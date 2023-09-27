import { Request, Response } from 'express'
import LicenceService from '../../../../services/licenceService'
import OutOfBoundsPremisesRemovalRoutes from './outOfBoundsPremisesRemovalRoutes'
import { OUT_OF_BOUNDS_PREMISES_CONDITION_CODE } from '../../../../utils/conditionRoutes'

const licenceService = new LicenceService(null, null, null, null) as jest.Mocked<LicenceService>
describe('Route Handlers - Create Licence - Out Of Bounds Premises Removal Routes Handler', () => {
  const handler = new OutOfBoundsPremisesRemovalRoutes(licenceService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      params: {
        licenceId: '1',
        conditionId: '1',
      },
      query: {},
      body: {},
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      status: jest.fn(),
      locals: {
        licence: {
          additionalLicenceConditions: [
            { id: 1, code: 'outOfBoundsPremises', data: [{ field: 'nameOfPremises', value: 'The Dolphin' }] },
          ],
        },
        user: {
          username: 'joebloggs',
        },
      },
    } as unknown as Response
  })

  describe('GET', () => {
    it('should display confirmation page to delete condition', async () => {
      await handler.GET(req, res)
      expect(res.render).toHaveBeenCalledWith('pages/manageConditions/outOfBoundsPremises/confirmPremisesDeletion', {
        conditionId: '1',
        conditionCode: 'outOfBoundsPremises',
        displayMessage: null,
        description: 'The Dolphin',
      })
    })
  })

  describe('POST', () => {
    beforeEach(() => {
      licenceService.deleteAdditionalCondition = jest.fn()
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        status: jest.fn(),
        locals: {
          licence: {
            id: 1,
            additionalLicenceConditions: [
              {
                id: 1,
                code: OUT_OF_BOUNDS_PREMISES_CONDITION_CODE,
                data: [{ field: 'nameOfPremises', value: 'The Dolphin' }],
              },
            ],
          },
          user: {
            username: 'joebloggs',
          },
        },
      } as unknown as Response
    })

    it('should call delete condition for submitted conditionId', async () => {
      req = {
        params: {
          licenceId: '1',
          conditionId: '1',
        },
        body: { confirmRemoval: 'Yes' },
      } as unknown as Request
      await handler.POST(req, res)
      expect(licenceService.deleteAdditionalCondition).toHaveBeenCalledWith(1, 1, { username: 'joebloggs' })
    })

    it('should redirect to the out of bounds premises page', async () => {
      req = {
        params: {
          licenceId: '1',
          conditionId: '1',
        },
        body: { confirmRemoval: 'Yes' },
      } as unknown as Request
      await handler.POST(req, res)
      expect(res.redirect).toHaveBeenCalledWith(
        `/licence/create/id/1/additional-licence-conditions/condition/${OUT_OF_BOUNDS_PREMISES_CONDITION_CODE}/outofbounds-premises?fromReview=true`
      )
    })

    it('should not call delete condition for submitted conditionId', async () => {
      req = {
        params: {
          licenceId: '1',
          conditionId: '1',
        },
        body: { confirmRemoval: 'No' },
      } as unknown as Request
      await handler.POST(req, res)
      expect(licenceService.deleteAdditionalCondition).toHaveBeenCalledTimes(0)
    })

    it('should display error if no option is selected', async () => {
      req = {
        params: {
          licenceId: '1',
          conditionId: '1',
        },
        body: {},
      } as unknown as Request
      await handler.POST(req, res)
      expect(licenceService.deleteAdditionalCondition).toHaveBeenCalledTimes(0)
      expect(res.render).toHaveBeenCalledWith('pages/manageConditions/outOfBoundsPremises/confirmPremisesDeletion', {
        conditionId: '1',
        conditionCode: OUT_OF_BOUNDS_PREMISES_CONDITION_CODE,
        displayMessage: { text: 'Select yes or no' },
        description: 'The Dolphin',
      })
    })
  })
})
