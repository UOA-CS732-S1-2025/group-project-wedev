import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config(); 

const user = process.env.EMAIL_USER;
const pass = process.env.EMAIL_PASS;
const from = process.env.EMAIL_FROM;

console.log("🔍 Nodemailer config:");
console.log("EMAIL_USER:", user);
console.log("EMAIL_PASS:", pass ? "✅ Present" : "❌ Missing");
console.log("EMAIL_FROM:", from);

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user,
    pass,
  },
});

export const sendVerificationEmail = async (to, verifyUrl) => {
  const mailOptions = {
    from,
    to,
    subject: "Verify your email address",
    html: `
      <h2>Welcome to Urban Ease!</h2>
      <p>Click the link below to verify your email:</p>
      <a href="${verifyUrl}">${verifyUrl}</a>
      <p>Sincerely,<br/>Cheng, Administrator of Urban Ease</p>
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.response);
  } catch (err) {
    console.error("❌ Email send failed:", err.message);
    throw err;
  }
};
