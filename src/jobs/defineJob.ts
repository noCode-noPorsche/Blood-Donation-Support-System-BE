// src/jobs/defineJobs.ts
import { sendPushNotification } from '~/utils/notification'
import agenda from './agenda'
import databaseService from '~/services/database.services'
import { BloodUnitStatus } from '~/constants/enum'
import { ObjectId } from 'mongodb'

const defineJobs = {
  NotifyUpcomingDonation: 'notify upcoming donation',
  ExpireBloodUnits: 'expire blood units'
}

// Job gửi thông báo trước ngày hiến máu
agenda.define(defineJobs.NotifyUpcomingDonation, async (job: any) => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const start = new Date(tomorrow.setHours(0, 0, 0, 0))
  const end = new Date(tomorrow.setHours(23, 59, 59, 999))

  const donations = await databaseService.donationRegistrations
    .find({
      start_date_donation: { $gte: start, $lte: end }
    })
    .toArray()

  for (const donation of donations) {
    const user = await databaseService.users.findOne({ _id: donation.user_id })
    const title = 'Sắp đến lịch hiến máu!'
    const body = `Bạn có lịch hiến máu vào ngày mai. Hãy chuẩn bị sức khoẻ!`
    await databaseService.notifications.insertOne({
      receiver_id: user?._id as ObjectId,
      donation_registration_id: donation._id,
      title,
      message: body
    })

    if (user?.fcm_token) {
      await sendPushNotification({
        fcmToken: user.fcm_token,
        title: title,
        body: body
      })
    }
  }
})

// Job tự động cập nhật trạng thái túi máu hết hạn
agenda.define(defineJobs.ExpireBloodUnits, async () => {
  const now = new Date()

  await databaseService.bloodUnits.updateMany(
    {
      expired_at: { $lte: now },
      status: { $ne: BloodUnitStatus.Expired }
    },
    { $set: { status: BloodUnitStatus.Expired, updated_at: now } }
  )
})

// Hàm gọi để schedule các job
export async function scheduleJobs() {
  await agenda.start()
  await agenda.every('35 4 * * *', defineJobs.NotifyUpcomingDonation) // 8AM mỗi ngày
  await agenda.every('0 0 * * *', defineJobs.ExpireBloodUnits) // 12AM mỗi ngày
}
