import { Licence } from '../@types/licenceApiClientTypes'
import { Prisoner } from '../@types/prisonerSearchApiClientTypes'
import { getReleaseDateFromNomis, getReleaseDateFromLicence } from './getReleaseDate'

describe('Get prisoner release date from Nomis', () => {
  it('No date returns "not found', () => {
    const nomisRecord = {
      conditionalReleaseDate: null,
    } as Prisoner

    expect(getReleaseDateFromNomis(nomisRecord)).toBe('not found')
  })

  it('Release date should be Conditional Release Date 22 Nov 2035', () => {
    const nomisRecord = {
      conditionalReleaseDate: '2035-11-22',
    } as Prisoner

    expect(getReleaseDateFromNomis(nomisRecord)).toBe('22 Nov 2035')
  })

  it('Release date should be Confirmed Release Date 22 Oct 2035', () => {
    const nomisRecord = {
      conditionalReleaseDate: '2035-11-22',
      confirmedReleaseDate: '2035-10-22',
    } as Prisoner

    expect(getReleaseDateFromNomis(nomisRecord)).toBe('22 Oct 2035')
  })

  it('Release date should be Conditional Release Override Date 22 Nov 2036', () => {
    const nomisRecord = {
      conditionalReleaseDate: '2036-11-01',
      conditionalReleaseOverrideDate: '2036-11-22',
    } as Prisoner

    expect(getReleaseDateFromNomis(nomisRecord)).toBe('22 Nov 2036')
  })

  it('Returns malformed date as is', () => {
    const nomisRecord = {
      conditionalReleaseDate: 'aaa2036-11-01',
    } as Prisoner

    expect(getReleaseDateFromNomis(nomisRecord)).toBe('aaa2036-11-01')
  })
})

describe('Get prisoner release date from Licence', () => {
  it('No date returns "not found', () => {
    const licence = {
      conditionalReleaseDate: null,
    } as Licence

    expect(getReleaseDateFromLicence(licence)).toBe('not found')
  })

  it('Release date should be Conditional Release Date 22 Nov 2035', () => {
    const licence = {
      conditionalReleaseDate: '22/11/2035',
    } as Licence

    expect(getReleaseDateFromLicence(licence)).toBe('22 Nov 2035')
  })

  it('Release date should be Confirmed Release Date 22 Oct 2035', () => {
    const licence = {
      conditionalReleaseDate: '22/11/2035',
      actualReleaseDate: '22/10/2035',
    } as unknown as Licence

    expect(getReleaseDateFromLicence(licence)).toBe('22 Oct 2035')
  })
})
