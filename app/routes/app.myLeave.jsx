import { Text, Card } from '@shopify/polaris';
import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { store } from '../valtio/store';
import { useSnapshot } from 'valtio';
import { useNavigate } from '@remix-run/react';
import { verifyUser } from '../components/authentications/verifyUser';
import Loader from '../components/Loader';
import MyLeaveComponent from '../components/MyLeave/MyLeaveComponent';

export default function MyLeaves() {
    const snap = useSnapshot(store)
    const navigate = useNavigate();
    const [isVerified, setVerified] = useState(false)
    

    useEffect(() => {

        async function doVerification() {
            const isVerified = await verifyUser();
            if (!isVerified) {
                navigate("/app/login");
            } else {
                setVerified(true);
            }
        }

        if (snap.user.email.length > 2) {
            setVerified(true)
        } else {
            doVerification();
        }
    }, [navigate]);

    return (
        <>
            {!isVerified ? <Loader /> :
                <Header
                    title={"My Leave"}
                    type="myLeave"
                    component={
                        <MyLeaveComponent />
                    }
                />
            }
        </>

    );
}