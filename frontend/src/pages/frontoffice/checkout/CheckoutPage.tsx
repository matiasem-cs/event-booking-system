import * as React from 'react';
import { styled } from '@mui/system';
import {OrderSummary, OrderSummaryProps} from './OrderSummary';
import {PaymentForm, PaymentFormProps} from './PaymentForm';
import {Userbar, UserbarProps} from "../../../components/userbar/Userbar.tsx";
import {useEffect} from "react";
import {Snackbar} from "@mui/material";
import {APIStatus, isAPIStatus, OrderInfo, OrderInfoResponse} from "../../../types.ts";
import {AuthApi} from "../../../api/authApi.ts";

const CheckoutContainer = styled('div')(() => ({
    display: 'flex',
    gap: '24px', // Adjust the gap between components as needed,
}));


const CheckoutPageErrors = {
    failed_comment_upload: 'Server Error - Message upload failed, please try again later.',
    failed_comment_fetch: 'Server Error - Could not fetch comments, please try again later.',
    failed_unexpected: 'an unexpected error occurred, please try again later.',
    failed_auth: "Unauthorized access. Please login again."
};

export interface CheckoutPageProps {
    event_id : string,
    event_name: string,
    ticket_id: string,
    ticket_title: string,
    quantity_purchased: number,
    price: number,
    navigateToEventPage(event_id : string): void;
    navigateToUserPage(): void;
    handleOrderComplete(order_id: string) : void;
    handleLogout: () => void;
}

const initMessage = "Your tickets are reserved for the next 2 minutes, please make sure to submit the order by then.";
const timesUpMessage = "You didn't complete your purchase on time, redirecting to the event page.";

export const CheckoutPage: React.FC<CheckoutPageProps> = (
    {event_id,
        event_name,
        ticket_id,
        ticket_title,
        quantity_purchased,
        price,
        navigateToUserPage,
        handleLogout,
        navigateToEventPage,
        handleOrderComplete
    }
) => {

    // Order states
    const [orderInfo, setOrderInfo] = React.useState<OrderInfo>()

    // Message states
    const [open, setOpen] = React.useState<boolean>(false)
    const [snackbarMessage, setSnackbarMessage] = React.useState<string>('')



    useEffect(()=>{
        const sendOrder = async () => {
            try {
                // console.log('Generating Order...')

                /* POST request for new order to Order service  */
                const generateOrderRes : APIStatus | OrderInfoResponse = await AuthApi.createOrder(event_id,ticket_id,quantity_purchased,price)

                if (isAPIStatus(generateOrderRes)) {
                    // Handle APIStatus enum
                    switch (generateOrderRes) {
                        case APIStatus.Unauthorized:
                            throw CheckoutPageErrors.failed_auth

                        case APIStatus.ServerError:
                            throw CheckoutPageErrors.failed_comment_upload;

                        default:
                            throw CheckoutPageErrors.failed_unexpected
                    }
                } else {
                    // order was created
                    if (generateOrderRes.message === 'Order created successfully') {

                        const orderDetails: OrderInfo = generateOrderRes.order

                        setOrderInfo(orderDetails)
                    }
                }

            } catch (error) {
                console.error("Error while creating Order:", error);

                // @ts-ignore
                // const errorMsg = error.toString()
                // setErrorMessage(errorMsg)
            }
        }
         sendOrder()
    },[])

    useEffect(()=>{
        console.log('Recived Order Info:')
        console.log(orderInfo)
    },[orderInfo])


    // handle checkout page message timers

    useEffect(() => {
        // Show the initial snackbar message for 5 seconds
        setSnackbarMessage(initMessage);
        setOpen(true);
        const timer1 = setTimeout(() => {
            setOpen(false);
        }, 5000);

        // Start the 2-minute timer
        const timer2 = setTimeout(() => {
            setSnackbarMessage(timesUpMessage);
            setOpen(true);
        }, 120000); // 2 minutes (in milliseconds)

        // Hide the "timesUp" message after 5 seconds
        const timer3 = setTimeout(() => {
            setOpen(false);
            navigateToEventPage(event_id)
        }, 125000); // 2 minutes + 5 seconds

        // Clean up the timers
        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, []);



    /* Component handlers */


    /* Child Component props */
    const userbarProps: UserbarProps = {
        navigateToUserPage,
        handleLogout
    }

    const orderSummaryProps: OrderSummaryProps = {
        event_name: event_name,
        ticket_title: ticket_title,
        price: price,
        quantity_purchased: quantity_purchased
    }

    const paymentFromProps: PaymentFormProps = {
        event_id: event_id,
        order_id: orderInfo?._id,
        charge: orderInfo?.total_cost,
        navigateToEventPage,
        handleOrderComplete
    }

    const action = (
        <React.Fragment>

        </React.Fragment>
    );

    return (
        <>
            <Userbar {...userbarProps} />
            {open && (
                <Snackbar
                    open={open}
                    message={snackbarMessage}
                    action={action}
                />
            )}
                <CheckoutContainer>
                    <OrderSummary {...orderSummaryProps} />
                    <PaymentForm {...paymentFromProps} />
                </CheckoutContainer>
        </>
    );
};
