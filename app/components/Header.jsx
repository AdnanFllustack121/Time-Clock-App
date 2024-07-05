import { Page, Card } from '@shopify/polaris';
import React, { useCallback } from 'react';
import { useSnapshot } from 'valtio';
import { store } from '../valtio/store';
import { useNavigate } from '@remix-run/react';
import { showToast } from './Toast';
import { ViewIcon, ExitIcon } from '@shopify/polaris-icons';
import ModalComponent from './ModalComponent';

export default function Header({ title, component }) {
    const snap = useSnapshot(store)
    const navigate = useNavigate()

    const [getModalActive, setModalActive] = React.useState(false);

    const handleLogout = useCallback(() => {
        localStorage.removeItem("time_clock_token")
        store.user = {
            firstName: '',
            lastName: '',
            email: '',
            contact: '',
            isSuperAdmin: false,
            isAdmin: false,
            isUserDocEmpty: false,
            isLoggedIn: false
        }
        showToast('You have successfully logged out')
        navigate('/app/Login')
    }, [])

    const toggleModal = () => !getModalActive ? setModalActive(true) : setModalActive(false);

    return (
        <Page
            title={title}
            fullWidth
            actionGroups={[
                {
                    title: 'More',
                    actions: [
                        { content: 'Profile', icon: ViewIcon, onAction: toggleModal },
                        { content: 'Logout', onAction: handleLogout, icon: ExitIcon, destructive: true },
                    ],
                },
            ]}
        >
            {component}

            <ModalComponent
                isTrue={getModalActive}
                toggleModal={toggleModal}
                handlePrimaryAction={toggleModal}
                type={"viewProfile"}
                primaryContent="Close"
                value={snap.user}
            />
        </Page>
    );
}