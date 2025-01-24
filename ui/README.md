# 2021 Summit Demo Dashboard

## Build/Publish Container

* `buildah bud -f Containerfile -t 2021-dashboard-ui`
* `buildah push localhost/2021-dashboard-ui docker://quay.io/redhatdemo/2021-dashboard-ui`
* Restart any running pods to pick up the new image

## Environment Variables

* `LEADERBOARD_SERVER` - URL (no `http`) for the `/leaderboard` websocket server
* `STATS_SERVER` - URL (no `http`) for the `/stats` websocket server
* `REPLAY_SERVER` - URL (no `http`) for the `/game/${gameId}/replays?gimme=12` REST endpoint

## Local Development

* `sudo podman run -it -p 11222:11222 -e USER="admin" -e PASS="password" --net=summit quay.io/infinispan/server:12.0`
* `./mvnw package quarkus:dev` (from within the [Leaderboard Service](https://github.com/rhdemo/2021-leaderboard-service) folder)
* `deno run --unstable --allow-all drash_app.ts`
* Restart on any script or HTML changes as they are cached
* Refresh the page for style changes
