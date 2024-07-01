import { proxy, useSnapshot } from "valtio";

export const store = proxy({
    data: {
        shopData: {}
    },
    toast: {
        error: false,
        active: false,
        message: ''
    },
    user: {
        firstName: '',
        lastName: '',
        email: '',
        contact: '',
        isSuperAdmin: false,
        isAdmin: false,
        isUserDocEmpty: false,
        isLoggedIn: false
    }
});
