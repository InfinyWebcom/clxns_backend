const nodemailer = require('nodemailer');

const sendEmail = (data) => {
  // console.log('\n\n\n\n TEST EMAILL :-', data);
  const smtpTransport = nodemailer.createTransport({
    tls: { rejectUnauthorized: false },
    secureConnection: false,
    host: 'smtp.gmail.com',
    port: 587,
    requiresAuth: true,
    auth: {
      user: process.env.mail_username,
      pass: process.env.mail_password,
    },
  });

  const mailOptions = {
    to: data.email,
    from: process.env.mail_username,
    subject: data.subject,
    html: data.body,
  };

  if (data.attachments) {
    mailOptions.attachments = data.attachments;
  }

  if (data.cc && data.cc.length > 0) {
    mailOptions.cc = data.cc;
  }

  smtpTransport.sendMail(mailOptions, (err) => {
    console.log('\n\nEmail - sendMail - err :-', err);
    return true;
  });
};

module.exports = {
  sendEmail,
};
