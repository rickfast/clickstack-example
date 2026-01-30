import { Elysia } from 'elysia'
import { yoga } from '@elysiajs/graphql-yoga'
import { cors } from '@elysiajs/cors'

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
      try {
        const response = await fetch(`${REST_SERVICE_URL}/api/users`)
        const data = await response.json()
        return data.users
      } catch (error) {
        console.error('Error fetching users:', error)
        return []
      }
    },
    user: async (_: any, { id }: { id: number }) => {
      try {
        const response = await fetch(`${REST_SERVICE_URL}/api/users/${id}`)
        const data = await response.json()
        return data.user
      } catch (error) {
        console.error('Error fetching user:', error)
        return null
      }
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