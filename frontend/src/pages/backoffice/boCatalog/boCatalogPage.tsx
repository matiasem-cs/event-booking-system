import React, {useEffect, useState} from "react";
import {
    APIStatus,
    CatalogEventInfo,
    isAPIStatus,
} from "../../../types.ts";

import EventCard from "../../../components/eventCard/EventCard.tsx";
import {Userbar, UserbarProps} from "../../../components/userbar/Userbar.tsx";
// import {TicketCard} from "../../../components/ticketSection/TicketCard.tsx";
import {AuthApi} from "../../../api/authApi";

// MUI Component imports
// import Grid from '@mui/material/Unstable_Grid2';
import Typography from "@mui/material/Typography";
import {ErrorMessage} from "../../../components/error/error.tsx";
import { Box, Grid } from "@mui/material";
import InfiniteScroll from 'react-infinite-scroll-component';




/* CatalogEvents component prop definitions */
const CatalogEventErrorMessages = {
    failed_fetch: 'Server Error - Could not fetch events, please try again later.'
};

export interface BOCatalogPageProps {
    navigateToCreateEventPage(): void;
    navigateToBOEventPage(event_id : string): void;
    navigateToUserPage(): void;
    handleLogout: () => void;
}

const PAGE_SIZE = 12;

export const BOCatalogPage: React.FC<BOCatalogPageProps> = ({navigateToBOEventPage, navigateToCreateEventPage, handleLogout}) => {
    // console.log('BOCatalogPage');
    const [catalogEventsInfo, setCatalogEventsInfo] = useState<CatalogEventInfo[]>([])
    const [errorMessage, setErrorMessage] = useState<string>('')
    // const [userInfo, setUserInfo] = useState<UserInfo>('')

    // Pagination states
    const [page, setPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState(true)

    useEffect(() => {
        // fetch all event(s) information
        const fetchPageInfo = async () => {
            try {
                setLoading(true)    // enable loading prompt before fetch

                const result = await AuthApi.getBOCatalogEvents(0,PAGE_SIZE);
                if (Array.isArray(result)) {

                    setCatalogEventsInfo(result)

                    setLoading(false);  // disable loading prompt after fetch

                    // It's an array of CatalogEventInfo
                    console.log('BackOffice Catalog events:', result);
                } else if (result === APIStatus.Unauthorized) {
                    setErrorMessage(CatalogEventErrorMessages.failed_fetch)
                    // API returned unauthorized status
                    // console.log('Unauthorized to access catalog events');
                } else if (result === APIStatus.ServerError) {
                    setErrorMessage(CatalogEventErrorMessages.failed_fetch)
                    // API returned server error status
                    // console.log('Server error while fetching catalog events');
                } else {
                    setErrorMessage(CatalogEventErrorMessages.failed_fetch)
                    // Unexpected return value
                    // console.log('Unexpected return value:', result);
                }

            } catch (error) {
                // console.error("Error fetching event data:", error);

                setLoading(false);  // disable loading prompt after fetch

                setErrorMessage(CatalogEventErrorMessages.failed_fetch)
            }
        };

        fetchPageInfo();
    },[]);


    const fetchAdditionalEvents = async () => {
        try {
            setLoading(true); // Start loading
    
            // Fetch more events from the API
            const newEventsRes: APIStatus | CatalogEventInfo[] = await AuthApi.getBOCatalogEvents(page * PAGE_SIZE, PAGE_SIZE);
    
            if (isAPIStatus(newEventsRes)) {
                // Handle APIStatus enum
                switch (newEventsRes) {
                    case APIStatus.Unauthorized:
                        setErrorMessage('Unauthorized access. Please login again.');
                        break;
                    case APIStatus.ServerError:
                        setErrorMessage('Server Error - Could not fetch events, please try again later.');
                        break;
                    default:
                        setErrorMessage('Unexpected error while fetching events.');
                }
            } else {
                // newEventsRes contains new events
                const newEvents: CatalogEventInfo[] = newEventsRes;
    
                if (newEvents.length > 0) {
                    // Concatenate new events with existing events
                    setCatalogEventsInfo(prevEvents => [...prevEvents, ...newEvents]);
                    setPage(prevPage => prevPage + 1); // Increment page number
                } else {
                    setHasMore(false); // No more events to load
                }
            }
    
            setLoading(false); // Stop loading
        } catch (error) {
            setErrorMessage('Unexpected error while fetching events.');
            setLoading(false); // Stop loading
        }
    };


    /* Component handlers */
    const handleClick = (event_id : string) => {
        // console.log(event_id)
        navigateToBOEventPage(event_id);
    }

    /* Child component prop definitions */
    const userbarProps: UserbarProps = {
        navigateToCreateEventPage,
        navigateToUserPage: () => {},
        handleLogout
    }


    return (
        <>
            <Userbar {...userbarProps} />
            <Box mt={3} mb={2} display="flex" flexDirection="column" alignItems="center">
                <Typography variant="h5" align="center">Events Catalog</Typography>
            </Box>     
            {/* <Grid container spacing={2}> */}
            <InfiniteScroll
            dataLength={catalogEventsInfo.length}
            next={fetchAdditionalEvents}
            hasMore={hasMore}
            loader={loading && <h4>Loading Events...</h4>}
            style={{
                display: 'flex',
                flexDirection: 'row', // Display items in rows
                flexWrap: 'wrap', // Allow items to wrap to the next row
                justifyContent: 'center', // Distribute space between items
                alignItems: 'flex-start', // Align items to the top of the container
                overflow: 'hidden', // Prevents scrollbar from appearing
            }}
        >       
            {catalogEventsInfo?.map((event) => (
                <Grid item key={event._id} xs={12} sm={6} md={4} lg={3} style={{ flexBasis: '25%', marginBottom: '10px' }}>
                    <EventCard
                        isFrontOffice={false}
                        eventInfo={event}
                        onLearnMore={() => handleClick(event._id)}
                    />
                </Grid>
            ))}
        </InfiniteScroll>
            {/* </Grid> */}
            <div className="temp-messages">
                {loading && <p>Loading...</p>}
                {errorMessage && <ErrorMessage message={errorMessage}/>}
            </div>
        </>
    );
};
