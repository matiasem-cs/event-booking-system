import React, {useEffect, useState} from "react";
import {APIStatus, isAPIStatus, UserRating} from "../../types.ts";
import {Loader} from "../loader/loader.tsx";
import {ErrorMessage} from "../error/error.tsx";
import './ratingModalStyle.css'


// MUI Component imports
import {Modal, Rating, Typography} from "@mui/material";
import Button from "@mui/material/Button";
import {AuthApi} from "../../api/authApi.ts";


/* Rating Modal component prop definitions */
const RatingModalErrorMessages = {
    failed_rating_create: 'Server Error - Rating could not be added, please try again later.',
    failed_rating_update: 'Server Error - Rating could not be edited, please try again later.',
    failed_unexpected: 'an unexpected error occurred, please try again later.',
    failed_not_found: 'Server Error - Old rating value not found.',
    failed_bad_request: 'Invalid rating entered, please try again.',
    failed_auth: "Unauthorized access. Please login again."

};

interface RatingModalProps {
    open: boolean;
    handleClose: () => void;
    userRating: UserRating;
    handleRatingUpdate: (newValue: number) => void;
}
export const RatingModal: React.FC<RatingModalProps> = ({ open, handleClose, userRating, handleRatingUpdate }) => {

    const [value, setValue] = React.useState<number>(userRating.rating);
    const [submittedWithoutChange, setSubmittedWithoutChange] = React.useState<boolean>(false);

    const [isLoading, setIsLoading] = React.useState<boolean>(false)
    const [errorMessage, setErrorMessage] = useState<string>('')


    useEffect(()=> {
        // console.log('user rating is:')
        // console.log(userRating.rating)
        // console.log('===============')
        // setValue(userRating.rating)
    },[userRating])

    useEffect(() => {
        // console.log('new modal value is:')
        // console.log(value)
    },[value])

    /* Component handlers */
    const handleSubmit =  async () => {
        // update\create user rating for given event
        // console.log('submit clicked')
        if (value === 0) {
            setSubmittedWithoutChange(true);

            setTimeout(() => {
                setSubmittedWithoutChange(false);
                handleClose();
            }, 3000);
        } else {
            if (userRating.rating === 0) {
                // create a new rating in backend
                setIsLoading(true)
                try {
                    // await axios.post(`http://${EVENT_SERVICE_LOCAL_ADDRESS}/api/ratings`, {
                    //     event_id: userRating.event_id,
                    //     user_id: userRating.user_id,
                    //     rating: value
                    // });


                    const postRatingRes : APIStatus = await AuthApi.createRating(userRating.event_id, value)

                    // handle rating promise response
                    if (isAPIStatus(postRatingRes)) {
                        // Handle APIStatus enum
                        switch (postRatingRes) {
                            case APIStatus.Success:
                                setIsLoading(false)

                                handleRatingUpdate(value)

                                handleClose()

                                // console.log('Rating created successfully!')
                                break;
                            case APIStatus.Unauthorized:
                                throw RatingModalErrorMessages.failed_auth

                            case APIStatus.ServerError:
                                throw RatingModalErrorMessages.failed_rating_create;
                            default:
                                throw RatingModalErrorMessages.failed_unexpected
                        }
                    }

                    // await axios.post(`https://${GATEWAY_ADDRESS}/api/ratings`, {
                    //     event_id: userRating.event_id,
                    //     user_id: userRating.user_id,
                    //     rating: value
                    // });
                    // setIsLoading(false)
                    // handleClose();

                } catch (error) {

                    console.error("Error creating rating:", error);
                    setIsLoading(false)

                    // display error message for 3 seconds
                    // @ts-ignore
                    const errorMsg = error.toString()
                    setErrorMessage(errorMsg)

                    setTimeout(() => {
                        setErrorMessage('');
                        setValue(userRating.rating)
                        handleClose();
                    }, 3000);
                }
            } else {
                // update user previous rating
                if (userRating.rating === value) {
                    handleClose();
                } else {
                    setIsLoading(true)
                    try {
                        // await axios.put(`http://${EVENT_SERVICE_LOCAL_ADDRESS}/api/ratings/${userRating.event_id}/${userRating.user_id}`, {
                        //     rating: value
                        // });

                        const updateRatingRes : APIStatus = await AuthApi.updateRatingByEventIdAndUserId(userRating.event_id, value)


                        // handle rating update response
                        if (isAPIStatus(updateRatingRes)) {
                            // Handle APIStatus enum
                            switch (updateRatingRes) {
                                case APIStatus.Success:
                                    setIsLoading(false)

                                    handleRatingUpdate(value)

                                    handleClose()

                                    // console.log('Rating updated successfully!')
                                    break;
                                case APIStatus.Unauthorized:
                                    throw RatingModalErrorMessages.failed_auth

                                case APIStatus.ServerError:
                                    throw RatingModalErrorMessages.failed_rating_update;

                                case APIStatus.NotFound:
                                    throw RatingModalErrorMessages.failed_not_found;

                                case APIStatus.BadRequest:
                                    throw RatingModalErrorMessages.failed_bad_request;
                                default:
                                    throw RatingModalErrorMessages.failed_unexpected
                            }
                        } else {
                            setIsLoading(false)

                            // console.log(`rating update response: ${updateRatingRes}`)
                        }


                        // await axios.put(`https://${GATEWAY_ADDRESS}/api/ratings/${userRating.event_id}/${userRating.user_id}`, {
                        //     rating: value
                        // });
                        //
                        // setIsLoading(false)
                        //
                        // handleClose();

                    } catch (error){

                        // console.error("Error Updating rating:", error);
                        setIsLoading(false)

                        // display error message for 3 seconds
                        // @ts-ignore
                        const errorMsg = error.toString()
                        setErrorMessage(errorMsg)

                        setTimeout(() => {
                            setErrorMessage('');
                            setValue(userRating.rating)
                            handleClose();
                        }, 3000);
                    }
                }
            }
        }
    }

    return (
        <Modal open={open} onClose={handleClose}>
            <div className='modal-container'>
                <Typography sx={{ margin: 0 }} variant="h6">Rate This Event</Typography>
                <Rating
                    name="rate-event"
                    value={value}
                    sx={{margin: 1}}
                    onChange={(event, newValue) => {
                        if (newValue === null) {
                            console.log(event);
                            setValue(0)
                        } else {
                            setValue(newValue);
                        }
                    }
                }
                />
                <Button sx={{margin: 1}} onClick={handleSubmit}>Submit</Button>

                <div>
                    {submittedWithoutChange &&
                        <Typography variant="subtitle1">Event not rated - Valid rating between 1-5.</Typography>}

                    {errorMessage && <ErrorMessage message={errorMessage}/>}
                    {isLoading && <Loader/>}
                </div>
            </div>
        </Modal>
    );
};
