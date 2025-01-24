import { exists } from "https://deno.land/std/fs/exists.ts"
import { Application, Router, HttpError, Status, send } from "https://deno.land/x/oak/mod.ts";

let leaderboardUrl = Deno.env.get("LEADERBOARD_SERVER");
let statsUrl = Deno.env.get("STATS_SERVER");
let replayUrl = Deno.env.get("REPLAY_SERVER");

let config = new Map();
config.set('LEADERBOARD_SERVER', leaderboardUrl);
config.set('STATS_SERVER', statsUrl);
config.set('REPLAY_SERVER', replayUrl)

console.log(config);

function replaceValues(str:string, vals:Map<string,string>) {
  vals.forEach((v,k) => {
      str = str.replaceAll('${'+k+'}',v)
  }); 
  return str; 
}

const dashboardFile = replaceValues(await Deno.readTextFile(`${Deno.cwd()}/assets/html/dashboard.html`), config);
const replayerFile = replaceValues(await Deno.readTextFile(`${Deno.cwd()}/assets/html/replayer.html`),config);

const app = new Application();
const router = new Router();
let scriptCache = new Map<string,string>();

// Error Handling
app.use(async (context, next) => {
  try {
    await next();
  } catch (e) {
    if (e instanceof HttpError) {
      context.response.status = e.status as any;
      if (e.expose) {
        context.response.body = `<!doctype html><html><body><h1>${e.status} - ${e.message}</h1></body></html>`;
      } else {
        context.response.body = `<!doctype html><html><body><h1>${e.status} - ${Status[e.status]}</h1></body></html>`;
      }
    } else if (e instanceof Error) {
      context.response.status = 500;
      context.response.body = `<!doctype html><html><body><h1>500 - Internal Server Error</h1></body></html>`;
      console.log("Unhandled Error:", e.message);
      console.log(e.stack);
    }
  }
});

// Request Routing
router
  .get("/", ctx=> {
    ctx.response.type = 'text/html; charset=utf-8';
    ctx.response.body = `<!doctype html><html><body><h1>2021 Summit Demo</h1>
    <ul>
      <li><a href="/dashboard">Dashboard</a></li>
      <li><a href="/replay">Replayer</a></li>
    </ul></body></html>`;
  })
  .get("/dashboard", async ctx=> {
    ctx.response.type = 'text/html; charset=utf-8';
    ctx.response.body = replaceValues(await Deno.readTextFile(`${Deno.cwd()}/assets/html/dashboard.html`), config);
  })
  .get("/replay", async ctx=> {
    ctx.response.type = 'text/html; charset=utf-8';
    ctx.response.body = replaceValues(await Deno.readTextFile(`${Deno.cwd()}/assets/html/replayer.html`), config);
  })
  .get("/assets/scripts/:path+", async ctx => {
    const fileName = `./assets/scripts/${ctx.params['path']}`;
    ctx.response.type = 'application/javascript';
    if (scriptCache.has(fileName)) {
      ctx.response.body = scriptCache.get(fileName);
    } else if (await exists(fileName.replace('.js','.ts'))) {
      const { files, diagnostics } = await Deno.emit(fileName.replace('.js','.ts'), {
        check: false,
        bundle: 'esm',
        compilerOptions: {
          lib: ['esnext','dom'],
          module: 'es6',
          target: 'es2017'
        }
      });
      if (diagnostics.length) {
        console.warn(Deno.formatDiagnostics(diagnostics));
      }
      scriptCache.set(fileName, files['deno:///bundle.js']);
      ctx.response.body = scriptCache.get(fileName);
    } else {
      ctx.response.body = '';
    }
  })
  .get("/assets/:path+", async ctx => {
    await send(ctx, ctx.request.url.pathname, {
      root: `${Deno.cwd()}`
    });
  });

app.use(router.routes());
app.use(router.allowedMethods());

app.addEventListener('listen', ({hostname, port}) => {
  console.log(`Serving ${Deno.cwd()}`);
  console.log(`Start listening on ${hostname}:${port}`);
});

await app.listen({hostname: "0.0.0.0", port: 8000 });