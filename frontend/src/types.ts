/* CONST ENUM DEFINITIONS */
export enum APIStatus {
    Success,
    BadRequest,
    Unauthorized,
    ServerError,
    NotFound,
    PaymentServerError
}

export enum UserPermission {
    User = 'U',
    Admin = "A",
    Manager = "M",
    Worker = "W",
}

export enum Pages {
    SIGNUP = 'signup',
    LOGIN = 'login',
    AUTHLAYOUT = 'authLayout',
    FORGOT_PASSWORD = 'forgot_password',
    TESTING = 'testing'
}

export enum FrontOfficePages {
    CATALOG_EVENTS = 'catalog_events',
    EVENT_PAGE = 'event_page',
    CHECKOUT = 'checkout',
    SUCCESS_PAGE = 'success_page',
    USER_HISTORY_PAGE = 'user_history_page'
}

export enum BackOfficePages {
    BO_CREATE_EVENT = 'bo_create_event',
    BO_EVENT_PAGE = 'bo_event_page',
    BO_CATALOG_EVENTS = 'bo_catalog_events',
}


/* PROP DEFINITIONS */
export interface PageProps {
    navigateToSignUpPage(): void;
    navigateToLoginPage(): void;
    navigateToAuthLayout(): void;
    navigateToForgotPasswordPage(): void;
}


/*** front office constants ***/

// Service addresses
export const EVENT_SERVICE_ADDRESS = 'event-api-trph.onrender.com'
export const GATEWAY_ADDRESS = 'wsp-project-api-gateway-trph.onrender.com'
export const EVENT_SERVICE_LOCAL_ADDRESS = 'localhost:3001'
export const COMMENT_SERVICE_LOCAL_ADDRESS = 'localhost:3000'

export const USER_HISTORY_LOCAL_ADDRESS ='localhost:3006'

export const ORDER_TICKETS_LOCAL_ADDRESS = 'localhost:5001'

export const API_GATEWAY_RENDERED_ADDRESS = "https://wsp-project-api-gateway-s7ma.onrender.com"


/* Object definitions */
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


/** Service Model Schema Definitions **/
export interface EventInfo {
    _id?: string;
    title: string;
    category: string;
    description: string;
    location: string;
    organizer: string;
    start_date: string;
    end_date: string;
    img: string;
    comment_count?: number;
    rating?: number;
    lowest_price_available?: number;
    quantity_available?: number;
}



export interface UserInfo {
    user_id: string,
    username: string,
    permission: UserPermission,
    rating_counter: number,
    closest_event_name: string,
    closest_event_date: string
}

export interface UserRating {
    event_id: string;
    user_id: string;
    rating: number;
}

export interface CatalogEventInfo {
    _id: string,
    title: string,
    category: EventCategory,
    start_date: string,
    img: string,
    comment_count: number,
    rating: number,
    lowest_price_available: number,
    quantity_available: number
}

export interface CommentInfo {
    _id: string;
    event_id: string;
    author: string;
    datePublished: string;
    content: string;
}

export interface Ticket {
    _id? : string,
    event_id? : string,
    name: string,
    quantity_available: number,
    price: number
}

export interface UpdateDatesBody {
    event_id: string,
    start_date: string,
    end_date: string
}

export interface OrderInfoResponse {
    message: string,
    order: OrderInfo
}

export interface OrderInfo {
    _id?: string;
    user_id: string;
    event_id: string;
    ticket_id: string;
    ticket_type: string;
    datePurchased: Date;
    quantity_purchased: number;
    total_cost: number;
    paymentStatus: 'pending' | 'approved' | 'failure' | 'waiting_payment' | 'waiting_payment_overtime';
}

export interface PurchaseDetails {
    event_id : string,
    event_name: string,
    ticket_id: string,
    ticket_title: string,
    quantity_purchased: number,
    price: number
}

export interface PayOrderBody {
    order_id: string;
    payment_details: {
        cc: string;
        holder: string;
        cvv: string;
        exp: string; // MM/YY - TODO: change to Date if needed
        charge: number;
    }
}

export interface HammerheadResponse {
    message: string,
    response: {paymentToken: string}
}

export interface UserHistoryModel {
    _id?: string,
    event_id: string,
    event_details: {
        title: string,
        category: string,
        location: string,
        organizer: string,
        start_date: string,
        end_date: string,
    },
    order_details: {
        tickets: any,
        totalCost: number,
        datePurchased: string,
        _id: string,
    }[]
}

/** utility functions **/
export const isAPIStatus = (value: any): value is APIStatus => {
    return Object.values(APIStatus).includes(value);
};


/** Utility Functions **/

export const formatDatefromISOstring = (dateString: string) => {
    const formattedDate = dateString.replace(/\.\d{3}Z$/, '');
    // Remove the seconds part
    const finalFormattedDate = formattedDate.replace(/:\d{2}$/, '');
    // console.log(finalFormattedDate); // Output: "2024-03-21T14:30"
    // Remove to T
    const finalWithoutTDate = finalFormattedDate.replace('T', ' ');
    return finalWithoutTDate;
}

export const isEventInfo = (obj: any): obj is EventInfo => {
    return (
        typeof obj._id === 'string' &&
        typeof obj.title === 'string' &&
        typeof obj.category === 'string' &&
        typeof obj.description === 'string' &&
        typeof obj.location === 'string' &&
        typeof obj.organizer === 'string' &&
        typeof obj.start_date === 'string' &&
        typeof obj.end_date === 'string' &&
        typeof obj.img === 'string' &&
        typeof obj.comment_count === 'number' &&
        typeof obj.rating === 'number' &&
        typeof obj.lowest_price_available === 'number' &&
        typeof obj.quantity_available === 'number'
    );
}