import { Client } from "pg";
import pgCursor from "pg-cursor";
import { JSDOM } from "jsdom";
import { DOMParser as PMDOMParser } from "prosemirror-model";
import { schema as basicSchema } from "prosemirror-schema-basic";

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

function convertPlaintextToProsemirrorJson(plaintext) {
  const dom = new JSDOM("<div></div>");
  const div = dom.window.document.querySelector("div");
  div.innerHTML = plaintext.split(/\n+/).map(
    line => `<p>${line}</p>`
  ).join("");

  const doc = PMDOMParser.fromSchema(basicSchema).parse(div);
  return doc.toJSON();
}

await client.connect();
try {
    await client.query('BEGIN'); // Start transaction

    const cursor = client.query(
        new Cursor(
            'SELECT id, some_column FROM your_table WHERE needs_update = true')
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
                const updatedValue = yourUpdateLogic(row);

                await client.query(
                    'UPDATE public.studysets SET terms_json = $1, needs_update = false WHERE id = $2',
                    [updatedValue, row.id]
                );
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

