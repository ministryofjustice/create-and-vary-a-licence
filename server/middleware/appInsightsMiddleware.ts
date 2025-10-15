import { getCorrelationContext } from 'applicationinsights'
import type { Request, Response, NextFunction } from 'express'

type CorrelationContextGetter = typeof getCorrelationContext

export default function appInsightsMiddleware(contextGetter: CorrelationContextGetter = getCorrelationContext) {
  return (req: Request, res: Response, next: NextFunction) => {
    res.prependOnceListener('finish', () => {
      const context = contextGetter()
      if (context && req.route) {
        const path = req.route?.path
        const pathToReport = Array.isArray(path) ? `"${path.join('" | "')}"` : path
        context.customProperties.setProperty('operationName', `${req.method} ${pathToReport}`)
      }
    })
    next()
  }
}
