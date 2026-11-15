import * as mongoose from "mongoose";
import {UserPermission} from "../consts";

export interface UserModel extends Document {
    username: string;
    password: string;
    permission: UserPermission;
    secQuestion: string;
    secAnswer: string;
    ratingCounter: number;
    closestEventName: string; 
    closestEventDate: Date;    //todo: remove this once async message broker is up
}

const userSchema = new mongoose.Schema
(
    {
        username: {type : String, required: true, unique: true, min: 1},  // no empty usernames //todo: validate unique
        password: {type : String, required: true, min: 1},  // no empty passwords
        permission: { type: String, enum: Object.values(UserPermission), default: UserPermission.User },
        secQuestion : {type: String, required: true, min: 1},
        secAnswer : {type: String, required: true, min: 1},
        ratingCounter: { type: Number, default: 0 },
        closestEventName: { type: String , default: ""},
        closestEventDate: { type: Date , default: new Date(0) } //todo: remove this once async message broker is up
    }
);

export default mongoose.model("WSP-Project-User", userSchema);