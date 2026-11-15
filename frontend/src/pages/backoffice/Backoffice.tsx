import React, { useState } from 'react';
import { BackOfficePages } from '../../types';
import { CreateEvent , CreateEventProps} from './boCreateEvent/CreateEvent';
import { BOCatalogPage, BOCatalogPageProps } from './boCatalog/boCatalogPage';
import { BOEventPage, BOEventPageProps } from './boEvent/boEventPage';

export interface BackOfficeProps {
    handleLogout: () => void;
}

export const Backoffice: React.FC<BackOfficeProps> = ({
    handleLogout
}) => {
    const [currentPage, setCurrentPage] = useState<BackOfficePages>(BackOfficePages.BO_CATALOG_EVENTS);
    const [selectedEventId, setSelectedEventId] = useState<string>('');


    const navigateToCreateEventPage = () => setCurrentPage(BackOfficePages.BO_CREATE_EVENT);
    // const navigateToBOEventPage = () => setCurrentPage(BackOfficePages.BO_EVENT_PAGE);
    const navigateToUserPage = () => {};
    const navigateToBOCatalogPage = () => setCurrentPage(BackOfficePages.BO_CATALOG_EVENTS);

    const navigateToBOEventPage = (event_id: string) => {

        // setPageHistory([...pageHistory, FrontOfficePages.EVENT_PAGE])

        // Update browser history
        // window.history.pushState({ page: FrontOfficePages.EVENT_PAGE }, '', `/events/${event_id}`);

        setCurrentPage(BackOfficePages.BO_EVENT_PAGE);
        setSelectedEventId(event_id)
    }

    const boEventPageProps : BOEventPageProps = {
        event_id: selectedEventId,
        navigateToCreateEventPage,
        handleLogout
    }

    const createEventProps : CreateEventProps = {
        navigateToBOCatalogPage,
        handleLogout
    }

    const boCatalogPageProps: BOCatalogPageProps = {
        navigateToBOEventPage,
        navigateToUserPage,
        navigateToCreateEventPage,
        handleLogout
    }

    if(currentPage === BackOfficePages.BO_CREATE_EVENT) {
        return (
            <CreateEvent {...createEventProps}/>
        )
    } else if (currentPage === BackOfficePages.BO_CATALOG_EVENTS){
        return (
            <BOCatalogPage {...boCatalogPageProps}/>
        )
    } else if (currentPage === BackOfficePages.BO_EVENT_PAGE){
        return (
            <BOEventPage {...boEventPageProps}/>
        )
    }
    else {
        return (
            <>
                <h1>Welcome to the Backoffice !</h1>
                <p><b>Currently under construction...</b></p>
            </>        
        )
    }
};
