import { format } from 'date-fns'

const convertToDateString = (date: string): string => {
  const [sDay, sMonth, sYear] = date.split('/')
  return format(new Date(parseInt(sYear, 10), parseInt(sMonth, 10) - 1, parseInt(sDay, 10)), 'yyyy-MM-dd')
}

export default convertToDateString
