const sass = require('sass');
const esbuild = require('esbuild');
const process = require('process');

const dev = process.env.NODE_ENV === 'development';
const prod = process.env.NODE_ENV === 'production';

/**
 * @type { esbuild.Plugin }
 */
const scssPlugin = {
    name: 'scss',
    setup(build) {
        build.onResolve({ filter: /.*/ }, args => {
            // do not resolve css url()
            if (args.kind === 'url-token') {
                return { external: true };
            }
        });

        build.onLoad({ filter: /\.scss$/ }, args => {
            const result = sass.compile(args.path);

            return {
                contents: result.css,
                loader: 'css',
                watchFiles: result.loadedUrls.map(u => u.pathname)
            }
        });
    }
};

/**
 * @type { esbuild.BuildOptions }
 */
const buildOptions = {
    entryPoints: { popup: 'src/Popup.tsx', background: 'src/background.ts' },
    outdir: 'build',
    bundle: true,
    minify: true,
    keepNames: true,
    format: 'esm',
    target: 'chrome86',
    logLevel: 'info',
    plugins: [scssPlugin],

    // dev options
    sourcemap: dev ? 'inline' : false,

    // prod options
    metafile: prod
};

async function build() {
    if (dev) {
        const ctx = await esbuild.context(buildOptions);
        await ctx.watch();
        console.log('watching...');
    } else {
        const result = await esbuild.build(buildOptions).catch(() => process.exit(1));

        if (result.metafile) {
            console.log(await esbuild.analyzeMetafile(result.metafile));
        }
    }
}

build();
