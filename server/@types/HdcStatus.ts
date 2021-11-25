class HdcStatus {
  public constructor(
    bookingId: string,
    private readonly homeDetentionCurfewEligibilityDate: string = null,
    private readonly checksPassed: boolean = false,
    private readonly approvalStatus: string = null
  ) {
    this.bookingId = bookingId
    this.eligibleForHdc = homeDetentionCurfewEligibilityDate && checksPassed === true && approvalStatus !== 'REJECTED'
  }

  bookingId: string

  eligibleForHdc: boolean
}

export = HdcStatus
