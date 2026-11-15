import * as dotenv from 'dotenv';
dotenv.config();

//services URLs
export const AUTH_SERVICE_URL = 'http://localhost:3000';
export const EVENT_SERVICE_URL = process.env.EVENT_URL || 'http://localhost:3001';
export const RATING_SERVICE_URL = process.env.RATING_URL || 'http://localhost:3001';
export const TICKET_SERVICE_URL = process.env.TICKET_URL || 'http://localhost:3002';
export const ORDER_SERVICE_URL = process.env.ORDER_URL || 'http://localhost:3002';
export const COMMENT_SERVICE_URL = process.env.COMMENT_URL || 'http://localhost:3003';
export const USER_HISTORY_SERVICE_URL = process.env.USERHISTORY_URL || 'http://localhost:3004';


export const ROUTE_PREFIX = '/api';

//User routes
export const ADMIN_LOGIN_PATH = "/admin/login";
export const LOGIN_PATH = "/login";
export const LOGOUT_PATH = "/logout";
export const SIGNUP_PATH = "/signup";
export const USERNAME_PATH = "/username";
export const GET_USER_PERMISSION = "/permission";
export const GET_USERS = "/users";
export const GET_USER_BY_ID = "/users/:id";
export const UPDATE_USER = "/users/:id";
export const UPDATE_USER_PERMISSION = "/update_permission/:id";
export const FORGOT_PASSWORD = "/users/forgot_password/:username";
export const VERIFY_SECURITY_ANSWER = "/users/security_answer/:username"; // get security answer in body, return token if true
export const RESET_PASSWORD = "/users/reset_password/:username"; // return
export const GET_USER_INFO = "/user_info";
export const GET_USER_INFO_BY_ID = "/user_info/:id";

// Event routes
export const GET_ALL_EVENTS_ROUTE = '/events'; // done
export const GET_EVENT_ROUTE = '/events/:id'; // done
export const CREATE_EVENT_ROUTE = '/events';
export const UPDATE_EVENT_DATE_ROUTE = '/events-date/:id';
export const GET_EVENTS_BY_LOWEST_PRICE_ROUTE = '/eventsByLowestPrice';
export const GET_EVENTS_BY_PRICE_RANGE_ROUTE = '/eventsByPriceRange';
export const GET_EVENTS_BY_PRICE_RANGE_SORTED_ROUTE = '/eventsByPriceRangeSorted';
export const GET_EVENTS_WITH_TICKETS_AVAILABLE_ROUTE = '/eventsWithTicketsAvailable';

/** add get events sorted */

// Rating routes
export const GET_RATINGS_ROUTE = '/ratings';
export const GET_RATING_ROUTE = '/ratings/:id';
export const CREATE_RATING_ROUTE = '/ratings';
export const UPDATE_RATING_ROUTE = '/ratings/:id';
export const GET_RATING_BY_EVENT_AND_USER_ID_ROUTE = '/ratings/event-user/:eventId';
export const UPDATE_RATING_BY_EVENT_AND_USER_ID_ROUTE = '/ratings/event-user/:eventId';


// Ticket routes
export const GET_TICKETS_BY_ENEVT_ID_ROUTE = '/tickets/event/:event_id';
export const CREATE_TICKETS_FOR_EVENT_ROUTE = '/tickets/event/:eventId';

// Comment routes
export const GET_COMMENTS_ROUTE = '/comments';
export const CREATE_COMMENT_ROUTE = '/comments';
export const GET_COMMENTS_BY_EVENT_ROUTE = '/comments/event/:eventId';

// Order routes
export const CREATE_ORDER_ROUTE = '/orders';
export const PAY_ORDER_ROUTE = '/orders/pay';
export const GET_ORDER_ROUTE = '/orders/:id';


// User History routes
export const GET_USER_HISTORY_ROUTE = '/user-history';

export enum UserPermission {
    User = 'U',
    Admin = "A",
    Manager = "M",
    Worker = "W",
}


// RabbitMQ
export const PROJECT_EXCHANGE = 'project_exchange';
export const EVENT_EXCHENGE = 'event_exchange';
export const RATING_EXCHENGE = 'rating_exchange';
export const TICKET_EXCHENGE = 'ticket_exchange';
export const COMMENT_EXCHENGE = 'comment_exchange';
export const ORDER_EXCHENGE = 'order_exchange';
export const USER_HISTORY_EXCHENGE = 'user_history_exchange';
export const USER_EXCHENGE = 'user_exchange';
export const USER_QUEUE = 'user_queue';
export const GATEWAY_EXCHENGE = 'gateway_exchange';
export const GATEWAY_QUEUE = 'gateway_queue';


// Event actions
export const EVENT_CREATED_ACTION = 'event_created';
export const RATING_CREATED_ACTION = 'rating_created';
export const UPDATE_CLOSEST_EVENT_ACTION = 'update_closest_event';
export const DELETE_EVENT_ACTION = 'delete_event';
export const DELETE_TICKETS_BY_EVENT_ID_ACTION = 'delete_tickets_by_event_id';
export const USER_ORDERED_EVENT_ACTION = 'ordered_event';



export interface EventModel{
    title: string;
    category: string;
    description: string;
    location: string;
    organizer: string;
    start_date: Date;
    end_date: Date;
    img: string;
    comment_count: number;
    rating: number;
    lowest_price_available: number;
    quantity_available: number;
}

export interface OrderBody { 
    user_id: string;
    event_id: string;
    ticket_id: string; 
    quantity_purchased: number;
    price: number;
}