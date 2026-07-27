# Quizfreely

Quizfreely is a free and open source studying tool.

[quizfreely.org](https://quizfreely.org)

[Codeberg](https://codeberg.org/quizfreely/quizfreely) · [GitHub](https://github.com/quizfreely/quizfreely)

Developer/contributor documentation is at [docs.quizfreely.org](https://docs.quizfreely.org).

This repository, `quizfreely/quizfreely`, is Quizfreely's web app, written in JavaScript with Node.js & SvelteKit.

Quizfreely's backend API's repository is `quizfreely/api`. ([Codeberg](https://codeberg.org/quizfreely/api) & [GitHub](https://github.com/quizfreely/api)) It's a GraphQL API written in Go/Golang.

---

### First-time contributor/developer setup

After cloning this repository, copy `.env.example` to `.env`.

Then, edit `.env`.
- If you're running `quizfreely/api` too, make sure `API_URL` has the right port
    - See instructions [on Codeberg](https://codeberg.org/quizfreely/api) or [on Github](https://github.com/quizfreely/api) to set up Quizfreely's backend API
- If you're only working on the frontend and don't want to set up the backend API, use `API_URL=https://quizfreely.org/api`

There are lots of helpful and detailed comments inside of `.env` for all the other options.

If you don't change anything in `.env` after copying it, everything should "just work" by default.

Install dependencies with `npm install`.
```bash
npm install
```

### Running the web app

Use `npm run dev` to run Quizfreely's frontend.
```bash
npm run dev

# or
# npm run dev -- --host
```

Use `--host` to access it from another device on the same network, like a mobile device.

