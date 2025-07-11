import { Request, Response } from 'express'

export default class NoAddressFoundRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { searchQuery } = req.query as { searchQuery?: string }
    return res.render('pages/create/NoAddressFound', {
      searchQuery,
      postcodeLookupSearchUrl: `/licence/create/id/${licenceId}/initial-meeting-place`,
    })
  }
}
