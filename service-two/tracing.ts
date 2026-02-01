import { NodeSDK } from '@opentelemetry/sdk-node'
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node'
import { Resource } from '@opentelemetry/resources'
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http'
import { OTLPLogExporter } from '@opentelemetry/exporter-logs-otlp-http'
import { LoggerProvider, SimpleLogRecordProcessor } from '@opentelemetry/sdk-logs'
import { logs } from '@opentelemetry/api-logs'

export function initializeTracing() {
  const serviceName = process.env.OTEL_SERVICE_NAME || 'graphql-api'
  const endpoint = process.env.OTEL_EXPORTER_OTLP_ENDPOINT || 'http://localhost:4318'

  const resource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: serviceName,
    [SemanticResourceAttributes.SERVICE_VERSION]: '1.0.0',
  })

  const traceExporter = new OTLPTraceExporter({
    url: `${endpoint}/v1/traces`,
  })

  const logExporter = new OTLPLogExporter({
    url: `${endpoint}/v1/logs`,
  })

  const loggerProvider = new LoggerProvider({
    resource,
  })
  loggerProvider.addLogRecordProcessor(new SimpleLogRecordProcessor(logExporter))
  logs.setGlobalLoggerProvider(loggerProvider)

  const sdk = new NodeSDK({
    resource,
    traceExporter,
    instrumentations: [
      getNodeAutoInstrumentations({
        '@opentelemetry/instrumentation-fs': {
          enabled: false,
        },
      }),
    ],
  })

  sdk.start()
  console.log(`🔍 OpenTelemetry tracing and logging initialized for ${serviceName}`)

  process.on('SIGTERM', () => {
    Promise.all([
      sdk.shutdown(),
      loggerProvider.shutdown(),
    ])
      .then(() => console.log('Tracing and logging terminated'))
      .catch((error) => console.log('Error terminating observability', error))
      .finally(() => process.exit(0))
  })
}

export function getLogger(name: string) {
  return logs.getLoggerProvider().getLogger(name, '1.0.0')
}
