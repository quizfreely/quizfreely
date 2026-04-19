import { redirect, error } from "@sveltejs/kit";

export function GET({ url, cookies }) {
    if (url?.searchParams && url.searchParams.get("clear") == "true") {
        cookies.delete(
            "settingsdatetimeformathours",
            {
                maxAge: 2592000,
                path: "/",
                httpOnly: true,
                secure: true,
                sameSite: "lax"
            }
        )

        redirect(307, "/settings");
    } else if (
        url?.searchParams && (
            url.searchParams.get("h") == "12" ||
            url.searchParams.get("h") == "24"
        )
    ) {
        cookies.set(
          "settingsdatetimeformathours",
          url.searchParams.get("h"),
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
        )

        redirect(307, "/settings");
    } else {
      error(400, {
          message: "Date/time format setting, hours can only be 12 or 24"
      });
    }
}

