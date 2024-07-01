import React, { useCallback, useEffect, useState } from "react";
import {
    Button,
    Form,
    FormLayout,
    Text,
    TextField,
    Card,
    Page,
    Checkbox,
    Link,
} from "@shopify/polaris";
import Placeholder from "../components/placeholder";
import { showToast } from "../components/Toast";
import { useNavigate } from "@remix-run/react";
import { useSnapshot } from "valtio";
import { store } from "../valtio/store";
import { verifyUser } from "../components/authentications/verifyUser";
import Loader from "../components/Loader";

export default function Signup() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        contact: "",
    });

    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setLoading] = useState(false);
    const [isVerified, setVerified] = useState(false);

    const navigate = useNavigate();
    const snap = useSnapshot(store);

    useEffect(() => {
        async function doVerification() {
            try {
                const isVerified = await verifyUser();
                console.log("isVerified:", isVerified);
                setVerified(true);
            } catch (error) {
                console.error('Error verifying user:', error);
            }
        }

        doVerification();
    }, [navigate]);

    const handleSubmit = useCallback(async () => {
        try {
            setLoading(true);

            const { firstName, lastName, email, password, confirmPassword, contact } = formData;

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const passwordRegex = /^.{8,}$/;
            const notEmptyRegex = /^.{1,}$/;

            if (
                !notEmptyRegex.test(firstName) ||
                !notEmptyRegex.test(lastName) ||
                !notEmptyRegex.test(email) ||
                !notEmptyRegex.test(password) ||
                !notEmptyRegex.test(confirmPassword) ||
                !notEmptyRegex.test(contact)
            ) {
                showToast("Fields shouldn't be empty", true);
                return;
            }

            if (!emailRegex.test(email)) {
                showToast("Please enter a valid email", true);
                return;
            }

            if (!passwordRegex.test(password) || !passwordRegex.test(confirmPassword)) {
                showToast("Password must be at least 8 characters long", true);
                return;
            }

            if (password !== confirmPassword) {
                showToast("Password doesn't match!", true);
                return;
            }

            const newData = {
                firstName,
                lastName,
                email,
                password,
                contact,
                isSuperAdmin: snap.user.isUserDocEmpty ? true : false,
                isAdmin: false,
            };

            const response = await fetch(`/api/signup`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(newData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData?.message || "Signup failed. Please check your details.";
                showToast(errorMessage, true);
            } else {
                const { message, token, user } = await response.json();
                if (token) {
                    console.log('message', message);
                    localStorage.setItem("time_clock_token", token);
                    store.user = {
                        ...snap.user,
                        firstName: user ? user.firstName : '',
                        lastName: user ? user.lastName : '',
                        email: user ? user.email : '',
                        contact: user ? user.contact : '',
                        isSuperAdmin: user ? user.isSuperAdmin : false,
                        isAdmin: user ? user.isAdmin : false,
                        isLoggedIn: true
                    }
                    setTimeout(() => {
                        navigate("/app");
                    }, 1000);
                } else if (message) {
                    showToast(message);
                }
            }
        } catch (error) {
            console.error('error on Signup', error)
            showToast("An unexpected error occurred. Please try again later.");
        } finally {
            setLoading(false);
        }
    }, [formData, navigate, snap.user.isUserDocEmpty]);

    const handleChange = useCallback((field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value,
        }));
    }, []);

    const handleShowPasswordChange = useCallback(() => {
        setShowPassword(prev => !prev);
    }, []);


    return (
        <>
            {!isVerified ? <Loader /> : <Page narrowWidth>
                <div style={{ marginTop: "4rem" }}></div>
                <Card sectioned title="Sign Up">
                    <Placeholder
                        component={
                            <>
                                <Text variant="headingXl" alignment="center" as="h4">
                                    Sign Up
                                </Text>
                                <div style={{ marginTop: "5px" }}></div>
                                {snap.user.isUserDocEmpty ? (
                                    <Text variant="headingXs" alignment="center" as="h6">
                                        Your account is being created as a super admin.
                                    </Text>
                                ) : null}
                                <div style={{ marginTop: "2rem" }}></div>

                                <Form onSubmit={handleSubmit}>
                                    <FormLayout>
                                        <FormLayout.Group>
                                            <TextField
                                                value={formData.firstName}
                                                onChange={(value) => handleChange('firstName', value)}
                                                type="text"
                                                autoComplete="firstName"
                                                label="First Name"
                                                placeholder="Please enter your first name"
                                            />
                                            <TextField
                                                value={formData.lastName}
                                                onChange={(value) => handleChange('lastName', value)}
                                                type="text"
                                                autoComplete="lastName"
                                                label="Last Name"
                                                placeholder="Please enter your last name"
                                            />
                                        </FormLayout.Group>

                                        <FormLayout.Group>
                                            <TextField
                                                value={formData.email}
                                                onChange={(value) => handleChange('email', value)}
                                                type="email"
                                                autoComplete="email"
                                                label="Email Address"
                                                placeholder="Please enter an email address"
                                            />
                                            <TextField
                                                value={formData.contact}
                                                onChange={(value) => handleChange('contact', value)}
                                                type='number'
                                                autoComplete="contact"
                                                label="Contact Number"
                                                placeholder="Please enter your contact number"
                                            />
                                        </FormLayout.Group>

                                        <TextField
                                            value={formData.password}
                                            onChange={(value) => handleChange('password', value)}
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            label="Password"
                                            placeholder="Please enter a password"
                                        />

                                        <TextField
                                            value={formData.confirmPassword}
                                            onChange={(value) => handleChange('confirmPassword', value)}
                                            type={showPassword ? "text" : "password"}
                                            autoComplete="new-password"
                                            label="Confirm Password"
                                            placeholder="Please enter a password again"
                                        />
                                        <Checkbox
                                            label="Show password"
                                            checked={showPassword}
                                            onChange={handleShowPasswordChange}
                                        />

                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
                                            <div style={{ marginBottom: '10px' }}>
                                                <Button loading={isLoading} size="large" variant="primary" primary submit>
                                                    Submit
                                                </Button>
                                            </div>
                                            <div>
                                                <Link url="/app/Login" style={{ fontSize: '14px', textDecoration: 'underline' }}>Sign in to your account</Link>
                                            </div>
                                        </div>


                                    </FormLayout>
                                </Form>
                            </>
                        }
                        marginTop='0'
                        padding='50px'
                        height='auto'
                        width='auto'
                        marginBottom='0'
                        itemsCentered={false}
                    />
                </Card>
            </Page>}
        </>
    );
}
