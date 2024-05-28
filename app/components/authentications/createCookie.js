import { createCookie } from "@remix-run/node"; // or "@remix-run/cloudflare"

export const createCookie = createCookie("____time_clock_session", {
  // all of these are optional defaults that can be overridden at runtime
  expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), 
  httpOnly: true,
  maxAge: 3 * 24 * 60 * 60, 
  path: "/",
  sameSite: "lax",
  secrets: [process.env.TOKEN_KEY],
  secure: true,
});
