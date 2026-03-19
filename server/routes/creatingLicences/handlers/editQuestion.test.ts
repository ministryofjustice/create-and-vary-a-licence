import EditQuestionRoutes from './editQuestion'
import LicenceService from '../../../services/licenceService'
import { LicenceSummary } from '../../../@types/licenceApiClientTypes'
import { createRequestAndResponse, createUser } from '../../../testUtils/handlerTestUtils'

const licenceService = new LicenceService(null, null) as jest.Mocked<LicenceService>

describe('Route Handlers - Create Licence - Edit Licence Question', () => {
  const handler = new EditQuestionRoutes(licenceService)

  beforeEach(() => {
    licenceService.updateStatus = jest.fn()
    licenceService.editApprovedLicence = jest.fn()
  })

  describe('GET', () => {
    it('should redirect if not in the correct status', async () => {
      const { req, res } = createRequestAndResponse({
        req: { licenceId: '1' },
        res: {
          user: createUser({ username: 'joebloggs', displayName: 'Joe Bloggs' }),
          licence: { statusCode: 'ACTIVE' },
        },
      })

      await handler.GET(req, res)
      expect(res.redirect).toHaveBeenCalledWith(`/licence/create/id/1/check-your-answers`)
    })

    it('should render view', async () => {
      const { req, res } = createRequestAndResponse({
        req: { licenceId: '1' },
        res: {
          user: createUser({ username: 'joebloggs', displayName: 'Joe Bloggs' }),
          licence: { statusCode: 'APPROVED' },
        },
      })

      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/create/editQuestion')
    })
  })

  describe('POST', () => {
    it('should update status to IN_PROGRESS and redirect when answer is YES', async () => {
      const { req, res } = createRequestAndResponse({
        req: { licenceId: '1', body: { answer: 'Yes' } },
        res: { user: createUser({ username: 'joebloggs', displayName: 'Joe Bloggs' }), licence: {} },
      })

      await handler.POST(req, res)
      expect(licenceService.updateStatus).toHaveBeenCalledWith(1, 'IN_PROGRESS', {
        username: 'joebloggs',
        displayName: 'Joe Bloggs',
      })
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/check-your-answers')
    })

    it('should not update status and should redirect when answer is NO', async () => {
      const { req, res } = createRequestAndResponse({
        req: { licenceId: '1', body: { answer: 'No' } },
        res: { user: createUser({ username: 'joebloggs', displayName: 'Joe Bloggs' }), licence: {} },
      })

      await handler.POST(req, res)
      expect(licenceService.updateStatus).not.toHaveBeenCalled()
      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/check-your-answers')
    })
  })

  it('should call edit licence to create a new licence version if status is APPROVED and answer is yes', async () => {
    const editedLicence = { licenceId: 2 } as unknown as LicenceSummary
    licenceService.editApprovedLicence.mockReturnValue(Promise.resolve(editedLicence))

    const { req, res } = createRequestAndResponse({
      req: { licenceId: '1', body: { answer: 'Yes' } },
      res: {
        user: createUser({ username: 'joebloggs', displayName: 'Joe Bloggs' }),
        licence: { statusCode: 'APPROVED' },
      },
    })

    await handler.POST(req, res)
    expect(licenceService.editApprovedLicence).toHaveBeenCalledWith('1', {
      username: 'joebloggs',
      displayName: 'Joe Bloggs',
    })
    expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/2/check-your-answers')
  })
})
