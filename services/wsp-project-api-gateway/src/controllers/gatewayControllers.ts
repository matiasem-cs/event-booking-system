import e, { Request, Response } from 'express';
import axios, { AxiosError } from 'axios';
import '../consts.js';
import { COMMENT_SERVICE_URL, CREATE_COMMENT_ROUTE, CREATE_EVENT_ROUTE, CREATE_ORDER_ROUTE, CREATE_RATING_ROUTE, DELETE_EVENT_ACTION, DELETE_TICKETS_BY_EVENT_ID_ACTION, EVENT_CREATED_ACTION, EVENT_SERVICE_URL, GET_COMMENTS_ROUTE, GET_ALL_EVENTS_ROUTE, ORDER_SERVICE_URL, PAY_ORDER_ROUTE, RATING_SERVICE_URL, ROUTE_PREFIX, TICKET_SERVICE_URL, UPDATE_EVENT_DATE_ROUTE, USER_HISTORY_SERVICE_URL, GET_EVENTS_BY_LOWEST_PRICE_ROUTE, GET_EVENTS_BY_PRICE_RANGE_ROUTE, GET_EVENTS_BY_PRICE_RANGE_SORTED_ROUTE, GET_EVENTS_WITH_TICKETS_AVAILABLE_ROUTE } from '../consts.js';
import { sendMessage } from '../messaging/rabbitmq.js';
import jwt, { JwtPayload, Secret } from 'jsonwebtoken';
import { UserPermission } from '../consts.js';

// get all events
export const getAllEvents = async (req: Request, res: Response) => {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).send('Not logged in');
      return;
    }
  
    try {
        jwt.verify(token, process.env.JWT_SECRET as Secret);
    }
    catch (e) {
      res.status(401).send('Invalid token');
      return;
    }

    try {
        const { skip, limit } = req.query;
        let endpoint;
        if (skip && limit) {
            endpoint = EVENT_SERVICE_URL + ROUTE_PREFIX + GET_ALL_EVENTS_ROUTE + `?skip=${skip}&limit=${limit}`;
        } else if (skip) {
            endpoint = EVENT_SERVICE_URL + ROUTE_PREFIX + GET_ALL_EVENTS_ROUTE + `?skip=${skip}`;
        } else if (limit) {
            endpoint = EVENT_SERVICE_URL + ROUTE_PREFIX + GET_ALL_EVENTS_ROUTE + `?limit=${limit}`;
        } else {
            endpoint = EVENT_SERVICE_URL + ROUTE_PREFIX + GET_ALL_EVENTS_ROUTE;
        }
        // make the request to the Event service
        const eventServiceResponse = await axios.get(endpoint);
        // send the response from the Event service to the client
        res.status(eventServiceResponse.status).send(eventServiceResponse.data);
    } catch (error) {
        // Handle errors from the Event service
        if (error.response) {
            // The request was made and the server responded with a status code
            res.status(error.response.status).send(error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            res.status(500).send('Internal Server Error');
        } else {
            // Something happened in setting up the request that triggered an error
            res.status(500).send('Internal Server Error');
        }
    }
};

// get events by lowest price
export const getEventsByLowestPrice = async (req: Request, res: Response) => {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).send('Not logged in');
      return;
    }
  
    try {
        jwt.verify(token, process.env.JWT_SECRET as Secret);
    }
    catch (e) {
      res.status(401).send('Invalid token');
      return;
    }
    try {
        let endpoint
        const { skip, limit } = req.query;
        if (!skip && !limit) {
            endpoint = EVENT_SERVICE_URL + ROUTE_PREFIX + GET_EVENTS_BY_LOWEST_PRICE_ROUTE;
        } else if (!skip) {
            endpoint = EVENT_SERVICE_URL + ROUTE_PREFIX + GET_EVENTS_BY_LOWEST_PRICE_ROUTE + `?limit=${limit}`;
        } else if (!limit) {
            endpoint = EVENT_SERVICE_URL + ROUTE_PREFIX + GET_EVENTS_BY_LOWEST_PRICE_ROUTE + `?skip=${skip}`;
        } else {
            const queryParams = `?skip=${skip}&limit=${limit}`;
            endpoint = EVENT_SERVICE_URL + ROUTE_PREFIX + GET_EVENTS_BY_LOWEST_PRICE_ROUTE + queryParams;
        }
        console.log('endpoint: ', endpoint);
 
        // make the request to the Event service
        const eventServiceResponse = await axios.get(endpoint);
        // send the response from the Event service to the client
        res.status(eventServiceResponse.status).send(eventServiceResponse.data);
    } catch (error) {
        // Handle errors from the Event service
        if (error.response) {
            // The request was made and the server responded with a status code
            res.status(error.response.status).send(error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            res.status(500).send('Internal Server Error');
        } else {
            // Something happened in setting up the request that triggered an error
            res.status(500).send('Internal Server Error');
        }
    }
};

