import { DataProviders } from './dataProvider/dataProviders';
import sgMail, { MailDataRequired } from '@sendgrid/mail';

export async function sendMailIfPendingProposals(dataProviders: DataProviders, adminEmails: string[]) {
  if (process.env.SENDGRID_API_KEY && adminEmails && adminEmails.length > 0) {
    try {
      const pendingProposals = await dataProviders.changeProposal.getPendingChangeProposalCount();
      if (pendingProposals > 0) {
        const message = `There are ${pendingProposals} idiom change proposals pending review`;
        sgMail.setApiKey(process.env.SENDGRID_API_KEY);
        const msg: MailDataRequired = {
          to: adminEmails,
          from: 'notifications@idiomatically.net',
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


export async function sendAcceptedProposalEmail(slug: string, title: string, email: string) {

  const serverUrl = process.env.SERVER_URL;
  if (process.env.SENDGRID_API_KEY && email) {
    try {
      const url = `${serverUrl}/idioms/${slug}`;
      const subject = `Your contribution to Idiomatically.net was approved!`;
      const message = `We accepted your contribution for ${title}, please view it here: ${url} . Thanks for your support!`;
      sgMail.setApiKey(process.env.SENDGRID_API_KEY);
      const msg: MailDataRequired = {
        to: [email],
        from: 'admin@idiomatically.net',
        subject: subject,
        text: message,
        mailSettings: {
          spamCheck: {
            enable: false
          }
        },
        trackingSettings: {
          clickTracking: {
            enable: false
          }
        }
      };
      await sgMail.send(msg);
    }
    catch (e) {
      console.error(`Unable to send mail - ${e}`);
    }
  }
}