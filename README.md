# Quizfreely

Quizfreely is a free and open source studying tool.

https://quizfreely.org

[Codeberg](https://codeberg.org/quizfreely/quizfreely) · [GitHub](https://github.com/quizfreely/quizfreely)

General developer/contributor documentation is available [here](https://docs.quizfreely.org).

This repository, `quizfreely/quizfreely`, is Quizfreely's web app, written in JavaScript with Node.js & SvelteKit.

Quizfreely's backend API's repository is `quizfreely/api`. ([Codeberg](https://codeberg.org/quizfreely/api) & [GitHub](https://github.com/quizfreely/api)) It's a GraphQL API written in Go/Golang.

## First-time setup for contributors/developers

After cloning this repository, copy `.env.example` to `.env`.

Then, edit `.env`.
- If you're running `quizfreely/api` locally, update `API_URL` to the correct port
    - See the instructions [on Codeberg](https://codeberg.org/quizfreely/api) or [on Github](https://github.com/quizfreely/api) to set up the API
- If you're only working on the frontend and don't want to set up the backend API, set `API_URL` to `API_URL=https://quizfreely.org/api`

Install dependencies with `npm install`.
```bash
npm install
```

## Running the project

Use `npm run dev` to run Quizfreely's frontend locally.
```bash
npm run dev

# use `--host` to access it from another device on the same network, like a mobile device
# npm run dev -- --host
```

