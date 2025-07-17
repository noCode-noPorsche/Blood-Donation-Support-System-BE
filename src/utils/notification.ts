import admin from '~/services/firebase.services'

export const sendPushNotification = async ({
  fcmToken,
  title,
  body,
  data
}: {
  fcmToken: string
  title: string
  body: string
  data?: Record<string, string>
}) => {
  const message = {
    token: fcmToken,
    notification: {
      title,
      body
    },
    data: data || {}
  }

  try {
    const response = await admin.messaging().send(message)
    console.log('Successfully sent message:', response)
    return response
  } catch (error) {
    console.error('Error sending message:', error)
    throw error
  }
}
