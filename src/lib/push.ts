
import webpush from "web-push";
import PolapainModel from "@/models/Polapain";

const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const privateKey = process.env.VAPID_PRIVATE_KEY;

export async function sendPushNotification(userId: string, payload: { title: string; body: string; url: string }) {
  if (!publicKey || !privateKey) {
    console.warn("Push notifications skipped: VAPID keys not configured in .env");
    return;
  }

  try {
      webpush.setVapidDetails(
        "mailto:example@example.com",
        publicKey,
        privateKey
      );
  } catch (error) {
      console.error("Failed to set VAPID details:", error);
      return;
  }

  const user = await PolapainModel.findById(userId);
  if (!user || !user.pushSubscriptions || user.pushSubscriptions.length === 0) {
    return;
  }

  const pushPromises = user.pushSubscriptions.map(async (subscription) => {
    try {
      await webpush.sendNotification(subscription, JSON.stringify(payload));
    } catch (error: any) {
      if (error.statusCode === 410 || error.statusCode === 404) {
        // Subscription has expired or is no longer valid
        await PolapainModel.findByIdAndUpdate(userId, {
          $pull: { pushSubscriptions: { endpoint: subscription.endpoint } }
        });
      } else {
        console.error("Error sending push notification:", error);
      }
    }
  });

  await Promise.all(pushPromises);
}
