import nodemailer from "nodemailer";

// const transporter = nodemailer.createTransport({
//   service: "gmail",
//   auth: {
//     user: process.env.EMAIL_ID,
//     pass: process.env.EMAIL_PASS,
//   },
// });

// const sendEmail = async (to, subject, message) => {
//   await transporter.sendMail({
//     from: `"AEGCL Tenders" <${process.env.EMAIL_ID}>`,
//     to,
//     subject,
//     text: message,
//   });
// };

// export default sendEmail;

export const sendEmail = async ({ email, subject, message }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    service: process.env.SMTP_SERVICE,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_MAIL,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  const options = {
    from: process.env.SMTP_MAIL,
    to: email,
    subject,
    html: message,
  };
  await transporter.sendMail(options);
};
