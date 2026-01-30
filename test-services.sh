#!/bin/bash

echo "🧪 Testing Microservices Stack with Observability"
echo "================================================"

# Wait for services to be ready
echo "⏳ Waiting for services to start..."
sleep 5

# Test REST API
echo -e "\n📡 Testing REST API (service-three):"
curl -s http://localhost:3003/health | jq '.'
curl -s http://localhost:3003/api/users | jq '.users[0]'

# Test GraphQL API
echo -e "\n🔧 Testing GraphQL API (service-two):"
curl -s http://localhost:3002/health | jq '.'
curl -s -X POST http://localhost:3002/graphql \
  -H "Content-Type: application/json" \
  -d '{"query":"{ users { id name email role } }"}' | jq '.data.users[0]'

# Test React UI
echo -e "\n🎨 Testing React UI (service-one):"
curl -s http://localhost:3001/health | jq '.'

# Check ClickStack
echo -e "\n📊 Testing ClickStack Observability:"
curl -s -o /dev/null -w "HyperDX UI Status: %{http_code}\n" http://localhost:8080

echo -e "\n✅ All services tested!"
echo "🔍 View traces at: http://localhost:8080"
echo "   Navigate to Traces section to see the request flows"