import fs from 'fs'
import { templateRenderer } from '../../../utils/__testutils/templateTestUtils'

const render = templateRenderer(fs.readFileSync('server/views/pages/approve/confirmation.njk').toString())

describe('Approval confirmation page', () => {
  describe('Standard licence change message', () => {
    it('should display standard change message for standard licences', () => {
      const $ = render({
        licence: { kind: 'CRD' },
        titleText: 'Licence approved',
        confirmationMessage: 'The licence has been approved',
        isComEmailAvailable: true,
        applicationName: 'Create and vary a licence',
      })

      expect($('[data-qa="licence-change-message"]').text()).toContain(
        'Probation practitioners can make changes up to 2 days before release',
      )
    })
  })

  describe('TIME_SERVED licence', () => {
    it('should display time served banner message', () => {
      const $ = render({
        licence: { kind: 'TIME_SERVED' },
        titleText: 'Licence approved',
        confirmationMessage: 'The licence has been approved',
        isComEmailAvailable: true,
        applicationName: 'Create and vary a licence',
      })

      expect($('[data-qa="approval-title-panel"]').text()).toContain(
        'Check a case administrator has contacted the probation team',
      )
      expect($('[data-qa="email-message-text"]').text()).toContain(
        'Check a case administrator has notified the probation team that this licence has been generated',
      )
    })

    it('should display licence change message for TIME_SERVED', () => {
      const $ = render({
        licence: { kind: 'TIME_SERVED' },
        titleText: 'Licence approved',
        confirmationMessage: 'The licence has been approved',
        isComEmailAvailable: true,
        applicationName: 'Create and vary a licence',
      })

      expect($('[data-qa="licence-change-message"]').text()).toContain(
        'Probation practitioners can make changes up to 2 days before release',
      )
    })
  })

  describe('HDC licence with MVP2 enabled', () => {
    it('should display HDC reapproval message when licence kind is HDC', () => {
      const $ = render({
        licence: { kind: 'HDC' },
        titleText: 'Licence approved',
        confirmationMessage: 'The licence has been approved',
        isComEmailAvailable: true,
        applicationName: 'Create and vary a licence',
      })

      expect($('p').text()).toContain(
        "You'll need to reapprove the licence if changes are made to the HDC curfew details or licence conditions",
      )
      expect($('p').text()).toContain(
        'Probation practitioners can update the reporting instructions. You do not need to approve those changes',
      )
    })

    it('should not display HDC reapproval message when licence kind is not HDC', () => {
      const $ = render({
        licence: { kind: 'CRD' },
        titleText: 'Licence approved',
        confirmationMessage: 'The licence has been approved',
        isComEmailAvailable: true,
        applicationName: 'Create and vary a licence',
      })

      expect($('p').text()).not.toContain(
        "You'll need to reapprove the licence if changes are made to the HDC curfew details or licence conditions",
      )
    })
  })

  describe('Email notification scenarios', () => {
    it('should display auto email message when COM email is available (non TIME_SERVED)', () => {
      const $ = render({
        licence: { kind: 'AP_PSS' },
        titleText: 'Licence approved',
        confirmationMessage: 'The licence has been approved',
        isComEmailAvailable: true,
        applicationName: 'Create and vary a licence',
      })

      expect($('[data-qa="email-message-text"]').text()).toContain(
        'We will email the probation practitioner automatically to tell them this licence has been approved',
      )
    })

    it('should display manual notification message when COM email is not available (non TIME_SERVED)', () => {
      const $ = render({
        licence: { kind: 'AP_PSS' },
        titleText: 'Licence approved',
        confirmationMessage: 'The licence has been approved',
        isComEmailAvailable: false,
        applicationName: 'Create and vary a licence',
      })

      expect($('[data-qa="email-message-text"]').text()).toContain(
        'A case administrator still needs to notify the probation team that this licence has been approved',
      )
      expect($('[data-qa="email-message-text"]').text()).toContain(
        'We do not have their contact details to do this automatically',
      )
    })
  })

  describe('Common elements', () => {
    it('should display approval panel with title text', () => {
      const $ = render({
        licence: { kind: 'AP_PSS' },
        titleText: 'Licence approved',
        confirmationMessage: 'The licence has been approved',
        isComEmailAvailable: true,
        applicationName: 'Create and vary a licence',
      })

      expect($('[data-qa="approval-title-panel"]').text()).toContain('Licence approved')
    })

    it('should display what happens next section', () => {
      const $ = render({
        licence: { kind: 'AP_PSS' },
        titleText: 'Licence approved',
        confirmationMessage: 'The licence has been approved',
        isComEmailAvailable: true,
        applicationName: 'Create and vary a licence',
      })

      expect($('h2').text()).toContain('What happens next')
      expect($('p').text()).toContain('The licence has been approved')
    })

    it('should display return to case list button', () => {
      const $ = render({
        licence: { kind: 'AP_PSS' },
        titleText: 'Licence approved',
        confirmationMessage: 'The licence has been approved',
        isComEmailAvailable: true,
        applicationName: 'Create and vary a licence',
      })

      expect($('[data-qa="return-to-case-list"]').text()).toContain('Approve another licence')
      expect($('[data-qa="return-to-case-list"]').attr('href')).toBe('/licence/approve/cases')
    })

    it('should display if changes are made section heading', () => {
      const $ = render({
        licence: { kind: 'AP_PSS' },
        titleText: 'Licence approved',
        confirmationMessage: 'The licence has been approved',
        isComEmailAvailable: true,
        applicationName: 'Create and vary a licence',
      })

      expect($('h2').text()).toContain('If changes are made')
    })
  })

  describe('AP_PSS licence (standard flow)', () => {
    it('should display standard change message for AP_PSS', () => {
      const $ = render({
        licence: { kind: 'AP_PSS' },
        titleText: 'Licence approved',
        confirmationMessage: 'The licence has been approved',
        isComEmailAvailable: true,
        applicationName: 'Create and vary a licence',
      })

      expect($('[data-qa="licence-change-message"]').text()).toContain(
        'Probation practitioners can make changes up to 2 days before release',
      )
    })
  })
})
