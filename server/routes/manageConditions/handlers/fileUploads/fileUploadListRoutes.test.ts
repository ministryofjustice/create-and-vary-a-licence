import { Request, Response } from 'express'
import ConditionService from '../../../../services/conditionService'
import LicenceService from '../../../../services/licenceService'
import { MEZ_CONDITION_CODE } from '../../../../utils/conditionRoutes'
import { AddAdditionalConditionRequest, AdditionalCondition } from '../../../../@types/licenceApiClientTypes'
import FileUploadListRoutes from './fileUploadListRoutes'
import YesOrNo from '../../../../enumeration/yesOrNo'
import LicenceType from '../../../../enumeration/licenceType'

const conditionService = new ConditionService(null) as jest.Mocked<ConditionService>
const licenceService = new LicenceService(null, conditionService) as jest.Mocked<LicenceService>

jest.mock('../../../../services/conditionService')
jest.mock('../../../../services/licenceService')

describe('Route Handlers - Create Licence - file upload list routes', () => {
  let req: Request
  let res: Response
  const handler = new FileUploadListRoutes(licenceService, conditionService)

  beforeEach(() => {
    req = {
      params: {
        licenceId: '1',
        conditionId: '1',
        conditionCode: MEZ_CONDITION_CODE,
      },
      query: {},
      body: {},
      session: {},
    } as unknown as Request

    res = {
      render: jest.fn(),
      redirect: jest.fn(),
      status: jest.fn(),
      locals: {
        licence: {
          id: 1,
          additionalLicenceConditions: [],
          version: 'version',
        },
        user: {
          username: 'joebloggs',
        },
      },
    } as unknown as Response
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  describe('GET', () => {
    it('should redirect to the additional licence conditions callback if there are no maps', async () => {
      await handler.GET(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/additional-licence-conditions/callback')
    })

    it('should redirect to the additional licence conditions callback if there are no maps with the fromReview flag if set', async () => {
      req.query.fromReview = 'true'
      await handler.GET(req, res)

      expect(res.redirect).toHaveBeenCalledWith(
        '/licence/create/id/1/additional-licence-conditions/callback?fromReview=true',
      )
    })

    it('should redirect to the policy changes callback if there are no maps and the flag is set', async () => {
      req.query.fromPolicyReview = 'true'
      req.session.changedConditionsInputsCounter = 1
      await handler.GET(req, res)

      expect(res.redirect).toHaveBeenCalledWith('/licence/vary/id/1/policy-changes/input/callback/2')
    })

    it('should render the list view if there is at least one map', async () => {
      const mezInstance: AdditionalCondition = { id: 1, code: MEZ_CONDITION_CODE, data: [], uploadSummary: [] }
      res.locals.licence.additionalLicenceConditions = [mezInstance]
      await handler.GET(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/manageConditions/fileUploads/list', {
        conditions: [mezInstance],
        licenceId: '1',
        displayMessage: null,
      })
    })
  })

  describe('POST', () => {
    const mezInstance: AdditionalCondition = { id: 1, code: MEZ_CONDITION_CODE, data: [], uploadSummary: [] }
    beforeEach(() => {
      req.body.conditionCode = MEZ_CONDITION_CODE
      res.locals.licence.additionalLicenceConditions = [mezInstance]
    })

    it('should re-render with an error message if the user does not select an option', async () => {
      await handler.POST(req, res)

      expect(res.render).toHaveBeenCalledWith('pages/manageConditions/fileUploads/list', {
        conditions: [mezInstance],
        licenceId: '1',
        displayMessage: { text: 'Select yes or no' },
      })
    })

    describe('user selects "No"', () => {
      beforeEach(() => {
        req.body.uploadFile = YesOrNo.NO
      })

      it('should redirect to the additional licence conditions callback', async () => {
        await handler.POST(req, res)

        expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/additional-licence-conditions/callback')
      })

      it('should redirect to the additional licence conditions callback with fromReview if the flag is set', async () => {
        req.query.fromReview = 'true'
        await handler.POST(req, res)

        expect(res.redirect).toHaveBeenCalledWith(
          '/licence/create/id/1/additional-licence-conditions/callback?fromReview=true',
        )
      })

      it('should redirect to the policy changes callback if the fromPolicyReview flag is set', async () => {
        req.query.fromPolicyReview = 'true'
        req.session.changedConditionsInputsCounter = 1
        await handler.POST(req, res)

        expect(res.redirect).toHaveBeenCalledWith('/licence/vary/id/1/policy-changes/input/callback/2')
      })
    })

    describe('user selects "Yes"', () => {
      beforeEach(() => {
        req.body.uploadFile = YesOrNo.YES
        conditionService.getAdditionalConditionByCode.mockResolvedValue({
          code: MEZ_CONDITION_CODE,
          category: 'Freedom of movement',
          text: 'MEZ text',
          tpl: 'MEZ tpl',
          requiresInput: true,
          type: 'AP',
        })
        conditionService.currentOrNextSequenceForCondition.mockReturnValue(1)
        conditionService.getAdditionalConditionType.mockResolvedValue(LicenceType.AP)
        licenceService.addAdditionalCondition.mockResolvedValue({ id: 3 } as AdditionalCondition)
      })

      it('should call to add a new instance of the condition', async () => {
        const expectedRequest = {
          conditionCode: MEZ_CONDITION_CODE,
          conditionCategory: 'Freedom of movement',
          conditionText: 'MEZ text',
          conditionType: 'AP',
          expandedText: 'MEZ tpl',
          sequence: 1,
        } as AddAdditionalConditionRequest

        await handler.POST(req, res)

        expect(licenceService.addAdditionalCondition).toHaveBeenCalledWith('1', LicenceType.AP, expectedRequest, {
          username: 'joebloggs',
        })
      })

      it('should redirect to the input page for the added exclusion zone instance', async () => {
        await handler.POST(req, res)
        expect(res.redirect).toHaveBeenCalledWith('/licence/create/id/1/additional-licence-conditions/condition/3')
      })

      it('should redirect with the fromReview flag if set', async () => {
        req.query.fromReview = 'true'
        await handler.POST(req, res)
        expect(res.redirect).toHaveBeenCalledWith(
          '/licence/create/id/1/additional-licence-conditions/condition/3?fromReview=true',
        )
      })

      it('should redirect with the fromPolicyReview flag if set', async () => {
        req.query.fromPolicyReview = 'true'
        await handler.POST(req, res)
        expect(res.redirect).toHaveBeenCalledWith(
          '/licence/create/id/1/additional-licence-conditions/condition/3?fromPolicyReview=true',
        )
      })
    })
  })
})
