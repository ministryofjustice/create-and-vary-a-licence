/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 */

export interface paths {
  '/licence/id/{licenceId}/appointmentPerson': {
    /** Update the person the person on probation will meet at the initial appointment Requires ROLE_SYSTEM_USER or ROLE_CVL_ADMIN. */
    put: operations['updateAppointmentPerson']
  }
  '/licence/create': {
    /** Creates a licence with the default status IN_PROGRESS and populates with the details provided. Requires ROLE_SYSTEM_USER or ROLE_CVL_ADMIN. */
    post: operations['createLicence']
  }
  '/test/data': {
    /** Just a test API to verify that the full stack of components are working together */
    get: operations['getTestData']
  }
  '/licence/id/{licenceId}': {
    /** Returns a single licence detail by its unique identifier. Requires ROLE_SYSTEM_USER or ROLE_CVL_ADMIN. */
    get: operations['getLicenceById']
  }
}

export interface components {
  schemas: {
    /** Request object for updating the person the person on probation will meet at the initial appointment */
    AppointmentPersonRequest: {
      /** The name of the person the person on probation will meet at the initial appointment */
      appointmentPerson: string
    }
    ErrorResponse: {
      status: number
      errorCode?: number
      userMessage?: string
      developerMessage?: string
      moreInfo?: string
    }
    /** Request object for creating a new licence */
    CreateLicenceRequest: {
      /** Type of licence requested - one of AP, PSS or AP_PSS */
      typeCode: 'AP' | 'AP_PSS' | 'PSS'
      /** The version of licence conditions currently active as a string value */
      version: string
      /** The prison nomis identifier for this offender */
      nomsId: string
      /** The prison booking number for the current sentence for this offender */
      bookingNo: string
      /** The prison booking id for the current sentence for this offender */
      bookingId: number
      /** The case reference number (CRN) of this person, from either prison or probation service */
      crn: string
      /** The police national computer number (PNC) of this person, from either prison or probation service */
      pnc?: string
      /** The criminal records office (CRO) identifier police of this person, from either prison or probation service */
      cro?: string
      /** The prison location code where this person is currently resident - leave null if not in prison */
      prisonCode: string
      /** The prison description - leave null if not in prison */
      prisonDescription: string
      /** The prison telephone number - leave null if not in prison */
      prisonTelephone?: string
      /** The offender forename */
      forename: string
      /** The offender middle names */
      middleNames?: string
      /** The offender surname */
      surname: string
      /** The offender's date of birth, from either prison or probation services */
      dateOfBirth: string
      /** The conditional release date, from prison services */
      conditionalReleaseDate?: string
      /** The actual release date, from prison services */
      actualReleaseDate?: string
      /** The sentence start date, from prison services */
      sentenceStartDate?: string
      /** The sentence end date, from prison services */
      sentenceEndDate?: string
      /** The licence start date, from prison services */
      licenceStartDate?: string
      /** The licence end date, from prison services */
      licenceExpiryDate?: string
      /** The forename of the offender manager, from probation services */
      comFirstName?: string
      /** The surname of the offender manager, from probation services */
      comLastName?: string
      /** The username used in login for the person creating this licence */
      comUsername: string
      /** The staff identifier of the offender manager, from probation services */
      comStaffId: number
      /** The email address of the offender manager, from probation services */
      comEmail?: string
      /** The telephone contact number for the offender manager, from probation services */
      comTelephone?: string
      /** The probation area code where the offender manager is based, from probation services */
      probationAreaCode: string
      /** The local delivery unit code where the offender manager works, from probation services */
      probationLduCode: string
      /** The list of standard conditions from service configuration */
      standardConditions: components['schemas']['StandardCondition'][]
    }
    /** Describes a standard condition on this licence */
    StandardCondition: {
      /** The internal ID for this standard condition on this licence */
      id?: number
      /** The coded value for this standard */
      code?: string
      /** The sequence of this standard condition */
      sequence?: number
      /** The text of this standard condition */
      text?: string
    }
    /** Response object for a created licence */
    CreateLicenceResponse: {
      /** Internal identifier for this licence generated within this service */
      licenceId: number
      /** Licence type code */
      licenceType: 'AP' | 'AP_PSS' | 'PSS'
      /** The status of this new licence after creation */
      licenceStatus: 'IN_PROGRESS' | 'SUBMITTED' | 'ACTIVE' | 'REJECTED' | 'INACTIVE' | 'RECALLED'
    }
    /** Describes a test data object */
    TestData: {
      /** The key */
      key: string
      /** The value */
      value: string
    }
    TestDataResponse: components['schemas']['TestData'][]
    /** Describes an additional condition */
    AdditionalCondition: {
      /** The internal ID for this additional condition for this licence */
      id: number
      /** Coded value for the additional condition */
      code?: string
      /** Sequence of this additional condition within the additional conditions */
      sequence?: number
      /** The textual value for this additional condition */
      text?: string
      /** The list of data items entered for this additional condition */
      data: components['schemas']['AdditionalConditionData'][]
    }
    /** Describes the data entered for an additional condition */
    AdditionalConditionData: {
      /** The internal ID of this data item, for this condition on this licence */
      id: number
      /** The sequence of this data item, for this condition on this licence */
      sequence: number
      /** The description of this data item for this condition on this licence */
      description?: string
      /** The format of this data item */
      format?: string
      /** The value of this data item */
      value?: string
    }
    /** Describes a bespoke condition on a licence */
    BespokeCondition: {
      /** The internal ID for this condition on this licence */
      id: number
      /** The sequence of this bespoke condition on this licence */
      sequence?: number
      /** The text of this bespoke condition */
      text?: string
    }
    /** Describes a licence document within this service */
    Licence: {
      /** Unique identifier for this licence within the service */
      id: number
      /** The licence type code */
      typeCode: 'AP' | 'AP_PSS' | 'PSS'
      /** The version number used for standard and additional conditions */
      version?: string
      /** The current status code for this licence */
      statusCode?: 'IN_PROGRESS' | 'SUBMITTED' | 'ACTIVE' | 'REJECTED' | 'INACTIVE' | 'RECALLED'
      /** The prison identifier for the person on this licence */
      nomsId?: string
      /** The prison booking number for the person on this licence */
      bookingNo?: string
      /** The prison internal booking ID for the person on this licence */
      bookingId?: number
      /** The case reference number (CRN) for the person on this licence */
      crn?: string
      /** The police national computer number (PNC) for the person on this licence */
      pnc?: string
      /** The criminal records office number (CRO) for the person on this licence */
      cro?: string
      /** The agency code of the detaining prison */
      prisonCode?: string
      /** The agency description of the detaining prison */
      prisonDescription?: string
      /** The telephone number to contact the prison */
      prisonTelephone?: string
      /** The first name of the person on licence */
      forename?: string
      /** The middle names of the person on licence */
      middleNames?: string
      /** The family name of the person on licence */
      surname?: string
      /** The date of birth of the person on licence */
      dateOfBirth?: string
      /** The earliest conditional release date of the person on licence */
      conditionalReleaseDate?: string
      /** The actual release date (if set) */
      actualReleaseDate?: string
      /** The sentence start date */
      sentenceStartDate?: string
      /** The sentence end date */
      sentenceEndDate?: string
      /** The date that the licence will start */
      licenceStartDate?: string
      /** The date that the licence will expire */
      licenceExpiryDate?: string
      /** The first name of the supervising probation officer */
      comFirstName?: string
      /** The last name of the supervising probation officer */
      comLastName?: string
      /** The nDELIUS user name for the supervising probation officer */
      comUsername?: string
      /** The nDELIUS staff identifier for the supervising probation officer */
      comStaffId?: number
      /** The email address for the supervising probation officer */
      comEmail?: string
      /** The contact telephone number for the supervising probation officer */
      comTelephone?: string
      /** The code for the probation area where the supervising officer is located */
      probationAreaCode?: string
      /** The local delivery unit (LDU) code who supervises this licence */
      probationLduCode?: string
      /** Who the person will meet at their initial appointment */
      appointmentPerson?: string
      /** The date of the initial appointment */
      appointmentDate?: string
      /** The time of the initial appointment */
      appointmentTime?: string
      /** The address of initial appointment */
      appointmentAddress?: string
      /** The date and time that this prison approved this licence */
      approvedDate?: string
      /** The username who approved the licence on behalf of the prison governor */
      approvedByUsername?: string
      /** The date and time that this licence was superseded by a new variant */
      supersededDate?: string
      /** The date and time that this licence was first created */
      dateCreated?: string
      /** The username which created this licence */
      createdByUsername?: string
      /** The date and time that this licence was last updated */
      dateLastUpdated?: string
      /** The username of the person who last updated this licence */
      updatedByUsername?: string
      /** The list of standard conditions on this licence */
      standardConditions: components['schemas']['StandardCondition'][]
      /** The list of additional conditions on this licence */
      additionalConditions: components['schemas']['AdditionalCondition'][]
      /** The list of bespoke conditions on this licence */
      bespokeConditions: components['schemas']['BespokeCondition'][]
    }
  }
}

