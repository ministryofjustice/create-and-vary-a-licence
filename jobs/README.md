# Create and vary a licence jobs

## AssignComRoles

This job is intended to be run locally on a developer laptop.

It can be used to grant the Delius Digital Licence Create role (id: LHDCBT002) to a list of users who are
suitable candidates to have it.

To run this job:

* Set up a .env file to provide the variables which match the intended environment (e.g. DEV, PREPROD, PROD)
* The .env file requires many of the URLs / secrets required to run the service - check these by accessing any running pod.
* As a minimum, requires COMMUNITY_API_URL, AUTH_API_URL and client secrets
* Provide a CSV-formatted input file containing the following data:
```angular2html
DeliusUsername, Forename, Surname, Email, StaffCode, StaffGrade
TestUserNPS,Tom,Test,tom.test@justice.gov.uk,N44003,PSO
TestUserNPS2,Tony,Test,tony.test@justice.gov.uk,N44004,PSO
```
* Do not include the headers
* Compile the service code `npm run build`
* Copy the CSV file containing user details into ./dist/jobs
* Start a local redis in docker (perhaps with `docker-compose up -d`)
* Redis is required as the API clients need a local redis to cache tokens for clients. 
* Run the job wth `npm run assign-com-roles`

## AssignAcoRoles

This is a simplified version of the above to assign the Delius role CVLBT001 to PDU heads.

It accepts the same format of input file and relies upon a .env file allowing access to the intended environment.

To run the job

* Compile the service code `npm run build`
* Copy the CSV file containing ACO user details into ./dist/jobs
* Start a local redis in docker (perhaps with `docker-compose up -d`)
* Redis is required as the API clients need a local redis to cache tokens for clients.
* Run the job wth `npm run assign-aco-roles`


## ActivateLicences

This job is scheduled within Kubernetes to run periodically through the day.

It finds all Approved licences and then checks whether the person in prison has been released yet.

If released, the licence status is updated to Active.

The job can also be run manually. Local environment variables will need to be configured against
the environment you wish to run the script against, in this instance. 

* Compile the service code `npm run build`
* Start a local redis in docker (perhaps with `docker-compose up -d`)
* Redis is required as the API clients need a local redis to cache tokens for clients.
* Run the job wth `npm run activate-valid-licences`


## PromptLicenceCreation

This job is scheduled within Kubernetes to run every Monday at 6am.

For each configured prison it finds the people who will be released in the next 13 weeks.

It then finds the probation officers who are the offender managers, and if there is no 
licence present, it will send an email reminder to create one.

There are two cut-off points, 13 weeks and a further reminder at 4 weeks.

DEV and PREPROD will send emails using the TEST Notify account - this is prevented from sending 
emails to anyone other than those people configured within the team. PROD is configured to send
emails to anyone.