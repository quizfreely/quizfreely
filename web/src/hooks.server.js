import themesList from "$lib/themes";
import { env } from "$env/dynamic/private";

export function init() {
    if (env.PORT == null || env.API_URL == null) {
        let missingVars = "";
        if (env.PORT == null && env.API_URL == null) {
            missingVars = "PORT and API_URL";
        } else if (env.PORT == null) {
            missingVars = "PORT";
        } else if (env.API_URL == null) {
            missingVars = "API_URL";
        }
        console.log(
            "\x1b[31m%s\x1b[0m", /* red color, and then afterwords reset color */
            "\n!! Oh no\n" +
            `Quizfreely-web's dotenv file is missing ${ missingVars }\n` +
            "We can copy web/.env.example to web/.env\n"
        );
        if (env.PORT == null && env.API_URL == null) {
            /* show --env-file flag warning if both are null (cause if both are null, then mabye the whole env file is missing) */
            console.log(
                "\x1b[31m%s\x1b[0m", /* red color, and then afterwords reset color */
                "For production, use `node --env-file=.env build`\n" +
                "For development, vite loads dotenv files by default\n"
            )
        }
    }
}

export function handle({ event, resolve }) {
    let theme = "auto";
    let themeCookie = event.cookies.get("theme");
    if (themeCookie !== undefined && themesList.includes(themeCookie)) {
        theme = themeCookie;
    }
    event.locals.theme = theme;
    return resolve(event, {
        transformPageChunk: function ({ html }) {
            return html.replace(
                "%theme%", theme
            ).replace(
                "%theme%", theme
            ); /* run `replace` exactly twice,
            once for %theme% in html's class attribute,
            and again for %theme% in the css href
            see web/src/app.html for details
            
            we run it a fixed number of times
            and do not use replaceAll
            because there might be edge cases
            where %theme% is literally in rendered html
            that we don't want to replace,
            for example documentation might have `%theme%` */
        }
    });
}
