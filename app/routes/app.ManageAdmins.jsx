import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import { useNavigate } from '@remix-run/react';
import { useSnapshot } from 'valtio';
import { store } from '../valtio/store';
import { verifyUser } from '../components/authentications/verifyUser';
import Loader from '../components/Loader';
import ManageAdminsComponent from '../components/ManageAdmins/ManageAdminsComponent';

export default function ManageAdmins() {

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
                    title={"Manage Admins"}
                    component={
                        <ManageAdminsComponent />
                    }
                />
            }
        </>
    )
}
