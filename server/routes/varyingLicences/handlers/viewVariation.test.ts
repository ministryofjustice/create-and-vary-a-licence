import { Request, Response } from 'express'

import ViewVariationRoutes from './viewVariation'
import LicenceStatus from '../../../enumeration/licenceStatus'
import { Licence } from '../../../@types/licenceApiClientTypes'

const username = 'joebloggs'

describe('Route - Vary - View variation', () => {
  const handler = new ViewVariationRoutes()
  let req: Request
  let res: Response

  const licence = {
    id: 1,
    surname: 'Bobson',
    forename: 'Bob',
    appointmentTime: '12/12/2022 14:16',
    additionalLicenceConditions: [],
    additionalPssConditions: [],
    bespokeConditions: [],
  } as Licence

  beforeEach(() => {
    req = {
      body: {
        licenceId: '1',
      },
    } as unknown as Request
  })

  describe('GET', () => {
    it('should render a licence view for active licence', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username },
          licence: {
            ...licence,
            statusCode: LicenceStatus.ACTIVE,
          },
        },
      } as unknown as Response

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/vary/viewVariation', {
        callToActions: {
          shouldShowEditAndDiscardButton: false,
          shouldShowPrintButton: false,
          shouldShowVaryButton: true,
        },
        expandedLicenceConditions: res.locals.licence.additionalLicenceConditions,
        expandedPssConditions: res.locals.licence.additionalPssConditions,
      })
    })

    it('should show edit and discard buttons when variation is in submitted state', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username },
          licence: {
            ...licence,
            statusCode: LicenceStatus.VARIATION_SUBMITTED,
          },
        },
      } as unknown as Response

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/vary/viewVariation', {
        callToActions: {
          shouldShowEditAndDiscardButton: true,
          shouldShowPrintButton: false,
          shouldShowVaryButton: false,
        },
        expandedLicenceConditions: res.locals.licence.additionalLicenceConditions,
        expandedPssConditions: res.locals.licence.additionalPssConditions,
      })
    })

    it('should show edit and discard buttons when variation is in rejected state', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username },
          licence: {
            ...licence,
            statusCode: LicenceStatus.VARIATION_REJECTED,
          },
        },
      } as unknown as Response

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/vary/viewVariation', {
        callToActions: {
          shouldShowEditAndDiscardButton: true,
          shouldShowPrintButton: false,
          shouldShowVaryButton: false,
        },
        expandedLicenceConditions: res.locals.licence.additionalLicenceConditions,
        expandedPssConditions: res.locals.licence.additionalPssConditions,
      })
    })

    it('should show print, edit and discard buttons when variation is in approved state', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username },
          licence: {
            ...licence,
            statusCode: LicenceStatus.VARIATION_APPROVED,
          },
        },
      } as unknown as Response

      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/vary/viewVariation', {
        callToActions: {
          shouldShowEditAndDiscardButton: true,
          shouldShowPrintButton: true,
          shouldShowVaryButton: false,
        },
        expandedLicenceConditions: res.locals.licence.additionalLicenceConditions,
        expandedPssConditions: res.locals.licence.additionalPssConditions,
      })
    })

    it('should redirect to check your answers if variation is in progress', async () => {
      res = {
        render: jest.fn(),
        redirect: jest.fn(),
        locals: {
          user: { username },
          licence: {
            ...licence,
            statusCode: LicenceStatus.VARIATION_IN_PROGRESS,
          },
        },
      } as unknown as Response

      await handler.GET(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/check-your-answers')
    })
  })
})
