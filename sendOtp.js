const twilio = require('twilio');

const accountSid = 'your_account_sid';
const authToken = 'your_auth_token';
const client = twilio(accountSid, authToken);

const sendOtp = async (mobileNumber, otp) => {
  try {
    await client.messages.create({
      body: `Your OTP is ${otp}`,
      from: 'your_twilio_phone_number',
      to: mobileNumber,
    });
  } catch (error) {
    console.error('Error sending OTP:', error);
  }
};

module.exports = sendOtp;
