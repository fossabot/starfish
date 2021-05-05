import c from '../common/dist'
import { build } from 'esbuild'
import esbuildSvelte from 'esbuild-svelte'
import sveltePreprocess from 'svelte-preprocess'

c.log(`Watching for svelte file changes...`)

build({
  entryPoints: [`./src/index.svelte`],
  bundle: true,
  outdir: `./public/dist`,
  watch: {
    onRebuild(error, result) {
      if (error) c.error(`Esbuild build failed:`, error)
      else c.log(`Esbuild build succeeded`)
    },
  },
  plugins: [
    esbuildSvelte({
      cache: true,
      compileOptions: { css: false },
      preprocess: sveltePreprocess(),
    }),
  ],
}).catch(() => process.exit(1))
