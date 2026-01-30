import { Elysia } from 'elysia'
import { staticPlugin } from '@elysiajs/static'
import { cors } from '@elysiajs/cors'

const app = new Elysia()
  .use(cors())
  .use(staticPlugin({
    assets: 'public',
    prefix: '/'
  }))
  .get('/health', () => ({ status: 'ok' }))
  .get('/app.js', async () => {
    const proc = Bun.spawn(['bun', 'build', './src/index.tsx', '--minify'])
    const output = await new Response(proc.stdout).text()
    return new Response(output, {
      headers: {
        'Content-Type': 'application/javascript'
      }
    })
  })
  .listen(3001)

console.log(`🚀 React UI is running at ${app.server?.hostname}:${app.server?.port}`)