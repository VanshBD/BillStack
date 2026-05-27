const { passwordVerfication, otpVerification } = require('@/emailTemplate/emailVerfication');

const { Resend } = require('resend');
const config = require('../../../config');

const sendMail = async ({
  email,
  name,
  link,
  otp,
  billstack_app_email,
  subject = 'Verify your email | billstack',
  type = 'emailVerfication',
  emailToken,
}) => {
  const resend = new Resend(config.resendApi);

  const html =
    type === 'otpVerification'
      ? otpVerification({ name, otp })
      : passwordVerfication({ name, link });

  const { data } = await resend.emails.send({
    from: billstack_app_email,
    to: email,
    subject,
    html,
  });

  return data;
};

module.exports = sendMail;
