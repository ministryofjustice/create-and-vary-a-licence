import { Request, Response } from 'express'

export default class WhatsNewPage {
  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/whatsNewPage', {
      backLink: req.session.returnToCase,
    })
  }
}
