import { Request, Response } from 'express'
import moment from 'moment/moment'
import LicenceOverrideService from '../../../services/licenceOverrideService'
import LicenceService from '../../../services/licenceService'
import { dateStringToSimpleDate } from '../../../utils/utils'
import { Licence } from '../../../@types/licenceApiClientTypes'
import SimpleDate from '../../creatingLicences/types/date'
import LicenceDatesAndReason from '../types/licenceDatesAndReason'

export default class OffenderLicenceDatesRoutes {
  constructor(private licenceService: LicenceService, private licenceOverrideService: LicenceOverrideService) {}

  GET = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { licenceId } = req.params

    const licence = await this.licenceService.getLicence(licenceId, user)
    const licenceDates = await this.getLicenceSimpleDates(licence)
    res.render('pages/support/offenderLicenceDates', {
      licence,
      licenceDates,
    })
  }

  POST = async (req: Request, res: Response): Promise<void> => {
    const { user } = res.locals
    const { licenceId, nomsId } = req.params
    const { dateChangeReason } = req.body
    const updatedDates = await this.getDatesFromSimpleDates(req.body)

    if (updatedDates && dateChangeReason) {
      await this.licenceOverrideService.overrideDates(
        parseInt(licenceId, 10),
        { ...updatedDates, reason: dateChangeReason },
        user
      )
      res.redirect(`/support/offender/${nomsId}/licences`)
      return
    }

    const licence = await this.licenceService.getLicence(licenceId, user)
    const licenceDates = await this.getLicenceSimpleDates(licence)
    res.render('pages/support/offenderLicenceDates', {
      licence,
      licenceDates,
      dateChangeReason,
    })
  }

  getLicenceSimpleDates = async (licence: Licence): Promise<object> => {
    return {
      crd: dateStringToSimpleDate(licence.conditionalReleaseDate),
      ard: dateStringToSimpleDate(licence.actualReleaseDate),
      ssd: dateStringToSimpleDate(licence.sentenceStartDate),
      sed: dateStringToSimpleDate(licence.sentenceEndDate),
      lsd: dateStringToSimpleDate(licence.licenceStartDate),
      led: dateStringToSimpleDate(licence.licenceExpiryDate),
      tussd: dateStringToSimpleDate(licence.topupSupervisionStartDate),
      tused: dateStringToSimpleDate(licence.topupSupervisionExpiryDate),
    }
  }

  getDatesFromSimpleDates = async (formData: LicenceDatesAndReason): Promise<object> => {
    return {
      conditionalReleaseDate: this.simpleDateToLicenceDate(formData.crd),
      actualReleaseDate: this.simpleDateToLicenceDate(formData.ard),
      sentenceStartDate: this.simpleDateToLicenceDate(formData.ssd),
      sentenceEndDate: this.simpleDateToLicenceDate(formData.sed),
      licenceStartDate: this.simpleDateToLicenceDate(formData.lsd),
      licenceExpiryDate: this.simpleDateToLicenceDate(formData.led),
      topupSupervisionStartDate: this.simpleDateToLicenceDate(formData.tussd),
      topupSupervisionExpiryDate: this.simpleDateToLicenceDate(formData.tused),
    }
  }

  simpleDateToLicenceDate = (date: SimpleDate): string | undefined => {
    if (!date) {
      return undefined
    }
    const dateTimeString = [date.year, date.month, date.day].join(' ')
    const momentDt = moment(dateTimeString, 'YYYY MM DD')
    return momentDt.isValid() ? momentDt.format('DD/MM/YYYY') : undefined
  }
}
