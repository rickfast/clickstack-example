import { initializeTracing } from './tracing'
import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { trace, context } from '@opentelemetry/api'

// Initialize OpenTelemetry tracing
initializeTracing()

const tracer = trace.getTracer('rest-api')

const app = new Elysia()
  .use(cors())
  .get('/health', () => ({ status: 'ok' }))
  .get('/api/users', () => {
    return tracer.startActiveSpan('get-users', (span) => {
      span.setAttribute('http.method', 'GET')
      span.setAttribute('http.route', '/api/users')

      const users = [
        { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin' },
        { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'user' },
        { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'user' },
        { id: 4, name: 'Diana Prince', email: 'diana@example.com', role: 'moderator' }
      ]

      span.setAttribute('users.count', users.length)
      span.end()

      return { users }
    })
  })
  .get('/api/users/:id', ({ params: { id } }) => {
    return tracer.startActiveSpan('get-user-by-id', (span) => {
      span.setAttribute('http.method', 'GET')
      span.setAttribute('http.route', '/api/users/:id')
      span.setAttribute('user.id', id)

      const users = [
        { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin' },
        { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'user' },
        { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'user' },
        { id: 4, name: 'Diana Prince', email: 'diana@example.com', role: 'moderator' }
      ]
      const user = users.find(u => u.id === parseInt(id))

      if (!user) {
        span.setStatus({ code: 2, message: 'User not found' })
        span.end()
        return { error: 'User not found' }
      }

      span.setAttribute('user.role', user.role)
      span.end()
      return { user }
    })
  })
  .listen(3003)

console.log(`🚀 REST Service is running at ${app.server?.hostname}:${app.server?.port}`)