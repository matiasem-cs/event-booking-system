import * as React from 'react';

import {ErrorMessage} from "../../../components/error/error.tsx";

import Box from '@mui/material/Box';
import FormLabel from '@mui/material/FormLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';
import CreditCardRoundedIcon from '@mui/icons-material/CreditCardRounded';
import SimCardRoundedIcon from '@mui/icons-material/SimCardRounded';
import ChevronRightRoundedIcon from '@mui/icons-material/ChevronRightRounded';


import {styled} from '@mui/system';
import Button from "@mui/material/Button";
import {APIStatus, HammerheadResponse, isAPIStatus, PayOrderBody} from "../../../types.ts";
import {AuthApi} from "../../../api/authApi.ts";
import {Loader} from "../../../components/loader/loader.tsx";
import {useEffect} from "react";

const FormGrid = styled('div')(() => ({
    display: 'flex',
    flexDirection: 'column',
}));

const PaymentErrors = {
    failed_payment: 'Server Error - Payment Failed. You are being transferred to the previous page.',
    failed_unexpected: 'an unexpected error occurred, please try again later.',
    failed_auth: "Unauthorized access. Please login again."
};

export interface PaymentFormProps {
    event_id: string,
    order_id: string | undefined;
    charge: number | undefined;
    navigateToEventPage(event_id : string) : void
    handleOrderComplete(order_id: string) : void;
}

