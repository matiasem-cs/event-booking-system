import React, {useEffect, useState} from "react";
import {APIStatus, isAPIStatus} from "../../../types";

import {ErrorMessage} from "../../../components/error/error";
import {Userbar, UserbarProps} from "../../../components/userbar/Userbar";
import {Typography} from "@mui/material";
import {OrderDetailsModal} from "./OrderDetailsModal";


// MUI Component imports
import {DataGrid} from '@mui/x-data-grid';
import Button from "@mui/material/Button";
import {AuthApi} from "../../../api/authApi.ts";
import {Loader} from "../../../components/loader/loader.tsx";


/* Component prop definitions */
export interface UserHistoryProps {
    navigateToUserPage() : void;
    handleLogout: () => void;
}

interface UserHistoryModel {
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

/*** UserHistory constants ***/

const UserHistoryErrorMessages = {
    failed_unexpected: 'an unexpected error occurred, please try again later.',
    failed_history_fetch: 'Server Error - Could not fetch Users ordered History, please try again later.',
    failed_auth: "Unauthorized access. Please login again.",
};

/***  ***/


export const UserHistoryPage: React.FC<UserHistoryProps> = ({navigateToUserPage, handleLogout}) => {

    const [userHistoryInfo, setUserHistoryInfo] = useState<UserHistoryModel[] | null>(null)
    const [errorMessage, setErrorMessage] = useState<string>('')
    const [isLoading, setIsLoading] = useState<boolean>(false);
    // todo: add Loader component

    // Order Modal states
    const [selectedOrders, setSelectedOrders] = useState<any[]>([]);
    const [isModalOpen, setIsModalOpen] = useState<boolean>(false);



    useEffect(() => {
        // fetch all event(s) information
        const fetchPageInfo = async () => {
            try {

                setIsLoading(true)
                const userHistoryRes : APIStatus | UserHistoryModel[] = await AuthApi.getUserHistory()

                // handle comment promise response
                if (isAPIStatus(userHistoryRes)) {
                    // Handle APIStatus enum
                    switch (userHistoryRes) {
                        case APIStatus.Unauthorized:
                            throw UserHistoryErrorMessages.failed_auth

                        case APIStatus.ServerError:
                            throw UserHistoryErrorMessages.failed_history_fetch;
                        default:
                            throw UserHistoryErrorMessages.failed_unexpected
                    }
                } else {
                    setIsLoading(false)

                    setUserHistoryInfo(userHistoryRes)
                }

            } catch (error) {
                console.error("Error fetching comment data:", error);

                setIsLoading(false)

                // @ts-ignore
                const errorMsg = error.toString()
                setErrorMessage(errorMsg)
            }


            //     const response = await fetch(`https://${GATEWAY_ADDRESS}/api/user-histories/${user_id}`);
            //     // const response = await fetch(`${API_GATEWAY_RENDERED_ADDRESS}/api/user-histories/${user_id}`);
            //
            //     const userHistoryInfo = await response.json();
            //
            //     console.log(userHistoryInfo)
            //
            //
            //     setUserHistoryInfo(userHistoryInfo.userHistory)
            //
            // } catch (error) {
            //     console.error("Error fetching event data:", error);
            //     setErrorMessage(UserHistoryErrorMessages.failed_fetch)
            // }
        };

        fetchPageInfo();
    },[]);



    /* Component handlers */
    const handleOpenModal = (selectedEventOrders: any[]) => {
        // console.log('passed information to modal:')
        // console.log(selectedEventOrders)

        setSelectedOrders(selectedEventOrders);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
    };

    /* Userbar prop definitions */
    const userbarProps: UserbarProps = {
        navigateToUserPage,
        handleLogout
    }

    // if (userHistoryInfo) {
    //     console.log(userHistoryInfo[0].order_details[0].datePurchased)
    // }

    return (
        <>
            <Userbar {...userbarProps} />

            <div className="userpage-header">
                <Typography sx={{ margin: 1}} variant="h6" >Your Personal Page</Typography>
                <Typography sx={{ margin: 1}} variant="subtitle2" >Manage all of your events.</Typography>
            </div>

            {userHistoryInfo && (
                <>
                    <DataGrid sx={{margin : 3}}
                        rows={userHistoryInfo.map((historyItem, index) => ({
                            id: index,
                            eventId: historyItem.event_id,
                            title: historyItem.event_details.title,
                            category: historyItem.event_details.category,
                            location: historyItem.event_details.location,
                            organizer: historyItem.event_details.organizer,
                            startDate: historyItem.event_details.start_date,
                            endDate: historyItem.event_details.end_date,
                            orders: historyItem.order_details.map((order) => ({
                                totalCost: order.totalCost,
                                datePurchased: order.datePurchased,
                                tickets: order.tickets,
                                orderId: order._id,
                            })),
                        }))}
                        columns={[
                            { field: "eventId", headerName: "Event ID", width: 150 },
                            { field: "title", headerName: "Title", width: 150 },
                            { field: "category", headerName: "Category", width: 150 },
                            { field: "location", headerName: "Location", width: 150 },
                            { field: "organizer", headerName: "Organizer", width: 150 },
                            { field: "startDate", headerName: "Start Date", width: 150 },
                            { field: "endDate", headerName: "End Date", width: 150 },
                            {
                                field: "orders",
                                headerName: "Orders",
                                width: 300,
                                renderCell: (params) => (
                                    <Button onClick={() => handleOpenModal(params.value)}>View Orders</Button>
                                ),
                            },
                        ]}
                    />
                    <OrderDetailsModal open={isModalOpen} handleClose={handleCloseModal}  orders={selectedOrders} />
                </>
            )}
            {errorMessage && <ErrorMessage message={errorMessage}/>}
            {isLoading && <Loader/>}


        </>
    );
};
