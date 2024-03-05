import getUrlAccessByStatus from './urlAccessByStatus'

const username = 'USER1'
let path = ''

describe('URL access checks for licence statuses', () => {
  describe('URL access checks for IN_PROGRESS', () => {
    it('should allow access to licence creation', () => {
      path = '/licence/create/id/1/initial-meeting-name'
      expect(getUrlAccessByStatus(path, 1, 'IN_PROGRESS', username)).toEqual(true)
    })

    it('should allow access to licence viewing', () => {
      path = '/licence/view/id/1/show'
      expect(getUrlAccessByStatus(path, 1, 'IN_PROGRESS', username)).toEqual(true)
    })

    it('should deny access to licence approval flow', () => {
      path = '/licence/approve/id/1/view'
      expect(getUrlAccessByStatus(path, 1, 'IN_PROGRESS', username)).toEqual(false)
    })

    it('should deny access to pdf print', () => {
      path = '/licence/view/id/1/pdf-print'
      expect(getUrlAccessByStatus(path, 1, 'IN_PROGRESS', username)).toEqual(false)
    })

    it('should allow access to standard licence creation', () => {
      path = '/licence/hard-stop/create/id/1/initial-meeting-name'
      expect(getUrlAccessByStatus(path, 1, 'IN_PROGRESS', username)).toEqual(true)
    })

    it('should allow access to edit standard licence', () => {
      path = '/licence/hard-stop/edit/id/1/initial-meeting-name'
      expect(getUrlAccessByStatus(path, 1, 'IN_PROGRESS', username)).toEqual(true)
    })

    it('should allow access to check your answers', () => {
      path = '/licence/hard-stop/id/1/check-your-answers'
      expect(getUrlAccessByStatus(path, 1, 'IN_PROGRESS', username)).toEqual(true)
    })
  })

  describe('URL access checks for SUBMITTED', () => {
    it('should allow access to check your answers', () => {
      path = '/licence/create/id/1/check-your-answers'
      expect(getUrlAccessByStatus(path, 1, 'SUBMITTED', username)).toEqual(true)
    })

    it('should allow access to confirmation page after submitting', () => {
      path = '/licence/create/id/123/confirmation'
      expect(getUrlAccessByStatus(path, 1, 'SUBMITTED', username)).toEqual(true)
    })

    it('should allow access to approval flow', () => {
      path = '/licence/approve/id/1/view'
      expect(getUrlAccessByStatus(path, 1, 'SUBMITTED', username)).toEqual(true)
    })

    it('should allow access to editing initial appointment information', () => {
      path = '/licence/create/id/1/initial-meeting-name'
      expect(getUrlAccessByStatus(path, 1, 'SUBMITTED', username)).toEqual(true)
    })

    it('should deny access to pdf print', () => {
      path = '/licence/view/id/1/pdf-print'
      expect(getUrlAccessByStatus(path, 1, 'SUBMITTED', username)).toEqual(false)
    })

    it('should allow access to standard licence edit', () => {
      path = '/licence/hard-stop/edit/id/1/initial-meeting-name'
      expect(getUrlAccessByStatus(path, 1, 'SUBMITTED', username)).toEqual(true)
    })

    it('should allow access to standard licence confirm', () => {
      path = '/licence/hard-stop/id/1/confirmation'
      expect(getUrlAccessByStatus(path, 1, 'SUBMITTED', username)).toEqual(true)
    })

    it('should allow access to check your answers', () => {
      path = '/licence/hard-stop/id/1/check-your-answers'
      expect(getUrlAccessByStatus(path, 1, 'SUBMITTED', username)).toEqual(true)
    })

    it('should allow access to licence-created-by-prison page', () => {
      path = '/licence/create/id/1/licence-created-by-prison'
      expect(getUrlAccessByStatus(path, 1, 'SUBMITTED', username)).toEqual(true)
    })
  })

  describe('URL access checks for APPROVED', () => {
    it('should allow access to check your answers', () => {
      path = '/licence/create/id/1/check-your-answers'
      expect(getUrlAccessByStatus(path, 1, 'APPROVED', username)).toEqual(true)
    })

    it('should allow access to editing initial appointment information', () => {
      path = '/licence/create/id/1/initial-meeting-name'
      expect(getUrlAccessByStatus(path, 1, 'APPROVED', username)).toEqual(true)
    })

    it('should deny access to other creation forms', () => {
      path = '/licence/create/id/1//additional-licence-conditions-question'
      expect(getUrlAccessByStatus(path, 1, 'APPROVED', username)).toEqual(false)
    })

    it('should allow access to approval confirmation', () => {
      path = '/licence/approve/id/1/confirm-approved'
      expect(getUrlAccessByStatus(path, 1, 'APPROVED', username)).toEqual(true)
    })

    it('should allow access to licence viewing', () => {
      path = '/licence/view/id/1/show'
      expect(getUrlAccessByStatus(path, 1, 'APPROVED', username)).toEqual(true)
    })

    it('should allow access to pdf print', () => {
      path = '/licence/view/id/1/pdf-print'
      expect(getUrlAccessByStatus(path, 1, 'APPROVED', username)).toEqual(true)
    })

    it('should deny access to approval flow', () => {
      path = '/licence/approve/id/1/view'
      expect(getUrlAccessByStatus(path, 1, 'APPROVED', username)).toEqual(false)
    })

    it('should allow access to standard licence edit', () => {
      path = '/licence/hard-stop/edit/id/1/initial-meeting-name'
      expect(getUrlAccessByStatus(path, 1, 'APPROVED', username)).toEqual(true)
    })

    it('should allow access to standard licence check your answers', () => {
      path = '/licence/hard-stop/id/1/check-your-answers'
      expect(getUrlAccessByStatus(path, 1, 'APPROVED', username)).toEqual(true)
    })

    it('should allow access to licence-created-by-prison page', () => {
      path = '/licence/create/id/1/licence-created-by-prison'
      expect(getUrlAccessByStatus(path, 1, 'APPROVED', username)).toEqual(true)
    })
  })

  describe('URL access checks for REJECTED', () => {
    it('should allow access to check your answers', () => {
      path = '/licence/create/id/1/check-your-answers'
      expect(getUrlAccessByStatus(path, 1, 'REJECTED', username)).toEqual(true)
    })

    it('should allow access to licence viewing', () => {
      path = '/licence/view/id/1/show'
      expect(getUrlAccessByStatus(path, 1, 'REJECTED', username)).toEqual(true)
    })

    it('should deny access to approval flow', () => {
      path = '/licence/approve/id/1/view'
      expect(getUrlAccessByStatus(path, 1, 'REJECTED', username)).toEqual(false)
    })

    it('should allow access to rejection confirmation', () => {
      path = '/licence/approve/id/1/confirm-rejected'
      expect(getUrlAccessByStatus(path, 1, 'REJECTED', username)).toEqual(true)
    })

    it('should deny access to pdf print', () => {
      path = '/licence/view/id/1/pdf-print'
      expect(getUrlAccessByStatus(path, 1, 'REJECTED', username)).toEqual(false)
    })
  })

  describe('URL access checks for ACTIVE', () => {
    it('should allow access to check your answers', () => {
      path = '/licence/create/id/1/check-your-answers'
      expect(getUrlAccessByStatus(path, 1, 'ACTIVE', username)).toEqual(true)
    })

    it('should allow access to licence viewing', () => {
      path = '/licence/view/id/1/show'
      expect(getUrlAccessByStatus(path, 1, 'ACTIVE', username)).toEqual(true)
    })

    it('should allow access to pdf print', () => {
      path = '/licence/view/id/1/pdf-print'
      expect(getUrlAccessByStatus(path, 1, 'ACTIVE', username)).toEqual(true)
    })

    it('should deny access to approval flow', () => {
      path = '/licence/approve/id/1/view'
      expect(getUrlAccessByStatus(path, 1, 'ACTIVE', username)).toEqual(false)
    })
  })

  describe('URL access checks for INACTIVE', () => {
    it('should allow access to check your answers', () => {
      path = '/licence/create/id/1/check-your-answers'
      expect(getUrlAccessByStatus(path, 1, 'INACTIVE', username)).toEqual(true)
    })

    it('should allow access to licence viewing', () => {
      path = '/licence/view/id/1/show'
      expect(getUrlAccessByStatus(path, 1, 'INACTIVE', username)).toEqual(true)
    })

    it('should allow access to pdf print', () => {
      path = '/licence/view/id/1/pdf-print'
      expect(getUrlAccessByStatus(path, 1, 'INACTIVE', username)).toEqual(true)
    })

    it('should deny access to approval flow', () => {
      path = '/licence/approve/id/1/view'
      expect(getUrlAccessByStatus(path, 1, 'INACTIVE', username)).toEqual(false)
    })
  })

  describe('URL access checks for RECALLED', () => {
    it('should allow access to check your answers', () => {
      path = '/licence/create/id/1/check-your-answers'
      expect(getUrlAccessByStatus(path, 1, 'RECALLED', username)).toEqual(true)
    })

    it('should allow access to licence viewing', () => {
      path = '/licence/view/id/1/show'
      expect(getUrlAccessByStatus(path, 1, 'RECALLED', username)).toEqual(true)
    })

    it('should deny access to approval flow', () => {
      path = '/licence/approve/id/1/view'
      expect(getUrlAccessByStatus(path, 1, 'RECALLED', username)).toEqual(false)
    })
  })
})