export interface operations {
  /** Update the person the person on probation will meet at the initial appointment Requires ROLE_SYSTEM_USER or ROLE_CVL_ADMIN. */
  updateAppointmentPerson: {
    parameters: {
      path: {
        licenceId: number
      }
    }
    responses: {
      /** Appointment person updated */
      200: unknown
      /** Bad request, request body must be valid */
      400: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Unauthorised, requires a valid Oauth2 token */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Forbidden, requires an appropriate role */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** The licence for this ID was not found. */
      404: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['AppointmentPersonRequest']
      }
    }
  }
  /** Creates a licence with the default status IN_PROGRESS and populates with the details provided. Requires ROLE_SYSTEM_USER or ROLE_CVL_ADMIN. */
  createLicence: {
    responses: {
      /** Licence created */
      200: {
        content: {
          'application/json': components['schemas']['CreateLicenceResponse']
        }
      }
      /** Unauthorised, requires a valid Oauth2 token */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Forbidden, requires an appropriate role */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
    requestBody: {
      content: {
        'application/json': components['schemas']['CreateLicenceRequest']
      }
    }
  }
  /** Just a test API to verify that the full stack of components are working together */
  getTestData: {
    responses: {
      /** Test data found */
      200: {
        content: {
          'application/json': components['schemas']['TestDataResponse']
        }
      }
      /** Unauthorised, requires a valid Oauth2 token */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Forbidden, requires an appropriate role */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
  }
  /** Returns a single licence detail by its unique identifier. Requires ROLE_SYSTEM_USER or ROLE_CVL_ADMIN. */
  getLicenceById: {
    parameters: {
      path: {
        licenceId: number
      }
    }
    responses: {
      /** Licence found */
      200: {
        content: {
          'application/json': components['schemas']['Licence']
        }
      }
      /** Unauthorised, requires a valid Oauth2 token */
      401: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** Forbidden, requires an appropriate role */
      403: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
      /** The licence for this ID was not found. */
      404: {
        content: {
          'application/json': components['schemas']['ErrorResponse']
        }
      }
    }
  }
}