// get events by price range
export const getEventsByPriceRange = async (req: Request, res: Response) => {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).send('Not logged in');
      return;
    }
  
    try {
        jwt.verify(token, process.env.JWT_SECRET as Secret);
    }
    catch (e) {
      res.status(401).send('Invalid token');
      return;
    }
    try {
        const { fromPrice, toPrice, skip, limit } = req.query;
        if (!skip || !limit || !fromPrice || !toPrice) {
            res.status(400).send('Bad Request, please provide all the required query parameters');
        }
        const endpoint = EVENT_SERVICE_URL + ROUTE_PREFIX + GET_EVENTS_BY_PRICE_RANGE_ROUTE + `?fromPrice=${fromPrice}&toPrice=${toPrice}&skip=${skip}&limit=${limit}`;
        console.log('endpoint: ', endpoint);
 
        // make the request to the Event service
        const eventServiceResponse = await axios.get(endpoint);
        // send the response from the Event service to the client
        res.status(eventServiceResponse.status).send(eventServiceResponse.data);
    } catch (error) {
        // Handle errors from the Event service
        if (error.response) {
            // The request was made and the server responded with a status code
            res.status(error.response.status).send(error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            res.status(500).send('Internal Server Error');
        } else {
            // Something happened in setting up the request that triggered an error
            res.status(500).send('Internal Server Error');
        }
    }
}

// get events by price range sorted
export const getEventsByPriceRangeSorted = async (req: Request, res: Response) => {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).send('Not logged in');
      return;
    }
  
    try {
        jwt.verify(token, process.env.JWT_SECRET as Secret);
    }
    catch (e) {
      res.status(401).send('Invalid token');
      return;
    }
    try {
        const { fromPrice, toPrice, skip, limit } = req.query;
        if (!skip || !limit || !fromPrice || !toPrice) {
            res.status(400).send('Bad Request, please provide all the required query parameters');
        }
        const endpoint = EVENT_SERVICE_URL + ROUTE_PREFIX + GET_EVENTS_BY_PRICE_RANGE_SORTED_ROUTE + `?fromPrice=${fromPrice}&toPrice=${toPrice}&skip=${skip}&limit=${limit}`;
        console.log('endpoint: ', endpoint);
 
        // make the request to the Event service
        const eventServiceResponse = await axios.get(endpoint);
        // send the response from the Event service to the client
        res.status(eventServiceResponse.status).send(eventServiceResponse.data);
    } catch (error) {
        // Handle errors from the Event service
        if (error.response) {
            // The request was made and the server responded with a status code
            res.status(error.response.status).send(error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            res.status(500).send('Internal Server Error');
        } else {
            // Something happened in setting up the request that triggered an error
            res.status(500).send('Internal Server Error');
        }
    }
}

// get events with tickets available
export const getEventsWithTicketsAvailable = async (req: Request, res: Response) => {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).send('Not logged in');
      return;
    }
  
    try {
        jwt.verify(token, process.env.JWT_SECRET as Secret);
    }
    catch (e) {
      res.status(401).send('Invalid token');
      return;
    }
    try {
        const { skip, limit } = req.query;
        if (!skip || !limit) {
            res.status(400).send('Bad Request, please provide all the required query parameters');
        }
        const endpoint = EVENT_SERVICE_URL + ROUTE_PREFIX + GET_EVENTS_WITH_TICKETS_AVAILABLE_ROUTE + `?skip=${skip}&limit=${limit}`;
        console.log('endpoint: ', endpoint);
 
        // make the request to the Event service
        const eventServiceResponse = await axios.get(endpoint);
        // send the response from the Event service to the client
        res.status(eventServiceResponse.status).send(eventServiceResponse.data);
    } catch (error) {
        // Handle errors from the Event service
        if (error.response) {
            // The request was made and the server responded with a status code
            res.status(error.response.status).send(error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            res.status(500).send('Internal Server Error');
        } else {
            // Something happened in setting up the request that triggered an error
            res.status(500).send('Internal Server Error');
        }
    }
}

