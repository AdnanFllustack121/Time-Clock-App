import { Text, Card } from '@shopify/polaris';
import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { useNavigate } from '@remix-run/react';
import { useSnapshot } from 'valtio';
import { store } from '../valtio/store';
import { verifyUser } from '../components/authentications/verifyUser';
import Loader from '../components/Loader';


export default function shiftRecords() {
    const snap = useSnapshot(store)
    const navigate = useNavigate();
    const [isVerified, setVerified] = useState(false)

    useEffect(() => {

        async function doVerification() {
            const isVerified = await verifyUser();
            console.log("isVerified from MyLeave...........>>", isVerified);
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
                    title={"Shift Records"}
                    component={
                        <Card>
                            <Text>Shift Records</Text>
                        </Card>
                    }
                />
            }
        </>

    );
}