import { format } from 'date-fns'

const convertToDateString = (date: string): string => {
  const [day, month, year] = date.split('/')
  return format(new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10)), 'yyyy-MM-dd')
}

const toDate = (date: string): Date => {
  const [day, month, year] = date.split('/')
  return new Date(parseInt(year, 10), parseInt(month, 10) - 1, parseInt(day, 10))
}

export { convertToDateString, toDate }
