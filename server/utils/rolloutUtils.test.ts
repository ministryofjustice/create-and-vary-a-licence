import { prisonInRollout, probationAreaInRollout, anyPrisonInRollout, anyProbationAreaInRollout } from './rolloutUtils'
import config from '../config'

describe('Rollout utils', () => {
  describe('Prisons in rollout', () => {
    beforeEach(() => {
      config.rollout.restricted = true
    })

    it('should return true if prisons intersect with rollout prisons', () => {
      expect(anyPrisonInRollout(['FAKE1', 'LEI', 'FAKE2'])).toBe(true)
    })

    it('should return false if prisons do not intersect with rollout prisons', () => {
      expect(anyPrisonInRollout(['FAKE1', 'FAKE2', 'FAKE3'])).toBe(false)
    })

    it('should return true if a specific prison is in rollout', () => {
      expect(prisonInRollout('MDI')).toBe(true)
    })

    it('should return false if a specific prison is not in rollout', () => {
      expect(prisonInRollout('FAKE')).toBe(false)
    })

    it('should return false if no prison is specified', () => {
      expect(prisonInRollout(null)).toBe(false)
    })
  })

  describe('Probation areas in rollout', () => {
    beforeEach(() => {
      config.rollout.restricted = true
    })

    it('should return true if probation areas intersect with rollout areas', () => {
      expect(anyProbationAreaInRollout(['FAKE1', 'N55', 'FAKE2'])).toBe(true)
    })

    it('should return false if probation areas do not intersect with rollout areas', () => {
      expect(anyProbationAreaInRollout(['FAKE1', 'FAKE2', 'FAKE3'])).toBe(false)
    })

    it('should return true if a specific probation area is in rollout', () => {
      expect(probationAreaInRollout('N55')).toBe(true)
    })

    it('should return false if a specific probation area is not in rollout', () => {
      expect(prisonInRollout('FAKE')).toBe(false)
    })

    it('should return false if no probation area is specified', () => {
      expect(prisonInRollout(null)).toBe(false)
    })
  })

  describe('Rollout unrestricted', () => {
    beforeEach(() => {
      config.rollout.restricted = false
    })

    it('should return true as prison rollout is unrestricted', () => {
      expect(prisonInRollout('FAKE')).toBe(true)
    })

    it('should return true as probation rollout is unrestricted', () => {
      expect(probationAreaInRollout('FAKE')).toBe(true)
    })

    it('should return true when no probation areas are specified', () => {
      expect(probationAreaInRollout(null)).toBe(true)
    })

    it('should return true as probation rollout is unrestricted', () => {
      expect(anyProbationAreaInRollout(['FAKE'])).toBe(true)
    })

    it('should return true as prison rollout is unrestricted', () => {
      expect(anyPrisonInRollout(['FAKE'])).toBe(true)
    })

    it('should return true when no prisons are specified', () => {
      expect(anyPrisonInRollout(null)).toBe(true)
    })
  })
})
