# Bun.js Microservices Stack

A minimal microservices architecture using Bun.js, featuring React, GraphQL, and REST APIs.

## Architecture

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  React UI   │────▶│ GraphQL API  │────▶│  REST API   │
│  Port 3001  │     │  Port 3002   │     │  Port 3003  │
└─────────────┘     └──────────────┘     └─────────────┘
  service-one        service-two          service-three
       │                    │                    │
       └────────────────────┼────────────────────┘
                            ▼
                 ┌──────────────────┐
                 │   ClickStack     │
                 │  Observability   │
                 │   Port 8080      │
                 └──────────────────┘
```

## Services

### Service One - React UI
- React application with Apollo Client
- Fetches user data via GraphQL queries
- Served by Bun with on-the-fly bundling
- Accessible at http://localhost:3001

### Service Two - GraphQL API
- GraphQL server using Elysia and GraphQL Yoga
- Provides GraphQL endpoint with GraphiQL interface
- Fetches data from the REST service
- GraphiQL available at http://localhost:3002/graphql

### Service Three - REST API
- RESTful API using Elysia framework
- Provides user data endpoints
- Data source for the GraphQL service
- API available at http://localhost:3003

### ClickStack Observability
- All-in-one observability platform with HyperDX UI
- Collects traces via OpenTelemetry (OTLP)
- ClickHouse-based storage for metrics and traces
- Accessible at http://localhost:8080

## Quick Start

### With Docker (Recommended)

1. Build and start all services:
```bash
make up
```

2. Access the services:
   - React UI: http://localhost:3001
   - GraphQL Playground: http://localhost:3002/graphql
   - REST API: http://localhost:3003/api/users
   - HyperDX Observability: http://localhost:8080

3. View logs:
```bash
make logs
```

4. Stop services:
```bash
make down
```

### Local Development

1. Install dependencies for each service:
```bash
cd service-one && bun install
cd ../service-two && bun install
cd ../service-three && bun install
```

2. Start each service in separate terminals:

Terminal 1 - REST API:
```bash
cd service-three && bun run dev
```

Terminal 2 - GraphQL API:
```bash
cd service-two && bun run dev
```

Terminal 3 - React UI:
```bash
cd service-one && bun run dev
```

## Testing

Run the test script to verify all services and generate traces:
```bash
./test-services.sh
```

This will:
- Test each service endpoint
- Generate traces in ClickStack
- Verify the complete request flow

## Makefile Commands

- `make build` - Build all Docker images
- `make up` - Build and start all services (with ClickStack)
- `make down` - Stop all services
- `make logs` - View service logs
- `make clean` - Stop services and remove images

## API Examples

### GraphQL Query
```graphql
query GetUsers {
  users {
    id
    name
    email
    role
  }
}
```

### REST Endpoints
- GET `/api/users` - Get all users
- GET `/api/users/:id` - Get user by ID
- GET `/health` - Health check

## Environment Variables

For production deployment, update the service URLs:
- Service Two: `REST_SERVICE_URL` (default: http://localhost:3003)
- Service One: Update `GRAPHQL_URL` in the React app

## Observability with ClickStack

ClickStack provides a complete observability solution powered by ClickHouse:

### Features
- **Distributed Tracing**: View request flows across all services
- **Metrics Collection**: System and application metrics
- **Log Aggregation**: Centralized logging from all services
- **HyperDX UI**: Modern observability dashboard

### OpenTelemetry Integration
All services are configured to send traces to ClickStack via OpenTelemetry:
- REST API (service-three) includes manual tracing instrumentation
- Automatic HTTP instrumentation for all services
- Traces available at http://localhost:8080

### Viewing Traces
1. Access HyperDX UI at http://localhost:8080
2. Navigate to the Traces section
3. Filter by service name: `rest-api`, `graphql-api`, or `react-ui`
4. Click on any trace to see the full request flow

## Tech Stack

- **Runtime**: Bun.js
- **Web Framework**: Elysia
- **UI**: React 18
- **GraphQL**: GraphQL Yoga + Apollo Client
- **Observability**: ClickStack (HyperDX + ClickHouse)
- **Telemetry**: OpenTelemetry
- **Containerization**: Docker & Docker Compose
- **Build Tool**: Make