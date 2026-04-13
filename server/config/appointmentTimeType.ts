type AppointmentTimeType = { value: string; text: string; hintText: string }

const appointmentTimeTypes: AppointmentTimeType[] = [
  {
    value: 'SPECIFIC_DATE_TIME',
    text: 'At a specific date and time ',
    hintText: 'At a specific date and time type.value, radio button, 1 of 3, extended',
  },
  {
    value: 'IMMEDIATE_UPON_RELEASE',
    text: 'Immediately after release',
    hintText: 'Immediately, radio button, 2 of 3',
  },
  {
    value: 'NEXT_WORKING_DAY_2PM',
    text: 'By 2pm on the next working day after their release',
    hintText: 'By 2pm the next working day after release, radio button, 3 of 3',
  },
]

export default appointmentTimeTypes
