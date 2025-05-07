import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendVerificationEmail = async (to: string, token: string) => {
  const link = `${process.env.BASE_URL}/api/auth/verify-email/${token}`;
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject: 'Verify your email',
    html: `<p>Click <a href="${link}">here</a> to verify your email.</p>`,
  });
};
