import 'reflect-metadata'
import * as fs from 'fs'
import * as path from 'path'
import { initialiseAppInsights, buildAppInsightsClient, flush } from '../server/utils/azureAppInsights'
import logger from '../logger'
import { services } from '../server/services'

// A type which reflects the input CSV file columns
type AcoDetail = {
  username: string
  forename: string
  surname: string
  email: string
  staffCode: string
  staffGrade: string
}

const { communityService } = services

initialiseAppInsights()
buildAppInsightsClient('create-and-vary-a-licence-assign-aco-roles-job')

// Rules to determine who should be allocated the role
const processAco = async (aco: AcoDetail): Promise<void> => {
  try {
    const staffDetails = await communityService.getUserDetailsByUsername(aco.username.trim().toUpperCase())
    if (staffDetails.enabled) {
      const roleExists = staffDetails.roles.find(role => role.name === 'CVLBT001')
      if (roleExists === undefined) {
        await communityService.assignDeliusRole(aco.username.trim().toUpperCase(), 'CVLBT001')
        logger.info(`${aco.forename} ${aco.surname} was assigned the role CVLBT001`)
      } else {
        logger.info(`${aco.forename} ${aco.surname} already has role CVLBT001`)
      }
    } else {
      logger.info(`${aco.forename} ${aco.surname} is not enabled in nDelius`)
    }
  } catch (err) {
    logger.info(`${aco.forename} ${aco.surname} ${aco.username} error from Community API - ${JSON.stringify(err)}`)
  }
}

// Populates an AcoDetail object from each line of the input file
const populateAcoDetail = (fieldValues: string[]): AcoDetail => {
  return {
    username: fieldValues[0],
    forename: fieldValues[1],
    surname: fieldValues[2],
    email: fieldValues[3],
    staffCode: fieldValues[4],
    staffGrade: fieldValues[5],
  } as AcoDetail
}

// Shows which environment is being used.
logger.info(`COMMUNITY_API_URL = ${process.env.COMMUNITY_API_URL}`)

// Change this filename to suit
const csvFilePath = path.resolve(__dirname, 'wales-aco.csv')
const lines = fs.readFileSync(csvFilePath, 'utf-8').split(/\r?\n/)

// Force this processing to run in sequence, line by line, awaiting each line being processed.
;(async () => {
  for (let i = 0; i < lines.length; i += 1) {
    const strings = lines[i].split(',')
    if (strings.length === 6) {
      // eslint-disable-next-line no-await-in-loop
      await processAco(populateAcoDetail(strings))
    }
  }
})().then(() => flush({ callback: () => process.exit() }, 'success'))
