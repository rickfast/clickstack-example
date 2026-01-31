import React from 'react'
import ReactDOM from 'react-dom/client'
import { ApolloClient, InMemoryCache, ApolloProvider, useQuery, gql } from '@apollo/client'

const GRAPHQL_URL = 'http://localhost:3002/graphql'

console.log('Initializing Apollo Client with URL:', GRAPHQL_URL)

const client = new ApolloClient({
  uri: GRAPHQL_URL,
  cache: new InMemoryCache(),
})

const GET_USERS = gql`
  query GetUsers {
    users {
      id
      name
      email
      role
    }
  }
`

function UserList() {
  const { loading, error, data } = useQuery(GET_USERS)

  console.log('Query state:', { loading, error, data })

  if (loading) return <div className="loading">Loading users...</div>
  if (error) {
    console.error('GraphQL Error:', error)
    return (
      <div className="error">
        <h3>Error loading users</h3>
        <p>{error.message}</p>
        <p style={{ fontSize: '0.8rem', marginTop: '1rem' }}>
          Check browser console for details
        </p>
      </div>
    )
  }

  if (!data || !data.users) {
    return <div className="error">No data received</div>
  }

  return (
    <div className="users-grid">
      {data.users.map((user: any) => (
        <div key={user.id} className="user-card">
          <div className="user-avatar">{user.name.charAt(0)}</div>
          <h3>{user.name}</h3>
          <p className="email">{user.email}</p>
          <span className={`role role-${user.role}`}>{user.role}</span>
        </div>
      ))}
    </div>
  )
}

function App() {
  return (
    <ApolloProvider client={client}>
      <div className="container">
        <header>
          <h1>User Dashboard</h1>
          <p>Connected to GraphQL Service</p>
        </header>
        <main>
          <UserList />
        </main>
      </div>
    </ApolloProvider>
  )
}

const style = document.createElement('style')
style.textContent = `
  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  header {
    text-align: center;
    color: white;
    margin-bottom: 3rem;
  }

  header h1 {
    font-size: 2.5rem;
    margin-bottom: 0.5rem;
  }

  header p {
    opacity: 0.9;
  }

  .users-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 1.5rem;
  }

  .user-card {
    background: white;
    border-radius: 12px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s;
    text-align: center;
  }

  .user-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
  }

  .user-avatar {
    width: 60px;
    height: 60px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: bold;
    margin: 0 auto 1rem;
  }

  .user-card h3 {
    margin-bottom: 0.5rem;
    color: #333;
  }

  .email {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 1rem;
  }

  .role {
    display: inline-block;
    padding: 0.25rem 0.75rem;
    border-radius: 20px;
    font-size: 0.85rem;
    font-weight: 500;
  }

  .role-admin {
    background: #fee2e2;
    color: #dc2626;
  }

  .role-moderator {
    background: #fef3c7;
    color: #d97706;
  }

  .role-user {
    background: #dbeafe;
    color: #2563eb;
  }

  .loading, .error {
    text-align: center;
    padding: 2rem;
    background: white;
    border-radius: 12px;
    color: #333;
  }

  .error {
    background: #fee2e2;
    color: #dc2626;
  }
`
document.head.appendChild(style)

console.log('React app starting...')

const rootElement = document.getElementById('root')
if (!rootElement) {
  console.error('Root element not found!')
} else {
  console.log('Root element found, mounting React app')
  const root = ReactDOM.createRoot(rootElement)
  root.render(<App />)
  console.log('React app rendered')
}