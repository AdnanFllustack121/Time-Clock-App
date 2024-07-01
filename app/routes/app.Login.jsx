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
    const [formValues, setFormValues] = useState({
        email: "",
        password: "",
        showPassword: false
    });
    const { email, password, showPassword } = formValues;
    const navigate = useNavigate();
    const [isLoading, setLoading] = useState(false);

    const handleInputChange = useCallback((field, value) => {
        setFormValues(prevState => ({
            ...prevState,
            [field]: value
        }));
    }, []);

    const handleShowPasswordChange = useCallback(() => {
        setFormValues(prevState => ({
            ...prevState,
            showPassword: !prevState.showPassword
        }));
    }, []);

    const handleSubmit = useCallback(async () => {
        try {
            setLoading(true);
            console.log('submit event login', {
                email,
                password
            });

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const passwordRegex = /^.{8,}$/;
            const notEmptyRegex = /^.{1,}$/;

            if (!notEmptyRegex.test(email) || !notEmptyRegex.test(password)) {
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

            const newData = { email, password };

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
            console.error('error on login', error);
            showToast(`An unexpected error occurred. Please try again later. error: ${error}`, true);
        } finally {
            setLoading(false);
        }
    }, [email, password, navigate]);

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
                            <Form onSubmit={handleSubmit}>
                                <FormLayout>
                                    <Placeholder
                                        component={
                                            <TextField
                                                value={email}
                                                onChange={(value) => handleInputChange('email', value)}
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
                                                onChange={(value) => handleInputChange('password', value)}
                                                type={showPassword ? "text" : "password"}
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

                                    {/* <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                                        <Button size="large" loading={isLoading} primary submit>
                                            Submit
                                        </Button>
                                    </div>
                                    <div style={{ textAlign: 'center', marginTop: '12px' }}>
                                        <Link url="/app/Signup">Create an account</Link>
                                    </div> */}

                                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginTop: '20px' }}>
                                        <div style={{ marginBottom: '10px' }}>
                                            <Button loading={isLoading} size="large" variant="primary" primary submit>
                                                Submit
                                            </Button>
                                        </div>
                                        <div>
                                            <Link url="/app/Signup" style={{ fontSize: '14px', textDecoration: 'underline' }}>Sign up for an account</Link>
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
        </Page>
    );
}
