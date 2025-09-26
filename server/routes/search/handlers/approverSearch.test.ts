import { Request, Response } from 'express'
import ApproverSearchRoutes from './approverSearch'
import PrisonerService from '../../../services/prisonerService'
import SearchService from '../../../services/searchService'
import { PrisonDetail } from '../../../@types/prisonApiClientTypes'
import { ApprovalCase } from '../../../@types/licenceApiClientTypes'
import { User } from '../../../@types/CvlUserDetails'

const searchService = new SearchService(null) as jest.Mocked<SearchService>
const prisonerService = new PrisonerService(null, null) as jest.Mocked<PrisonerService>

jest.mock('../../../services/searchService')
jest.mock('../../../services/prisonerService')

describe('Route Handlers - Search - Prison Approver Search', () => {
  const handler = new ApproverSearchRoutes(searchService, prisonerService)
  let req: Request
  let res: Response

  beforeEach(() => {
    req = {
      query: {
        queryTerm: '',
      },
    } as unknown as Request

    res = {
      locals: {
        user: {
          hasMultipleCaseloadsInNomis: false,
          prisonCaseloadToDisplay: ['MDI'],
          hasSelectedMultiplePrisonCaseloads: false,
        },
      },
      render: jest.fn(),
    } as unknown as Response

    prisonerService.getPrisons.mockResolvedValue([
      {
        agencyId: 'BAI',
        description: 'Belmarsh (HMP)',
      },
      {
        agencyId: 'BXI',
        description: 'Brixton (HMP)',
      },
      {
        agencyId: 'MDI',
        description: 'Moorland (HMP)',
      },
      {
        agencyId: 'LEI',
        description: 'Leeds (HMP)',
      },
    ] as PrisonDetail[])
  })

  afterEach(() => {
    jest.resetAllMocks()
  })

  let searchResponse = {
    approvalNeededResponse: [
      {
        licenceId: 1,
        name: 'Test Person 1',
        prisonerNumber: 'A1234AA',
        probationPractitioner: {
          name: 'Com Four',
        },
        submittedByFullName: 'Submitted Person',
        releaseDate: '01/05/2024',
        urgentApproval: false,
        approvedBy: null,
        approvedOn: null,
        kind: 'CRD',
        prisonCode: 'MDI',
        prisonDescription: 'Moorland (HMP)',
      },
      {
        licenceId: 2,
        name: 'Test Person 2',
        prisonerNumber: 'A1234AB',
        probationPractitioner: {
          name: 'Com Three',
        },
        submittedByFullName: 'Submitted Person',
        releaseDate: '01/05/2024',
        urgentApproval: true,
        approvedBy: null,
        approvedOn: null,
        kind: 'CRD',
        prisonCode: 'MDI',
        prisonDescription: 'Moorland (HMP)',
      },
      {
        licenceId: 3,
        name: 'Test Person 3',
        prisonerNumber: 'A1234AC',
        probationPractitioner: {
          name: 'Com Three',
        },
        submittedByFullName: 'Submitted Person',
        releaseDate: '10/06/2024',
        urgentApproval: true,
        approvedBy: null,
        approvedOn: null,
        kind: 'CRD',
        prisonCode: 'MDI',
        prisonDescription: 'Moorland (HMP)',
      },
      {
        licenceId: 4,
        name: 'Test Person 4',
        prisonerNumber: 'A1234AD',
        probationPractitioner: {
          name: 'Com Three',
        },
        submittedByFullName: 'Submitted Person',
        releaseDate: '02/05/2024',
        urgentApproval: true,
        approvedBy: null,
        approvedOn: null,
        kind: 'CRD',
        prisonCode: 'MDI',
        prisonDescription: 'Moorland (HMP)',
      },
    ] as ApprovalCase[],
    recentlyApprovedResponse: [
      {
        licenceId: 5,
        name: 'Test Person 5',
        prisonerNumber: 'A1234AE',
        releaseDate: '01/05/2024',
        probationPractitioner: {
          name: 'Com Four',
        },
        submittedByFullName: 'Submitted Person',
        urgentApproval: false,
        approvedBy: 'An Approver',
        approvedOn: '10/04/2023 00:00:00',
        kind: 'CRD',
        prisonCode: 'MDI',
        prisonDescription: 'Moorland (HMP)',
      },
      {
        licenceId: 6,
        name: 'Test Person 6',
        prisonerNumber: 'A1234AF',
        probationPractitioner: {
          name: 'Com Two',
        },
        submittedByFullName: 'Submitted Person',
        releaseDate: '12/04/2024',
        urgentApproval: true,
        approvedBy: 'An Approver',
        approvedOn: '12/04/2023 00:00:00',
        kind: 'CRD',
        prisonCode: 'MDI',
        prisonDescription: 'Moorland (HMP)',
      },
    ] as ApprovalCase[],
  }

  describe('GET', () =>
    it('sets the correct back link dependent on the previous page visited', async () => {
      req.query = { queryTerm: '' }

      await handler.GET(req, res)

      expect(searchService.getPrisonApproverSearchResults).not.toHaveBeenCalled()

      expect(res.render).toHaveBeenCalledWith('pages/search/approverSearch/approverSearch', {
        queryTerm: '',
        backLink: '/licence/approve/cases',
        tabParameters: {
          activeTab: '#approval-needed',
          approvalNeeded: {
            resultsCount: 0,
            tabHeading: 'Approval needed',
            tabId: 'tab-heading-approval-needed',
          },
          recentlyApproved: {
            resultsCount: 0,
            tabHeading: 'Recently approved',
            tabId: 'tab-heading-recently-approved',
          },
        },
        hasMultipleCaseloadsInNomis: false,
        hasSelectedMultiplePrisonCaseloads: false,
        prisonsToDisplay: [{ agencyId: 'MDI', description: 'Moorland (HMP)' }],
        changeLocationHref: '/licence/approve/change-location',
        approvalNeededCases: [],
        recentlyApprovedCases: [],
      })
    }))

  it('should render cases and evaluate links when user has a caseload in a single prison', async () => {
    searchService.getPrisonApproverSearchResults.mockResolvedValue(searchResponse)
    req.query = { queryTerm: 'test' }
    await handler.GET(req, res)

    expect(res.render).toHaveBeenCalledWith('pages/search/approverSearch/approverSearch', {
      queryTerm: 'test',
      backLink: '/licence/approve/cases',
      tabParameters: {
        activeTab: '#approval-needed',
        approvalNeeded: {
          resultsCount: 4,
          tabHeading: 'Approval needed',
          tabId: 'tab-heading-approval-needed',
        },
        recentlyApproved: {
          resultsCount: 2,
          tabHeading: 'Recently approved',
          tabId: 'tab-heading-recently-approved',
        },
      },
      hasMultipleCaseloadsInNomis: false,
      hasSelectedMultiplePrisonCaseloads: false,
      prisonsToDisplay: [{ agencyId: 'MDI', description: 'Moorland (HMP)' }],
      changeLocationHref: '/licence/approve/change-location?queryTerm=test',
      approvalNeededCases: [
        {
          licenceId: 1,
          name: 'Test Person 1',
          prisonerNumber: 'A1234AA',
          probationPractitioner: {
            name: 'Com Four',
          },
          submittedByFullName: 'Submitted Person',
          releaseDate: '01/05/2024',
          urgentApproval: false,
          approvedBy: null,
          approvedOn: null,
          kind: 'CRD',
          prisonCode: 'MDI',
          prisonDescription: 'Moorland (HMP)',
        },
        {
          licenceId: 2,
          name: 'Test Person 2',
          prisonerNumber: 'A1234AB',
          probationPractitioner: {
            name: 'Com Three',
          },
          submittedByFullName: 'Submitted Person',
          releaseDate: '01/05/2024',
          urgentApproval: true,
          approvedBy: null,
          approvedOn: null,
          kind: 'CRD',
          prisonCode: 'MDI',
          prisonDescription: 'Moorland (HMP)',
        },
        {
          licenceId: 3,
          name: 'Test Person 3',
          prisonerNumber: 'A1234AC',
          probationPractitioner: {
            name: 'Com Three',
          },
          submittedByFullName: 'Submitted Person',
          releaseDate: '10/06/2024',
          urgentApproval: true,
          approvedBy: null,
          approvedOn: null,
          kind: 'CRD',
          prisonCode: 'MDI',
          prisonDescription: 'Moorland (HMP)',
        },
        {
          licenceId: 4,
          name: 'Test Person 4',
          prisonerNumber: 'A1234AD',
          probationPractitioner: {
            name: 'Com Three',
          },
          submittedByFullName: 'Submitted Person',
          releaseDate: '02/05/2024',
          urgentApproval: true,
          approvedBy: null,
          approvedOn: null,
          kind: 'CRD',
          prisonCode: 'MDI',
          prisonDescription: 'Moorland (HMP)',
        },
      ],
      recentlyApprovedCases: [
        {
          licenceId: 5,
          name: 'Test Person 5',
          prisonerNumber: 'A1234AE',
          probationPractitioner: {
            name: 'Com Four',
          },
          submittedByFullName: 'Submitted Person',
          releaseDate: '01/05/2024',
          urgentApproval: false,
          approvedBy: 'An Approver',
          approvedOn: '10/04/2023 00:00:00',
          kind: 'CRD',
          prisonCode: 'MDI',
          prisonDescription: 'Moorland (HMP)',
        },
        {
          licenceId: 6,
          name: 'Test Person 6',
          prisonerNumber: 'A1234AF',
          probationPractitioner: {
            name: 'Com Two',
          },
          submittedByFullName: 'Submitted Person',
          releaseDate: '12/04/2024',
          urgentApproval: true,
          approvedBy: 'An Approver',
          approvedOn: '12/04/2023 00:00:00',
          kind: 'CRD',
          prisonCode: 'MDI',
          prisonDescription: 'Moorland (HMP)',
        },
      ],
    })
  })

  it('should render cases and evaluate links when user has selected multiple caseloads', async () => {
    res.locals.user = {
      hasMultipleCaseloadsInNomis: true,
      prisonCaseloadToDisplay: ['MDI', 'LEI'],
      hasSelectedMultiplePrisonCaseloads: true,
    } as User
    searchResponse = {
      approvalNeededResponse: [
        ...searchResponse.approvalNeededResponse,
        {
          licenceId: 7,
          name: 'Test Person 7',
          prisonerNumber: 'A1234AG',
          probationPractitioner: {
            name: 'Com Three',
          },
          submittedByFullName: 'Submitted Person',
          releaseDate: '02/11/2024',
          urgentApproval: true,
          approvedBy: null,
          approvedOn: null,
          kind: 'CRD',
          prisonCode: 'LEI',
          prisonDescription: 'Leeds (HMP)',
        } as ApprovalCase,
      ],
      recentlyApprovedResponse: [
        ...searchResponse.recentlyApprovedResponse,
        {
          licenceId: 8,
          name: 'Test Person 8',
          prisonerNumber: 'A1234AH',
          probationPractitioner: {
            name: 'Com Two',
          },
          submittedByFullName: 'Submitted Person',
          releaseDate: '11/05/2024',
          urgentApproval: true,
          approvedBy: 'An Approver',
          approvedOn: '10/12/2023 00:00:00',
          kind: 'CRD',
          prisonCode: 'LEI',
          prisonDescription: 'Leeds (HMP)',
        } as ApprovalCase,
      ],
    }
    searchService.getPrisonApproverSearchResults.mockResolvedValue(searchResponse)
    req.query = { queryTerm: 'test' }
    await handler.GET(req, res)

    expect(res.render).toHaveBeenCalledWith('pages/search/approverSearch/approverSearch', {
      queryTerm: 'test',
      backLink: '/licence/approve/cases',
      tabParameters: {
        activeTab: '#approval-needed',
        approvalNeeded: {
          resultsCount: 5,
          tabHeading: 'Approval needed',
          tabId: 'tab-heading-approval-needed',
        },
        recentlyApproved: {
          resultsCount: 3,
          tabHeading: 'Recently approved',
          tabId: 'tab-heading-recently-approved',
        },
      },
      hasMultipleCaseloadsInNomis: true,
      hasSelectedMultiplePrisonCaseloads: true,
      prisonsToDisplay: [
        {
          agencyId: 'MDI',
          description: 'Moorland (HMP)',
        },
        { agencyId: 'LEI', description: 'Leeds (HMP)' },
      ],
      changeLocationHref: '/licence/approve/change-location?queryTerm=test',
      approvalNeededCases: [
        {
          licenceId: 1,
          name: 'Test Person 1',
          prisonerNumber: 'A1234AA',
          probationPractitioner: {
            name: 'Com Four',
          },
          submittedByFullName: 'Submitted Person',
          releaseDate: '01/05/2024',
          urgentApproval: false,
          approvedBy: null,
          approvedOn: null,
          kind: 'CRD',
          prisonCode: 'MDI',
          prisonDescription: 'Moorland (HMP)',
        },
        {
          licenceId: 2,
          name: 'Test Person 2',
          prisonerNumber: 'A1234AB',
          probationPractitioner: {
            name: 'Com Three',
          },
          submittedByFullName: 'Submitted Person',
          releaseDate: '01/05/2024',
          urgentApproval: true,
          approvedBy: null,
          approvedOn: null,
          kind: 'CRD',
          prisonCode: 'MDI',
          prisonDescription: 'Moorland (HMP)',
        },
        {
          licenceId: 3,
          name: 'Test Person 3',
          prisonerNumber: 'A1234AC',
          probationPractitioner: {
            name: 'Com Three',
          },
          submittedByFullName: 'Submitted Person',
          releaseDate: '10/06/2024',
          urgentApproval: true,
          approvedBy: null,
          approvedOn: null,
          kind: 'CRD',
          prisonCode: 'MDI',
          prisonDescription: 'Moorland (HMP)',
        },
        {
          licenceId: 4,
          name: 'Test Person 4',
          prisonerNumber: 'A1234AD',
          probationPractitioner: {
            name: 'Com Three',
          },
          submittedByFullName: 'Submitted Person',
          releaseDate: '02/05/2024',
          urgentApproval: true,
          approvedBy: null,
          approvedOn: null,
          kind: 'CRD',
          prisonCode: 'MDI',
          prisonDescription: 'Moorland (HMP)',
        },
        {
          licenceId: 7,
          name: 'Test Person 7',
          prisonerNumber: 'A1234AG',
          probationPractitioner: {
            name: 'Com Three',
          },
          submittedByFullName: 'Submitted Person',
          releaseDate: '02/11/2024',
          urgentApproval: true,
          approvedBy: null,
          approvedOn: null,
          kind: 'CRD',
          prisonCode: 'LEI',
          prisonDescription: 'Leeds (HMP)',
        },
      ],
      recentlyApprovedCases: [
        {
          licenceId: 5,
          name: 'Test Person 5',
          prisonerNumber: 'A1234AE',
          probationPractitioner: {
            name: 'Com Four',
          },
          submittedByFullName: 'Submitted Person',
          releaseDate: '01/05/2024',
          urgentApproval: false,
          approvedBy: 'An Approver',
          approvedOn: '10/04/2023 00:00:00',
          kind: 'CRD',
          prisonCode: 'MDI',
          prisonDescription: 'Moorland (HMP)',
        },
        {
          licenceId: 6,
          name: 'Test Person 6',
          prisonerNumber: 'A1234AF',
          probationPractitioner: {
            name: 'Com Two',
          },
          submittedByFullName: 'Submitted Person',
          releaseDate: '12/04/2024',
          urgentApproval: true,
          approvedBy: 'An Approver',
          approvedOn: '12/04/2023 00:00:00',
          kind: 'CRD',
          prisonCode: 'MDI',
          prisonDescription: 'Moorland (HMP)',
        },
        {
          licenceId: 8,
          name: 'Test Person 8',
          prisonerNumber: 'A1234AH',
          probationPractitioner: {
            name: 'Com Two',
          },
          submittedByFullName: 'Submitted Person',
          releaseDate: '11/05/2024',
          urgentApproval: true,
          approvedBy: 'An Approver',
          approvedOn: '10/12/2023 00:00:00',
          kind: 'CRD',
          prisonCode: 'LEI',
          prisonDescription: 'Leeds (HMP)',
        },
      ],
    })
  })

  it('does not call the search service for a blank query', async () => {
    req.query.queryTerm = ''
    await handler.GET(req, res)

    expect(searchService.getPrisonApproverSearchResults).not.toHaveBeenCalled()

    expect(res.render).toHaveBeenCalledWith('pages/search/approverSearch/approverSearch', {
      queryTerm: '',
      backLink: '/licence/approve/cases',
      tabParameters: {
        activeTab: '#approval-needed',
        approvalNeeded: {
          resultsCount: 0,
          tabHeading: 'Approval needed',
          tabId: 'tab-heading-approval-needed',
        },
        recentlyApproved: {
          resultsCount: 0,
          tabHeading: 'Recently approved',
          tabId: 'tab-heading-recently-approved',
        },
      },
      hasMultipleCaseloadsInNomis: false,
      hasSelectedMultiplePrisonCaseloads: false,
      prisonsToDisplay: [{ agencyId: 'MDI', description: 'Moorland (HMP)' }],
      changeLocationHref: '/licence/approve/change-location',
      approvalNeededCases: [],
      recentlyApprovedCases: [],
    })
  })
})
