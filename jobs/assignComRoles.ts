import 'reflect-metadata'
import * as fs from 'fs'
import * as path from 'path'
import { initialiseAppInsights, buildAppInsightsClient, flush } from '../server/utils/azureAppInsights'
import logger from '../logger'
import { services } from '../server/services'

// A type which reflects the input CSV file columns
type ComDetail = {
  username: string
  forename: string
  surname: string
  email: string
  staffCode: string
  staffGrade: string
}

const { communityService } = services

initialiseAppInsights()
buildAppInsightsClient('create-and-vary-a-licence-assign-com-roles-job')

// Rules to determine who should be allocated the role
const processCom = async (com: ComDetail): Promise<void> => {
  try {
    const staffDetails = await communityService.getUserDetailsByUsername(com.username.trim().toUpperCase())
    if (staffDetails.enabled) {
      const roleExists = staffDetails.roles.find(role => role.name === 'LHDCBT002')
      if (roleExists === undefined) {
        const userDetails = await communityService.getStaffDetailByUsername(com.username.trim().toUpperCase())
        const caseload = await communityService.getManagedOffenders(userDetails.staffIdentifier)
        if (caseload?.length > 0) {
          await communityService.assignDeliusRole(com.username.trim().toUpperCase(), 'LHDCBT002')
          logger.info(`${com.forename} ${com.surname} was assigned the role LDHCBT002`)
        } else {
          logger.info(`${com.forename} ${com.surname} has an empty caseload}`)
        }
      } else {
        logger.info(`${com.forename} ${com.surname} already has role LHDCBT002`)
      }
    } else {
      logger.info(`${com.forename} ${com.surname} is not enabled in nDelius`)
    }
  } catch (err) {
    logger.info(`${com.forename} ${com.surname} ${com.username} error from Community API - ${JSON.stringify(err)}`)
  }
}

// Populates a ComDetail object from each line of the input file
const populateComDetail = (fieldValues: string[]): ComDetail => {
  return {
    username: fieldValues[0],
    forename: fieldValues[1],
    surname: fieldValues[2],
    email: fieldValues[3],
    staffCode: fieldValues[4],
    staffGrade: fieldValues[5],
  } as ComDetail
}

// Shows which environment is being used.
logger.info(`COMMUNITY_API_URL = ${process.env.COMMUNITY_API_URL}`)

// Change file name to suit
const csvFilePath = path.resolve(__dirname, 'wales-dev.csv')

const lines = fs.readFileSync(csvFilePath, 'utf-8').split(/\r?\n/)

// Force this processing to run in sequence, line by line, awaiting each line being processed.
;(async () => {
  for (let i = 0; i < lines.length; i += 1) {
    const strings = lines[i].split(',')
    if (strings.length === 6) {
      // eslint-disable-next-line no-await-in-loop
      await processCom(populateComDetail(strings))
    }
  }
})().then(() => flush({ callback: () => process.exit() }, 'success'))
