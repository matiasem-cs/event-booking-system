import React, {useEffect, useState} from "react";
import {Userbar, UserbarProps} from "../../../components/userbar/Userbar.tsx";
import {APIStatus, EventInfo, isAPIStatus, UserRating, formatDatefromISOstring, UserPermission, isEventInfo} from "../../../types.ts";
import {ErrorMessage} from "../../../components/error/error.tsx";
import { SuccessMessage } from "../../../components/success/success.tsx";
import {TicketTable, TicketTableProps} from "../../../components/ticketSection/TicketTable.tsx";
import {RatingModal} from "../../../components/rating/RatingModal.tsx";
// import './eventPageStyle.css'

// MUI Component imports
import { createTheme, ThemeProvider } from '@mui/material/styles';

import SendIcon from '@mui/icons-material/Send';
import Typography from "@mui/material/Typography";
import {Box, Card, CardMedia, Divider, Grid, TextField} from "@mui/material";
import CardContent from "@mui/material/CardContent";
import {Star} from "@mui/icons-material";
import {yellow} from "@mui/material/colors";
import Button from "@mui/material/Button";
import {AuthApi} from "../../../api/authApi.ts";
import { isUserPermission } from "../../../components/userbar/Userbar.tsx";
import { Loader } from "../../../components/loader/loader.tsx";


/* EventPage component prop definitions */
const EventPageErrorMessages = {
    failed_unexpected: 'an unexpected error occurred, please try again later.',
    failed_event_fetch: 'Server Error - Could not fetch event details, please try again later.',
    failed_auth: "Unauthorized access. Please login again.",
    failed_user_rating_fetch: 'Server Error - Could not fetch users rating for this event, please try again later.'
};

export interface BOEventPageProps {
    event_id: string;
    handleLogout: () => void;
    navigateToCreateEventPage(): void;
}


