FROM quay.io/ldary/deno:1.9.0
RUN mkdir -p /var/www/assets && mkdir -p /var/www/src
WORKDIR /var/www
COPY assets /var/www/assets/
COPY src /var/www/src
copy *.ts /var/www
EXPOSE 8000/tcp
ENV LEADERBOARD_SERVER="$LEADERBOARD_SERVER" STATS_SERVER="$STATS_SERVER" REPLAY_SERVER="$REPLAY_SERVER"
ENTRYPOINT [ "deno", "run", "--unstable", "--allow-env", "--allow-read", "--allow-net", "drash_app.ts" ]