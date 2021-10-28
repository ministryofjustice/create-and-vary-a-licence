import { RequestHandler } from 'express'

export default function trimRequestBody(): RequestHandler {
  // Recursively iterate into an object and trim any strings inside
  const deepTrim = (object: object): object => {
    const o = object
    if (o) {
      Object.keys(o).forEach(key => {
        if (typeof o[key] === 'string') {
          o[key] = o[key].trim()
        } else if (typeof o[key] === 'object') {
          o[key] = deepTrim(o[key])
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
