import { Request, Response } from 'express'
import PathType from '../../../../enumeration/pathType'

export default class NoAddressFoundRoutes {
  constructor(private readonly path: PathType) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { licenceId } = req.params
    const { searchQuery } = req.query as { searchQuery?: string }
    const action = this.path === PathType.EDIT ? 'edit' : 'create'
    const basePath = `/licence/hard-stop/${action}/id/${licenceId}`

    return res.render('pages/initialAppointment/prisonCreated/noAddressFound', {
      searchQuery,
      postcodeLookupSearchUrl: `${basePath}/initial-meeting-place`,
      manualAddressEntryUrl: `${basePath}/manual-address-entry`,
    })
  }
}
