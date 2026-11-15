import React, {useEffect, useState} from "react";

import './commentSectionStyle.css'
import {CommentCard} from "./CommentCard.tsx";
import {ErrorMessage} from "../error/error.tsx";
import InfiniteScroll from 'react-infinite-scroll-component';
import {APIStatus, CommentInfo, isAPIStatus} from "../../types";

// MUI imports
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CommentIcon from '@mui/icons-material/Comment';
import {Avatar, Box, Card, IconButton, TextField, Typography} from "@mui/material";
import {AuthApi} from "../../api/authApi.ts";


/*** Comment constants ***/
const CHARACTER_LIMIT = 100;
const PAGE_SIZE = 20;

const CommentErrorMessages = {
    failed_comment_upload: 'Server Error - Message upload failed, please try again later.',
    failed_comment_fetch: 'Server Error - Could not fetch comments, please try again later.',
    failed_unexpected: 'an unexpected error occurred, please try again later.',
    failed_auth: "Unauthorized access. Please login again."
};

/***  ***/

/* Component prop definitions */
export interface CommentTableProps {
    event_id :string
    username: string
    // handleChosenTicket  : void
}

// todo: GET user - for user bar
// todo: validate CSRF
export const CommentTable: React.FC<CommentTableProps> = ({event_id, username}) => {

    // todo: TEMP PROPS
    const [eventComments, setEventComments] = useState<CommentInfo[]>([])
    const [charValue, setCharValue] = useState<string>("")
    const [errorMessage, setErrorMessage] = useState<string>('')

    // Pagination states
    const [page, setPage] = useState<number>(1);
    const [loading, setLoading] = useState<boolean>(false);
    const [hasMore, setHasMore] = useState(true)


    useEffect(() => {
        // Fetch initial event comments
        const fetchEventComments = async () => {
            try {
                // console.log(`loading: ${loading}`)
                setLoading(true)
                const commentResponse : APIStatus | CommentInfo[] = await AuthApi.getCommentsByEventId(event_id)

                // handle comment promise response
                if (isAPIStatus(commentResponse)) {
                    // Handle APIStatus enum
                    switch (commentResponse) {
                        case APIStatus.Unauthorized:
                            // console.log('comment fetch - ' + CommentErrorMessages.failed_auth)
                            throw CommentErrorMessages.failed_auth

                        case APIStatus.ServerError:
                            // console.log(CommentErrorMessages.failed_comment_fetch)

                            throw CommentErrorMessages.failed_comment_fetch;
                        default:
                            // console.log('comment fetch - ' + CommentErrorMessages.failed_unexpected)
                            throw CommentErrorMessages.failed_unexpected
                    }
                } else {
                    setLoading(false)

                    setEventComments(commentResponse)
                }

            } catch (error) {
                console.error("Error fetching comment data:", error);

                setLoading(false)

                // @ts-ignore
                const errorMsg = error.toString()
                setErrorMessage(errorMsg)
            }
        };

        fetchEventComments();
    },[])

    useEffect(()=> {
        // empty the text field after POST
        setCharValue('')
    },[eventComments])


    /* Component handlers */

    // comment submission handler
    const handleSubmitComment = async () => {
        try {
            setLoading(true)

            /* POST request new comment to Comment service  */
            const postResponse : APIStatus = await AuthApi.createComment(event_id, charValue)

            if (isAPIStatus(postResponse)) {
                // Handle APIStatus enum
                switch (postResponse) {
                    case APIStatus.Success:
                        setLoading(false)
                        // console.log('comment created successfully!')
                        break;
                    case APIStatus.Unauthorized:
                        // console.log('comment upload - ' + CommentErrorMessages.failed_auth)
                        throw CommentErrorMessages.failed_auth

                    case APIStatus.ServerError:
                        // console.log(CommentErrorMessages.failed_comment_fetch)

                        throw CommentErrorMessages.failed_comment_upload;
                    default:
                        // console.log('comment upload - ' + CommentErrorMessages.failed_unexpected)
                        throw CommentErrorMessages.failed_unexpected
                }
            } else {
                // console.log(`Comment upload res: ${postResponse}`)
            }


            // Calculate the page number for fetching comments
            const nextPage = Math.ceil((eventComments.length + 1) / PAGE_SIZE);

            // Fetch updated comments after successful post (just update limit - dont skip!)
            const postSubmitCommentFetch : APIStatus | CommentInfo[] = await AuthApi.getCommentsByEventId(event_id, nextPage*PAGE_SIZE)

            if (isAPIStatus(postSubmitCommentFetch)) {
                // Handle APIStatus enum
                switch (postSubmitCommentFetch) {
                    case APIStatus.Unauthorized:
                        // console.log('comment fetch - ' + CommentErrorMessages.failed_auth)
                        throw CommentErrorMessages.failed_auth

                    case APIStatus.ServerError:
                        // console.log(CommentErrorMessages.failed_comment_fetch)

                        throw CommentErrorMessages.failed_comment_fetch;
                    default:
                        // console.log('comment fetch - ' + CommentErrorMessages.failed_unexpected)
                        throw CommentErrorMessages.failed_unexpected
                }
            } else {
                setEventComments(postSubmitCommentFetch)
            }


        } catch (error) {
            console.error("Error submitting comment:", error);

            // @ts-ignore
            const errorMsg = error.toString()
            setErrorMessage(errorMsg)
        }
    }

    // Comment input text change handler
    const handleInputChange = (e : any) => {
        setCharValue(e.target.value)
    }

    const fetchAdditionalComments = async () => {
      try {
          /* fetch more comments from the Comment service */
          const newCommentsRes : APIStatus | CommentInfo[] = await AuthApi.getCommentsByEventId(event_id, PAGE_SIZE, page*PAGE_SIZE)

          if (isAPIStatus(newCommentsRes)) {
              // Handle APIStatus enum
              switch (newCommentsRes) {
                  case APIStatus.Unauthorized:
                    //   console.log('comment fetch - ' + CommentErrorMessages.failed_auth)
                      throw CommentErrorMessages.failed_auth

                  case APIStatus.ServerError:
                    //   console.log(CommentErrorMessages.failed_comment_fetch)

                      throw CommentErrorMessages.failed_comment_fetch;
                  default:
                    //   console.log('comment fetch - ' + CommentErrorMessages.failed_unexpected)
                      throw CommentErrorMessages.failed_unexpected
              }
          } else {
                // new commments are type data
              const newComments : CommentInfo[] = newCommentsRes;

              if (newComments.length > 0) {
                  // update commentInfo state with destructed version of comments + newly fetched comments
                  setEventComments(prevComments => [...prevComments, ...newComments]);

                  // Increment the page number for pagination
                  setPage(prevPage => prevPage + 1);
              } else {
                  setHasMore(false);
              }
          }



          // const response = await fetch(`http://${COMMENT_SERVICE_LOCAL_ADDRESS}/api/comments/event/${event_id}?limit=${PAGE_SIZE}&skip=${page*PAGE_SIZE}`);
          // const data = await response.json();
          // const newComments = data.eventComments;
          //
          // console.log(newComments)

      } catch (error) {
          console.error("Error fetching more comments:", error);

          // @ts-ignore
          const errorMsg = error.toString()
          setErrorMessage(errorMsg)
      }
    }//fetchAdditionalComments

    return (
        <Box className="comment-section">

            <div className='comment-table-header'>
                <CommentIcon sx={{margin: 1}}/>
                <Typography variant="h6" >Comments</Typography>
            </div>

            <InfiniteScroll
                dataLength={eventComments.length}
                next={fetchAdditionalComments}
                hasMore={hasMore}
                loader={ loading && <h4>Loading Comments...</h4> }
            >
                {eventComments?.map(comment => (
                    <CommentCard key={comment._id} {...comment}/>
                ))}
            </InfiniteScroll>

            <Card className='comment-table-input-container'>

                <div className='comment-input-header'>
                    <Avatar sx={{ width: 24, height: 24 }}/>
                    <Typography sx={{ fontWeight: 'bold', margin: 1}} variant="subtitle1" >{username}</Typography>
                </div>

                <div className='comment-input'>
                    <TextField
                        sx = {{margin: 1, width: '50ch', maxWidth: 800 }}
                        id="outlined-multiline-static"
                        label="Add comment..."
                        value={charValue}
                        inputProps={{
                            maxLength: CHARACTER_LIMIT
                        }}
                        helperText={`${charValue.length}/${CHARACTER_LIMIT}`}
                        onChange={handleInputChange}
                        multiline
                        rows={4}
                    />

                    <IconButton sx={{ margin: 2 }} color="primary" aria-label="add comment" onClick={handleSubmitComment}>
                        <AddCircleOutlineIcon sx={{ fontSize: 27 }}  />
                    </IconButton>
                </div>
            </Card>
            {errorMessage && <ErrorMessage message={errorMessage}/>}

        </Box>

    );
}
