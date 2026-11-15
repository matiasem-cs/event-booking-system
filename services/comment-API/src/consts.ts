interface CommentOnEventMsgModel {
    event_id: string
}

export interface RabbitMQMessage {
    'action': string, 'data': CommentOnEventMsgModel | number | string
}

export const PROJECT_EXCHANGE = 'project_exchange';

export const COMMENT_QUEUE = 'comment_queue';


/* TIMEOUT OPTIONS */
export const TWO_MIN_TIMER = 2 * 60 * 1000;
export const ONE_MIN_TIMER = 60 * 1000;

export const FOUR_MIN_TIMER = 4 * 60 * 1000;


/** RabbitMQ actions **/
export const COMMENT_CREATED_ACTION = 'comment_created';
