import { Toast, Frame } from '@shopify/polaris';
import { useSnapshot } from 'valtio';
import { store } from '../valtio/store';

export const showToast = (message, isError = false) => {
    // console.log('from showToast', store.toast)
    console.log('isError from showTaost', isError);
    store.toast = {
        ...store.toast,
        error: isError,
        active: true,
        message: message
    };
};

export const hideToast = () => {
    // console.log('from hideToast', store.toast)
    store.toast = {
        ...store.toast,
        error: false,
        active: false,
        message: ''
    };
};

export default function ToastExample({ height = '250px' }) {
    const snap = useSnapshot(store)

    // useEffect(() => {
    //     console.log('hit snap from Toast.jsx', snap.toast);
    // }, [snap.toast.active])

    const toastMarkup = snap.toast.active ? (
        <Toast content={snap.toast.message} onDismiss={hideToast} error={snap.toast.error} />
    ) : null;

    return (
        <div style={{ height, }}>
            <Frame>
                {toastMarkup}
            </Frame>
        </div>
    );
}
