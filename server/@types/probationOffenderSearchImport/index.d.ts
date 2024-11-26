/**
 * This file was auto-generated by openapi-typescript.
 * Do not make direct changes to the file.
 *
 * Manual changes
 *   - replace double-quotes with single quotes
 *   - replace semi-colons with blank
 */

export interface paths {
  '/crns': {
    /** Requires ROLE_COMMUNITY role */
    post: operations['findByIdsUsingPOST']
  }
  '/ldu-codes': {
    /** Requires ROLE_COMMUNITY role */
    post: operations['findByLduCodeUsingPOST']
  }
  '/ldu-codes/{lduCode}': {
    /** Requires ROLE_COMMUNITY role */
    get: operations['searchOffendersByLduCodeUsingGET']
  }
  '/match': {
    /** Specify the request criteria to match against */
    post: operations['match']
  }
  '/nomsNumbers': {
    /** Requires ROLE_COMMUNITY role */
    post: operations['findByNomsNumbersUsingPOST']
  }
  '/phrase': {
    /**
     * The phrase can contain one or more of the following:
     *
     *         - first name
     *         - middle name
     *         - surname
     *         - first line of address
     *         - county of address
     *         - town of address
     *         - postal code of address
     *         - date of birth (in any common format)
     *         - CRN
     *         - NOMS number
     *         - PNC number
     *         - CRO number
     *         - National Insurance number
     *         - Recorded gender
     *
     *         Both primary and alias names will be searched.
     *
     *         When using this API be aware of a few anomalies between searching using all terms or not (e.g AND versus OR query) :
     *          - A phrase that contain just single letter will result in all records being matched since essentially single letters for the AND query are discarded
     *          - first name when matched is artificially boosted in the result sort order for OR queries, due to how first names are also searched as if it is a prefix as well a complete match
     *
     *          Roles and scopes:
     *           - client must have ROLE_COMMUNITY
     *           - by default any offenders that are restricted or have exclusion lists for staff will be redacted in the response (the crn and offender managers will still be visible) with these exceptions
     *             - there is a Delius user in context (username in JWT token along with an auth source of Delius) and they are allowed to view the offender, e.g. not on the exclusion list or is on the restricted list
     *             - the client has the scopes to allow it to ignore these lists the two scopes to bypass this feature are 'ignore_delius_exclusions_always' and 'ignore_delius_inclusions_always'
     */
    post: operations['searchByPhrase']
  }
  '/search': {
    /** Specify the request criteria to match against */
    get: operations['search_1']
    /** Specify the request criteria to match against */
    post: operations['search']
  }
  '/synthetic-monitor': {
    get: operations['syntheticMonitorUsingGET']
  }
  '/team-codes': {
    /** Requires ROLE_COMMUNITY role */
    post: operations['findByTeamCodeUsingPOST']
  }
  '/team-codes/{teamCode}': {
    /** Requires ROLE_COMMUNITY role */
    get: operations['searchOffendersByTeamCodeUsingGET']
  }
}

