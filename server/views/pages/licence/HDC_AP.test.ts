import fs from 'fs'
import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'
import type { Licence } from '../../../@types/licenceApiClientTypes'

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
      hdcInfo: {
        curfewAddress: 'addressLineOne, addressLineTwo, addressTownOrCity, addressPostcode',
        firstDayCurfewTimes: {
          from: '09:00',
          until: '17:00',
        },
        weeklyCurfewTimes: {
          monday: {
            from: '09:00',
            until: '17:00',
          },
          tuesday: {
            from: '09:00',
            until: '17:00',
          },
          wednesday: {
            from: '09:00',
            until: '17:00',
          },
          thursday: {
            from: '09:00',
            until: '17:00',
          },
          friday: {
            from: '09:00',
            until: '17:00',
          },
          saturday: {
            from: '09:00',
            until: '17:00',
          },
          sunday: {
            from: '09:00',
            until: '17:00',
          },
        },
        prisonTelephone: '0113 318 9547',
        monitoringSupplierTelephone: '0800 137 291',
      },
    })

    expect($('title').text()).toContain('John Smith')

    expect($('#details').text()).toContain('0113 318 9547')

    expect($('#appointmentAddress').text()).toContain('The Square')

    expect($('#curfewAddress').text()).toContain('addressLineOne')
  })
})
