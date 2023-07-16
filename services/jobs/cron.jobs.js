const cron = require('node-cron');
const BidCronJob = require('../cron/bid.cron');

// define job 

// run every minute 

const Job = async() => {
    await BidCronJob.run();
}

// schedule the job to run every minute 
cron.schedule('* * * * *', Job);