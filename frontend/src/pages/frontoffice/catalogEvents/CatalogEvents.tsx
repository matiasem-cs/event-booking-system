import React, {useEffect, useState} from "react";
import {
    APIStatus,
    CatalogEventInfo,
} from "../../../types.ts";

import EventCard from "../../../components/eventCard/EventCard.tsx";
import {Userbar, UserbarProps} from "../../../components/userbar/Userbar.tsx";
// import {TicketCard} from "../../../components/ticketSection/TicketCard.tsx";
import {AuthApi} from "../../../api/authApi";


// MUI Component imports
import Typography from "@mui/material/Typography";
import {ErrorMessage} from "../../../components/error/error.tsx";
import { Box, Button, TextField ,Grid} from "@mui/material";
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';



/* CatalogEvents component prop definitions */
const CatalogEventErrorMessages = {
    failed_fetch: 'Server Error - Could not fetch events, please try again later.'
};

export interface CatalogEventsProps {
    navigateToEventPage(event_id : string): void;
    navigateToUserPage(): void;
    handleLogout: () => void;
}


export const CatalogEvents: React.FC<CatalogEventsProps> = ({navigateToEventPage, navigateToUserPage, handleLogout}) => {
    // state variables for price range and sorting
    const [fromPrice, setFromPrice] = React.useState<number>(0);
    const [toPrice, setToPrice] = React.useState<number>(0);
    const [sortByPrice, setSortByPrice] = React.useState<boolean>(false); // Assuming false means sorting by lowest price

    const [catalogEventsInfo, setCatalogEventsInfo] = useState<CatalogEventInfo[] | null>()
    const [errorMessage, setErrorMessage] = useState<string>('')
    // const [skip, setSkip] = useState<number>(0)
    // const [limit, setLimit] = useState<number>(100)
    // const [userInfo, setUserInfo] = useState<UserInfo>('')

    // Pagination states
    // const [page, setPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    // const [hasMore, setHasMore] = useState(true)

    useEffect(() => {
        console.log('sortByPrice:', sortByPrice);
        // fetch all event(s) information
        // const fetchPageInfo = async () => {
        //     try {
        //         setLoading(true)    // enable loading prompt before fetch

        //         const result = await AuthApi.getCatalogEvents(0,100);
        //         if (Array.isArray(result)) {

        //             setCatalogEventsInfo(result)

        //             setLoading(false);  // disable loading prompt after fetch

        //             // It's an array of CatalogEventInfo
        //             console.log('Catalog events:', result);
        //         } else if (result === APIStatus.Unauthorized) {
        //             // API returned unauthorized status
        //             console.log('Unauthorized to access catalog events');
        //         } else if (result === APIStatus.ServerError) {
        //             // API returned server error status
        //             console.log('Server error while fetching catalog events');
        //         } else {
        //             // Unexpected return value
        //             console.log('Unexpected return value:', result);
        //         }

        //     } catch (error) {
        //         console.error("Error fetching event data:", error);

        //         setLoading(false);  // disable loading prompt after fetch

        //         setErrorMessage(CatalogEventErrorMessages.failed_fetch)
        //     }
        // };

        fetchPageInfo();
    },[]);

    const fetchPageInfo = async () => {
        try {
            setLoading(true)    // enable loading prompt before fetch

            const result = await AuthApi.getCatalogEvents(0,100);
            if (Array.isArray(result)) {

                setCatalogEventsInfo(result)

                setLoading(false);  // disable loading prompt after fetch

                // It's an array of CatalogEventInfo
                // console.log('Catalog events:', result);
            } else if (result === APIStatus.Unauthorized) {
                setErrorMessage('Unauthorized to access catalog events');
                // API returned unauthorized status
                // console.log('Unauthorized to access catalog events');
            } else if (result === APIStatus.ServerError) {
                setErrorMessage('Server error while fetching catalog events');
                // API returned server error status
                // console.log('Server error while fetching catalog events');
            } else {
                setErrorMessage('Unexpected return value');
                // Unexpected return value
                // console.log('Unexpected return value:', result);
            }

        } catch (error) {
            console.error("Error fetching event data:", error);

            setLoading(false);  // disable loading prompt after fetch

            setErrorMessage(CatalogEventErrorMessages.failed_fetch)
        }
    };

    const handleApiResponse = (res: any) => {
        if (Array.isArray(res)) {
            setCatalogEventsInfo(res);
            setLoading(false);
        } else if (res === APIStatus.Unauthorized) {
            setErrorMessage('Unauthorized to access catalog events');
            // console.log('Unauthorized to access catalog events');
        } else if (res === APIStatus.ServerError) {
            setErrorMessage('Server error while fetching catalog events');
            // console.log('Server error while fetching catalog events');
        } else {
            // console.log('Unexpected return value:', res);
            setErrorMessage('Unexpected return value');
        }
    };

    // Handler to set the fromPrice
    const handleFromPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFromPrice(Number(event.target.value));
    };

    // Handler to set the toPrice
    const handleToPriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setToPrice(Number(event.target.value));
    };

    // Handler to set the sortByPrice
    const handleSortByPrice = (sortByPrice: boolean) => {
        // console.log('### Sort by price:', sortByPrice);
        setSortByPrice(!sortByPrice);
        // console.log('Sort by price:', sortByPrice);
    };

    const handleSubmit = async () => {
        if (fromPrice < 0 || toPrice < 0) {
            setErrorMessage('Price cannot be negative');
            return;
        }
        if (fromPrice > toPrice) {
            setErrorMessage('From price cannot be greater than to price');
            return;
        }

        if (fromPrice === 0 && toPrice === 0 && !sortByPrice) {
            // console.log('Fetching all events without any filter');
            await fetchPageInfo();
            return;
        } else if (fromPrice === 0 && toPrice === 0 && sortByPrice) {
            // console.log('Fetching all events sorted by price');
            await fetchEventsSorted();
            return;
        } else if (toPrice > 0 && !sortByPrice) {
            // console.log('Fetching events by price range, no sorting');
            await fetchEventsByPriceRange();
        } else if (toPrice > 0 && sortByPrice) {
            // console.log('Fetching events by price range and sorted');
            await fetchEventsByPriceRangeAndSort();
        } else {
            console.log('Invalid input');
        }

        // Reset the price range and sorting
        setFromPrice(0);
        setToPrice(0);
        setSortByPrice(false);
    };

    


    const fetchEventsSorted = async () => {
        setLoading(true);
        setErrorMessage('');
        const skip = 0;
        const limit = 100;
        const res = await AuthApi.getEventsByLowestPrice(skip, limit);
        handleApiResponse(res);
    }

    // Function to fetch events based on price range
    const fetchEventsByPriceRange = async () => {
        setLoading(true);
        setErrorMessage('');
        const skip = 0;
        const limit = 100;
        const res = await AuthApi.getEventsByPriceRange(skip, limit, fromPrice, toPrice);
        handleApiResponse(res);
    };

    // Function to fetch events based on price range and sorting
    const fetchEventsByPriceRangeAndSort = async () => {
        setLoading(true);
        setErrorMessage('');
        const skip = 0;
        const limit = 100;
        const res = await AuthApi.getEventsByPriceRangeSorted(skip, limit, fromPrice, toPrice);
        handleApiResponse(res);
    };

    /* Component handlers */
    const handleClick = (event_id : string) => {
        // console.log(event_id)
        navigateToEventPage(event_id);
    }

    /* Child component prop definitions */
    const userbarProps: UserbarProps = {
        navigateToCreateEventPage: () => {},
        navigateToUserPage,
        handleLogout
    }


    return (
        <>
            <Userbar {...userbarProps} />
            <Box mt={3} mb={2} display="flex" flexDirection="column" alignItems="center">
                <Typography variant="h4" align="center">Events Catalog</Typography>
            </Box>
            
            <Box  mb={2}  paddingLeft={3} paddingRight={3} display="flex" flexDirection="column" alignItems="center">
            <Box           sx={{
                width: '100%', // Set the width as needed
                border: '1px black',
                borderRadius: '10px', // Adjust the radius as needed
                boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)', // Adjust shadow parameters as needed
                padding: 3,
                margin: 3
          }} >
                <Grid container spacing={2} xs={16} display="flex" justifyContent={"space-between"}>
                <Grid item xs={2}>
                    <TextField
                        required
                        fullWidth
                        id="fromPrice"
                        label="From Price"
                        name="fromPrice"
                        type="number"
                        value={fromPrice}
                        onChange={handleFromPriceChange}
                    />
                </Grid>
                <Grid item xs={2}>
                    <TextField
                        required
                        fullWidth
                        id="toPrice"
                        label="To Price"
                        name="toPrice"
                        type="number"
                        value={toPrice}
                        onChange={handleToPriceChange}
                    />
                </Grid>
                <Grid item xs={2}>
                    <FormControlLabel
                        control={
                            <Switch
                                checked={sortByPrice}
                                onChange={() => handleSortByPrice(sortByPrice)}
                                name="sortByPrice"
                                color="primary"
                                size="medium"
                            />
                        }
                        label="Sort by Price"
                    />
                </Grid>
                <Grid item xs={2}>
                    <Button
                        type="button"
                        variant="contained"
                        color="primary"
                        size="large"
                        onClick={handleSubmit}
                    >
                        Apply Price Range
                    </Button>
                </Grid>
            </Grid>
            </Box>
            <Grid container spacing={2}>     
                {catalogEventsInfo?.map((event) => (
                    <Grid  key={event._id} xs={12} sm={6} md={4} lg={3}>
                        <EventCard
                            isFrontOffice={true}
                            eventInfo={event}
                            onLearnMore={() => handleClick(event._id)}
                        />
                    </Grid>
                ))}
            </Grid>
            </Box>
            <div className="temp-messages">
                {loading && <p>Loading...</p>}
                {errorMessage && <ErrorMessage message={errorMessage}/>}
            </div>
        </>
    );
};
