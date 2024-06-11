import React, { useCallback, useState } from "react";
import {
    Button,
    Form,
    FormLayout,
    Text,
    TextField,
    Card,
    Page,
    Checkbox,
    Link
} from "@shopify/polaris";
import Placeholder from "../components/placeholder";
import { showToast } from "../components/Toast";
import { useNavigate } from "@remix-run/react";

export default function Signup() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false)
    const navigate = useNavigate()
    const [isLoading, setLoading] = useState(false)


    const handleSubmit = useCallback(async () => {
        try {
            setLoading(true)
            console.log('submit event login', {
                password,
                email
            });

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

            const passwordRegex = /^.{8,}$/;
            const notEmptyRegex = /^.{1,}$/;

            if (!notEmptyRegex.test(email) ||
                !notEmptyRegex.test(password)) {
                showToast("Fields shouldn't be empty", true);
                return;
            }


            if (!emailRegex.test(email)) {
                showToast("Invalid email format", true);
                return;
            }


            if (!passwordRegex.test(password)) {
                showToast("Password must be at least 8 characters long", true);
                return;
            }
            const newData = {
                email,
                password
            }
            const response = await fetch(
                `/api/login`,
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
                const errorMessage = errorData?.message || "Login failed. Please check your details.";
                showToast(errorMessage, true);
            } else {
                const { message, status, error, token } = await response.json();
                showToast(message, error);
                if (status) {
                    console.log('message', message);
                    localStorage.setItem("time_clock_token", token);
                    setTimeout(() => {
                        navigate("/app");
                    }, 1000);
                }
            }
        } catch (error) {
            console.error('error on login', error)
            showToast(`An unexpected error occurred. Please try again later. error: ${error}`, true);
        } finally {
            setLoading(false)
        }
    }, [password, email]);

    const handleEmailChange = useCallback((value) => setEmail(value), []);
    const handlePasswordChange = useCallback((value) => setPassword(value), []);
    const handleShowPasswordChange = useCallback(() => { setShowPassword(v => !v), [] });


    return (
        <Page narrowWidth>
            <div style={{ marginTop: "4rem" }}></div>
            <Card sectioned title="Login">

                <Placeholder
                    component={
                        <>
                            <Text variant="headingXl" alignment="center" as="h4">
                                Sign in
                            </Text>
                            <div style={{ marginTop: "1rem" }}></div>

                            <Form>
                                <FormLayout>
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
                                        marginTop='10px'
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
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <Button size="large" loading={isLoading} primary onClick={handleSubmit} >
                                                    Submit
                                                </Button>
                                                <Link url="/app/Signup">Create an account</Link>

                                            </div>

                                        }
                                        marginTop='12px'
                                        padding='auto'
                                        height='auto'
                                        width='auto'
                                        marginBottom='0px'
                                        itemsCentered={false}
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
