.PHONY: all build build-one build-two build-three clean up down logs

all: build

build: build-one build-two build-three
	@echo "✅ All images built successfully"

build-one:
	@echo "🔨 Building service-one (React UI)..."
	docker build -t service-one:latest ./service-one

build-two:
	@echo "🔨 Building service-two (GraphQL)..."
	docker build -t service-two:latest ./service-two

build-three:
	@echo "🔨 Building service-three (REST API)..."
	docker build -t service-three:latest ./service-three

up: build
	@echo "📁 Creating volume directories..."
	@mkdir -p volumes/db volumes/ch_data volumes/ch_logs
	@echo "🚀 Starting all services..."
	docker-compose up -d
	@echo "✅ All services started!"
	@echo "   - React UI: http://localhost:3001"
	@echo "   - GraphQL: http://localhost:3002/graphql"
	@echo "   - REST API: http://localhost:3003"
	@echo "   - HyperDX: http://localhost:8080"

down:
	@echo "🛑 Stopping all services..."
	docker-compose down

logs:
	docker-compose logs -f

clean:
	@echo "🧹 Cleaning up..."
	docker-compose down -v
	docker rmi service-one:latest service-two:latest service-three:latest 2>/dev/null || true