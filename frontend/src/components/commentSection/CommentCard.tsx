import React from "react";
import './commentSectionStyle.css'

// MUI Component imports
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";


/* Component prop definitions */
export interface CommentCardProps {
    author: string,
    datePublished: string,
    content: string
}


export const CommentCard: React.FC <CommentCardProps> = ({ author, datePublished, content }) => {

    return (
        <Card className='comment-container'>
            <div className="comment-header">
                <Typography sx={{ margin : 1, fontWeight: 'bold' }} variant="subtitle1" component="div">{author}</Typography>
                <Typography sx={{ color: 'rgba(0, 0, 0, 0.54)' }} variant="subtitle1" component="div">{datePublished}</Typography>
            </div>
            <div className="comment-content">
                <Typography variant="body2" >{content}</Typography>
            </div>
        </Card>
    )
}