// src/workers/transpiler.worker.ts

import * as esbuild from 'esbuild-wasm';

let esbuildInitialized = false;

const transpile = async (rawCode: string): Promise<{ code: string; error: string }> => {
  if (!esbuildInitialized) {
    await esbuild.initialize({
      wasmURL: '/esbuild.wasm',
    });
    esbuildInitialized = true;
  }

  try {
    const result = await esbuild.build({
      entryPoints: ['index.js'],
      bundle: true,
      write: false,
      define: {
        'process.env.NODE_ENV': '"production"',
      },
      plugins: [
        {
          name: 'cdn-and-internal-resolver',
          setup(build) {
            // Rule 1: Intercept imports for our internal library 'ABC'
            build.onResolve({ filter: /^ABC(\/.*)?$/ }, (args) => {
              const subpath = args.path.substring('ABC'.length);
              return {
                path: subpath.startsWith('/') ? subpath.substring(1) : subpath,
                namespace: 'internal-lib',
              };
            });

            // Rule 2: Handle the virtual entry point
            build.onResolve({ filter: /^index\.js$/ }, () => ({ path: 'index.js', namespace: 'memory-fs' }));
            
            // Rule 3: Handle remote http/https modules (from CDN)
            build.onResolve({ filter: /^https?:\/\// }, (args) => ({ path: args.path, namespace: 'http-url' }));
            
            // Rule 4: Handle relative paths within remote modules
            build.onResolve({ filter: /.*/, namespace: 'http-url' }, (args) => ({ path: new URL(args.path, args.importer).href, namespace: 'http-url' }));
            
            // Rule 5: Handle all other (bare) module imports by resolving to esm.sh
            build.onResolve({ filter: /.*/ }, (args) => ({ path: `https://esm.sh/${args.path}`, namespace: 'http-url' }));

            // --- Loaders ---

            // Loader for our internal library from the public folder
            build.onLoad({ filter: /.*/, namespace: 'internal-lib' }, async (args) => {
              const res = await fetch(`/ABC/${args.path}`);
              const text = await res.text();
              const loader = args.path.endsWith('.css') ? 'css' : 'jsx';
              return { contents: text, loader };
            });

            // Loader for remote modules from CDN
            build.onLoad({ filter: /.*/, namespace: 'http-url' }, async (args) => {
                const res = await fetch(args.path);
                const text = await res.text();
                const loader = args.path.endsWith('.css') ? 'css' : 'jsx';
                return { contents: text, loader };
            });

            // Loader for the virtual entry point
            build.onLoad({ filter: /.*/, namespace: 'memory-fs' }, () => ({ contents: rawCode, loader: 'jsx' }));
          },
        },
      ],
    });
    
    return { code: result.outputFiles[0].text, error: '' };
  } catch (err) {
    if (err instanceof Error) {
      return { code: '', error: err.message };
    }
    return { code: '', error: 'An unknown transpilation error occurred.' };
  }
};


self.addEventListener('message', async (event) => {
  const { code } = event.data;
  const result = await transpile(code);
  self.postMessage(result);
});
