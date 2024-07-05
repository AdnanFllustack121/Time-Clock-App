import { jwtDecode } from "jwt-decode";

export async function action({ request }) {
    const payload = JSON.parse(await request.text());
    const { credential } = payload;
    try {
        const user_data = jwtDecode(credential);
        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (error) {
        console.log("Action Error", error);
        return new Response(JSON.stringify({ success: false, message: "Internal Server Error" }), { status: 500 });
    }
}