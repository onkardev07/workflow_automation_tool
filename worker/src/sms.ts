import AWS from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();

AWS.config.update({
  region: process.env.AWS_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const sns = new AWS.SNS();

interface NotificationParams {
  phoneNumber?: string;
  message: string;
}

export async function sendNotification({
  phoneNumber,
  message,
}: NotificationParams) {
  try {
    const params = {
      Message: message,
      ...(phoneNumber && { PhoneNumber: phoneNumber }), // Optional phone number parameter
    };

    const result = await sns.publish(params).promise();
    console.log("Notification sent:", result);
    return result;
  } catch (error) {
    console.error("Error sending notification:", error);
    throw error;
  }
}
