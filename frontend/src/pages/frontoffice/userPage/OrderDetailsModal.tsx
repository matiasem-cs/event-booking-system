import React from "react";
import { Modal, Typography } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";


interface OrderModel  {
    orderId : string,
    tickets: {name: string, quantity: number},
    datePurchased: string,
    totalCost: number
}

interface OrderDetailsModalProps {
    open: boolean;
    handleClose: () => void;
    orders: OrderModel[];
}
export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ open, handleClose, orders }) => {

    return (
        <Modal open={open} onClose={handleClose}>
            <div style={{ position: "absolute", width:"70%", top: "50%", left: "50%", transform: "translate(-50%, -50%)", backgroundColor: "white", padding: "20px" }}>
                <Typography sx={{ margin: 1 }} variant="h6">Order Details</Typography>

                <DataGrid
                    rows={orders.map((orderItem : OrderModel, index : number) =>  ({
                        id: index,
                        orderId: orderItem.orderId,
                        datePurchased: orderItem.datePurchased,
                        ticket_name: orderItem.tickets.name,
                        ticket_quantity: orderItem.tickets.quantity,
                        totalCost: orderItem.totalCost
                    }))}
                    columns={[
                        { field: "orderId", headerName: "Order ID", width: 150 },
                        { field: "datePurchased", headerName: "Date Purchased", width: 200 },
                        { field: "ticket_name", headerName: "Ticket Type", width: 150 },
                        { field: "ticket_quantity", headerName: "Quantity", width: 100 },
                        { field: "totalCost", headerName: "Total Cost", width: 150 },
                    ]}
                />
            </div>
        </Modal>
    );
};
