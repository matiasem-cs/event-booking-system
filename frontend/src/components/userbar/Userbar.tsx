import React, {useEffect} from "react";
import './userbar.css'

// MUI Icon imports
import StarIcon from '@mui/icons-material/Star';

import Badge from '@mui/material/Badge';
// MUI Component imports
import Typography from "@mui/material/Typography";
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import LogoutIcon from '@mui/icons-material/Logout';
import PersonIcon from '@mui/icons-material/Person';

import {AppBar, Box, Button, Toolbar} from "@mui/material";



// MUI Color imports
import {blue } from "@mui/material/colors";
import {APIStatus, UserInfo, formatDatefromISOstring, UserPermission} from "../../types";
import { AuthApi } from "../../api/authApi";



  
// function TypographyTheme() {
//     return <Div>{`Coming up: ${}`}</Div>;
// }

/* Component prop definitions */
export interface UserbarProps {
    navigateToCreateEventPage?(): void;
    navigateToUserPage(): void;
    handleLogout: () => void;
}


function isUserInfo(obj: any): obj is UserInfo {
    return (
        typeof obj.user_id === 'string' &&
        typeof obj.username === 'string' &&
        typeof obj.permission === 'string' &&
        typeof obj.rating_counter === 'number' &&
        typeof obj.closest_event_name === 'string' &&
        typeof obj.closest_event_date === 'string'
    );
}

export function isUserPermission(obj: any): obj is UserPermission {
    return (
        obj === UserPermission.User ||
        obj === UserPermission.Admin ||
        obj === UserPermission.Worker ||
        obj === UserPermission.Manager
    );
}

export const Userbar: React.FC<UserbarProps> = ({
        navigateToCreateEventPage,
        navigateToUserPage,
        handleLogout
    }) => {
        const [userinfo, setUserInfo] = React.useState<UserInfo | null>(null);
        // const [userPermission, setUserPermission] = useState<UserPermission>()

        // todo: handle permission for BO vs FO
        useEffect(() => {
            const fetchUserInfo = async () => {
                console.log('Fetching user info...');
                const res = await AuthApi.getUserInfo();
                if (isUserInfo(res)){
                    console.log('User info fetched:', res);
                    if(!res.closest_event_name){
                        res.closest_event_date = '';
                    } else {
                        res.closest_event_date = formatDatefromISOstring(res.closest_event_date);
                    }
                    
                    setUserInfo(res);
                }
                else if (res === APIStatus.Unauthorized) {
                    console.log('Unauthorized to access user info');
                } else if (res === APIStatus.ServerError) {
                    console.log('Server error while fetching user info');
                } else {
                    console.log('Unexpected return value:', res);
                }
            };

            fetchUserInfo();
        }, []);

        


        /** Check if the permission in the token is equal to permission in userInfo. if not then the admin updated my permission and I need to logout **/
        useEffect(() => {
            // console.log("AuthLayout: permission: ", permission);
            const checkUserPermission = async () => {
                try {
                    console.log('Checking user permission...');
                    const userPermission = await AuthApi.getUserPermission();
                    if (isUserPermission(userPermission) && userinfo && userPermission !== userinfo.permission) {
                        alert('Your permission has been updated, please login again');
                        handleLogout();
                    }
                } catch (error) {
                    console.log('Failed to fetch user permission in userBar: ', error);
                }
            };

            checkUserPermission();
        }, [userinfo]);
    
        const isAllowedToUpdateEvent = () => {
            return userinfo?.permission === UserPermission.Manager || userinfo?.permission === UserPermission.Admin
        }
        // console.log('User info:', userinfo);

    return (
    <>
        <AppBar position="static" className='app-bar' sx={{bgcolor:blue[900]}}> 
            <Toolbar>
                <div className='user-info'>
                    <Button 
                        variant="contained"
                        size="large"
                        color="info"
                        startIcon={<PersonIcon />}
                        onClick={userinfo?.permission === UserPermission.User ? navigateToUserPage : undefined}
                    >
                        {userinfo?.username}
                    </Button>
                </div>
                
                <Typography variant="h6">Coming Up:</Typography>
                <div className='future-event-box'>
                    {userinfo?.closest_event_name ? 
                    <Box>
                        <Typography variant="subtitle1">{userinfo?.closest_event_name}</Typography>
                        <Typography variant="subtitle1">{userinfo?.closest_event_date}</Typography>
                    </Box>
                    :
                    <Typography variant="subtitle1">No events</Typography>
                    }  
                </div>

                <div className='rating-info'>
                    <Badge badgeContent={userinfo?.rating_counter}  color="error" title="Number of events rated">
                        <StarIcon color="action" />
                    </Badge>
                </div>
                {isAllowedToUpdateEvent() &&
                 <Button variant="contained" type="button" color="info" startIcon={<AddOutlinedIcon />} onClick={navigateToCreateEventPage}>Add new event</Button>
                }
                <div className='user-functions'>
                    <Button variant="contained" startIcon={<LogoutIcon/>} color="info" sx={{marginLeft:"10px"}} onClick={handleLogout}>Logout</Button>
                </div>
            </Toolbar>
        </AppBar>
        <div className='gradient-div'/>
    </>
);
}


