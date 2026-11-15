import React from 'react';
import Typography from '@mui/material/Typography';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Button from "@mui/material/Button";
import { Userbar, UserbarProps } from '../../../components/userbar/Userbar.tsx'; // Adjust the import path as needed

export interface SuccessPageProps {
    order_id: string | undefined,
    event_name: string,
    ticket_title: string,
    quantity_purchased: number,
    price: number,
    navigateToCatalogEventsPage(): void;
    navigateToUserPage(): void;
    handleLogout(): void;
}

export const SuccessPage: React.FC<SuccessPageProps> = ({
                                                            order_id,
                                                            navigateToCatalogEventsPage,
                                                            event_name,
                                                            price,
                                                            ticket_title,
                                                            quantity_purchased,
                                                            navigateToUserPage,
                                                            handleLogout
                                                        }) => {
    /* Child Component props */
    const userbarProps: UserbarProps = {
        navigateToUserPage,
        handleLogout
    };
    // return success page
    return (
        <div style={{ display: 'flex', backgroundColor: '#fbfcfe',flexDirection: 'column', alignItems: 'center', minHeight: '100vh' }}>
            <Userbar {...userbarProps} />
            <Card sx={{ borderRadius: '16px', width: '50%', minWidth: '300px', mt: 20 }}>
                <CardContent>
                    <Typography sx={{ textAlign: 'center', fontWeight: 'bold' }} variant="h5" gutterBottom>
                        Event successfully ordered!
                    </Typography>
                    <Typography sx={{ textAlign: 'center', marginTop: '20px' }} variant="body1" gutterBottom>
                        Event Name: {event_name}
                    </Typography>
                    <Typography sx={{ textAlign: 'center', marginTop: '20px' }} variant="body1" gutterBottom>
                        Ticket Title: {ticket_title}
                    </Typography>
                    <Typography sx={{ textAlign: 'center', marginTop: '20px' }} variant="body1" gutterBottom>
                        Quantity Purchased: {quantity_purchased}
                    </Typography>
                    <Typography sx={{ textAlign: 'center', marginTop: '20px' }} variant="body1" gutterBottom>
                        Total Price: ${price.toFixed(2)}
                    </Typography>
                    <Typography sx={{ textAlign: 'center', marginTop: '20px' }} variant="body1" gutterBottom>
                        Order ID: {order_id}
                    </Typography>
                    <Button
                        onClick={navigateToCatalogEventsPage}
                        variant="contained"
                        color="primary"
                        sx={{ display: 'block', margin: 'auto', mt: 5 }}
                    >
                        Go back to Events catalog
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};
