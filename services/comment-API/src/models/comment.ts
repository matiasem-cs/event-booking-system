import * as mongoose from "mongoose";


export interface CommentModel extends Document {
    event_id: string;
    author: string;
    datePublished: Date;
    content: string;
}

const commentSchema = new mongoose.Schema<CommentModel>(
    {
        event_id: {type: String, required: true, min: 1},
        author: {type: String, required: true, min: 1}, //todo: comes from user input - limit size
        datePublished: {type: Date, default: Date.now},
        content: {type: String, required: true, min: 1}
    }
);

export default mongoose.model("WSP-Project-Comment", commentSchema);
