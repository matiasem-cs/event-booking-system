import React, {useEffect, useState} from "react";
import {Userbar, UserbarProps} from "../../../components/userbar/Userbar.tsx";
import {APIStatus, EventInfo, isAPIStatus, UserRating, PurchaseDetails} from "../../../types.ts";
import {ErrorMessage} from "../../../components/error/error.tsx";
import {CommentTable, CommentTableProps} from "../../../components/commentSection/CommentTable.tsx";
import {TicketTable, TicketTableProps} from "../../../components/ticketSection/TicketTable.tsx";
import {RatingModal} from "../../../components/rating/RatingModal.tsx";
import './eventPageStyle.css'

// MUI Component imports
import Typography from "@mui/material/Typography";
import {Card, CardMedia, Divider} from "@mui/material";
import CardContent from "@mui/material/CardContent";
import {Star} from "@mui/icons-material";
import {yellow} from "@mui/material/colors";
import Button from "@mui/material/Button";
import {AuthApi} from "../../../api/authApi.ts";


/* EventPage component prop definitions */
const EventPageErrorMessages = {
    failed_unexpected: 'an unexpected error occurred, please try again later.',
    failed_event_fetch: 'Server Error - Could not fetch event details, please try again later.',
    failed_auth: "Unauthorized access. Please login again.",
    failed_user_rating_fetch: 'Server Error - Could not fetch users rating for this event, please try again later.'
};

export interface EventPageProps {
    event_id: string;
    handleLogout: () => void;
    navigateToUserPage(): void;
    navigateToCheckout(details: PurchaseDetails): void
}


