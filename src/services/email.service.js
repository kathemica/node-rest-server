import sgMail from '@sendgrid/mail';

import { emailConfig, logger, SERVER_URL } from '../config/index.js';

sgMail.setApiKey(emailConfig.SENDGRID_API_KEY);

// const transport = nodemailer.createTransport(emailConfig.smtp);
/* istanbul ignore next */
// if (env !== 'test') {
//   sgMail
//     .verify()
//     .then(() => logger.info('Connected to email server'))
//     .catch(() => logger.warn('Unable to connect to email server. Make sure you have configured the SMTP options in .env'));
// }

/**
 * Send an email
 * @param {string} to
 * @param {string} subject
 * @param {string} text
 * @param {string} html
 * @returns {Promise}
 */
const sendEmail = async (to = '', subject = '', text = '') => {
  const msg = {
    from: emailConfig.from,
    to,
    subject,
    text,
  };

  await sgMail
    .send(msg)
    .then(() => {
      logger.info(`Email sent to ${to} about ${subject}`);
    })
    .catch((error) => {
      logger.error(error);
    });
};

/**
 * Send reset password email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendResetPasswordEmail = async (to, token) => {
  const subject = 'Reset password';
  // replace this url with the link to the reset password page of your front-end app
  const resetPasswordUrl = `${SERVER_URL}/auths/reset-password?token=${token}`;
  const text = `Dear user,
To reset your password, click on this link: ${resetPasswordUrl}
If you did not request any password resets, then ignore this email.`;
  await sendEmail(to, subject, text);
};

/**
 * Send verification email
 * @param {string} to
 * @param {string} token
 * @returns {Promise}
 */
const sendVerificationEmail = async (to, token) => {
  const subject = 'Email Verification';
  // replace this url with the link to the email verification page of your front-end app
  const verificationEmailUrl = `${SERVER_URL}/auths/verify-email?token=${token}`;
  const text = `Dear user, To verify your email, click on this link: ${verificationEmailUrl}. \nIf you did not create an account, then ignore this email.`;
  await sendEmail(to, subject, text);
};

export { sgMail, sendEmail, sendResetPasswordEmail, sendVerificationEmail };
