import { Request, Response } from 'express'

export default class WhatsNewController {
  GET = async (req: Request, res: Response): Promise<void> => {
    res.render('pages/whatsNewPage', {
      backLink: req.session.returnToCase,
    })
  }
}
