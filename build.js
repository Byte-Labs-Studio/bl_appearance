import { context } from "esbuild";

const dev = process.argv[2] === '-dev'

const ENTRIES = [
  {
    type: 'server',
    entryPoints: ['server/init.ts'],
    outfile: 'dist/server/init.js',
  },
  {
    type: 'client',
    entryPoints: ["client/init.ts"],
    outfile: "dist/client/init.js",
    platform: 'node',
  },
];

const build = async (esbuildOptions, type) => {
  const ctx = await context({
    bundle: true,
    format: 'esm',
    target: 'esnext',
    logLevel: 'info',
    sourcemap: dev ? 'both' : false,
    minify: !dev,
    keepNames: dev,
    define: {
      __DEV_MODE__: `${dev}`,
    },
    ...esbuildOptions,
  })

  if (dev) {
    ctx.watch()
    console.log(`[Watch] Sucessfully rebuilt ${type} bundle`);
  } else {
    ctx.rebuild()
    ctx.dispose()
  }
}

for (const OPTIONS of ENTRIES) {
  try {
    await build({
      entryPoints: OPTIONS.entryPoints,
      outfile: OPTIONS.outfile,
    }, OPTIONS.type);
  } catch (error) {
    console.error('Error during build:', error);
  }
}