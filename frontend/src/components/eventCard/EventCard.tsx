import React from "react";
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import {CatalogEventInfo} from "../../types.ts";
import {CardActions, CardMedia} from "@mui/material";
import Button from "@mui/material/Button";
import { formatDatefromISOstring } from "../../types.ts";

/* component prop definitions */
interface EventCardProps {
    isFrontOffice: boolean;
    eventInfo: CatalogEventInfo;
    onLearnMore: () => void;
}

export const EventCard: React.FC<EventCardProps> = ({eventInfo , onLearnMore, isFrontOffice}) => {

    return (
        <Card sx={{ maxWidth: 345, margin: '15px', marginLeft:'50px'}}>
            <CardMedia
                sx={{ height: 140 }}
                image={eventInfo.img}
                title={eventInfo.title + ' img'}
            />
            <CardContent>
                <Typography variant="h5" component="div">{eventInfo.title}</Typography>
                <Typography variant="body2" color="text.secondary">{formatDatefromISOstring(eventInfo.start_date)}</Typography>
                <Typography variant="body2" color="text.secondary">Available tickets: {eventInfo.quantity_available}</Typography>
                {isFrontOffice && <Typography variant="body2" color="text.secondary">Starting from: {eventInfo.lowest_price_available}$</Typography>}
            </CardContent>
            <CardActions>
                <Button size="small" onClick={onLearnMore}>Learn More</Button>
            </CardActions>
        </Card>
    );
}

export default EventCard;
