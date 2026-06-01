import { Request, Response } from 'express'

export default class FindNewCurfewAddressRoutes {
  GET = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const basePath = `/licence/vary/id/${licenceId}/hdc`

    res.render('pages/vary/hdc/findNewCurfewAddress', {
      manualAddressEntryUrl: `${basePath}/manual-curfew-address-entry`,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { searchQuery } = req.body
    const basePath = `/licence/vary/id/${req.params.licenceId}/hdc`

    return res.redirect(`${basePath}/select-curfew-address?searchQuery=${encodeURIComponent(searchQuery)}`)
  }
}
