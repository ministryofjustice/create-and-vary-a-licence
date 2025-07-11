import { Request, Response } from 'express'

export default class NoAddressFoundRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { postcode } = req.query as { postcode?: string }
    return res.render('pages/create/NoAddressFound', {
      postcode,
      postcodeLookupSearchUrl: `/licence/create/id/${licenceId}/initial-meeting-place`,
    })
  }
}