// get event by id
export const getEvent = async (req: Request, res: Response) => {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).send('Not logged in');
      return;
    }
  
    try {
        jwt.verify(token, process.env.JWT_SECRET as Secret);
    }
    catch (e) {
      res.status(401).send('Invalid token');
      return;
    }
    try {
        // set the endpoint
        const endpoint = EVENT_SERVICE_URL + ROUTE_PREFIX + GET_ALL_EVENTS_ROUTE + '/' + req.params.id;
        console.log('endpoint: ', endpoint);
        // make the request to the Event service
        const eventServiceResponse = await axios.get(endpoint);
        // send the response from the Event service to the client
        res.status(eventServiceResponse.status).send(eventServiceResponse.data);
    } catch (error) {
        // Handle errors from the Event service
        if (error.response) {
            // The request was made and the server responded with a status code
            res.status(error.response.status).send(error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            res.status(500).send('Internal Server Error');
        } else {
            // Something happened in setting up the request that triggered an error
            res.status(500).send('Internal Server Error');
        }
    }
}

// required request body
// {
//     event: { ... },
//     tickets: [ ... ]
// }

// create event
export const createEvent = async (req: Request, res: Response) => {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).send('Not logged in');
      return;
    }
  
    let permission;
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET as Secret);
      permission = (payload as JwtPayload).permission;
    }
    catch (e) {
      res.status(401).send('Invalid token');
      return;
    }
    if(permission !== UserPermission.Worker && permission !== UserPermission.Admin && permission !== UserPermission.Manager){
        res.status(403).send('Permission denied, only workers, admins and managers can create events');
        return;
    }
    
    try {
        const { event, tickets } = req.body;

        // Calculate lowest_price_available
        const lowestPriceAvailable = Math.min(...tickets.map(ticket => ticket.price));

        // Calculate quantity_available
        const quantityAvailable = tickets.reduce((total, ticket) => total + Number(ticket.quantity_available), 0);

        // Create the event object with updated data
        const updatedEvent = {
            ...event,
            lowest_price_available: lowestPriceAvailable,
            quantity_available: quantityAvailable
        };

        console.log('api-gateway at createEvent: ', updatedEvent);
        // set the endpoint
        const endpoint = EVENT_SERVICE_URL + ROUTE_PREFIX + CREATE_EVENT_ROUTE;
        console.log('endpoint: ', endpoint);

        // make the request to the Event service
        const eventServiceResponse = await axios.post(endpoint, updatedEvent);

        // make the request to the Ticket service
        if (eventServiceResponse.status === 201) {
            // Create tickets for the event
            console.log('api-gateway at createEvent tickets: ', tickets);
            const ticketServiceResponse = await axios.post(TICKET_SERVICE_URL + ROUTE_PREFIX + '/tickets/event/' + eventServiceResponse.data._id, {tickets});

            // If the Ticket service returns an error, delete the event from the Event service and tickets from the Ticket service
            // and send the error to the client
            if (ticketServiceResponse.status === 201) {
                res.status(201).send(eventServiceResponse.data);
                return;
            } else {
                let messageToEvent = { action: DELETE_EVENT_ACTION, data: { event_id: eventServiceResponse.data._id } };
                let messageToTicket = { action: DELETE_TICKETS_BY_EVENT_ID_ACTION, data: { event_id: eventServiceResponse.data._id } };
                await sendMessage(JSON.stringify(messageToEvent), 'Gateway Service');
                await sendMessage(JSON.stringify(messageToTicket), 'Gateway Service');
                res.status(ticketServiceResponse.status).send(ticketServiceResponse.data);
                return;
            }
        }
        console.log('api-gateway at createEvent event response: ', eventServiceResponse.data);
        res.status(eventServiceResponse.status).send(eventServiceResponse.data);

    } catch (error) {
        // Handle errors from the Event service
        if (error.response) {
            // The request was made and the server responded with a status code
            res.status(error.response.status).send(error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            res.status(500).send('Internal Server Error');
        } else {
            // Something happened in setting up the request that triggered an error
            res.status(500).send('Internal Server Error');
        }
    }
};


