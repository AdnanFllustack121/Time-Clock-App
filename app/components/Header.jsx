import { Page, Card } from '@shopify/polaris';
import React, { useCallback } from 'react';
import { useSnapshot } from 'valtio';
import { store } from '../valtio/store';
import { useNavigate } from '@remix-run/react';
import { showToast } from './Toast';

export default function Header({ title, component }) {
    const snap = useSnapshot(store)
    const navigate = useNavigate()

    const handleLogout = useCallback(() => {
        localStorage.removeItem("time_clock_token")
        store.user = {
            firstName: '',
            lastName: '',
            email: '',
            isAdmin: false,
            isUserDocEmpty: false,
            isLoggedIn: false
        }
        showToast('You have successfully logged out')
        navigate('/app/Login')
    }, [])

    return (
        <Page
            title={title}
            fullWidth
            actionGroups={[
                {
                    title: 'More',
                    actions: [
                        { content: `Hi, ${snap.user.firstName} ${snap.user.lastName}` },
                        { content: 'Logout', onAction: handleLogout },
                    ],
                },
            ]}
        >
            {component}
        </Page>
    );
}