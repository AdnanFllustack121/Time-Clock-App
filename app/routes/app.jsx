import { json } from "@remix-run/node";
import { Link, Outlet, useLoaderData, useRouteError } from "@remix-run/react";
import { boundary } from "@shopify/shopify-app-remix/server";
import { AppProvider } from "@shopify/shopify-app-remix/react";
import { NavMenu } from "@shopify/app-bridge-react";
import polarisStyles from "@shopify/polaris/build/esm/styles.css?url";
import { authenticate } from "../shopify.server";
import ToastExample from "../components/Toast";
import '../components/appStyle/app.css';
import { useSnapshot } from "valtio";
import { store } from "../valtio/store";
import { GoogleOAuthProvider } from '@react-oauth/google';

export const links = () => [{ rel: "stylesheet", href: polarisStyles }];

export const loader = async ({ request }) => {
  await authenticate.admin(request);

  return json({ apiKey: process.env.SHOPIFY_API_KEY || "" });
};

export default function App() {
  const { apiKey } = useLoaderData();
  const snap = useSnapshot(store)

  return (
    <GoogleOAuthProvider clientId="993035188467-m6j4ag82khvgujbpbq3r6pq4f6552nrq.apps.googleusercontent.com">
      <AppProvider isEmbeddedApp apiKey={apiKey}>
        <NavMenu>
          {snap.user.isLoggedIn && <Link
            to="/app"
            rel="home"
          >
            Home
          </Link>}
          {snap.user.isLoggedIn && <Link
            to="/app/myLeave"
          >
            My Leave
          </Link>}
          {(snap.user.isAdmin || snap.user.isSuperAdmin) && snap.user.isLoggedIn && <Link
            to="/app/shiftRecords"
          >
            Shift Records
          </Link>}
          {(snap.user.isAdmin || snap.user.isSuperAdmin) && snap.user.isLoggedIn && <Link
            to="/app/leaveRequests"
          >
            Leave Requests
          </Link>}
          {snap.user.isSuperAdmin && snap.user.isLoggedIn && <Link
            to="/app/ManageAdmins"
          >
            Manage Admins
          </Link>}
        </NavMenu>
        <Outlet />
        <ToastExample />
      </AppProvider>
    </GoogleOAuthProvider>
  );
}

// Shopify needs Remix to catch some thrown responses, so that their headers are included in the response.
export function ErrorBoundary() {
  return boundary.error(useRouteError());
}

export const headers = (headersArgs) => {
  return boundary.headers(headersArgs);
};
