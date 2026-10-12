import { flushTelemetry, initialiseTelemetry, SpanFilterFn, telemetry } from '@ministryofjustice/hmpps-azure-telemetry'
import { SpanStatusCode } from '@opentelemetry/api'

const isExcludedPath = (url: string) =>
  url.startsWith('/health') ||
  url.startsWith('/ping') ||
  url.startsWith('/info') ||
  url.startsWith('/favicon.ico') ||
  url.startsWith('/assets')

const filterSuccessfulExcludedPaths: SpanFilterFn = span => {
  const url = (span.attributes['url.path'] || span.attributes['http.target'] || '') as string

  return !(isExcludedPath(url) && span.status?.code !== SpanStatusCode.ERROR)
}

initialiseTelemetry({
  serviceName: 'create-and-vary-a-licence',
  serviceVersion: process.env.BUILD_NUMBER || 'unknown',
  connectionString: process.env.APPLICATIONINSIGHTS_CONNECTION_STRING,
  debug: process.env.DEBUG_TELEMETRY === 'true',
})
  .addFilter(filterSuccessfulExcludedPaths)
  .addModifier(telemetry.processors.enrichSpanNameWithHttpRoute())
  .startRecording()

const shutdown = async () => {
  await flushTelemetry()
  process.exit(0)
}

process.on('SIGTERM', () => shutdown())
process.on('SIGINT', () => shutdown())
