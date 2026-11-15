import React, {useEffect, useState} from "react";
import {APIStatus, isAPIStatus, PurchaseDetails, Ticket} from '../../types'
import {TicketCard} from "./TicketCard";
import {ErrorMessage} from "../error/error";


// MUI Component imports
import Grid from "@mui/material/Unstable_Grid2";
import Typography from "@mui/material/Typography";
import {AuthApi} from "../../api/authApi.ts";
import Box from "@mui/material/Box";



/* Component prop definitions */
export interface TicketTableProps {
    eventId: string;
    event_title: string | undefined,
    navigateToCheckout(details: PurchaseDetails): void,
    isFrontOffice: boolean
}

const TicketErrorMessages = {
    failed_ticket_fetch: 'Server Error - Could not fetch event Tickets, please try again later.',
    failed_unexpected: 'an unexpected error occurred, please try again later.',
    failed_auth: "Unauthorized access. Please login again.",
};


export const TicketTable: React.FC<TicketTableProps> = ({eventId, navigateToCheckout, event_title, isFrontOffice}) => {

    //todo: replace as prop


    const [eventTickets, setEventsTickets] = useState<Ticket[]>([])
    const [errorMessage, setErrorMessage] = useState<string>('')

    // Pagination states
    // const [page, setPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    // const [hasMore, setHasMore] = useState(true)

    useEffect(() => {
        // Fetch event comments
        const fetchEventTickets = async () => {
            try {
                console.log(`loading: ${loading}`)

                setLoading(true)    // enable loading prompt before fetch

                console.log(`event_id : ${eventId}`)

                const ticketResponse : Ticket[] | APIStatus = await AuthApi.getTicketsByEventId(eventId)

                // handle event promise response
                if (isAPIStatus(ticketResponse)) {
                    // Handle APIStatus enum
                    switch (ticketResponse) {
                        case APIStatus.Unauthorized:
                            console.log('ticket fetch - ' + TicketErrorMessages.failed_auth)
                            throw TicketErrorMessages.failed_auth
                        // throw "Unauthorized access. Please login again.";
                        case APIStatus.ServerError:
                            console.log(TicketErrorMessages.failed_ticket_fetch)

                            throw TicketErrorMessages.failed_ticket_fetch;
                        default:
                            console.log('ticket fetch - ' + TicketErrorMessages.failed_unexpected)
                            throw TicketErrorMessages.failed_unexpected
                    }
                } else {
                    // Handle EventInfo object
                    const ticketsData = ticketResponse;
                    console.log(`tickets:`)
                    console.log(ticketsData)
                    setEventsTickets(ticketsData)
                }

                setLoading(false);  // disable loading prompt after fetch


            } catch (error) {
                console.error("Error fetching ticket data:", error);

                setLoading(false)

                // @ts-ignore
                const errorMsg = error.toString()
                setErrorMessage(errorMsg)
            }
        };

        fetchEventTickets();
    },[])

    /* Child component props */
    // const ticketCardProps = {
    //     event_id: eventId,
    //     ticket_id :
    // }


    return (

        <Box
        sx={{
                        margin: 2,
                        border: '1px black',
                        borderRadius: '10px', // Adjust the radius as needed
                        boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)', // Adjust shadow parameters as needed
                      }}
        >
            <div className="ticket-table-header">
                <Typography sx={{ marginTop:2 , paddingTop:2, textAlign: 'center' }} alignContent="center" variant="h5">{isFrontOffice ? `Buy Tickets` : `Tickets status` }</Typography>
            </div>
            <div className="ticket-table-container">
                <Grid container spacing={2}>
                    {eventTickets?.map(ticket  => (
                        <Grid key={ticket._id} xs={12} sm={6} md={4} lg={3}>
                            <TicketCard
                                name={ticket.name}
                                quantity_available={ticket.quantity_available}
                                price={ticket.price}
                                ticket_id={ticket._id}
                                event_id={eventId}
                                event_title={event_title}
                                navigateToCheckout={navigateToCheckout}
                                isFrontOffice={isFrontOffice}
                            />
                        </Grid>
                    ))}
                </Grid>
            </div>

            <div className="temp-messages">
                {loading && <p>Loading...</p>}
                {errorMessage && <ErrorMessage message={errorMessage}/>}
            </div>
        </Box>

    );
}