export interface definitions {
  Address: {
    addressNumber?: string
    buildingName?: string
    county?: string
    district?: string
    from: string
    noFixedAbode?: boolean
    notes?: string
    postcode?: string
    status?: definitions['KeyValue']
    streetName?: string
    telephoneNumber?: string
    to?: string
    town?: string
  }
  AllTeam: {
    borough?: definitions['KeyValue']
    code?: string
    description?: string
    district?: definitions['KeyValue']
    externalProvider?: definitions['KeyValue']
    isPrivate?: boolean
    localDeliveryUnit?: definitions['KeyValue']
    name?: string
    providerTeamId: number
    scProvider?: definitions['KeyValue']
    teamId: number
  }
  BadRequestException: {
    cause?: definitions['Throwable']
    localizedMessage?: string
    message?: string
    stackTrace?: definitions['StackTraceElement'][]
    suppressed?: definitions['Throwable'][]
  }
  ContactDetails: {
    addresses?: definitions['Address'][]
    allowSMS?: boolean
    emailAddresses?: string[]
    phoneNumbers?: definitions['PhoneNumber'][]
  }
  Disability: {
    disabilityId?: number
    disabilityType?: definitions['KeyValue']
    endDate?: string
    notes?: string
    startDate?: string
  }
  Human: {
    /** Given names */
    forenames?: string
    /** Family name */
    surname?: string
  }
  IDs: {
    crn: string
    croNumber?: string
    immigrationNumber?: string
    mostRecentPrisonerNumber?: string
    niNumber?: string
    nomsNumber?: string
    pncNumber?: string
  }
  Institution: {
    code?: string
    description?: string
    establishmentType?: definitions['KeyValue']
    institutionId: number
    institutionName?: string
    isEstablishment?: boolean
    isPrivate?: boolean
    /** Prison institution code in NOMIS */
    nomsPrisonInstitutionCode?: string
  }
  KeyValue: {
    code?: string
    description?: string
  }
  MappaDetails: {
    category?: number
    categoryDescription?: string
    level?: number
    levelDescription?: string
    notes?: string
    officer?: definitions['StaffHuman']
    probationArea?: definitions['KeyValue']
    reviewDate?: string
    startDate?: string
    team?: definitions['KeyValue']
  }
  MatchRequest: {
    /** Filter so only offenders on a current sentence managed by probation will be returned */
    activeSentence?: boolean
    /** Criminal Records Office (CRO) number */
    croNumber?: string
    /** Offender date of birth */
    dateOfBirth?: string
    /** Offender first name */
    firstName?: string
    /** The Offender NOMIS Id (aka prison number/offender no in DPS) */
    nomsNumber?: string
    /** Police National Computer (PNC) number */
    pncNumber?: string
    /** Offender surname */
    surname?: string
  }
  NotFoundException: {
    cause?: definitions['Throwable']
    localizedMessage?: string
    message?: string
    stackTrace?: definitions['StackTraceElement'][]
    suppressed?: definitions['Throwable'][]
  }
  OffenderAlias: {
    dateOfBirth?: string
    firstName?: string
    gender?: string
    id?: string
    middleNames?: string[]
    surname?: string
  }
  OffenderDetail: {
    accessDenied?: boolean
    activeProbationManagedSentence?: boolean
    age?: number
    contactDetails?: definitions['ContactDetails']
    currentDisposal?: string
    currentExclusion?: boolean
    currentRestriction?: boolean
    currentTier?: string
    dateOfBirth?: string
    exclusionMessage?: string
    firstName?: string
    gender?: string
    /** map of fields which matched a search term (Only return for phrase searching) */
    highlight?: { [key: string]: string[] }
    mappa?: definitions['MappaDetails']
    middleNames?: string[]
    offenderAliases?: definitions['OffenderAlias'][]
    offenderId: number
    offenderManagers?: definitions['OffenderManager'][]
    offenderProfile?: definitions['OffenderProfile']
    otherIds?: definitions['IDs']
    partitionArea?: string
    previousSurname?: string
    probationStatus?: definitions['ProbationStatus']
    restrictionMessage?: string
    softDeleted?: boolean
    surname?: string
    title?: string
  }
  OffenderLanguages: {
    languageConcerns?: string
    otherLanguages?: string[]
    primaryLanguage?: string
    requiresInterpreter?: boolean
  }
  OffenderManager: {
    active?: boolean
    allocationReason?: definitions['KeyValue']
    fromDate?: string
    partitionArea?: string
    probationArea?: definitions['ProbationArea']
    providerEmployee?: definitions['Human']
    softDeleted?: boolean
    staff?: definitions['StaffHuman']
    team?: definitions['Team']
    toDate?: string
    trustOfficer?: definitions['Human']
  }
  OffenderMatch: {
    /** Details of the matching offender */
    offender: definitions['OffenderDetail']
  }
  OffenderMatches: {
    /** How the match was performed */
    matchedBy:
      | 'ALL_SUPPLIED'
      | 'ALL_SUPPLIED_ALIAS'
      | 'EXTERNAL_KEY'
      | 'HMPPS_KEY'
      | 'NAME'
      | 'NOTHING'
      | 'PARTIAL_NAME'
      | 'PARTIAL_NAME_DOB_LENIENT'
    /** List of offenders that share the same possibility of being the match */
    matches: definitions['OffenderMatch'][]
  }
  OffenderProfile: {
    disabilities?: definitions['Disability'][]
    ethnicity?: string
    immigrationStatus?: string
    nationality?: string
    notes?: string
    offenderDetails?: string
    offenderLanguages?: definitions['OffenderLanguages']
    previousConviction?: definitions['PreviousConviction']
    religion?: string
    remandStatus?: string
    riskColour?: string
    secondaryNationality?: string
    sexualOrientation?: string
  }
  Pageable: {
    offset?: number
    pageNumber?: number
    pageSize?: number
    paged?: boolean
    sort?: definitions['Sort']
    unpaged?: boolean
  }
  PhoneNumber: {
    number?: string
    type?: 'MOBILE' | 'TELEPHONE'
  }
  PreviousConviction: {
    convictionDate?: string
    detail?: { [key: string]: string }
  }
  ProbationArea: {
    code?: string
    description?: string
    institution?: definitions['Institution']
    nps?: boolean
    organisation?: definitions['KeyValue']
    probationAreaId: number
    teams?: definitions['AllTeam'][]
  }
  ProbationAreaAggregation: {
    /** Probation area code */
    code?: string
    /** Count of matching offenders in this area */
    count?: number
  }
  ProbationStatus: {
    awaitingPsr: boolean
    inBreach?: boolean
    preSentenceActivity: boolean
    previouslyKnownTerminationDate?: string
    status: string
  }
  SearchDto: {
    /** Case reference number */
    crn?: string
    /** Criminal Records Office (CRO) number */
    croNumber?: string
    /** Offender date of birth */
    dateOfBirth?: string
    /** Offender first name(s) */
    firstName?: string
    /** The Offender NOMIS Id (aka prison number/offender no in DPS) */
    nomsNumber?: string
    /** Police National Computer (PNC) number */
    pncNumber?: string
    /** Offender surname */
    surname?: string
  }
  SearchPagedResults: {
    content?: definitions['OffenderDetail'][]
    empty?: boolean
    first?: boolean
    last?: boolean
    number?: number
    numberOfElements?: number
    pageable?: definitions['Pageable']
    size?: number
    sort?: definitions['Sort']
    totalElements?: number
    totalPages?: number
  }
  SearchPhraseFilter: {
    /** When true, only match offenders that match all terms. Analogous to AND versus OR */
    matchAllTerms?: boolean
    /** Phrase containing the terms to search for */
    phrase: string
    /** Filter of probation area codes. Only offenders that have an active offender manager in one of the areas will be returned */
    probationAreasFilter?: string[]
  }
  SearchPhraseResults: {
    content?: definitions['OffenderDetail'][]
    empty?: boolean
    first?: boolean
    last?: boolean
    number?: number
    numberOfElements?: number
    pageable?: definitions['Pageable']
    /** Counts of offenders aggregated by probation area */
    probationAreaAggregations?: definitions['ProbationAreaAggregation'][]
    size?: number
    sort?: definitions['Sort']
    /** Alternative search phrase suggestions. See https://www.elastic.co/guide/en/elasticsearch/reference/current/search-suggesters.html */
    suggestions?: definitions['Suggest']
    totalElements?: number
    totalPages?: number
  }
  Sort: {
    empty?: boolean
    sorted?: boolean
    unsorted?: boolean
  }
  StackTraceElement: {
    classLoaderName?: string
    className?: string
    fileName?: string
    lineNumber?: number
    methodName?: string
    moduleName?: string
    moduleVersion?: string
    nativeMethod?: boolean
  }
  StaffHuman: {
    /** Staff code */
    code?: string
    /** Given names */
    forenames?: string
    /** Family name */
    surname?: string
    /** When true the not allocated */
    unallocated?: boolean
  }
  Suggest: {
    fragment?: boolean
  }
  Team: {
    /** Team's borough */
    borough?: definitions['KeyValue']
    /** Team code */
    code?: string
    /** Team description */
    description?: string
    /** Team's district */
    district?: definitions['KeyValue']
    /** Local Delivery Unit - LDU */
    localDeliveryUnit?: definitions['KeyValue']
    /** Team telephone, often not populated */
    telephone?: string
  }
  Throwable: {
    cause?: definitions['Throwable']
    localizedMessage?: string
    message?: string
    stackTrace?: definitions['StackTraceElement'][]
    suppressed?: definitions['Throwable'][]
  }
}

