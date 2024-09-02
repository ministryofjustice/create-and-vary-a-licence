import { RequestHandler } from 'express'

export default function trimRequestBody(): RequestHandler {
  // Recursively iterate into an object and trim any strings inside
  const deepTrim = <T extends Record<string, string | T>>(object: T): object => {
    const o = object
    if (o) {
      ;(Object.keys(o) as (keyof T)[]).forEach(key => {
        const val = o[key]
        if (typeof val === 'string') {
          o[key] = val.trim() as typeof val
        } else if (typeof val === 'object') {
          o[key] = deepTrim(val as T) as typeof val
        }
      })
    }
    return o as object
  }

  return (req, res, next) => {
    if (req.method === 'POST') {
      req.body = deepTrim(req.body)
    }
    next()
  }
}