// update event dates
export const updateEventDates = async (req: Request, res: Response) => {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).send('Not logged in');
      return;
    }
  
    let permission;
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET as Secret);
      permission = (payload as JwtPayload).permission;
    }
    catch (e) {
      res.status(401).send('Invalid token');
      return;
    }

    if(permission !== UserPermission.Admin && permission !== UserPermission.Manager){
        res.status(403).send('Permission denied, only admins and managers can update events');
        return;
    }
    try {
        // set the endpoint
        const endpoint = EVENT_SERVICE_URL + ROUTE_PREFIX + '/events-date/' + req.params.id;
        console.log('endpoint: ', endpoint);
        // make the request to the Event service
        const eventServiceResponse = await axios.put(endpoint, req.body);

        //     let message = {
        //         action: EVENT_CREATED_ACTION,
        //         data: {
        //           event_id: eventServiceResponse.data._id,
        //           tickets: req.body.tickets
        //         }
        //     };
        //     await sendMessageFromGWToTicket(JSON.stringify(message));
        // }

        // send the response from the Event service to the client
        res.status(eventServiceResponse.status).send(eventServiceResponse.data);
    } catch (error) {
        // Handle errors from the Event service
        if (error.response) {
            // The request was made and the server responded with a status code
            res.status(error.response.status).send(error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            res.status(500).send('Internal Server Error');
        } else {
            // Something happened in setting up the request that triggered an error
            res.status(500).send('Internal Server Error');
        }
    }
};


// create order
export const createOrder = async (req: Request, res: Response) => {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).send('Not logged in');
      return;
    }
    let user_id;
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET as Secret);
        user_id = (payload as JwtPayload).user_id;
    }
    catch (e) {
      res.status(401).send('Invalid token');
      return;
    }
    console.log('Gateway createOrder user_id: ', user_id)
    console.log('Gateway createOrder req.body: ', req.body)
    
    try {
        const { event_id, ticket_id, quantity_purchased, price } = req.body;
        const orderBody = { user_id, event_id, ticket_id, quantity_purchased, price };
        // set the endpoint
        const endpoint = ORDER_SERVICE_URL + ROUTE_PREFIX + CREATE_ORDER_ROUTE;
        console.log('endpoint: ', endpoint);
        // make the request to the Event service
        const orderServiceResponse = await axios.post(endpoint, orderBody);

        // send the response from the Event service to the client
        res.status(orderServiceResponse.status).send(orderServiceResponse.data);
    } catch (error) {
        // Handle errors from the Event service
        if (error.response) {
            // The request was made and the server responded with a status code
            res.status(error.response.status).send(error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            res.status(500).send('Internal Server Error');
        } else {
            // Something happened in setting up the request that triggered an error
            res.status(500).send('Internal Server Error');
        }
    }
};


// pay order
export const payOrder = async (req: Request, res: Response) => {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).send('Not logged in');
      return;
    }
  
    try {
        jwt.verify(token, process.env.JWT_SECRET as Secret);
    }
    catch (e) {
      res.status(401).send('Invalid token');
      return;
    }

    try {
        // set the endpoint
        const endpoint = ORDER_SERVICE_URL + ROUTE_PREFIX + PAY_ORDER_ROUTE;
        console.log('endpoint: ', endpoint);
        // make the request to the Event service
        const orderServiceResponse = await axios.post(endpoint, req.body);

        // send the response from the Event service to the client
        res.status(orderServiceResponse.status).send(orderServiceResponse.data);
    } catch (error) {
        // Handle errors from the Event service
        if (error.response) {
            // The request was made and the server responded with a status code
            res.status(error.response.status).send(error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            res.status(500).send('Internal Server Error');
        } else {
            // Something happened in setting up the request that triggered an error
            res.status(500).send('Internal Server Error');
        }
    }
};


// get order by id
export const getOrder = async (req: Request, res: Response) => {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).send('Not logged in');
      return;
    }
  
    try {
      jwt.verify(token, process.env.JWT_SECRET as Secret);
    }
    catch (e) {
      res.status(401).send('Invalid token');
      return;
    }

    try {
        // set the endpoint
        const endpoint = ORDER_SERVICE_URL + ROUTE_PREFIX + CREATE_ORDER_ROUTE + '/' + req.params.id;
        console.log('endpoint: ', endpoint);
        // make the request to the Event service
        const orderServiceResponse = await axios.get(endpoint);

        // send the response from the Event service to the client
        res.status(orderServiceResponse.status).send(orderServiceResponse.data);
    } catch (error) {
        // Handle errors from the Event service
        if (error.response) {
            // The request was made and the server responded with a status code
            res.status(error.response.status).send(error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            res.status(500).send('Internal Server Error');
        } else {
            // Something happened in setting up the request that triggered an error
            res.status(500).send('Internal Server Error');
        }
    }
};


