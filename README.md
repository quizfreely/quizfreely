# Quizfreely

Quizfreely is a free and open source studying tool.

https://quizfreely.org

[Codeberg](https://codeberg.org/quizfreely/quizfreely) · [GitHub](https://github.com/quizfreely/quizfreely)

General developer/contributor documentation is available [here](https://docs.quizfreely.org).

This repository, `quizfreely/quizfreely`, is Quizfreely's web app, written in JavaScript with Node.js & SvelteKit.

Quizfreely's backend API's repository is `quizfreely/api`. ([Codeberg](https://codeberg.org/quizfreely/api) & [GitHub](https://github.com/quizfreely/api)) It's a GraphQL API written in Go/Golang.

# First-time setup

- Copy `.env.example` to `.env` and configure it for your use case
- Run `npm install` (here, as in all commands below, `bun` can substitute `npm` if you prefer)

# Running the project

`npm run dev` (add `--host` if you want to access it from another device in the same network, e.g. from a mobile device)
