import { DataProviders } from './dataProvider/dataProviders';
import { CronJob } from 'cron';
import { sendMailIfPendingProposals } from './emailService';

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


export function stopJobs() {
  if (EquivalentClosureJob) {
    EquivalentClosureJob.stop();
  }

  if (ProposalsToReviewJob) {
    ProposalsToReviewJob.stop();
  }
}
