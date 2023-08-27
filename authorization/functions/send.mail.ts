import nodemailer from 'nodemailer';
import { signupEmailTemplate, resetPswEmailTemplate } from './email.template';

const sendMail = (token: any, user: any) => {
  let transporter = nodemailer.createTransport({
    host: 'smtp.beget.com',
    port: 465,
    secure: true,
    auth: {
      user: 'info@fingarden.ru',
      pass: process.env.EMAIL_SERVICE_SECRET_KEY,
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    },
  });
  const url = `https://fingarden.ru/profile/verify/${token}`;
  transporter.sendMail(
    {
      to: user.email,
      from: 'info@fingarden.ru',
      subject: `Подтверждать ${user.email}`,
      html: signupEmailTemplate(user.firstName, user.email, url),
    },
    (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);
    },
  );
};

const sendMailResetPsw = (token: any, user: any) => {
  let transporter = nodemailer.createTransport({
    host: 'smtp.beget.com',
    port: 465,
    secure: true,
    auth: {
      user: 'info@fingarden.ru',
      pass: process.env.EMAIL_SERVICE_SECRET_KEY,
    },
    tls: {
      // do not fail on invalid certs
      rejectUnauthorized: false,
    },
  });
  const url = `https://fingarden.ru/profile/pswreset/confirmpsw/${token}`;
  transporter.sendMail(
    {
      to: user.email,
      from: 'info@fingarden.ru',
      subject: `Сбросить пароль для ${user.email}`,
      html: resetPswEmailTemplate(user.firstName, user.email, url),
    },
    (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);
    },
  );
};

export { sendMail, sendMailResetPsw };
