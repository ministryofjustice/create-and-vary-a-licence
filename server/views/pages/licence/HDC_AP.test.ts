import fs from 'fs'
import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/pages/licence/HDC_AP.njk').toString())

describe('Print a HDC AP licence', () => {
  it('verify render of an AP licence', () => {
    const $ = render({
      licence: {
        id: 1,
        kind: 'HDC',
        forename: 'John',
        surname: 'Smith',
        typeCode: 'AP',
        version: '1.0',
        prisonCode: 'MDI',
        appointmentPerson: 'Jack Frost',
        appointmentAddress: 'The Square, Area, Town, County, S12 3QD',
        comTelephone: '07878 234566',
        standardLicenceConditions: [
          { code: '1', text: 'Standard 1' },
          { code: '2', text: 'Standard 2' },
          { code: '3', text: 'Standard 3' },
          { code: '4', text: 'Standard 4' },
          { code: '5', text: 'Standard 5' },
          { code: '6', text: 'Standard 6' },
          { code: '7', text: 'Standard 7' },
        ],
        additionalLicenceConditions: [],
        bespokeConditions: [],
      },
      qrCodesEnabled: false,
      singleItemConditions: [],
      multipleItemConditions: [],
      hdcLicenceData: {
        curfewAddress: {
          addressLine1: 'addressLineOne',
          addressLine2: 'addressLineTwo',
          addressTown: 'addressTownOrCity',
          postCode: 'addressPostcode',
        },
        firstNightCurfewHours: {
          firstNightFrom: '09:00',
          firstNightUntil: '17:00',
        },
        curfewHours: {
          mondayFrom: '17:00',
          mondayUntil: '09:00',
          tuesdayFrom: '17:00',
          tuesdayUntil: '09:00',
          wednesdayFrom: '17:00',
          wednesdayUntil: '09:00',
          thursdayFrom: '17:00',
          thursdayUntil: '09:00',
          fridayFrom: '17:00',
          fridayUntil: '09:00',
          saturdayFrom: '17:00',
          saturdayUntil: '09:00',
          sundayFrom: '17:00',
          sundayUntil: '09:00',
        },
      },
      prisonTelephone: '0114 2345232334',
    })

    expect($('title').text()).toContain('John Smith')

    expect($('#details').text()).toContain('0114 2345232334')

    expect($('#appointmentAddress').text()).toContain('The Square')

    expect($('#curfewAddress').text()).toContain('addressLineOne')
  })
})
