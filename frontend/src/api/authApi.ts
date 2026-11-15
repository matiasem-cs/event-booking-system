import {
    APIStatus,
    CatalogEventInfo,
    CommentInfo,
    EventInfo,
    HammerheadResponse,
    OrderInfo,
    OrderInfoResponse,
    PayOrderBody,
    Ticket,
    UserHistoryModel,
    UserInfo,
    UserPermission,
    UserRating
} from "../types";
import axios, {AxiosError} from 'axios';


interface Credentials {
    username: string;
    password: string;
    secQuestion?: string;
    secAnswer?: string;
}
const baseURL = process.env.NODE_ENV === 'production' ? 'https://wsp-project-api-gateway-s7ma.onrender.com' : 'http://localhost:3000';
// const baseURL = 'http://localhost:3000'; // TODO: update before production

export const AuthApi = {
    login: async ({ username, password }: Credentials): Promise<APIStatus> => {
        try {
            // TODO: make a request to the server to login
            const response = await axios.post(`${baseURL}/api/login`, { username, password }, { withCredentials: true });
            
            if (response.status === 401) {
                return APIStatus.Unauthorized;
            }
            if (response.status === 400) { 
                return APIStatus.BadRequest;
            }
            if (response.status === 500) {
                return APIStatus.ServerError;
            }
            return APIStatus.Success;
        } catch (e) {
            return handleError(e);
        }
    },
    signUp: async ({ username, password , secQuestion, secAnswer }: Credentials): Promise<APIStatus> => {
        try {
            // TODO: make a request to the server to sign up
            const response = await axios.post(`${baseURL}/api/signup`, { username, password, secQuestion, secAnswer });
            if (response.status === 400) {
                if (response.statusText === 'Username already exists') {
                    return APIStatus.BadRequest;
                } else {
                    return APIStatus.Unauthorized;
                }
            }
            if (response.status === 500) {
                return APIStatus.ServerError;
            }

            return APIStatus.Success;
            
        } catch (e) {
            return handleError(e);
        }
    },
    logout: async (): Promise<APIStatus> => {
        try {
            // TODO: make a request to the server to logout
            const response = await axios.post(`${baseURL}/api/logout`, {}, { withCredentials: true });
            if (response.status === 200) {
                return APIStatus.Success;
            } else {
                return handleError(response.status);
            }
        } catch (e) {
            return handleError(e);
        }
    },
    getUserName: async (): Promise<string | APIStatus> => {
        try {
            const response = await axios.get(`${baseURL}/api/username`, { withCredentials: true });
            if (response.status === 401) {
                return APIStatus.Unauthorized;
            }
            // return the username
            return response.data.username;
        } catch (e) {
            return handleError(e);
        }
    },
    getUserPermission: async (): Promise<UserPermission | APIStatus> => {
        try {
            const response = await axios.get(`${baseURL}/api/permission`, { withCredentials: true });
            if (response.status === 401) {
                return APIStatus.Unauthorized;
            }
            // return the permission
            return response.data.permission as UserPermission;
        } catch (e) {
            return handleError(e);
        }
    },
    getSecurityQuestion: async (username: string): Promise<string | APIStatus> => {
        try {
            const response = await axios.post(`${baseURL}/api/users/forgot_password/${username}`);
            if (response.status === 404) {
                return APIStatus.NotFound;
            }
            return response.data;
        } catch (e) {
            return handleError(e);
        }
    },
    resetPassword: async ({ username, secAnswer, password }: Credentials): Promise<APIStatus> => {
        try {
            const securityAnswer = secAnswer;
            const newPassword = password;
            const response = await axios.put(`${baseURL}/api/users/reset_password/${username}`, { securityAnswer, newPassword });
            // console.log('response.message', response.data.message);
            if (response.status === 400) {
                return APIStatus.BadRequest;
            } else if (response.status === 404) {
                return APIStatus.NotFound;
            } else if (response.status === 401) { // wrong security answer
                return APIStatus.Unauthorized;
            } else if (response.status === 500) {
                return APIStatus.ServerError;
            }
            return APIStatus.Success;
        } catch (e) {
            return handleError(e);
        }
    },
    getUserInfo: async (): Promise<APIStatus | UserInfo> => {
        try {
            const response = await axios.get(`${baseURL}/api/user_info`, { withCredentials: true });
            if (response.status === 401) {
                return APIStatus.Unauthorized;
            } else if (response.status === 404) {
                return APIStatus.NotFound;
            } else if (response.status === 500) {
                return APIStatus.ServerError;
            }else if (response.status === 200) {
                return response.data;
            }
            return response.data;
        } catch (e) {
            return handleError(e);
        }
    },
    getCatalogEvents: async (skip:number, limit:number): Promise<APIStatus | CatalogEventInfo[]> => {
        try {
            if (skip < 0 || limit < 0) {
                return APIStatus.BadRequest;
            }
            const endpoint = `${baseURL}/api/eventsWithTicketsAvailable?skip=${skip}&limit=${limit}`;
            const response = await axios.get(endpoint, { withCredentials: true });
            if (response.status === 401) {
                return APIStatus.Unauthorized;
            } 
            else if (response.status === 500) {
                return APIStatus.ServerError;
            } else if (response.status === 200) {
                return response.data;
            }
            return APIStatus.ServerError;
        } catch (e) {
            return handleError(e);
        }
    },
    getBOCatalogEvents: async (skip:number, limit:number): Promise<APIStatus | CatalogEventInfo[]> => {
        try {
            // console.log('in the getBOCatalogEvents')    
            if (skip < 0 || limit < 0) {
                return APIStatus.BadRequest;
            }
            const endpoint = `${baseURL}/api/events?skip=${skip}&limit=${limit}`;
            const response = await axios.get(endpoint, { withCredentials: true });
            if (response.status === 401) {
                return APIStatus.Unauthorized;
            } 
            else if (response.status === 500) {
                return APIStatus.ServerError;
            } else if (response.status === 200) {
                return response.data;
            }
            return APIStatus.ServerError;
        } catch (e) {
            return handleError(e);
        }
    },
    getEventsByLowestPrice: async (skip:number, limit:number): Promise<APIStatus | CatalogEventInfo[]> => {
        try {
            if (skip < 0 || limit < 0) {
                return APIStatus.BadRequest;
            }
            const endpoint = `${baseURL}/api/eventsByLowestPrice?skip=${skip}&limit=${limit}`;
            const response = await axios.get(endpoint, { withCredentials: true });
            if (response.status === 401) {
                return APIStatus.Unauthorized;
            } 
            else if (response.status === 500) {
                return APIStatus.ServerError;
            } else if (response.status === 200) {
                return response.data;
            }
            return APIStatus.ServerError;
        } catch (e) {
            return handleError(e);
        }
    },
    getEventsByPriceRange: async (skip:number, limit:number, fromPrice: number, toPrice: number): Promise<APIStatus | CatalogEventInfo[]> => {
        try {
            if (skip < 0 || limit < 0 || fromPrice < 0 || toPrice < 0 || fromPrice > toPrice) {
                return APIStatus.BadRequest;
            }
            const endpoint = `${baseURL}/api/eventsByPriceRange?skip=${skip}&limit=${limit}&fromPrice=${fromPrice}&toPrice=${toPrice}`;
            const response = await axios.get(endpoint, { withCredentials: true });
            if (response.status === 401) {
                return APIStatus.Unauthorized;
            } 
            else if (response.status === 500) {
                return APIStatus.ServerError;
            } else if (response.status === 200) {
                return response.data;
            }
            return APIStatus.ServerError;
        } catch (e) {
            return handleError(e);
        }
    },
    getEventsByPriceRangeSorted: async (skip:number, limit:number, fromPrice: number, toPrice: number): Promise<APIStatus | CatalogEventInfo[]> => {
        try {
            if (skip < 0 || limit < 0 || fromPrice < 0 || toPrice < 0 || fromPrice > toPrice) {
                return APIStatus.BadRequest;
            }
            const endpoint = `${baseURL}/api/eventsByPriceRangeSorted?skip=${skip}&limit=${limit}&fromPrice=${fromPrice}&toPrice=${toPrice}`;
            const response = await axios.get(endpoint, { withCredentials: true });
            if (response.status === 401) {
                return APIStatus.Unauthorized;
            } 
            else if (response.status === 500) {
                return APIStatus.ServerError;
            } else if (response.status === 200) {
                return response.data;
            }
            return APIStatus.ServerError;
        } catch (e) {
            return handleError(e);
        }
    },
    getEvent: async (eventId: string): Promise<APIStatus | EventInfo> => {
        try {
            const response = await axios.get(`${baseURL}/api/events/${eventId}`, { withCredentials: true });
            if (response.status === 401) {
                return APIStatus.Unauthorized;
            } 
            else if (response.status === 500) {
                return APIStatus.ServerError;

            } else if (response.status === 200) {
                return response.data;
            }
            return APIStatus.ServerError;
        } catch (e) {
            return handleError(e);
        }
    },
    createEvent: async (event: EventInfo, tickets: Ticket[]): Promise<APIStatus | EventInfo> => {
        try {
            // console.log('AuthApi: event:', event);
            // console.log('AuthApi: tickets:', tickets);
            const response = await axios.post(`${baseURL}/api/events`, { event: event, tickets: tickets }, { withCredentials: true });
            if (response.status === 401 || response.status === 403) {
                return APIStatus.Unauthorized;
            } 
            else if (response.status === 500) {
                return APIStatus.ServerError;
            } else if (response.status === 201) {
                return response.data;
            }
            return response.data;
        } catch (e) {
            return handleError(e);
        }
    },
    updateEventDates: async (eventId: string, start_date: string, end_date: string): Promise<APIStatus | EventInfo> => {
        try {
            const response = await axios.put(`${baseURL}/api/events-date/${eventId}`, { start_date, end_date }, { withCredentials: true });
            if (response.status === 401 || response.status === 403) {
                return APIStatus.Unauthorized;
            } 
            else if (response.status === 500) {
                return APIStatus.ServerError;
            } else if (response.status === 200) {
                return response.data;
            }
            return response.data;
        } catch (e) {
            return handleError(e);
        }
    },
    createOrder: async (event_id: string, ticket_id: string, quantity_purchased: number, price: number): Promise<APIStatus | OrderInfoResponse> => {
        try {
            const response = await axios.post(`${baseURL}/api/orders`, { event_id, ticket_id, quantity_purchased, price }, { withCredentials: true });
            if (response.status === 401) {
                return APIStatus.Unauthorized;
            } 
            else if (response.status === 500) {
                return APIStatus.ServerError;
            } else if (response.status === 200) {
                return response.data;
            }
            return response.data;
        } catch (e) {
            return handleError(e);
        }
    },
    payOrder: async (payBody: PayOrderBody): Promise<APIStatus | HammerheadResponse> => {
        try {
            const response = await axios.post(`${baseURL}/api/orders/pay`, payBody, { withCredentials: true });
            if (response.status === 401) {
                return APIStatus.Unauthorized;
            } else if (response.status === 500) {
                return APIStatus.ServerError;
            } else if (response.status === 200) {
                return response.data;
            } else if (response.status === 404) {
                return APIStatus.NotFound;
            }
            return response.data;
        } catch (e) {
            if (axios.isAxiosError(e)) {
                const axiosError: AxiosError = e;
                if (axiosError.code === 'ECONNREFUSED') {
                    console.error('Connection refused error:', axiosError.message);
                    return APIStatus.ServerError; // Or handle the error as needed
                }
                if (axiosError.response) {
                    // console.log('axios error caught', axiosError.response)
                    // @ts-ignore
                    if (axiosError.response.status === 500 && axiosError.response.data.message === 'Credit card server error') {
                        // console.log('PAYMENT SERVER ERROR ! ')
                        return APIStatus.PaymentServerError;
                    } else {
                        return handleError(e);
                    }
                }
            }
            // Throw an error if no return statement is reached
            return APIStatus.PaymentServerError
        }
    },
    getOrderById: async (orderId: string): Promise<APIStatus | OrderInfo> => {
        try {
            const response = await axios.get(`${baseURL}/api/orders/${orderId}`, { withCredentials: true });
            if (response.status === 401) {
                return APIStatus.Unauthorized;
            } 
            else if (response.status === 500) {
                return APIStatus.ServerError;
            } else if (response.status === 404){
                return APIStatus.NotFound;
            } else if (response.status === 200) {
                return response.data;
            }
            return response.data;
        } catch (e) {
            return handleError(e);
        }
    }, 
    getTicketsByEventId: async (eventId: string): Promise<APIStatus | Ticket[]> => {
        try {
            const response = await axios.get(`${baseURL}/api/tickets/event/${eventId}`, { withCredentials: true });
            // console.log('below response')
            if (response.status === 401) {
                return APIStatus.Unauthorized;
            } 
            else if (response.status === 500) {
                return APIStatus.ServerError;
            } else if (response.status === 200) {
                return response.data;
            }
            return response.data;
        } catch (e) {
            // console.log('shit axios error')
            return handleError(e);
        }
    },
    createComment: async (event_id: string, content: string): Promise<APIStatus> => {
        try {
            const response = await axios.post(`${baseURL}/api/comments`, { event_id, content }, { withCredentials: true });
            if (response.status === 401) {
                return APIStatus.Unauthorized;
            } 
            else if (response.status === 500) {
                return APIStatus.ServerError;
            } else if (response.status === 201) {
                return APIStatus.Success;
            }
            return response.data;
        } catch (e) {
            return handleError(e);
        }
    }, 
    getCommentsByEventId: async (eventId: string,  limit?: number, skip?: number): Promise<APIStatus | CommentInfo[]> => {
        try {
            let endpoint;
            if (!limit && !skip) {
                endpoint = `${baseURL}/api/comments/event/${eventId}`
            } else if (!skip && limit) {
                endpoint = `${baseURL}/api/comments/event/${eventId}?&limit=${limit}`
            } else {
                // contains both limit and skip
                endpoint = `${baseURL}/api/comments/event/${eventId}?skip=${skip}&limit=${limit}`
            }
            const response = await axios.get(endpoint, { withCredentials: true });
            if (response.status === 401) {
                return APIStatus.Unauthorized;
            } 
            else if (response.status === 500) {
                return APIStatus.ServerError;
            } else if (response.status === 200) {
                return response.data;
            }
            return response.data;
        } catch (e) {
            return handleError(e);
        }
    },
    createRating: async (event_id: string, rating: number): Promise<APIStatus> => {
        try {
            const response = await axios.post(`${baseURL}/api/ratings`, { event_id, rating }, { withCredentials: true });
            if (response.status === 401) {
                return APIStatus.Unauthorized;
            } 
            else if (response.status === 500) {
                return APIStatus.ServerError;
            } else if (response.status === 201) {
                return APIStatus.Success;
            }
            return response.data;
        } catch (e) {
            // console.log(`create rating error:`, e)
            return handleError(e);
        }
    },
    updateRatingById: async (ratingId: string, rating: number): Promise<APIStatus> => {
        try {
            const response = await axios.put(`${baseURL}/api/ratings/${ratingId}`, { rating }, { withCredentials: true });
            if (response.status === 401) {
                return APIStatus.Unauthorized;
            } else if (response.status === 400) {
                return APIStatus.BadRequest;
            } else if (response.status === 404) {
                return APIStatus.NotFound;
            } else if (response.status === 500) {
                return APIStatus.ServerError;
            } else if (response.status === 200) {
                return APIStatus.Success;
            }
            return response.data;
        } catch (e) {
            return handleError(e);
        }
    },
    updateRatingByEventIdAndUserId: async (event_id: string, rating: number): Promise<APIStatus> => {
        try {
            const response = await axios.put(`${baseURL}/api/ratings/event-user/${event_id}`, { rating }, { withCredentials: true });
            if (response.status === 401) {
                return APIStatus.Unauthorized;
            } else if (response.status === 400) {
                return APIStatus.BadRequest;
            } else if (response.status === 404) {
                return APIStatus.NotFound;
            } else if (response.status === 500) {
                return APIStatus.ServerError;
            } else if (response.status === 200) {
                return APIStatus.Success;
            }
            return response.data;
        } catch (e) {
            return handleError(e);
        }
    },
    getRatingByEventIdAndUserId: async (event_id: string): Promise<APIStatus | UserRating> => {
        try {
            const response = await axios.get(`${baseURL}/api/ratings/event-user/${event_id}`, { withCredentials: true });
            // console.log('axios response:')
            // console.log(response.status)
            if (response.status === 401) {
                return APIStatus.Unauthorized;
            } else if (response.status === 404) {
                // console.log('matias');
                return APIStatus.NotFound;
            } else if (response.status === 500) {
                return APIStatus.ServerError;
            } else if (response.status === 200) {
                return response.data;
            }
            return response.data;
        } catch (e) {
            return handleError(e);
        }
    },
    getUserHistory: async (): Promise<APIStatus | UserHistoryModel[]> => {
        try {
            const response = await axios.get(`${baseURL}/api/user-history`, { withCredentials: true });
            if (response.status === 401) {
                return APIStatus.Unauthorized;
            } else if (response.status === 500) {
                return APIStatus.ServerError;
            } else if (response.status === 200) {
                return response.data;
            }
            return response.data;
        } catch (e) {
            return handleError(e);
        }
    }
};

const handleError = async (e: unknown): Promise<APIStatus> => {
    // TODO: handle errors here, check status code and return the appropriate APIStatus
    if (axios.isAxiosError(e)) {
        const axiosError: AxiosError = e;
        if (axiosError.response) {

                // console.log('in the error handler')
                // console.log(axiosError.response.status)
                // console.log(axiosError.message)

            if (axiosError.response.status === 401) {
                return APIStatus.Unauthorized;
            } else if (axiosError.response.status === 500) {
                return APIStatus.ServerError;
            } else if (axiosError.response.status === 404) {
                return APIStatus.NotFound;
            } else if (axiosError.response.status === 400) {
                return APIStatus.BadRequest;
            } else {
                return APIStatus.ServerError;
            }
        }
    }
    return APIStatus.ServerError;
};