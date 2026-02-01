import { initializeTracing, getLogger } from './tracing'
import { Elysia } from 'elysia'
import { yoga } from '@elysiajs/graphql-yoga'
import { cors } from '@elysiajs/cors'
import { trace } from '@opentelemetry/api'
import { SeverityNumber } from '@opentelemetry/api-logs'

// Initialize OpenTelemetry tracing
initializeTracing()

const tracer = trace.getTracer('graphql-api')
const logger = getLogger('graphql-api')
const REST_SERVICE_URL = process.env.REST_SERVICE_URL || 'http://localhost:3003'

const typeDefs = `
  type User {
    id: Int!
    name: String!
    email: String!
    role: String!
  }

  type Query {
    users: [User!]!
    user(id: Int!): User
  }
`

const resolvers = {
  Query: {
    users: async () => {
      return tracer.startActiveSpan('graphql.query.users', async (span) => {
        try {
          span.setAttribute('graphql.operation.type', 'query')
          span.setAttribute('graphql.operation.name', 'users')

          logger.emit({
            severityNumber: SeverityNumber.INFO,
            severityText: 'INFO',
            body: 'GraphQL query: Fetching all users',
            attributes: {
              'graphql.operation.type': 'query',
              'graphql.operation.name': 'users',
            },
          })

          const response = await fetch(`${REST_SERVICE_URL}/api/users`)
          const data = await response.json()

          span.setAttribute('users.count', data.users?.length || 0)
          span.end()

          logger.emit({
            severityNumber: SeverityNumber.INFO,
            severityText: 'INFO',
            body: `GraphQL query: Successfully fetched ${data.users?.length || 0} users from REST API`,
            attributes: {
              'users.count': data.users?.length || 0,
            },
          })

          return data.users
        } catch (error) {
          console.error('Error fetching users:', error)

          logger.emit({
            severityNumber: SeverityNumber.ERROR,
            severityText: 'ERROR',
            body: `GraphQL query failed: ${(error as Error).message}`,
            attributes: {
              'error.message': (error as Error).message,
              'graphql.operation.name': 'users',
            },
          })

          span.recordException(error as Error)
          span.setStatus({ code: 2, message: 'Failed to fetch users' })
          span.end()
          return []
        }
      })
    },
    user: async (_: any, { id }: { id: number }) => {
      return tracer.startActiveSpan('graphql.query.user', async (span) => {
        try {
          span.setAttribute('graphql.operation.type', 'query')
          span.setAttribute('graphql.operation.name', 'user')
          span.setAttribute('user.id', id)

          logger.emit({
            severityNumber: SeverityNumber.INFO,
            severityText: 'INFO',
            body: `GraphQL query: Fetching user with ID ${id}`,
            attributes: {
              'graphql.operation.type': 'query',
              'graphql.operation.name': 'user',
              'user.id': id,
            },
          })

          const response = await fetch(`${REST_SERVICE_URL}/api/users/${id}`)
          const data = await response.json()

          if (data.user) {
            span.setAttribute('user.role', data.user.role)

            logger.emit({
              severityNumber: SeverityNumber.INFO,
              severityText: 'INFO',
              body: `GraphQL query: Successfully fetched user ${data.user.name}`,
              attributes: {
                'user.id': id,
                'user.name': data.user.name,
                'user.role': data.user.role,
              },
            })
          } else {
            logger.emit({
              severityNumber: SeverityNumber.WARN,
              severityText: 'WARN',
              body: `GraphQL query: User not found with ID ${id}`,
              attributes: {
                'user.id': id,
              },
            })
          }

          span.end()
          return data.user
        } catch (error) {
          console.error('Error fetching user:', error)

          logger.emit({
            severityNumber: SeverityNumber.ERROR,
            severityText: 'ERROR',
            body: `GraphQL query failed for user ${id}: ${(error as Error).message}`,
            attributes: {
              'error.message': (error as Error).message,
              'graphql.operation.name': 'user',
              'user.id': id,
            },
          })

          span.recordException(error as Error)
          span.setStatus({ code: 2, message: 'Failed to fetch user' })
          span.end()
          return null
        }
      })
    }
  }
}

const app = new Elysia()
  .use(cors())
  .use(
    yoga({
      typeDefs,
      resolvers,
      graphiql: true,
      graphqlEndpoint: '/graphql'
    })
  )
  .get('/health', () => ({ status: 'ok' }))
  .listen(3002)

console.log(`🚀 GraphQL Service is running at ${app.server?.hostname}:${app.server?.port}/graphql`)