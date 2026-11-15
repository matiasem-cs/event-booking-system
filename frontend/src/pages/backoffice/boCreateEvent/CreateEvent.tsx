import * as React from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import Link from '@mui/material/Link';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import EditCalendarOutlinedIcon from '@mui/icons-material/EditCalendarOutlined';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Divider from '@mui/material/Divider';
import DeleteIcon from '@mui/icons-material/Delete';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import SendIcon from '@mui/icons-material/Send';

import { ErrorMessage } from '../../../components/error/error';
import { Loader } from '../../../components/loader/loader';
import { APIStatus, EventCategory, EventInfo, Ticket, isEventInfo} from '../../../types';
import { Userbar, UserbarProps } from '../../../components/userbar/Userbar';
import { AuthApi } from '../../../api/authApi';
import { SuccessMessage } from '../../../components/success/success';


export interface CreateEventProps {
  navigateToBOCatalogPage: () => void;
  handleLogout: () => void;
}



export const CreateEvent: React.FC<CreateEventProps> = (
  { handleLogout , navigateToBOCatalogPage }
) => {
    const [eventName, setEventName] = React.useState('');
    const [eventLocation, setEventLocation] = React.useState('');
    const [eventOrganizer, setEventOrganizer] = React.useState('');
    const [eventImageURL, setEventImageURL] = React.useState('');
    const [eventDescription, setEventDescription] = React.useState('');
    const [eventCategory, setEventCategory] = React.useState('');
    const [eventStartDate, setEventStartDate] = React.useState('');
    const [eventEndDate, setEventEndDate] = React.useState('');
    const [tickets, setTickets] = React.useState<Ticket[]>([{ name: '', quantity_available: 0, price: 0 }]);
    const [ticketErrors, setTicketErrors] = React.useState<string[]>([]); // Track ticket errors
    const [lastTicketError, setLastTicketError] = React.useState<string>(''); // Error message for removing last ticket
    const [errorMessage, setErrorMessage] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [successMessage, setSuccessMessage] = React.useState('');
    // const [dissableSubmit, setDissableSubmit] = React.useState(false);

    const maxLength = 400;

    React.useEffect(() => {
      // console.log('CreateEvent useEffect');
      // console.log('tickets:', tickets);
      // console.log('ticketErrors:', ticketErrors);
    },[]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        
        setIsLoading(true);
        setErrorMessage('');
        setSuccessMessage('');
        setTicketErrors([]);
        setLastTicketError('');

        const data = new FormData(event.currentTarget);
        // Fields validation
        if (!data.get('eventName') ||
         !data.get('eventDescription') ||
          !data.get('eventLocation') ||
           !data.get('eventOrganizer') ||
            !data.get('eventImageURL') ||
             !data.get('eventCategory') ||
              !data.get('eventStartDate') ||
                !data.get('eventEndDate')
        ){
          // console.log('eventName:', data.get('eventName'));
          // console.log('eventDescription:', data.get('eventDescription'));
          // console.log('eventLocation:', data.get('eventLocation'));
          // console.log('eventOrganizer:', data.get('eventOrganizer'));
          // console.log('eventImageURL:', data.get('eventImageURL'));
          // console.log('eventCategory:', data.get('eventCategory'));
          // console.log('eventStartDate:', data.get('eventStartDate'));
          // console.log('eventEndDate:', data.get('eventEndDate'));
          setErrorMessage('All Event fields are required');
          setIsLoading(false);
          return;
        }
        
        // const startDateString = `${data.get('eventStartDate')}`;
        // const endDateString = `${data.get('eventEndDate')}`;
        const startDateString = eventStartDate;
        const endDateString = eventEndDate;
        const startDate = new Date(startDateString);
        const endDate = new Date(endDateString);

        if (startDate < new Date()) {
          // console.log('startDate in the past!');
          // console.log('startDate:', startDate);
          setErrorMessage('Start date must be in the future');
          setIsLoading(false);
          return;
        }

        if (startDate > endDate) {
          setErrorMessage('End date must be after start date');
          setIsLoading(false);
          return;
        }

        const newTicketErrors = tickets.map((ticket) => {
          if(!ticket.name){
            return 'Ticket name is required';
          } else if (!ticket.quantity_available){
            return 'Quantity available is required';
          } else if (!ticket.price){
            return 'Price is required';
          }
          if (ticket.quantity_available <= 0) {
            return 'Quantity must be a positive number';
          }
          if (ticket.price <= 0) {
            return 'Price must be a positive number';
          }
          return '';
        });

        setTicketErrors(newTicketErrors);
        // If there are no errors, submit the form
        if (!newTicketErrors.some((error) => error)) {

          const event: EventInfo = {
            title: data.get('eventName') as string,
            description: data.get('eventDescription') as string,
            location: data.get('eventLocation') as string,
            organizer: data.get('eventOrganizer') as string,
            img: data.get('eventImageURL') as string,
            category: data.get('eventCategory') as EventCategory,
            start_date: startDateString,
            end_date: endDateString
          }

          // console.log('CreateEvent tickets:', tickets);

          const res = await AuthApi.createEvent(event, tickets);

          // Check if the response is an EventInfo object
          if (isEventInfo(res)) {
            // console.log('Event created:', res);
            setSuccessMessage('Event created successfully');
         
            setTimeout(() => {
              setEventName('');
              setEventLocation('');
              setEventOrganizer('');
              setEventImageURL('');
              setEventDescription('');
              setEventCategory('');
              setTickets([{ name: '', quantity_available: 0, price: 0 }]);
              setTicketErrors([]);
              setLastTicketError('');
              setErrorMessage('');
              setIsLoading(false);
              setSuccessMessage('');
              // setEventStartDate('');
              // setEventEndDate('');
            }
            , 10000);

          } else { // Handle error response

            if (res === APIStatus.Unauthorized) {
              setErrorMessage('Unauthorized, please login again');
            } else if (res === APIStatus.BadRequest) {
              setErrorMessage('Failed to create event, Bad request');
            } else if (res === APIStatus.ServerError) {
              setErrorMessage('Failed to create event, Server error');
            } else {
              setErrorMessage('Failed to create event, Unexpected error' );
            }
          }
          // Your form submission logic here
        } else {
          setErrorMessage('Please fix Ticket errors before submitting the form');
        }
        setIsLoading(false);
    };


    const handleEventNameChange = (event: any) => {
      setEventName(event.target.value);
    };

    const handleEventLocationChange = (event: any) => {
      setEventLocation(event.target.value);
    };

    const handleEventOrganizerChange = (event: any) => {
      setEventOrganizer(event.target.value);
    };

    const handleEventImageURLChange = (event: any) => {
      setEventImageURL(event.target.value);
    };

    const handleEventCategoryChange = (event: SelectChangeEvent) => {
      setEventCategory(event.target.value as EventCategory);
    };

    const handleEventDescriptionChange = (event: any) => {
      setEventDescription(event.target.value);
    };

    /** Handeling tickets **/
    
  const handleAddTicket = () => {
    setErrorMessage('');
    setTickets([...tickets, { name: '', quantity_available: 0, price: 0 }]);
    setTicketErrors([...ticketErrors, '']); // Add an empty error message for the new ticket
    setLastTicketError(''); // Reset last ticket error message
  };

  const handleRemoveTicket = (index: number) => {
    if (tickets.length === 1){
      setLastTicketError('Cannot remove the last ticket');
      setErrorMessage('');
      return; // Minimum number of tickets allowed is 1
    } 
    setLastTicketError(''); // Reset last ticket error message
    const updatedTickets = [...tickets];
    updatedTickets.splice(index, 1);
    setTickets(updatedTickets);
    const updatedErrors = [...ticketErrors];
    updatedErrors.splice(index, 1);
    setTicketErrors(updatedErrors);
    setErrorMessage('');
  };

  const handleTicketChange = (index: number, field: keyof Ticket, value: string) => {
    const updatedTickets = [...tickets];
    updatedTickets[index] = {
      ...updatedTickets[index],
      [field]: value,
    };
    setTickets(updatedTickets);
  };


  // console.log(`date is: ${eventDate}`)

    /* Child component prop definitions */
  const userbarProps: UserbarProps = {
    navigateToCreateEventPage: () => {},
    handleLogout,
    navigateToUserPage: () => {}
  }


  return (
    <ThemeProvider theme={createTheme()}>
      <Userbar {...userbarProps} />
      <Container component="main" maxWidth="lg" >
        <CssBaseline />
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: '1px black',
            borderRadius: '10px', // Adjust the radius as needed
            boxShadow: '0px 0px 10px rgba(0, 0, 0, 0.2)', // Adjust shadow parameters as needed
            padding: 3,
            margin: 3
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
            <EditCalendarOutlinedIcon />
          </Avatar>
          <Typography component="h1" variant="h5">
            Create Event
          </Typography>
          <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={6}>
                <TextField
                  autoComplete="event-name"
                  name="eventName"
                  required
                  fullWidth
                  id="eventName"
                  label="Event Name"
                  autoFocus
                  value={eventName}
                  onChange={handleEventNameChange}
                />
              </Grid>
              <Grid item xs={6}>
              <FormControl fullWidth id="category-form">
                <InputLabel id="event-category">Event Category</InputLabel>
                  <Select
                    labelId="event-category"
                    name='eventCategory'
                    id="event-category"
                    value={eventCategory}
                    label="Event Category"
                    onChange={handleEventCategoryChange}
                  >
                  <MenuItem value={EventCategory.CharityEvent}>{`${EventCategory.CharityEvent}`}</MenuItem>
                  <MenuItem value={EventCategory.Concert}>{`${EventCategory.Concert}`}</MenuItem>
                  <MenuItem value={EventCategory.Conference}>{`${EventCategory.Conference}`}</MenuItem>
                  <MenuItem value={EventCategory.Convention}>{`${EventCategory.Convention}`}</MenuItem>
                  <MenuItem value={EventCategory.Exhibition}>{`${EventCategory.Exhibition}`}</MenuItem>
                  <MenuItem value={EventCategory.Festival}>{`${EventCategory.Festival}`}</MenuItem>
                  <MenuItem value={EventCategory.ProductLaunch}>{`${EventCategory.ProductLaunch}`}</MenuItem>
                  <MenuItem value={EventCategory.SportsEvent}>{`${EventCategory.SportsEvent}`}</MenuItem>
                </Select>
              </FormControl>
              </Grid>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="eventDescription"
                  label="Event Description"
                  name="eventDescription"
                  multiline
                  rows={4}
                  value={eventDescription}
                  onChange={handleEventDescriptionChange}
                  inputProps={{ maxLength }}
                  helperText={`${eventDescription.length}/${maxLength}`}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  required
                  fullWidth
                  id="eventLocation"
                  label="Event Location"
                  name="eventLocation"
                  value={eventLocation}
                  onChange={handleEventLocationChange}
                />
              </Grid>
              <Grid item xs={6}>
                <TextField
                  required
                  fullWidth
                  id="eventOrganizer"
                  label="Event Organizer"
                  name="eventOrganizer"
                  value={eventOrganizer}
                  onChange={handleEventOrganizerChange}
                />
              </Grid>
              <Grid item xs={6}>
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
              <Grid item xs={6}>
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
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  id="eventImageURL"
                  label="Image URL"
                  name="eventImageURL"
                  value={eventImageURL}
                  onChange={handleEventImageURLChange}
                />
              </Grid>
              {tickets.map((ticket, index) => (
                <Grid key={index} container item spacing={5}>
                  <Grid item xs={12}>
                    <Divider />
                    <Typography align='center' component="h6" variant="h6" marginTop={2}>Ticket {index + 1}</Typography>
                  </Grid>
                  <Grid item xs={12} sm={4}>
                    <TextField
                      required
                      fullWidth
                      id={`ticketName-${index}`}
                      label="Ticket Name"
                      name={`ticketName-${index}`}
                      value={ticket.name}
                      onChange={(e) => handleTicketChange(index, 'name', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <TextField
                      required
                      fullWidth
                      id={`ticketQuantity-${index}`}
                      label="Quantity Available"
                      name={`ticketQuantity-${index}`}
                      type="number"
                      value={ticket.quantity_available}
                      onChange={(e) => handleTicketChange(index, 'quantity_available', e.target.value)}
                    />
                  </Grid>
                  <Grid item xs={6} sm={4}>
                    <TextField
                      required
                      fullWidth
                      id={`ticketPrice-${index}`}
                      label="Price (USD)"
                      name={`ticketPrice-${index}`}
                      type="number"
                      value={ticket.price}
                      onChange={(e) => handleTicketChange(index, 'price', e.target.value)}
                    />
                  </Grid>
                  {ticketErrors[index] && (
                    <Grid item xs={12}>
                      <Typography color="error">{ticketErrors[index]}</Typography>
                    </Grid>
                  )}
                  <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                    {/* Add remove ticket button */}
                    <Button
                      type="button"
                      variant="contained"
                      color='error'
                      startIcon={<DeleteIcon />}
                      onClick={() => handleRemoveTicket(index)}
                    >
                      Remove Ticket
                    </Button>
                  </Grid>
                </Grid>              
              ))}
              <Grid item xs={12}>
                <Divider variant='middle'/>
              </Grid>
              <Grid item xs={12} >
                {lastTicketError && <ErrorMessage message={lastTicketError}/>}
                <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'center' }}>
                  <Button
                    type="button"
                    variant="outlined"
                    startIcon={<AddOutlinedIcon />}
                    onClick={handleAddTicket}
                  >
                    Add Ticket
                  </Button>
                </Grid>
              </Grid>
            </Grid>
            {errorMessage && <ErrorMessage message={errorMessage}/>}    
            {successMessage && <SuccessMessage message={successMessage}/>}   
            {isLoading ? <Loader /> :
              
              <Grid item xs={12} sm={8} sx={{ display: 'flex', justifyContent: 'center'}}>
                <Button
                  type="submit"
                  variant="contained"
                  size='large'
                  fullWidth
                  endIcon={<SendIcon />}
                  sx={{ mt: 3, mb: 3}}
                >
                  Create Event
                </Button>
              </Grid>}
            
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="#" variant="body2" onClick={navigateToBOCatalogPage}>
                  Back to Event Catalog 
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Container>
    </ThemeProvider>
  );
}

