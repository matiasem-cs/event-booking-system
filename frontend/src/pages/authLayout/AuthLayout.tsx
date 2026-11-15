import React, { useEffect } from 'react';
import {APIStatus, PageProps, UserPermission} from "../../types";
import {Backoffice} from "../backoffice/Backoffice.tsx";
import {FrontOffice, FrontOfficeProps} from "../frontoffice/FrontOffice.tsx";
import {useState} from 'react';
import {AuthApi} from "../../api/authApi";



export const AuthLayout: React.FC<PageProps> = ({
    navigateToLoginPage
}) => {
    const [permission, setPermission] = useState<UserPermission | null>(null);

    useEffect(() => {
        // console.log("AuthLayout: permission: ", permission);
        const fetchUserPermission = async () => {
            try {
              const result = await AuthApi.getUserPermission();
              switch (result) {
                case UserPermission.User:
                  setPermission(UserPermission.User);
                  break;
                case UserPermission.Admin:
                  setPermission(UserPermission.Admin);
                  break;
                case UserPermission.Worker:
                  setPermission(UserPermission.Worker);
                  break;
                case UserPermission.Manager:
                    setPermission(UserPermission.Manager);
                    break;
                default:
                  handleApiStatus(result);
              }
            } catch (error) {
                // Handle any errors that occur during the fetch
                alert('Failed to fetch user permission, please try again');
                navigateToLoginPage();
                // setErrorMessage('Failed to fetch username, please try again');
            }
        };
        fetchUserPermission();
    }, [permission]);


    const handleApiStatus = (result: APIStatus) =>{
        if (result === APIStatus.Unauthorized) {
            alert('Unauthorized');
            navigateToLoginPage();
        } else {
            alert('Failed to fetch user permission, please try again');
            navigateToLoginPage();
        //   setErrorMessage('Failed to fetch username, please try again');
        }
    }

    const handleLogout = async () => {
        const result = await AuthApi.logout();
        if (result === APIStatus.Success) {
            navigateToLoginPage();
        } else {
            alert('Failed to logout, please try again');
        }
    }

    const frontOfficeProps: FrontOfficeProps = {
        handleLogout
    }

    const backOfficeProps = {
        handleLogout
    }

    // console.log('user permission: ', permission)

    return (
        <>
            {(permission && (permission === UserPermission.User)) ? <FrontOffice {...frontOfficeProps}/> : <Backoffice {...backOfficeProps}/>}
        </>
    );
};