export const EventPage: React.FC<EventPageProps> = (
    { event_id, navigateToUserPage, handleLogout, navigateToCheckout}
) => {
    const user_id = '66143f3ba1013ac95c6c0458' // nadav-two user id

    const [eventInfo, setEventInfo] = useState<EventInfo | null>()
    const [userRating, setUserRating] = useState<UserRating>({user_id: user_id, event_id: event_id, rating: 0})

    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('')


    useEffect(()=>{
        const fetchPageInfo = async () => {
            try {
                setLoading(true)

                const eventPromise = await AuthApi.getEvent(event_id);
                const userRatingPromise = await AuthApi.getRatingByEventIdAndUserId(event_id)

                const [eventResponse, userRatingResponse] = await Promise.all([eventPromise, userRatingPromise]);

                // handle event promise response
                if (isAPIStatus(eventResponse)) {
                    // Handle APIStatus enum
                    switch (eventResponse) {
                        case APIStatus.Unauthorized:
                            throw EventPageErrorMessages.failed_auth
                        // throw "Unauthorized access. Please login again.";
                        case APIStatus.ServerError:
                            throw EventPageErrorMessages.failed_event_fetch;
                        default:
                            throw EventPageErrorMessages.failed_unexpected
                    }
                } else {
                    setLoading(true)

                    // Handle EventInfo object
                    const eventData: EventInfo = eventResponse;
                    setEventInfo(eventData)
                }


                // handle user rating promise response
                if (isAPIStatus(userRatingResponse)) {
                    // Handle APIStatus enum
                    switch (userRatingResponse) {
                        case APIStatus.Unauthorized:
                            throw EventPageErrorMessages.failed_auth
                        case APIStatus.NotFound:
                            setLoading(false)
                            // user has not rated this event yet - nothing to do here.
                            // console.log('User has no ratings for this event.')
                            break;
                        case APIStatus.ServerError:
                            throw EventPageErrorMessages.failed_user_rating_fetch;
                        default:
                            throw EventPageErrorMessages.failed_unexpected
                    }
                } else {
                    setLoading(false)

                    // Handle EventInfo object
                    const userRatingData = userRatingResponse;
                    // console.log(userRatingData)
                    setUserRating(userRatingData)
                }

                // handle event/rating promise errors
            } catch (error) {
                console.error("Error fetching event/rating data:", error);

                setLoading(false)

                // @ts-ignore
                const errorMsg = error.toString()
                setErrorMessage(errorMsg)
            }
        }

        fetchPageInfo()
    },[])


    /* Component handlers*/
    const handleRateEvent = () => {
        setIsModalOpen(true)
    }

    const handleCloseModal = () => {
        setIsModalOpen(false)
    }

    const handleRatingUpdate = (newRatingValue: number) => {
        // console.log(`Updating user rating, new value: ${newRatingValue}`)
        setUserRating({ ...userRating, rating: newRatingValue });
    };

    // const handlePurchase = (ticketsInfo :PurchaseDetails) => {
    //     const purchaseDetails: PurchaseDetails = {
    //         event_id : event_id,
    //         ticket_id : ticketsInfo.ticket_id,
    //         quantity_purchased : ticketsInfo.quantity_purchased,
    //         price : ticketsInfo.price
    //     }
    //     navigateToCheckout(purchaseDetails)
    // }


    /* Child component prop definitions */
    const userbarProps: UserbarProps = {
        navigateToUserPage,
        handleLogout
    }

    const commentTableProps: CommentTableProps ={
        event_id: event_id,
        username: 'New Comment'
    }

    const ticketTableProps: TicketTableProps = {
        eventId: event_id,
        event_title: eventInfo?.title,
        navigateToCheckout,
        isFrontOffice: true
    }

    return (
        <>
            <Userbar {...userbarProps}/>
            <header className='event-page-main-header'>
                <Typography sx={{ margin: 1 }} variant="h4">{eventInfo?.title}</Typography>
            </header>

            <Card sx={{ display: 'flex', width: '90%', margin: '15px'}}>
                <CardMedia
                    sx={{ margin:2, mt: 2,  height: 200, width: '40%' }}
                    image={eventInfo?.img}
                    title={eventInfo?.title + ' img'}
                />
                <CardContent sx={{margin: 1, width: '90%'}}>
                    <div className='info-container'>
                        <div className='main-details'>
                            <Typography variant="h6" color="text.main">{eventInfo?.category}</Typography>
                            <Typography sx={{ mt: 1, mb: 1 }} variant="h6" color="text.main">{eventInfo?.quantity_available} tickets available</Typography>
                            <Typography variant="h6" color="text.main">Starting from: {eventInfo?.lowest_price_available}$</Typography>

                            <div className='rating-container'>
                                <Button
                                    sx={{mt: 2}}
                                    onClick={handleRateEvent}
                                    variant="contained"
                                    title="Rate this event"
                                    disableElevation
                                >
                                    <div className='rating-container'>
                                        <Typography sx={{ fontWeight: 600 }} variant="subtitle1" color="text.main">
                                            {eventInfo?.rating}
                                        </Typography>
                                        <Star style={{ fill: yellow[800] }} />
                                    </div>
                                </Button>

                            </div>
                        </div>

                        <div className='additional-details'>
                            <Card>
                                <CardContent>
                                    <Typography variant="subtitle1" color="text.secondary">Starts: {eventInfo?.start_date}</Typography>
                                    <Typography variant="subtitle1" color="text.secondary">Ends: {eventInfo?.end_date}</Typography>
                                    <Typography variant="subtitle1" color="text.secondary">{eventInfo?.location}</Typography>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                    <Divider  className="divider" sx={{margin: 3, width: '600px'}}/>

                    <Typography variant="h6" color="text.secondary">{eventInfo?.description}</Typography>

                </CardContent>

                <RatingModal open={isModalOpen} handleClose={handleCloseModal}  handleRatingUpdate={handleRatingUpdate} userRating={userRating} />

            </Card>

            <TicketTable key={event_id} {...ticketTableProps}/>

            <div className="comment-section-container">
                <CommentTable key={event_id} {...commentTableProps} />
            </div>

            <div className="temp-messages">
                {loading && <p>Loading...</p>}
                {errorMessage && <ErrorMessage message={errorMessage}/>}
            </div>
        </>
    );

};