export const PaymentForm: React.FC<PaymentFormProps> = (
    {order_id, charge, event_id, navigateToEventPage, handleOrderComplete}) => {

    const [holderName, setHolderName] = React.useState('');
    const [cardNumber, setCardNumber] = React.useState('');
    const [cvv, setCvv] = React.useState('');
    const [expirationDate, setExpirationDate] = React.useState('');
    const [isLoading, setIsLoading] = React.useState<boolean>(false)

    // Error states
    const [holderErrorMsg, setHolderErrorMessage] = React.useState<string>('')
    const [expDateErrorMsg, setExpDateErrorMessage] = React.useState<string>('')
    const [cardNumberErrorMsg, setCardNumberErrorMsg] = React.useState<string>('')
    const [cvvErrorMsg, setCvvErrorMsg] = React.useState<string>('')
    const [failedPaymentMsg, setFailedPaymentMsg] = React.useState<string>('')

    useEffect(()=> {
        // handle failed payment message error and redirect
        setTimeout(() => {
            // after 3 seconds, transfer to event page
            if (failedPaymentMsg === PaymentErrors.failed_payment) {
                // console.log('transferring to event page due to failure.')
                navigateToEventPage(event_id)
            }
        }, 3000);
    },[failedPaymentMsg])

    const handleHolderNameChange = (event: { target: { value: string } }) => {
        const value = event.target.value;
        if (value.length <= 25) {
            setHolderName(value);
        }
    };

    const handleCardNumberChange = (event: { target: { value: string } }) => {
        const value = event.target.value.replace(/\D/g, '');
        const formattedValue = value.replace(/(\d{4})(?=\d)/g, '$1 ');
        if (value.length <= 16) {
            setCardNumber(formattedValue);
        }
    };

    const handleCvvChange = (event: { target: { value: string } }) => {
        const value = event.target.value.replace(/\D/g, '');
        if (value.length <= 3) {
            setCvv(value);
        }
    };

    const handleExpirationDateChange = (event: { target: { value: string } }) => {
        const value = event.target.value.replace(/\D/g, '');
        const formattedValue = value.replace(/(\d{2})(?=\d{2})/, '$1/');
        if (value.length <= 4) {
            setExpirationDate(formattedValue);
        }
    };


    const validateEntries = () => {

        // reset previous errors
        setCvvErrorMsg('')
        setExpDateErrorMessage('')
        setHolderErrorMessage('')
        setCardNumberErrorMsg('')

        let errorCounter = 0;

        //validate CVV length
        if (cvv.length < 3) {
            setCvvErrorMsg('CVV must contain 3 digits')
            errorCounter++;
        }

        // validate card number length
        if (cardNumber.length < 19) {
            setCardNumberErrorMsg('Invalid card number')
            errorCounter++;
        }

        // Validate card holder name
        const nameRegex = /[a-zA-Z]+[\s]*[a-zA-Z]*/;
        if (!nameRegex.test(holderName)) {
            setHolderErrorMessage('Invalid card holder name')

            errorCounter++;
        }

        // Validate expiration date
        if (expirationDate.length !== 5) {
            setExpDateErrorMessage('Expiration date must be in the format MM/YY')
            errorCounter++;

        } else {
            const currentDate = new Date();
            const currentYear = currentDate.getFullYear();
            const currentMonth = currentDate.getMonth() + 1; // Month is zero-indexed, so add 1

            const inputMonth = parseInt(expirationDate.substring(0, 2), 10);
            const inputYear = parseInt(expirationDate.substring(3), 10) + 2000; // Add 2000 to get the full year

            // Validate that the month is between 1 and 12
            if (inputMonth < 1 || inputMonth > 12) {
                setExpDateErrorMessage('Invalid month');
                errorCounter++;

            } else if (inputYear < currentYear || (inputYear === currentYear && inputMonth < currentMonth)) {
                setExpDateErrorMessage('Expiration date must be in the future')
                errorCounter++;
            }
        }
        return errorCounter;
    }

    const handlePlaceOrder = () => {
        // console.log('you are trying to place order!')

        const countErrors = validateEntries()

        if (countErrors === 0) {
            // switch off previous error msg if exists
            setCvvErrorMsg('')
            setExpDateErrorMessage('')
            setHolderErrorMessage('')
            setCardNumberErrorMsg('')

            // remove button and add loader
            // console.log('Making order now...')
            setIsLoading(true)  // add loading animation is the box

            // remove spaces from cc
            const trimmedCardNumber = cardNumber.replace(/\s/g, '')

            if (charge && order_id) {
                // create pay body
                const payBody: PayOrderBody = {
                    order_id: order_id,
                    payment_details: {
                        cc: trimmedCardNumber,
                        holder: holderName,
                        cvv: cvv,
                        exp: expirationDate,
                        charge: charge
                    }
                }
                paymentHandler(payBody);
            }
        }
    }

    // make backend call to payment service
    const paymentHandler = async (payBody: PayOrderBody) => {
        try {
            // console.log('pay body:', payBody)
            const payResponse: APIStatus | HammerheadResponse = await AuthApi.payOrder(payBody)

            if (isAPIStatus(payResponse)) {
                // Handle APIStatus enum
                switch (payResponse) {
                    case APIStatus.PaymentServerError:
                        throw PaymentErrors.failed_payment;

                    case APIStatus.Unauthorized:
                        throw PaymentErrors.failed_auth

                    case APIStatus.ServerError:
                        throw PaymentErrors.failed_payment;

                    case APIStatus.NotFound:
                        throw PaymentErrors.failed_payment

                    default:
                        throw PaymentErrors.failed_unexpected
                }
            } else {
                // successful purchase made
                if (payResponse.message === 'Payment successful!') {

                    setIsLoading(false)

                    const paymentToken: string = payResponse.response.paymentToken

                    console.log('Payment successful!', paymentToken)

                    if (order_id) {
                        handleOrderComplete(order_id) // navigate to success page
                    }
                }
            }
        } catch (error) {
            setIsLoading(false)
            console.error("Error making payment:", error);

            // @ts-ignore
            const errorMsg = error.toString()
            setFailedPaymentMsg(errorMsg)
        }
    }



    return (
        <div style={{ display: 'flex', flexDirection: 'column' }}>
            <Box
                sx={{
                    margin: 10,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    p: 3,
                    height: { xs: 300, sm: 350, md: 375 },
                    borderRadius: '20px',
                    border: '1px solid ',
                    borderColor: 'divider',
                    backgroundColor: '#fbfcfe',
                    boxShadow: '0px 4px 8px rgba(0, 0, 0, 0.05)',
                    width: '90%',
                    maxWidth: 800, // Adjust this value as needed
                    // margin: '0 auto', // Center the component horizontally
                }}
            >
                <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle2">Credit card</Typography>
                    <CreditCardRoundedIcon sx={{ color: 'text.secondary' }} />
                </Box>
                <SimCardRoundedIcon
                    sx={{
                        fontSize: { xs: 48, sm: 56 },
                        transform: 'rotate(90deg)',
                        color: 'text.secondary',
                    }}
                />
                <Box
                    sx={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        width: '100%',
                        gap: 2,
                    }}
                >
                    <FormGrid sx={{ flexGrow: 1 }}>
                        <FormLabel htmlFor="card-number" required>
                            Card number
                        </FormLabel>
                        <OutlinedInput
                            id="card-number"
                            autoComplete="card-number"
                            placeholder="0000 0000 0000 0000"
                            required
                            value={cardNumber}
                            onChange={handleCardNumberChange}
                        />
                    </FormGrid>
                    <FormGrid sx={{ maxWidth: '20%' }}>
                        <FormLabel htmlFor="cvv" required>
                            CVV
                        </FormLabel>
                        <OutlinedInput
                            id="cvv"
                            autoComplete="CVV"
                            placeholder="123"
                            required
                            value={cvv}
                            onChange={handleCvvChange}
                        />
                    </FormGrid>
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                    <FormGrid sx={{ flexGrow: 1 }}>
                        <FormLabel htmlFor="card-name" required>
                            Name
                        </FormLabel>
                        <OutlinedInput
                            id="card-name"
                            autoComplete="card-name"
                            placeholder="John Smith"
                            required
                            value={holderName}
                            onChange={handleHolderNameChange}
                        />
                    </FormGrid>
                    <FormGrid sx={{ flexGrow: 1 }}>
                        <FormLabel htmlFor="card-expiration" required>
                            Expiration date
                        </FormLabel>
                        <OutlinedInput
                            id="card-expiration"
                            autoComplete="card-expiration"
                            placeholder="MM/YY"
                            required
                            value={expirationDate}
                            onChange={handleExpirationDateChange}
                        />
                    </FormGrid>
                </Box>

                {isLoading ? <Loader/> :
                (<Button
                    onClick={handlePlaceOrder}
                    variant='contained'
                    endIcon={<ChevronRightRoundedIcon />}
                    sx={{
                        mt: '20px',
                        marginLeft: 'auto',
                        width: { xs: '100%', sm: 'fit-content' } // Adjust width based on screen size
                    }}
                >
                    Place Order
                </Button>)}
            </Box>
            <div>
                {holderErrorMsg && <ErrorMessage message={holderErrorMsg}/>}
                {expDateErrorMsg && <ErrorMessage message={expDateErrorMsg}/>}
                {cardNumberErrorMsg && <ErrorMessage message={cardNumberErrorMsg}/>}
                {cvvErrorMsg && <ErrorMessage message={cvvErrorMsg}/>}
                {failedPaymentMsg && <ErrorMessage message={failedPaymentMsg}/>}
            </div>
        </div>
    );
}
