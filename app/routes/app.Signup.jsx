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
} from "@shopify/polaris";
import Placeholder from "../components/placeholder";
import { showToast } from "../components/Toast";
import { useNavigate } from "@remix-run/react";
import { useSnapshot } from "valtio";
import { store } from "../valtio/store";


export default function Signup() {
    const [name, setName] = useState({
        fistName: "",
        lastName: ""
    })
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const navigate = useNavigate();
    const snap = useSnapshot(store)
    const [isLoading, setLoading] = useState(false)

    // const handleSubmit = useCallback(async () => {
    //     console.log('submit event', {
    //         email,
    //         password,
    //         confirmPassword
    //     });
    //     if (password !== confirmPassword) {
    //         showToast("Password doesn't matche!")
    //     }

    //     const newData = {
    //         email,
    //         password,
    //         firstName: name.fistName,
    //         lastName: name.lastName
    //     }

    //     try {
    //         const response = await fetch(
    //             `/api/signup`,
    //             {
    //                 method: "POST",
    //                 headers: {
    //                     "Content-Type": "application/json",
    //                 },
    //                 body: JSON.stringify(newData),
    //             }
    //         );

    //         if (response.ok) {
    //             const { message, status } = await response.json();
    //             if (status) {
    //                 console.log('message', message)
    //                 // document.cookie = `TimeClockAppToken=${token};path='https://admin.shopify.com/store/oneponte/apps/time-clock-1/app'`;
    //                 setTimeout(() => {
    //                     navigate("/app");
    //                 }, 1000);
    //             }

    //             showToast(message)
    //         };
    //     } catch (error) {
    //         console.error('error on Signup', error)
    //     } finally {
    //         // setEmail("");
    //         // setPassword("");
    //         // setConfirmPassword("")
    //         // setName({
    //         //     fistName: "",
    //         //     lastName: ""
    //         // })
    //     }


    // }, [email, password, confirmPassword]);


    const handleSubmit = useCallback(async () => {
        try {

            setLoading(true)
            console.log('submit event', {
                email,
                password,
                confirmPassword
            });

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const passwordRegex = /^.{8,}$/;
            const notEmptyRegex = /^.{1,}$/;

            if (!notEmptyRegex.test(name.fistName) ||
                !notEmptyRegex.test(name.lastName) ||
                !notEmptyRegex.test(email) ||
                !notEmptyRegex.test(password) ||
                !notEmptyRegex.test(confirmPassword)) {
                showToast("Fields shouldn't be empty");
                return;
            }

            if (!emailRegex.test(email)) {
                showToast("Please enter a valid email");
                return;
            }

            if (!passwordRegex.test(password) || !passwordRegex.test(confirmPassword)) {
                showToast("Password must be at least 8 characters long");
                return;
            }

            if (password !== confirmPassword) {
                showToast("Password doesn't match!");
                return;
            }
            console.log(' snap.user.isUserDocEmpty', snap.user.isUserDocEmpty);
            const newData = {
                email,
                password,
                firstName: name.fistName,
                lastName: name.lastName,
                isAdmin: snap.user.isUserDocEmpty ? true : false
            };
            const response = await fetch(
                `/api/signup`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(newData),
                }
            );

            if (!response.ok) {
                const errorData = await response.json();
                const errorMessage = errorData?.message || "Signup failed. Please check your details.";
                showToast(errorMessage);
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
            setLoading(false)
        }
    }, [email, password, confirmPassword, name, navigate, showToast]);



    const handleEmailChange = useCallback((value) => setEmail(value), []);
    const handlePasswordChange = useCallback((value) => setPassword(value), []);
    const handleConfirmPasswordChange = useCallback((value) => setConfirmPassword(value), []);
    const handleShowPasswordChange = useCallback(() => {
        console.log('hit sdfsdf')
        setShowPassword(v => !v), []
    });
    const handleConfirmShowPasswordChange = useCallback(() => setShowConfirmPassword(v => !v), []);


    return (
        <Page narrowWidth>
            <div style={{ marginTop: "4rem" }}></div>
            <Card sectioned title="Login">

                <Placeholder
                    component={
                        <>
                            <Text variant="headingXl" alignment="center" as="h4">
                                Sign Up
                            </Text>
                            <div style={{ marginTop: "5px" }}></div>
                            <Text variant="headingXs" alignment="center" as="h6">
                                Your account is getting created as an {snap.user.isUserDocEmpty ? "admin" : "employee"}.
                            </Text>
                            <div style={{ marginTop: "1rem" }}></div>

                            <Form>
                                <FormLayout>
                                    <Placeholder
                                        component={
                                            <FormLayout.Group>
                                                <TextField
                                                    value={name.fistName}
                                                    onChange={(_v) => setName((prev) => ({ ...prev, fistName: _v }))}
                                                    type="text"
                                                    autoComplete="firstName"
                                                    label="First Name"
                                                    placeholder="Please enter your first name"
                                                />
                                                <TextField
                                                    value={name.lastName}
                                                    onChange={(_v) => setName((prev) => ({ ...prev, lastName: _v }))}
                                                    type="text"
                                                    autoComplete="lastName"
                                                    label="Last Name"
                                                    placeholder="Please enter your last name"
                                                />
                                            </FormLayout.Group>

                                        }
                                        marginTop='15px'
                                        padding='0'
                                        height='auto'
                                        width='auto'
                                        marginBottom='7px'
                                        itemsCentered={false}
                                    />

                                    <Placeholder
                                        component={
                                            <TextField
                                                value={email}
                                                onChange={handleEmailChange}
                                                type="email"
                                                autoComplete="email"
                                                label="Email Address"
                                                placeholder="Please enter an email address"
                                            />

                                        }
                                        marginTop='0px'
                                        padding='0'
                                        height='auto'
                                        width='auto'
                                        marginBottom='7px'
                                        itemsCentered={false}
                                    />


                                    <Placeholder
                                        component={
                                            <TextField
                                                value={password}
                                                onChange={handlePasswordChange}
                                                type={
                                                    showPassword ? "text" : "password"
                                                }
                                                autoComplete="password"
                                                label="Password"
                                                placeholder="Please enter a password"
                                            />
                                        }
                                        marginTop='0'
                                        padding='0'
                                        height='auto'
                                        width='auto'
                                        marginBottom='-10px'
                                        itemsCentered={false}
                                    />
                                    <Checkbox
                                        label="Show password"
                                        checked={showPassword}
                                        onChange={handleShowPasswordChange}
                                    />


                                    <Placeholder
                                        component={
                                            <TextField
                                                value={confirmPassword}
                                                onChange={handleConfirmPasswordChange}
                                                type={
                                                    showConfirmPassword ? "text" : "password"
                                                }
                                                autoComplete="password"
                                                label="Confirm Password"
                                                placeholder="Please enter a password again"
                                            />
                                        }
                                        marginTop='7px'
                                        padding='0'
                                        height='auto'
                                        width='auto'
                                        marginBottom='-10px'
                                        itemsCentered={false}
                                    />

                                    <Checkbox
                                        label="Show password"
                                        checked={showConfirmPassword}
                                        onChange={handleConfirmShowPasswordChange}
                                    />


                                    <Placeholder
                                        component={
                                            <div style={{ width: '25%' }}>
                                                <Button fullWidth loading={isLoading} size="large" primary onClick={handleSubmit} >
                                                    Submit
                                                </Button>

                                            </div>

                                        }
                                        marginTop='10px'
                                        padding='auto'
                                        height='auto'
                                        width='auto'
                                        marginBottom='0px'
                                        itemsCentered={true}
                                    />

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
        </Page>
    );
}
