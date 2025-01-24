import { Drash } from "https://deno.land/x/drash@v1.4.4/mod.ts";
import { Tengine } from "https://deno.land/x/drash_middleware@v0.7.6/tengine/mod.ts";
import { DashboardResource } from "./src/dashboard.ts";
import { ScriptsResource } from "./src/scripts.ts";
import { ReplayResource } from "./src/replay.ts";

const tengine = Tengine({
    render: (...args: unknown[]): boolean => {
        return false;
    },
    views_path: "./assets/html"
});

const server = new Drash.Http.Server({
    directory: ".",
    response_output: "text/html",
    static_paths: {
        "/css":"./assets/css", 
        "/fonts": "./assets/fonts", 
        "/img": "./assets/img", 
        "/data": "./assets/data"
    },
    resources: [
        DashboardResource,
        ReplayResource,
        ScriptsResource
    ],
    middleware: {
        after_resource: [
            tengine
        ]
    }
});

server.run({
    hostname: "0.0.0.0",
    port: 8000
});

console.log(`Server running at ${server.hostname}:${server.port}`);

