import React from 'react';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';



export interface OrderSummaryProps {
    event_name: string,
    ticket_title: string,
    price: number,
    quantity_purchased: number
}

export const OrderSummary: React.FC<OrderSummaryProps> = (
    { event_name, ticket_title, price, quantity_purchased }
) => (
    <Card sx={{
        p: 3,
        borderRight: { sm: 'none', md: '1px solid' },
        borderColor: { sm: 'none', md: 'divider' },
        minHeight: '100vh', // Set height of the entire page
        backgroundColor: '#fbfcfe',
    }}>
        <CardContent>
            <Typography sx={{margin: 1, mb: '20px', fontWeight: 400}} variant="h6" gutterBottom>Total:</Typography>

            <Typography sx={{margin: 1, mb: '20px', fontWeight: 500}} variant="h4" gutterBottom>${(price * quantity_purchased).toFixed(2)}</Typography>

            <Typography sx={{margin: 2}} variant="h6" gutterBottom>{event_name}</Typography>

            <Typography sx={{margin: 2}} variant="h6" gutterBottom>{quantity_purchased} x {ticket_title}</Typography>
        </CardContent>
    </Card>
);

