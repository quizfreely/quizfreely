so like to build the containers
```sh
cd api
podman build --tag=quizfreely-api:0.12.3 .

# same thing for qzfr-web,
# building the container will run sveltekit's build command for us (see Containerfile)
cd web
podman build --tag=quizfreely-api:0.12.3 .
```

to push the containers, use `podman tag` (again) and `podman push`
```sh
# podman login codeberg.org

podman tag quizfreely-web:0.12.3 codeberg.org/quizfreely/quizfreely-web:0.12.3
podman push codeberg.org/quizfreely/quizfreely-web:0.12.3

# same thing for qzfr-api:
podman tag quizfreely-api:0.12.3 codeberg.org/quizfreely/quizfreely-api:0.12.3
podman push codeberg.org/quizfreely/quizfreely-api:0.12.3
```

same thing to push to gh/ghcr just like [Codeberg](https://codeberg.org)
```sh
# podman login ghcr.io

podman tag quizfreely-api:0.12.3 ghcr.io/quizfreely/quizfreely-api:0.12.3
podman push ghcr.io/quizfreely/quizfreely-api:0.12.3

# for quizfreely-api
podman tag quizfreely-api:0.12.3 ghcr.io/quizfreely/quizfreely-api:0.12.3
podman push ghcr.io/quizfreely/quizfreely-api:0.12.3
```

## Compose

For the first time, to run `compose.yaml` for quizfreely-api, we need to set secrets before using podman-compose:
```sh
# set secrets (only once, for the first time)
 printf 12345678 | podman secret create quizfreely_postgres_admin_password -
 printf 98765432 | podman secret create quizfreely_postgres_password -

cd api
podman-compose --env-file=.env.compose up -d
```

When you put a space before command(s), it doesn't get saved in your/our terminal history (useful when adding secrets) on most shells/configurations by default

After the secrets are already added, next time you can just use that `podman-compose` command:
```sh
cd api
podman-compose --env-file=.env.compose up -d
```