// get ticket by event_id
export const getTicketsByEventId = async (req: Request, res: Response) => {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).send('Not logged in');
      return;
    }
  
    try {
      jwt.verify(token, process.env.JWT_SECRET as Secret);
    }
    catch (e) {
      res.status(401).send('Invalid token');
      return;
    }

    try {
        // set the endpoint
        const endpoint = TICKET_SERVICE_URL + ROUTE_PREFIX + '/tickets/event/' + req.params.event_id;
        console.log('endpoint: ', endpoint);
        // make the request to the Event service
        const orderServiceResponse = await axios.get(endpoint);

        // send the response from the Event service to the client
        res.status(orderServiceResponse.status).send(orderServiceResponse.data);
    } catch (error) {
        // Handle errors from the Event service
        if (error.response) {
            // The request was made and the server responded with a status code
            res.status(error.response.status).send(error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            res.status(500).send('Internal Server Error');
        } else {
            // Something happened in setting up the request that triggered an error
            res.status(500).send('Internal Server Error');
        }
    }
};


// create comment
export const createComment = async (req: Request, res: Response) => {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).send('Not logged in');
      return;
    }
    let username;
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET as Secret);
        username = (payload as JwtPayload).username;
    }
    catch (e) {
      res.status(401).send('Invalid token');
      return;
    }

    const commentBody = { ...req.body, author: username };

    try {
        // set the endpoint
        const endpoint = COMMENT_SERVICE_URL + ROUTE_PREFIX + CREATE_COMMENT_ROUTE;
        console.log('endpoint: ', endpoint);
        //         const { event_id, author, content } = req.body;

        // make the request to the Event service
        const commentServiceResponse = await axios.post(endpoint, commentBody);

        // send the response from the Event service to the client
        res.status(commentServiceResponse.status).send(commentServiceResponse.data);
    } catch (error) {
        // Handle errors from the Event service
        if (error.response) {
            // The request was made and the server responded with a status code
            res.status(error.response.status).send(error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            res.status(500).send('Internal Server Error');
        } else {
            // Something happened in setting up the request that triggered an error
            res.status(500).send('Internal Server Error');
        }
    }
}


// get comment by event_id
export const getComments = async (req: Request, res: Response) => {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).send('Not logged in');
      return;
    }
  
    try {
      jwt.verify(token, process.env.JWT_SECRET as Secret);
    }
    catch (e) {
      res.status(401).send('Invalid token');
      return;
    }

    try {
        // set the endpoint
        const endpoint = COMMENT_SERVICE_URL + ROUTE_PREFIX + GET_COMMENTS_ROUTE + '/event/' + req.params.eventId;
        console.log('endpoint: ', endpoint);
        // make the request to the Event service
        const commentServiceResponse = await axios.get(endpoint);

        // send the response from the Event service to the client
        res.status(commentServiceResponse.status).send(commentServiceResponse.data);
    } catch (error) {
        // Handle errors from the Event service
        if (error.response) {
            // The request was made and the server responded with a status code
            res.status(error.response.status).send(error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            res.status(500).send('Internal Server Error');
        } else {
            // Something happened in setting up the request that triggered an error
            res.status(500).send('Internal Server Error');
        }
    }
};


// create Rating
export const createRating = async (req: Request, res: Response) => {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).send('Not logged in');
      return;
    }
    
    let user_id;
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET as Secret);
        user_id = (payload as JwtPayload).user_id;
    }
    catch (e) {
      res.status(401).send('Invalid token');
      return;
    }

    try {
        const ratingBody = { ...req.body, user_id };
        // set the endpoint
        const endpoint = RATING_SERVICE_URL + ROUTE_PREFIX + CREATE_RATING_ROUTE;
        console.log('endpoint: ', endpoint);
        //const { event_id, user_id, rating } = req.body;
        // make the request to the Event service
        const ratingServiceResponse = await axios.post(endpoint, ratingBody);

        // send the response from the Event service to the client
        res.status(ratingServiceResponse.status).send(ratingServiceResponse.data);
    } catch (error) {
        // Handle errors from the Event service
        if (error.response) {
            // The request was made and the server responded with a status code
            res.status(error.response.status).send(error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            res.status(500).send('Internal Server Error');
        } else {
            // Something happened in setting up the request that triggered an error
            res.status(500).send('Internal Server Error');
        }
    }
}


