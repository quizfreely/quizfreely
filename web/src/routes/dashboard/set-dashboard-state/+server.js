import { json } from "@sveltejs/kit";

export function POST({ cookies }) {
    cookies.set(
        "dashboard",
        "true",
        {
            /* 30 days * 24h * 60m * 60s = 2592000 sec for 30 days */
            maxAge: 2592000,
            path: "/",
            httpOnly: true,
            /* when secure is true,
            browsers only send the cookie through https,
            on localhost, browsers send it even if localhost isn't using https */
            secure: true,
            sameSite: "lax"
        }
    );

    return json({success:true});
}

