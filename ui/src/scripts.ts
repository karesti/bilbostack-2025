import { Drash } from "https://deno.land/x/drash@v1.4.4/mod.ts";
import { exists } from "https://deno.land/std/fs/exists.ts";

let scriptCache = new Map<string,string>();

export class ScriptsResource extends Drash.Http.Resource {
    static paths = ["/scripts/:scriptfile"];
    public async GET() {
        this.response.headers.set('Content-Type','application/javascript');
        const fileName = `./assets/scripts/${this.request.getPathParam('scriptfile')}`;
        if (scriptCache.has(fileName)) {
            this.response.body = scriptCache.get(fileName);
        } else if (await exists(fileName.replace('.js','.ts'))) {
            const { files, diagnostics } = await Deno.emit(fileName.replace('.js','.ts'), {
                check: false,
                bundle: 'classic',
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
            this.response.body = scriptCache.get(fileName);
        } else {
            this.response.body = '';
        }
        
        return this.response;
    }
}