// update Rating by id
export const updateRating = async (req: Request, res: Response) => {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).send('Not logged in');
      return;
    }
  
    try {
      jwt.verify(token, process.env.JWT_SECRET as Secret);
    }
    catch (e) {
      res.status(401).send('Invalid token');
      return;
    }

    try {
        // set the endpoint
        const endpoint = RATING_SERVICE_URL + ROUTE_PREFIX + CREATE_RATING_ROUTE + '/' + req.params.id;
        console.log('endpoint: ', endpoint);
        // make the request to the Event service
        const ratingServiceResponse = await axios.put(endpoint, req.body);

        // send the response from the Event service to the client
        res.status(ratingServiceResponse.status).send(ratingServiceResponse.data);
    } catch (error) {
        // Handle errors from the Event service
        if (error.response) {
            // The request was made and the server responded with a status code
            res.status(error.response.status).send(error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            res.status(500).send('Internal Server Error');
        } else {
            // Something happened in setting up the request that triggered an error
            res.status(500).send('Internal Server Error');
        }
    }
}


// update Rating by event_id and user_id
export const updateRatingByEventAndUserId = async (req: Request, res: Response) => {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).send('Not logged in');
      return;
    }
    let user_id;
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET as Secret);
        user_id = (payload as JwtPayload).user_id;
    }
    catch (e) {
      res.status(401).send('Invalid token');
      return;
    }

    try {
        // set the endpoint
        const endpoint = RATING_SERVICE_URL + ROUTE_PREFIX + '/ratings/event-user/' + req.params.eventId + '/' + user_id;
        console.log('endpoint: ', endpoint);
        // make the request to the Event service
        const ratingServiceResponse = await axios.put(endpoint, req.body);

        // send the response from the Event service to the client
        res.status(ratingServiceResponse.status).send(ratingServiceResponse.data);
    } catch (error) {
        // Handle errors from the Event service
        if (error.response) {
            // The request was made and the server responded with a status code
            res.status(error.response.status).send(error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            res.status(500).send('Internal Server Error');
        } else {
            // Something happened in setting up the request that triggered an error
            res.status(500).send('Internal Server Error');
        }
    }
}


// Get Rating by event_id and user_id
export const getRatingByEventAndUserId = async (req: Request, res: Response) => {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).send('Not logged in');
      return;
    }
    
    let user_id;
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET as Secret);
        user_id = (payload as JwtPayload).user_id;
    }
    catch (e) {
      res.status(401).send('Invalid token');
      return;
    }

    try {
        // set the endpoint
        const endpoint = RATING_SERVICE_URL + ROUTE_PREFIX + '/ratings/event-user/' + req.params.eventId + '/' + user_id;
        console.log('endpoint: ', endpoint);
        // make the request to the Event service
        const ratingServiceResponse = await axios.get(endpoint);

        // send the response from the Event service to the client
        res.status(ratingServiceResponse.status).send(ratingServiceResponse.data);
    } catch (error) {
        // Handle errors from the Event service
        if (error.response) {
            // The request was made and the server responded with a status code
            res.status(error.response.status).send(error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            res.status(500).send('Internal Server Error');
        } else {
            // Something happened in setting up the request that triggered an error
            res.status(500).send('Internal Server Error');
        }
    }
}


// get user history
export const getUserHistoryByUserId = async (req: Request, res: Response) => {
    const token = req.cookies.token;
    if (!token) {
      res.status(401).send('Not logged in');
      return;
    }
    let user_id;
    try {
        const payload = jwt.verify(token, process.env.JWT_SECRET as Secret);
        user_id = (payload as JwtPayload).user_id;
    }
    catch (e) {
      res.status(401).send('Invalid token');
      return;
    }

    try {
        // set the endpoint
        const endpoint = USER_HISTORY_SERVICE_URL + ROUTE_PREFIX + '/user-history/' + user_id;
        console.log('endpoint: ', endpoint);
        // make the request to the Event service
        const orderServiceResponse = await axios.get(endpoint);

        // send the response from the Event service to the client
        res.status(orderServiceResponse.status).send(orderServiceResponse.data);
    } catch (error) {
        // Handle errors from the Event service
        if (error.response) {
            // The request was made and the server responded with a status code
            res.status(error.response.status).send(error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            res.status(500).send('Internal Server Error');
        } else {
            // Something happened in setting up the request that triggered an error
            res.status(500).send('Internal Server Error');
        }
    }
}

