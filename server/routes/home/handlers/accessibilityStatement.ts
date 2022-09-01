import { Request, Response } from 'express'

export default class AccessibilityStatementRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/accessibilityStatement')
  }
}
