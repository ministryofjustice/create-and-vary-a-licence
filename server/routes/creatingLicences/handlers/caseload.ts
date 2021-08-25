import { Request, Response } from 'express'

export default class CaseloadRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    const caseload = [
      {
        name: 'Adam Balasaravika',
        crnNumber: 'X381306',
        conditionalReleaseDate: '03 August 2022',
      },
    ]
    res.render('pages/create/caseload', { caseload })
  }
}