export interface operations {
  /** Requires ROLE_COMMUNITY role */
  findByIdsUsingPOST: {
    parameters: {
      body: {
        /** crnList */
        crnList: string[]
      }
    }
    responses: {
      /** OK */
      200: {
        schema: definitions['OffenderDetail'][]
      }
      /** Unauthorised, requires a valid Oauth2 token */
      401: unknown
      /** Forbidden, requires an authorisation with role ROLE_COMMUNITY */
      403: unknown
    }
  }
  /** Requires ROLE_COMMUNITY role */
  findByLduCodeUsingPOST: {
    parameters: {
      body: {
        /** lduList */
        lduList: string[]
      }
      query: {
        offset?: number
        /** Results page you want to retrieve (0..N) */
        page?: unknown
        paged?: boolean
        pageNumber?: number
        pageSize?: number
        /** Number of records per page. */
        size?: unknown
        'sort.sorted'?: boolean
        'sort.unsorted'?: boolean
        unpaged?: boolean
      }
    }
    responses: {
      /** OK */
      200: {
        schema: definitions['SearchPagedResults']
      }
      /** Unauthorised, requires a valid Oauth2 token */
      401: unknown
      /** Forbidden, requires an authorisation with role ROLE_COMMUNITY */
      403: unknown
    }
  }
  /** Requires ROLE_COMMUNITY role */
  searchOffendersByLduCodeUsingGET: {
    parameters: {
      path: {
        /** lduCode */
        lduCode: string
      }
      query: {
        offset?: number
        paged?: boolean
        pageNumber?: number
        pageSize?: number
        'sort.sorted'?: boolean
        'sort.unsorted'?: boolean
        unpaged?: boolean
      }
    }
    responses: {
      /** OK */
      200: {
        schema: definitions['SearchPagedResults']
      }
      /** Invalid Request */
      400: {
        schema: definitions['BadRequestException']
      }
      /** Unauthorised, requires a valid Oauth2 token */
      401: unknown
      /** Forbidden, requires an authorisation with role ROLE_COMMUNITY */
      403: unknown
      /** Not found */
      404: {
        schema: definitions['NotFoundException']
      }
    }
  }
  /** Specify the request criteria to match against */
  match: {
    parameters: {
      body: {
        /** matchRequest */
        matchRequest: definitions['MatchRequest']
      }
    }
    responses: {
      /** OK */
      200: {
        schema: definitions['OffenderMatches']
      }
      /** Invalid Request */
      400: {
        schema: definitions['BadRequestException']
      }
      /** Not found */
      404: {
        schema: definitions['NotFoundException']
      }
    }
  }
  /** Requires ROLE_COMMUNITY role */
  findByNomsNumbersUsingPOST: {
    parameters: {
      body: {
        /** nomsList */
        nomsList: string[]
      }
    }
    responses: {
      /** OK */
      200: {
        schema: definitions['OffenderDetail'][]
      }
      /** Unauthorised, requires a valid Oauth2 token */
      401: unknown
      /** Forbidden, requires an authorisation with role ROLE_COMMUNITY */
      403: unknown
    }
  }
  /**
   * The phrase can contain one or more of the following:
   *
   *         - first name
   *         - middle name
   *         - surname
   *         - first line of address
   *         - county of address
   *         - town of address
   *         - postal code of address
   *         - date of birth (in any common format)
   *         - CRN
   *         - NOMS number
   *         - PNC number
   *         - CRO number
   *         - National Insurance number
   *         - Recorded gender
   *
   *         Both primary and alias names will be searched.
   *
   *         When using this API be aware of a few anomalies between searching using all terms or not (e.g AND versus OR query) :
   *          - A phrase that contain just single letter will result in all records being matched since essentially single letters for the AND query are discarded
   *          - first name when matched is artificially boosted in the result sort order for OR queries, due to how first names are also searched as if it is a prefix as well a complete match
   *
   *          Roles and scopes:
   *           - client must have ROLE_COMMUNITY
   *           - by default any offenders that are restricted or have exclusion lists for staff will be redacted in the response (the crn and offender managers will still be visible) with these exceptions
   *             - there is a Delius user in context (username in JWT token along with an auth source of Delius) and they are allowed to view the offender, e.g. not on the exclusion list or is on the restricted list
   *             - the client has the scopes to allow it to ignore these lists the two scopes to bypass this feature are 'ignore_delius_exclusions_always' and 'ignore_delius_inclusions_always'
   */
  searchByPhrase: {
    parameters: {
      query: {
        offset?: number
        /** Results page you want to retrieve (0..N) */
        page?: unknown
        paged?: boolean
        pageNumber?: number
        pageSize?: number
        /** Number of records per page. */
        size?: unknown
        'sort.sorted'?: boolean
        'sort.unsorted'?: boolean
        unpaged?: boolean
      }
      body: {
        /** searchPhraseFilter */
        searchPhraseFilter: definitions['SearchPhraseFilter']
      }
    }
    responses: {
      /** OK */
      200: {
        schema: definitions['SearchPhraseResults']
      }
      /** Unauthorised, requires a valid Oauth2 token */
      401: unknown
      /** Forbidden, requires an authorisation with role ROLE_COMMUNITY */
      403: unknown
    }
  }
  /** Specify the request criteria to match against */
  search_1: {
    parameters: {
      body: {
        /** searchForm */
        searchForm: definitions['SearchDto']
      }
    }
    responses: {
      /** OK */
      200: {
        schema: definitions['OffenderDetail'][]
      }
      /** Invalid Request */
      400: {
        schema: definitions['BadRequestException']
      }
      /** Not found */
      404: {
        schema: definitions['NotFoundException']
      }
    }
  }
  /** Specify the request criteria to match against */
  search: {
    parameters: {
      body: {
        /** searchForm */
        searchForm: definitions['SearchDto']
      }
    }
    responses: {
      /** OK */
      200: {
        schema: definitions['OffenderDetail'][]
      }
      /** Invalid Request */
      400: {
        schema: definitions['BadRequestException']
      }
      /** Not found */
      404: {
        schema: definitions['NotFoundException']
      }
    }
  }
  syntheticMonitorUsingGET: {
    responses: {
      /** OK */
      200: unknown
    }
  }
  /** Requires ROLE_COMMUNITY role */
  findByTeamCodeUsingPOST: {
    parameters: {
      query: {
        offset?: number
        /** Results page you want to retrieve (0..N) */
        page?: unknown
        paged?: boolean
        pageNumber?: number
        pageSize?: number
        /** Number of records per page. */
        size?: unknown
        'sort.sorted'?: boolean
        'sort.unsorted'?: boolean
        unpaged?: boolean
      }
      body: {
        /** teamCodeList */
        teamCodeList: string[]
      }
    }
    responses: {
      /** OK */
      200: {
        schema: definitions['SearchPagedResults']
      }
      /** Unauthorised, requires a valid Oauth2 token */
      401: unknown
      /** Forbidden, requires an authorisation with role ROLE_COMMUNITY */
      403: unknown
    }
  }
  /** Requires ROLE_COMMUNITY role */
  searchOffendersByTeamCodeUsingGET: {
    parameters: {
      query: {
        offset?: number
        paged?: boolean
        pageNumber?: number
        pageSize?: number
        'sort.sorted'?: boolean
        'sort.unsorted'?: boolean
        unpaged?: boolean
      }
      path: {
        /** teamCode */
        teamCode: string
      }
    }
    responses: {
      /** OK */
      200: {
        schema: definitions['SearchPagedResults']
      }
      /** Invalid Request */
      400: {
        schema: definitions['BadRequestException']
      }
      /** Unauthorised, requires a valid Oauth2 token */
      401: unknown
      /** Forbidden, requires an authorisation with role ROLE_COMMUNITY */
      403: unknown
      /** Not found */
      404: {
        schema: definitions['NotFoundException']
      }
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface external {}
