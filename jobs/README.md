# Create and vary a licence jobs

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


DEV and PREPROD will send emails using the TEST Notify account - this is prevented from sending 
emails to anyone other than those people configured within the team. PROD is configured to send
emails to anyone.