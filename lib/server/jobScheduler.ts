import { DataProviders } from './dataProvider/dataProviders';
import { CronJob } from 'cron';
import sgMail, { MailDataRequired } from '@sendgrid/mail';

export let EquivalentClosureJob: CronJob = null;
export let ProposalsToReviewJob: CronJob = null;

export async function initializeJobs(dataProviders: DataProviders, adminEmails: string[]) {

  // Run every 12 hours
  EquivalentClosureJob = new CronJob('0 */12 * * *', async () => {
    await dataProviders.idiom.computeEquivalentClosure();
  });

  // Run every 24 hours
  ProposalsToReviewJob = new CronJob('0 0 */1 * *', async () => {
    await sendMailIfPendingProposals(dataProviders, adminEmails);
  });

  ProposalsToReviewJob.start();
  EquivalentClosureJob.start();
}


async function sendMailIfPendingProposals(dataProviders: DataProviders, adminEmails: string[]) {
  if (process.env.SENDGRID_API_KEY && adminEmails && adminEmails.length > 0) {
    try {
      const pendingProposals = await dataProviders.changeProposal.getPendingChangeProposalCount();
      if (pendingProposals > 0) {
        const message = `There are ${pendingProposals} idiom change proposals pending review`;
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg: MailDataRequired = {
          to: adminEmails,
          from: 'admin@idiomatically.net',
          subject: message,
          text: message
        };
        await sgMail.send(msg);
      }
    }
    catch (e) {
      console.error(`Unable to send mail - ${e}`);
    }
  }
  else {
    console.warn("No send mail api key configured");
  }
}

export function stopJobs() {
  if (EquivalentClosureJob) {
    EquivalentClosureJob.stop();
  }

  if (ProposalsToReviewJob) {
    ProposalsToReviewJob.stop();
  }
}
