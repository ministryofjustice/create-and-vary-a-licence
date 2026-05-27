import { Request, Response } from 'express'

export default class NoAddressFoundRoutes {
  constructor() {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { searchQuery } = req.query as { searchQuery?: string }
    const basePath = `/licence/vary/id/${licenceId}/hdc`

    return res.render('pages/vary/hdc/noAddressFound', {
      searchQuery,
      curfewAddressSearchUrl: `${basePath}/curfew-address`,
      manualAddressEntryUrl: `${basePath}/manual-curfew-address-entry`,
    })
  }
}
