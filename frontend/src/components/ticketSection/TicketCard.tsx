import React, {useState} from "react";

// MUI Component imports
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import {CardActions} from "@mui/material";
import Button from "@mui/material/Button";
import Input from '@mui/material/Input';
import {orange} from "@mui/material/colors";
import {PurchaseDetails} from "../../types.ts";




/* Component prop definitions */

const TicketCardErrors = {
    invalid_ticket_amount: 'Invalid Ticket quantity purchase attempt, please try again.'
};

interface TicketCardProps {
    name: string,
    quantity_available: number,
    price: number,
    ticket_id: string | undefined,
    event_id: string,
    event_title: string | undefined,
    navigateToCheckout(details: PurchaseDetails): void,
    isFrontOffice: boolean
}

export const TicketCard: React.FC<TicketCardProps> = (
    { name, quantity_available, price, event_id, event_title, ticket_id, navigateToCheckout, isFrontOffice }
) => {

    const [buyAmount, setBuyAmount] = useState<number>(0)
    const [errorMessage, setErrorMessage] = useState<string>('')


    const handleBuyClick = () => {

        // Ticket Buy validations
        if (buyAmount > quantity_available || buyAmount < 1 ) {
            setErrorMessage(TicketCardErrors.invalid_ticket_amount)

            // Clear error message after 2 seconds
            setTimeout(() => {
                setErrorMessage('');
            }, 2000);
        } else {

            // pass purchase details to FO component
            if (ticket_id && event_title) {
                const purchaseDetails: PurchaseDetails = {
                    event_id : event_id,
                    event_name: event_title,
                    ticket_id : ticket_id,
                    ticket_title: name,
                    quantity_purchased : buyAmount,
                    price : price
                }
                console.log('gathered info for purchase!', purchaseDetails)
                navigateToCheckout(purchaseDetails)
            }



            console.log(`Customer made purchase! Bought ${buyAmount} tickets`);
        }
    }

    const handleBuyAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setBuyAmount(parseInt(e.target.value));
    };


    return (
        <Card sx={{ bgcolor: orange[50], maxWidth: 345, margin: '15px'}}>
            <CardContent>
                <Typography variant="h5" component="div">{name}</Typography>
                <Typography variant="body2" color="text.secondary">Price: {price}$</Typography>
                <Typography variant="body2" color="text.secondary">{quantity_available} tickets left !</Typography>
            </CardContent>
            <CardActions>
                {isFrontOffice &&
                    <>
                        <Input type="number" inputProps={{ min: 0, max: quantity_available }} disabled={quantity_available <= 0} placeholder="0" onChange={handleBuyAmountChange} />
                        <Button size="small" disabled={quantity_available <= 0} onClick={handleBuyClick}>Buy Now </Button>
                    </>
                }

            </CardActions>
            {errorMessage && <p>{errorMessage}</p>}
        </Card>
    );
}
