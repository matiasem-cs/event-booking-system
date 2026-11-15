import React, {useEffect, useState} from 'react';
import {FrontOfficePages, PurchaseDetails} from "../../types";
import {CatalogEvents, CatalogEventsProps} from "./catalogEvents/CatalogEvents.tsx";
import {EventPage, EventPageProps} from "./eventPage/EventPage.tsx";
import {UserHistoryPage, UserHistoryProps} from "./userPage/UserPersonalPage.tsx";
import {CheckoutPage, CheckoutPageProps} from "./checkout/CheckoutPage.tsx";
import {SuccessPage, SuccessPageProps} from "./successPage/SuccessPage.tsx";


export interface FrontOfficeProps {
    handleLogout: () => void;
    //todo: implement history handler in FO
}

export const FrontOffice: React.FC<FrontOfficeProps> = (
    {handleLogout}
) => {
    const [currentPage, setCurrentPage] = useState<FrontOfficePages>(FrontOfficePages.CATALOG_EVENTS);
    const [pageHistory, setPageHistory] = useState<FrontOfficePages[]>([])
    const [selectedEventId, setSelectedEventId] = useState<string>('');

    const [orderDetails, setOrderDetails] = useState<PurchaseDetails>()

    // order_id state - will be updated after a successful purchase (used for passing order_id to success page)
    const [orderId, setOrderId] = useState<string | undefined>(undefined);


    useEffect(()=> {
        // console.log('Frontoffice purchase details:')
        // console.log(orderDetails)
    },[orderDetails])

    // trying to handle to back button
    useEffect(() => {
        const handlePopstate = (event: PopStateEvent) => {
            const state = event.state as { page: FrontOfficePages, event_id?: string };
            // console.log('pop state event: ', state)

            // let lastPage = pageHistory.pop();
            // setCurrentPage(lastPage)

            if (state) {
                setCurrentPage(state.page);
                setSelectedEventId(state.event_id || '');
            } else {
                setCurrentPage(FrontOfficePages.CATALOG_EVENTS)
            }
        };

        window.addEventListener('popstate', handlePopstate);

        return () => {
            window.removeEventListener('popstate', handlePopstate);
        };
    }, []);

    /* Page navigation handlers */
    const navigateToCheckout = (details : PurchaseDetails) => {
        setPageHistory([...pageHistory, FrontOfficePages.CHECKOUT])

        // Update browser history
        window.history.pushState({ page: FrontOfficePages.CHECKOUT }, '', `/${orderDetails?.event_id}/checkout`);

        setOrderDetails(details)

        setCurrentPage(FrontOfficePages.CHECKOUT)
    }

    const navigateToEventPage = (event_id: string) => {

        setPageHistory([...pageHistory, FrontOfficePages.EVENT_PAGE])

        // Update browser history
        window.history.pushState({ page: FrontOfficePages.EVENT_PAGE }, '', `/events/${event_id}`);

        setCurrentPage(FrontOfficePages.EVENT_PAGE);
        setSelectedEventId(event_id)
    }

    const navigateToUserPage = () => {

        setPageHistory([...pageHistory, FrontOfficePages.USER_HISTORY_PAGE])

        window.history.pushState({ page: FrontOfficePages.USER_HISTORY_PAGE }, '', `/user-histories`);

        setCurrentPage(FrontOfficePages.USER_HISTORY_PAGE);
    }

    const handleOrderComplete = (order_id: string) => {
        setOrderId(order_id);
        setCurrentPage(FrontOfficePages.SUCCESS_PAGE)
    };


    const navigateToCatalogEventsPage = () => {
        setCurrentPage(FrontOfficePages.CATALOG_EVENTS)
    }



    /* Component prop definitions */
    const catalogEventsProps: CatalogEventsProps = {
        navigateToEventPage,
        navigateToUserPage,
        handleLogout
    }

    const eventPageProps : EventPageProps = {
        event_id: selectedEventId,
        navigateToUserPage,
        navigateToCheckout, // self note: even if receives arg, only pass down name
        handleLogout
    }

    const userHistoryProps: UserHistoryProps = {
        navigateToUserPage,
        handleLogout
    }

    const checkoutPageProps: CheckoutPageProps = {
        event_id : orderDetails?.event_id || '',
        event_name: orderDetails?.event_name || '',
        ticket_id: orderDetails?.ticket_id || '',
        ticket_title: orderDetails?.ticket_title || '',
        quantity_purchased: orderDetails?.quantity_purchased || 0,
        price: orderDetails?.price || 0,
        handleOrderComplete,
        navigateToEventPage,
        navigateToUserPage,
        handleLogout
    }

    const successPageProps: SuccessPageProps = {
        order_id: orderId || undefined,
        event_name: orderDetails?.event_name || '',
        ticket_title: orderDetails?.ticket_title || '',
        quantity_purchased: orderDetails?.quantity_purchased || 0,
        price: orderDetails?.price || 0,
        navigateToCatalogEventsPage,
        navigateToUserPage,
        handleLogout
    }


    if(currentPage === FrontOfficePages.CATALOG_EVENTS) {
        return (
            <CatalogEvents {...catalogEventsProps}/>
        )
    }
    else if (currentPage === FrontOfficePages.EVENT_PAGE) {
        return (
            <EventPage {...eventPageProps}/>
        )
    } else if (currentPage === FrontOfficePages.USER_HISTORY_PAGE) {
        return (
            <UserHistoryPage {...userHistoryProps} />
        )
    }
    else if (currentPage === FrontOfficePages.CHECKOUT) {
        return (
            <CheckoutPage {...checkoutPageProps} />
        )
    } else if (currentPage === FrontOfficePages.SUCCESS_PAGE) {
        return (
            <SuccessPage {...successPageProps} />

        )
    }
};
