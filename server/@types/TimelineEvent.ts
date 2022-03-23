import TimelineEventType from '../enumeration/TimelineEventType'

export default class TimelineEvent {
  subText: string

  viewLink: string

  printLink: string

  constructor(
    private readonly eventType: TimelineEventType,
    private readonly title: string,
    private readonly statusCode: string,
    private readonly createdBy: string,
    private readonly licenceId: number,
    private readonly lastUpdate: string
  ) {}
}
