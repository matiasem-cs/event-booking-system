// only use this routes for updating events
export const GET_ALL_EVENTS_ROUTE = '/events';
export const GET_EVENT_ROUTE = '/events/:id';
export const CREATE_EVENT_ROUTE = '/events';
export const UPDATE_EVENT_ROUTE = '/events/:id';
export const UPDATE_EVENT_DATE_ROUTE = '/events-date/:id';
export const DELETE_EVENT_ROUTE = '/events/:id';
export const GET_EVENTS_BY_LOWEST_PRICE_ROUTE = '/eventsByLowestPrice';
export const GET_EVENTS_BY_PRICE_RANGE_ROUTE = '/eventsByPriceRange';
export const GET_EVENTS_BY_PRICE_RANGE_SORTED_ROUTE = '/eventsByPriceRangeSorted';
export const GET_EVENTS_WITH_TICKETS_AVAILABLE_ROUTE = '/eventsWithTicketsAvailable';

//
export const CREATE_RATING_ROUTE = '/ratings';
export const UPDATE_RATING_ROUTE = '/ratings/:id';
export const UPDATE_RATING_BY_EVENT_AND_USER_ID_ROUTE = '/ratings/event-user/:eventId/:userId';
export const GET_RATINGS_BY_EVENT_ID_ROUTE = '/ratings/event/:eventId';
export const GET_RATINGS_BY_USER_ID_ROUTE = '/ratings/user/:userId';
export const GET_RATING_BY_EVENT_AND_USER_ID_ROUTE = '/ratings/event-user/:eventId/:userId';


export enum EventCategory {
    CharityEvent = "Charity Event",
    Concert = "Concert",
    Conference = "Conference",
    Convention = "Convention",
    Exhibition = "Exhibition",
    Festival = "Festival",
    ProductLaunch = "Product Launch",
    SportsEvent = "Sports Event",
}


export const PROJECT_EXCHANGE = 'project_exchange';

export const EVENT_EXCHENGE = 'event_exchange';
export const EVENT_QUEUE = 'event_queue';
export const RATING_EXCHENGE = 'rating_exchange';
export const RATING_QUEUE = 'rating_queue';
export const TICKET_EXCHENGE = 'ticket_exchange';
export const TICKET_QUEUE = 'ticket_queue';
export const COMMENT_EXCHENGE = 'comment_exchange';
export const COMMENT_QUEUE = 'comment_queue';
export const USER_EXCHENGE = 'user_exchange';
export const USER_QUEUE = 'user_queue';
export const ORDER_EXCHENGE = 'order_exchange';
export const ORDER_QUEUE = 'order_queue';
export const USER_HISTORY_EXCHENGE = 'user_history_exchange';
export const USER_HISTORY_QUEUE = 'user_history_queue';
export const GATEWAY_EXCHENGE = 'gateway_exchange';
export const GATEWAY_QUEUE = 'gateway_queue';


export const EVENT_RETRY_QUEUE = 'event_retry_queue';


/** RabbitMQ message structure **/
export interface RabbitMQMessage {
    action: string;
    data: any;
}

/** RabbitMQ actions **/
export const RATING_UPDATED_ACTION = 'rating_updated';
export const RATING_CREATED_ACTION = 'rating_created';

export const EVENT_CREATED_ACTION = 'event_created';
export const EVENT_UPDATED_DATE_ACTION = 'event_updated_date';
export const DELETE_EVENT_ACTION = 'delete_event';


export const TICKETS_QUANTITY_CHANGED_ACTION = 'tickets_quantity_changed';
export const ADD_EVENT_QUANTITY_AVAILABLE = 'order_ticket_add';
export const SUBTRACT_EVENT_QUANTITY_AVAILABLE = 'order_ticket_subtract';

export const COMMENT_CREATED_ACTION = 'comment_created';
export const UPDATE_EVENT_LOWEST_PRICE_ACTION = 'update_event_lowest_price';

