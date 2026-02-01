import { initializeTracing, getLogger } from './tracing'
import { Elysia } from 'elysia'
import { cors } from '@elysiajs/cors'
import { trace, context } from '@opentelemetry/api'
import { SeverityNumber } from '@opentelemetry/api-logs'

// Initialize OpenTelemetry tracing
initializeTracing()

const tracer = trace.getTracer('rest-api')
const logger = getLogger('rest-api')

const app = new Elysia()
  .use(cors())
  .get('/health', () => ({ status: 'ok' }))
  .get('/api/users', () => {
    return tracer.startActiveSpan('get-users', (span) => {
      span.setAttribute('http.method', 'GET')
      span.setAttribute('http.route', '/api/users')

      logger.emit({
        severityNumber: SeverityNumber.INFO,
        severityText: 'INFO',
        body: 'Fetching all users from REST API',
        attributes: {
          'http.method': 'GET',
          'http.route': '/api/users',
        },
      })

      const users = [
        { id: 1, name: 'Alice Johnson', email: 'alice@example.com', role: 'admin' },
        { id: 2, name: 'Bob Smith', email: 'bob@example.com', role: 'user' },
        { id: 3, name: 'Charlie Brown', email: 'charlie@example.com', role: 'user' },
        { id: 4, name: 'Diana Prince', email: 'diana@example.com', role: 'moderator' }
      ]

      span.setAttribute('users.count', users.length)
      span.end()

      logger.emit({
        severityNumber: SeverityNumber.INFO,
        severityText: 'INFO',
        body: `Successfully retrieved ${users.length} users`,
        attributes: {
          'users.count': users.length,
        },
      })

      return { users }
    })
  })
  .get('/api/users/:id', ({ params: { id } }) => {
    return tracer.startActiveSpan('get-user-by-id', (span) => {
      span.setAttribute('http.method', 'GET')
      span.setAttribute('http.route', '/api/users/:id')
      span.setAttribute('user.id', id)

      logger.emit({
        severityNumber: SeverityNumber.INFO,
        severityText: 'INFO',
        body: `Fetching user with ID: ${id}`,
        attributes: {
          'user.id': id,
          'http.method': 'GET',
          'http.route': '/api/users/:id',
        },
      })

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

        logger.emit({
          severityNumber: SeverityNumber.WARN,
          severityText: 'WARN',
          body: `User not found with ID: ${id}`,
          attributes: {
            'user.id': id,
          },
        })

        return { error: 'User not found' }
      }

      span.setAttribute('user.role', user.role)
      span.end()

      logger.emit({
        severityNumber: SeverityNumber.INFO,
        severityText: 'INFO',
        body: `Successfully retrieved user: ${user.name}`,
        attributes: {
          'user.id': id,
          'user.name': user.name,
          'user.role': user.role,
        },
      })

      return { user }
    })
  })
  .listen(3003)

console.log(`🚀 REST Service is running at ${app.server?.hostname}:${app.server?.port}`)