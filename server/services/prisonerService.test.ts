import { Readable } from 'stream'
import fs from 'fs'
import { User } from '../@types/CvlUserDetails'
import PrisonApiClient from '../data/prisonApiClient'
import PrisonerSearchApiClient from '../data/prisonerSearchApiClient'
import PrisonerService from './prisonerService'
import { HomeDetentionCurfew, PrisonApiPrisoner, PrisonInformation, PrisonDetail } from '../@types/prisonApiClientTypes'
import { Prisoner, PrisonerSearchCriteria } from '../@types/prisonerSearchApiClientTypes'
import { CvlPrisoner } from '../@types/licenceApiClientTypes'

jest.mock('fs')
jest.mock('../data/prisonApiClient')
jest.mock('../data/prisonerSearchApiClient')
jest.spyOn(fs, 'readFileSync').mockReturnValue(Buffer.from('placeholder image'))

describe('Prisoner Service', () => {
  const prisonApiClient = new PrisonApiClient(null) as jest.Mocked<PrisonApiClient>
  const prisonerSearchApiClient = new PrisonerSearchApiClient(null) as jest.Mocked<PrisonerSearchApiClient>
  const prisonerService = new PrisonerService(prisonApiClient, prisonerSearchApiClient)

  const user = { username: 'joebloggs' } as User

  it('Get Prisoner Image', async () => {
    prisonApiClient.getPrisonerImage.mockResolvedValue(Readable.from('image'))

    const actualResult = await prisonerService.getPrisonerImage('ABC1234', user)

    expect(actualResult.read()).toEqual('image')
    expect(prisonApiClient.getPrisonerImage).toHaveBeenCalledWith('ABC1234', user)
  })

  describe('Get Prisoner Image as base64', () => {
    it('should get the image as base64 encoded string', async () => {
      prisonApiClient.getPrisonerImageData.mockResolvedValue(Buffer.from('image'))

      const actualResult = await prisonerService.getPrisonerImageData('ABC1234', user)

      expect(actualResult).toEqual(Buffer.from('image').toString('base64'))
      expect(prisonApiClient.getPrisonerImageData).toHaveBeenCalledWith('ABC1234', user)
    })

    it('should get placeholder as base64 encoded string if image for prisoner does not exist', async () => {
      prisonApiClient.getPrisonerImageData.mockRejectedValue('not found')

      const actualResult = await prisonerService.getPrisonerImageData('ABC1234', user)

      expect(actualResult).toEqual(Buffer.from('placeholder image').toString('base64'))
      expect(prisonApiClient.getPrisonerImageData).toHaveBeenCalledWith('ABC1234', user)
    })
  })

  it('Get Prisoner Detail', async () => {
    const expectedResult = { firstName: 'Joe', lastName: 'Bloggs' } as PrisonApiPrisoner

    prisonApiClient.getPrisonerDetail.mockResolvedValue(expectedResult)

    const actualResult = await prisonerService.getPrisonerDetail('ABC1234', user)

    expect(actualResult).toEqual(expectedResult)
    expect(prisonApiClient.getPrisonerDetail).toHaveBeenCalledWith('ABC1234', user)
  })

  it('Gets prisoner sentence and offence details', async () => {
    const bookingId = 956
    const expectedResult = [
      {
        bookingId,
        sentenceDate: '2022-07-16',
      },
      {
        bookingId,
        sentenceDate: '2023-02-20',
      },
    ]

    prisonApiClient.getPrisonerSentenceAndOffences.mockResolvedValue(expectedResult)
    const actualResult = await prisonerService.getPrisonerSentenceAndOffenceDetails(bookingId, user)
    expect(actualResult).toEqual(expectedResult)
    expect(prisonApiClient.getPrisonerSentenceAndOffences).toHaveBeenCalledWith(bookingId, user)
  })

  it('Gets the latest sentence start for a prisoner', async () => {
    const bookingId = 250412
    const sentencesAndOffences = [
      {
        bookingId,
        sentenceDate: '2022-07-16',
      },
      {
        bookingId,
        sentenceDate: '2023-02-20',
      },
      {
        bookingId,
        sentenceDate: '2021-06-15',
      },
      {
        bookingId,
        sentenceDate: '2022-03-21',
      },
    ]

    prisonApiClient.getPrisonerSentenceAndOffences.mockResolvedValue(sentencesAndOffences)
    const result = await prisonerService.getPrisonerLatestSentenceStartDate(bookingId, user)
    expect(result).toEqual(new Date(2023, 1, 20))
    expect(prisonApiClient.getPrisonerSentenceAndOffences).toHaveBeenCalledWith(bookingId, user)
  })

  it('Get Prison Information', async () => {
    const expectedResult = { agencyId: 'MDI', description: 'Moorland (HMP)' } as PrisonInformation

    prisonApiClient.getPrisonInformation.mockResolvedValue(expectedResult)

    const actualResult = await prisonerService.getPrisonInformation('MDI', user)

    expect(actualResult).toEqual(expectedResult)
    expect(prisonApiClient.getPrisonInformation).toHaveBeenCalledWith('MDI', user)
  })

  it('Get Prisons', async () => {
    const expectedResult = [{ agencyId: 'MDI', description: 'Moorland (HMP)' }] as PrisonDetail[]

    prisonApiClient.getPrisons.mockResolvedValue(expectedResult)

    const actualResult = await prisonerService.getPrisons()

    expect(actualResult).toEqual(expectedResult)
    expect(prisonApiClient.getPrisons).toHaveBeenCalledWith()
  })

  it('Search Prisoners', async () => {
    const expectedResult = [{ firstName: 'Joe', lastName: 'Bloggs' }] as Prisoner[]

    prisonerSearchApiClient.searchPrisoners.mockResolvedValue(expectedResult)

    const actualResult = await prisonerService.searchPrisoners({ lastName: 'Bloggs' } as PrisonerSearchCriteria, user)

    expect(actualResult).toEqual(expectedResult)
    expect(prisonerSearchApiClient.searchPrisoners).toHaveBeenCalledWith(
      { lastName: 'Bloggs' } as PrisonerSearchCriteria,
      user,
    )
  })

  describe('Search Prisoners by booking ids', () => {
    it('should return an empty list if criteria is empty', async () => {
      const expectedResult = [] as Prisoner[]

      const actualResult = await prisonerService.searchPrisonersByBookingIds([], user)

      expect(actualResult).toEqual(expectedResult)
      expect(prisonerSearchApiClient.searchPrisonersByBookingIds).not.toHaveBeenCalled()
    })

    it('should return a list of matching prisoners', async () => {
      const expectedResult = [{ prisonerNumber: 'ABC1234', firstName: 'Joe', lastName: 'Bloggs' }] as Prisoner[]

      prisonerSearchApiClient.searchPrisonersByBookingIds.mockResolvedValue(expectedResult)

      const actualResult = await prisonerService.searchPrisonersByBookingIds([1234], user)

      expect(actualResult).toEqual(expectedResult)
      expect(prisonerSearchApiClient.searchPrisonersByBookingIds).toHaveBeenCalledWith({ bookingIds: [1234] }, user)
    })
  })

  describe('Get HDC statuses', () => {
    it('should return empty list if no booking ids are available', async () => {
      const actualResult = await prisonerService.getHdcStatuses(
        [{ firstName: 'Joe', lastName: 'Bloggs' } as CvlPrisoner],
        user,
      )
      expect(actualResult).toEqual([])
      expect(prisonApiClient.getLatestHdcStatusBatch).not.toHaveBeenCalled()
    })

    it('should return list of HDC statuses', async () => {
      prisonApiClient.getLatestHdcStatusBatch.mockResolvedValue([
        { bookingId: 123, approvalStatus: 'PASSED', passed: true } as unknown as HomeDetentionCurfew,
      ])

      const actualResult = await prisonerService.getHdcStatuses(
        [
          {
            firstName: 'Joe',
            lastName: 'Bloggs',
            bookingId: '123',
            homeDetentionCurfewEligibilityDate: '26/12/2021',
          } as CvlPrisoner,
        ],
        user,
      )

      expect(actualResult).toEqual([
        {
          approvalStatus: 'PASSED',
          bookingId: '123',
          checksPassed: true,
        },
      ])
      expect(prisonApiClient.getLatestHdcStatusBatch).toHaveBeenCalledWith([123], user)
    })
  })

  describe('Get Latest HDC Status', () => {
    it('Should return NULL if no HDC status is found', async () => {
      prisonApiClient.getLatestHdcStatus.mockResolvedValue(null)

      const actualResult = await prisonerService.getActiveHdcStatus('123')

      expect(actualResult).toBeNull()

      expect(prisonApiClient.getLatestHdcStatus).toHaveBeenCalledWith('123')
    })

    it('Should return NULL if no bookingId is found', async () => {
      prisonApiClient.getLatestHdcStatus.mockResolvedValue({
        bookingId: null,
        approvalStatus: 'PASSED',
        passed: true,
      } as HomeDetentionCurfew)

      const actualResult = await prisonerService.getActiveHdcStatus('123')

      expect(actualResult).toBeNull()

      expect(prisonApiClient.getLatestHdcStatus).toHaveBeenCalledWith('123')
    })

    it('Should return PASSED approval status', async () => {
      prisonApiClient.getLatestHdcStatus.mockResolvedValue({
        bookingId: 123,
        approvalStatus: 'PASSED',
        passed: true,
      } as HomeDetentionCurfew)

      const actualResult = await prisonerService.getActiveHdcStatus('123')

      expect(actualResult).toEqual({
        bookingId: '123',
        approvalStatus: 'PASSED',
        checksPassed: true,
      })

      expect(prisonApiClient.getLatestHdcStatus).toHaveBeenCalledWith('123')
    })
  })

  describe('is HDC approved', () => {
    it('Should return false if no HDCED', async () => {
      const expectedResult = [{ firstName: 'Joe', lastName: 'Bloggs' }] as Prisoner[]

      prisonerSearchApiClient.searchPrisonersByBookingIds.mockResolvedValue(expectedResult)

      const actualResult = await prisonerService.isHdcApproved(123)

      expect(actualResult).toStrictEqual(false)
    })

    it('Should return true if approved for HDC', async () => {
      const expectedResult = [
        { firstName: 'Joe', lastName: 'Bloggs', homeDetentionCurfewActualDate: '2023-01-02' },
      ] as Prisoner[]

      prisonApiClient.getLatestHdcStatus.mockResolvedValue({
        bookingId: 123,
        approvalStatus: 'APPROVED',
        passed: true,
      } as HomeDetentionCurfew)

      prisonerSearchApiClient.searchPrisonersByBookingIds.mockResolvedValue(expectedResult)

      const actualResult = await prisonerService.isHdcApproved(123)

      expect(actualResult).toStrictEqual(true)
    })

    it('Should return false if no latest HDC status', async () => {
      const expectedResult = [
        { firstName: 'Joe', lastName: 'Bloggs', homeDetentionCurfewActualDate: '2023-01-02' },
      ] as Prisoner[]

      prisonApiClient.getLatestHdcStatus.mockResolvedValue(null)

      prisonerSearchApiClient.searchPrisonersByBookingIds.mockResolvedValue(expectedResult)

      const actualResult = await prisonerService.isHdcApproved(123)

      expect(actualResult).toStrictEqual(false)
    })

    it('Should return true if not approved for HDC', async () => {
      const expectedResult = [
        { firstName: 'Joe', lastName: 'Bloggs', homeDetentionCurfewActualDate: '2023-01-02' },
      ] as Prisoner[]

      prisonApiClient.getLatestHdcStatus.mockResolvedValue({
        bookingId: 123,
        approvalStatus: 'REFUSED',
        passed: true,
      } as HomeDetentionCurfew)

      prisonerSearchApiClient.searchPrisonersByBookingIds.mockResolvedValue(expectedResult)

      const actualResult = await prisonerService.isHdcApproved(123)

      expect(actualResult).toStrictEqual(false)
    })
  })
})
