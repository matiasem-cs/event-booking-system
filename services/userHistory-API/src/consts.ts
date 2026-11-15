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

interface OrderedEventDetails {
    user_id: string,
    event_id: string,
    eventName : string,
    start_date: Date
}

export interface UpdateClosestEvtMsg {
    user_id: string,
    closest_event: any
}

export interface RabbitMQMessage {
    'action': string, 'data': number | string | OrderedEventDetails | UpdateClosestEvtMsg[]
}

export const PROJECT_EXCHANGE = 'project_exchange';
export const USER_HISTORY_EXCHENGE = 'user_history_exchange';
export const USER_HISTORY_QUEUE = 'user_history_queue';
export const EVENT_EXCHENGE = 'event_exchange';
export const TICKET_EXCHENGE = 'ticket_exchange';
export const ORDER_EXCHENGE = 'order_exchange';
export const USER_EXCHENGE = 'user_exchange';
export const GATEWAY_EXCHENGE = 'gateway_exchange';


/** RabbitMQ actions **/
export const ORDER_CREATED_ACTION = 'order_created';
export const USER_ORDERED_EVENT_ACTION = 'ordered_event';
export const EVENT_UPDATED_DATE_ACTION = 'event_updated_date';
export const UPDATE_CLOSEST_EVENT_ACTION = 'update_closest_event';


/* TIMEOUT OPTIONS */
export const TWO_MIN_TIMER = 2 * 60 * 1000;
export const ONE_MIN_TIMER = 60 * 1000;

export const FOUR_MIN_TIMER = 4 * 60 * 1000;

