import { Client } from "pg";
import pgCursor from "pg-cursor";
import { JSDOM } from "jsdom";
import { DOMParser as PMDOMParser } from "prosemirror-model";
import { schema as basicSchema } from "prosemirror-schema-basic";
import sanitizeHtml from "sanitize-html";
const sanitizeHtmlOptions = {
    allowedTags: [],
    allowedAttributes: {},
    disallowedTagsMode: "escape"
}

if (!process?.env?.DB_CONNECTION_URL) {
    console.error(
        "DB_CONNECTION_URL missing in env \n" +
        "mabye copy .env.example to .env \n"
    )
    process.exit(1);
}

const client = new Client({
    connectionString: process.env.DB_CONNECTION_URL
});

function convertPlaintextToSafeHtml(plaintext) {
    return plaintext.split(/\n+/).map(
        line => `<p>${sanitizeHtml(line, sanitizeHtmlOptions)}</p>`
    ).join("");
}
function convertSafeHtmlToProsemirrorJson(safeHtml) {
    const dom = new JSDOM("<div></div>");
    const div = dom.window.document.querySelector("div");
    div.innerHTML = safeHtml;
    const doc = PMDOMParser.fromSchema(basicSchema).parse(div);
    return doc.toJSON();
}

await client.connect();
try {
    await client.query('BEGIN');

    const cursor = client.query(
        new Cursor('SELECT id, data FROM public.studysets')
    );

    function readNextBatch() {
        cursor.read(100, async (err, rows) => {
            if (err) throw err;

            if (rows.length === 0) {
                await cursor.close();
                await client.query('COMMIT');
                await client.end();
                console.log('Done!');
                return;
            }

            for (const row of rows) {
                if (row?.data?.terms) {
                    row.data.terms.forEach(function (term) {
                        const termSafeHtml = convertPlaintextToSafeHtml(term[0]);
                        const termProseMirrorJson = convertSafeHtmlToProsemirrorJson(
                            termSafeHtml
                        );
                        const defSafeHtml = convertPlaintextToSafeHtml(term[1]);
                        const defProseMirrorJson = convertSafeHtmlToProsemirrorJson(
                            defSafeHtml
                        );
                        await client.query(
                            "INSERT INTO public.terms (" +
                            "studyset_id, term_prosemirror_json, term_safe_html, def_prosemirror_json, def_safe_html" + 
                            ") VALUES ($1, $2, $3, $4, $5)",
                            [
                                row.id,
                                termProseMirrorJson,
                                termSafeHtml,
                                defProseMirrorJson,
                                defSafeHtml
                            ]
                        );
                    })
                }
            }

          readNextBatch();
        });
    }

    readNextBatch();
} catch (e) {
    console.error(e);
    await client.query('ROLLBACK');
    await client.end();
}

