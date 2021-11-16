class HdcStatus {
  public constructor(
    bookingId: string,
    private readonly homeDetentionCurfewEndDate: string = null,
    private readonly checksPassed: boolean = false,
    private readonly approvalStatus: string = ''
  ) {
    this.bookingId = bookingId
    this.eligibleForHdc = homeDetentionCurfewEndDate && checksPassed === true && approvalStatus !== 'REJECTED'
  }

  bookingId: string

  eligibleForHdc: boolean
}

export = HdcStatus
