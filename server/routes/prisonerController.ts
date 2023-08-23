import path from 'path'
import type { RequestHandler } from 'express'

import PrisonerService from '../services/prisonerService'

export default class PrisonerController {
  public constructor(private readonly prisonerService: PrisonerService) {}

  placeHolderImage = path.join(process.cwd(), '/assets/images/image-missing.png')

  public getImage(): RequestHandler {
    return async (req, res) => {
      const { nomsId } = req.params
      const { user } = res.locals

      await this.prisonerService
        .getPrisonerImage(nomsId, user)
        .then(data => {
          res.type('image/jpeg')
          data.pipe(res)
        })
        .catch(() => {
          res.sendFile(this.placeHolderImage)
        })
    }
  }
}
