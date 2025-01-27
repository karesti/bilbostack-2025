# Bilbo Stack 2025
To run this demo you need:

* Docker / Podman
* Java 21 or later

## Spin up Infinispan
The docker compose file spins up
* A LON cluster of 3
* A NYC cluster of 1

Both cluster connect locally using Cross Site replication.

```shell
docker/podman compose up
```
Use **admin/pass** and log in **LON** in your browser opening localhost:11222
Use **admin/pass** and log in **NYC** in your browser opening localhost:31222


## Build the Quarkus project

The leaderboard is a Quarkus application what provides a leadeboard
of a top 10 players.

Data is stores in Infinispan, using Protobuf serialisation.
The server keeps the schema.

```shell
./mvnw clean install
java -jar ./target/quarkus-app/quarkus-run.jar  
```

Open http://localhost:8080/ in your browser.
The app inserts data and schedules scores.

This project does not use INDEXED caches.
Queries are performed without specific indexes. 
To improve queries performance, adding indexing is recommened.
For simplicity in this demo, I did remove it.

# Testing Cross Site
If you want to test Cross Suite replication, then:
* Remove the players-score cache in Infinispan