export const BOEventPage: React.FC<BOEventPageProps> = (
    { event_id, handleLogout, navigateToCreateEventPage}
) => {
    const user_id = '66143f3ba1013ac95c6c0458' // nadav-two user id
    const [userPermission, setUserPermission] = useState<string>('')
    const [eventInfo, setEventInfo] = useState<EventInfo | null>()
    const [userRating, setUserRating] = useState<UserRating>({user_id: user_id, event_id: event_id, rating: 0})
    const [isLoading, setIsLoading] = React.useState(false);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [eventUpdated, setEventUpdated] = useState<boolean>(true)
    const [eventStartDate, setEventStartDate] = useState<string>('')
    const [eventEndDate, setEventEndDate] = useState<string>('')
    const [successMessage, setSuccessMessage] = useState<string>('')


    useEffect(() => {
        // console.log("AuthLayout: permission: ", permission);
        const fetchUserPermission = async () => {
            try {
              const result = await AuthApi.getUserPermission();
              if (isUserPermission(result)) {
                // console.log('User permission in boEventPage:', result);
                setUserPermission(result);
              }
              else {
                  handleApiStatus(result);
              }
            } catch (error) {
                // Handle any errors that occur during the fetch
                alert('Failed to fetch user permission, please try again');
                handleLogout();
                // setErrorMessage('Failed to fetch username, please try again');
            }
        };
        fetchUserPermission();
    }, []);


    const handleApiStatus = (result: APIStatus) =>{
        if (result === APIStatus.Unauthorized) {
            alert('Unauthorized, loging out...');
            handleLogout();
        } else {
            alert('Failed to fetch user permission, please try again later. Logging out...');
            handleLogout();
        //   setErrorMessage('Failed to fetch username, please try again');
        }
    }


    useEffect(()=>{
        const fetchPageInfo = async () => {
            try {
                setIsLoading(true)

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
                    setIsLoading(true)

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
                            setIsLoading(false)
                            // user has not rated this event yet - nothing to do here.
                            // console.log('User has no ratings for this event.')
                            break;
                        case APIStatus.ServerError:
                            throw EventPageErrorMessages.failed_user_rating_fetch;
                        default:
                            throw EventPageErrorMessages.failed_unexpected
                    }
                } else {
                    setIsLoading(false)

                    // Handle EventInfo object
                    const userRatingData = userRatingResponse;
                    // console.log(userRatingData)
                    setUserRating(userRatingData)
                }

                // handle event/rating promise errors
            } catch (error) {
                console.error("Error fetching event/rating data:", error);

                setIsLoading(false)

                // @ts-ignore
                const errorMsg = error.toString()
                setErrorMessage(errorMsg)
            }
        }

        fetchPageInfo()
        setEventUpdated(false)
    },[eventUpdated])


    const isAllowedToUpdateEvent = () => {
        return userPermission === UserPermission.Manager || userPermission === UserPermission.Admin
    }

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

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');
        if (!eventInfo || !eventInfo.start_date || !eventInfo.end_date) {
            setErrorMessage('Failed to update event dates, please try again later');
            setSuccessMessage('');
            setIsLoading(false);
            return;
        }
        const currentStartDate = new Date(eventInfo.start_date);
        if (currentStartDate < new Date()) {
            // console.log('startDate in the past!');
            // console.log('startDate:', currentStartDate);
            setErrorMessage('Cannot update event dates, event has already started');
            setSuccessMessage('');
            setIsLoading(false);
            return;
        }
        
        const newStartDateString = eventStartDate;
        const newEndDateString = eventEndDate;
        const newStartDate = new Date(newStartDateString);
        const newEndDate = new Date(newEndDateString);
        // console.log('eventInfo.start_date:', eventInfo.start_date);
        // console.log('eventInfo.end_date:', eventInfo.end_date);
        // console.log('currentStartDate:', currentStartDate);
        // console.log('newStartDate:', newStartDate);
        // console.log('newEndDate:', newEndDate);
        // console.log('eventStartDate:', eventStartDate);
        // console.log('eventEndDate:', eventEndDate);
        if (newStartDate <= currentStartDate) {
          setErrorMessage('Start date must be after current start date, Event can only be postponed');
          setSuccessMessage('');
          setIsLoading(false);
          return;
        }
        if (newEndDate <= newStartDate) {
          setErrorMessage('New end date must be after new start date');
          setSuccessMessage('');
          setIsLoading(false);
          return;
        }

        const result = await AuthApi.updateEventDates(event_id, newStartDateString, newEndDateString);
        if(isEventInfo(result)){
            // console.log('Event updated successfully')
            setSuccessMessage('Event dates updated successfully')
            setEventUpdated(true)
        } else {
            setErrorMessage('Failed to update event, Server error. Please try again later.')
            setSuccessMessage('')
            // console.log('Error updating event: ', result)
        }
        setIsLoading(false);
    }

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
        navigateToCreateEventPage,
        navigateToUserPage: () => {},
        handleLogout
    }


    const ticketTableProps: TicketTableProps = {
        eventId: event_id,
        event_title: eventInfo?.title,
        navigateToCheckout: () => {},
        isFrontOffice: false
    }

    return (
        <ThemeProvider theme={createTheme()}>
            <Userbar {...userbarProps}/>
            <header className='event-page-main-header'>
                <Typography sx={{ margin: 1 , textAlign: "center"}} variant="h4">{eventInfo?.title}</Typography>
            </header>
                
            <Card sx={{
                        
                        display: 'flex',
                        
                        
                        border: '1px black',
                        borderRadius: '10px', // Adjust the radius as needed
                        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)', // Adjust shadow parameters as needed
                        
                        margin: 2
                      }}>
                <CardMedia
                    sx={{ margin:2, mt: 2,  height: 200, width: '40%' }}
                    image={eventInfo?.img}
                    title={eventInfo?.title + ' img'}
                />
                <CardContent sx={{margin: 1, width: '90%'}}>
                    <div className='info-container' style={{display:"flex", justifyContent: "space-around"}}>
                        <div className='main-details'>
                            <Typography variant="h6" color="text.main">{eventInfo?.category}</Typography>
                            <Typography sx={{ mt: 1, mb: 1 }} variant="h6" color="text.main">{eventInfo?.quantity_available} tickets available</Typography>
                            <Typography variant="h6" color="text.main">Starting from: {eventInfo?.lowest_price_available}$</Typography>
                            <Typography variant="h6" sx={{ mt: 1}} color="text.main">Organizer: {eventInfo?.organizer}</Typography>

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
                                    <Typography variant="subtitle1" color="text.secondary">Starts: {eventInfo && formatDatefromISOstring(eventInfo.start_date)}</Typography>
                                    <Typography variant="subtitle1" color="text.secondary">Ends: {eventInfo && formatDatefromISOstring(eventInfo.end_date)}</Typography>
                                    <Typography variant="subtitle1" color="text.secondary">Location: {eventInfo?.location}</Typography>
                                    <Typography sx={{ marginTop: 2 }} variant="h5">Comments: {eventInfo?.comment_count}</Typography>
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

            {isAllowedToUpdateEvent() && (
            <Box 
                sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                border: '1px black',
                borderRadius: '10px', // Adjust the radius as needed
                boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)', // Adjust shadow parameters as needed
                margin: 2
                }}
            >
                <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
                    <Grid container xs={12} spacing={4} sx={{display:"flex", justifyContent:"center"}}>
                        <Grid item xs={12} alignContent="center">
                            <Typography variant="h6" color="text.Primary" sx={{textAlign:"center"}}>Update the event start and end dates</Typography>
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                required
                                fullWidth
                                id="eventStartDate"
                                label="Event Start Date"
                                name="eventStartDate"
                                type="datetime-local"
                                value={eventStartDate}
                                onChange={(e) => setEventStartDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        <Grid item xs={4}>
                            <TextField
                                required
                                fullWidth
                                id="eventEndDate"
                                label="Event End Date"
                                name="eventEndDate"
                                type="datetime-local"
                                value={eventEndDate}
                                onChange={(e) => setEventEndDate(e.target.value)}
                                InputLabelProps={{ shrink: true }}
                            />
                        </Grid>
                        
                            <Grid item xs={12} sm={8} sx={{ display: 'flex', justifyContent: 'center'}}>
                                <Button
                                type="submit"
                                variant="contained"
                                size='large'
                                fullWidth
                                disabled={isLoading}
                                endIcon={<SendIcon />}
                                sx={{ mt: 3, mb: 3}}
                                >
                                Update Event
                                </Button>
                            </Grid>
                    </Grid>
                </Box>
                </Box>
              )} 
            <div className="temp-messages">
                {isLoading && <Loader />}
                {errorMessage && <ErrorMessage message={errorMessage}/>}
                {successMessage && <SuccessMessage message={successMessage}/>}
            </div>
            </ThemeProvider>
        
    );

};