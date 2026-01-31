import { Elysia } from 'elysia'
import { staticPlugin } from '@elysiajs/static'
import { cors } from '@elysiajs/cors'

// Build the React app on startup
console.log('🔨 Building React app...')
const buildResult = await Bun.build({
  entrypoints: ['./src/index.tsx'],
  outdir: './dist',
  minify: true,
  target: 'browser'
})

if (!buildResult.success) {
  console.error('❌ Build failed:', buildResult.logs)
  process.exit(1)
}
console.log('✅ Build complete!')

const app = new Elysia()
  .use(cors())
  .get('/health', () => ({ status: 'ok' }))
  .get('/test', () => {
    return new Response(`
      <html>
        <body style="font-family: sans-serif; padding: 2rem;">
          <h1>Test Page</h1>
          <p>If you can see this, the server is working!</p>
          <button onclick="testGraphQL()">Test GraphQL Connection</button>
          <pre id="result"></pre>
          <script>
            async function testGraphQL() {
              const result = document.getElementById('result');
              result.textContent = 'Testing...';
              try {
                const response = await fetch('http://localhost:3002/graphql', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ query: '{ users { id name } }' })
                });
                const data = await response.json();
                result.textContent = JSON.stringify(data, null, 2);
              } catch (error) {
                result.textContent = 'Error: ' + error.message;
              }
            }
          </script>
        </body>
      </html>
    `, {
      headers: { 'Content-Type': 'text/html' }
    })
  })
  .get('/app.js', () => {
    return new Response(Bun.file('./dist/index.js'), {
      headers: {
        'Content-Type': 'application/javascript'
      }
    })
  })
  .get('/', () => {
    return new Response(Bun.file('./public/index.html'), {
      headers: {
        'Content-Type': 'text/html'
      }
    })
  })
  .listen(3001)

console.log(`🚀 React UI is running at ${app.server?.hostname}:${app.server?.port}`)