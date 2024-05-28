import { showToast } from "../Toast";
import { store } from "../../valtio/store";

export async function verifyUser() {
    const timeClockToken = localStorage.getItem("time_clock_token");
    console.log('timeClockToken', timeClockToken);
    if (!timeClockToken) {
        return false;
    }

    try {
        const response = await fetch(
            "/api/verifyUser",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ token: timeClockToken }),
            },
            { withCredentials: true }
        );

        const { status, user, message, isUserDocEmpty } = await response.json();

        console.log('status, user, message, isUserDocEmpty', status, '  ', user, '  ', message, '  ', isUserDocEmpty);

        store.user = {
            firstName: user ? user.firstName : '',
            lastName: user ? user.lastName : '',
            email: user ? user.email : '',
            isAdmin: user ? user.isAdmin : false,
            isLoggedIn: status ? true : false,
            isUserDocEmpty
        }

        if (status) {
            return true
        } else if (message) {
            showToast(message)
            return false
        }
    } catch (error) {
        console.error("Error verifying cookie:", error);
    }
};