import { sendPushNotification } from '~/utils/notification'
import agenda from './agenda'
import databaseService from '~/services/database.services'
import { BloodUnitStatus, DonationRegistrationStatus } from '~/constants/enum'
import { ObjectId } from 'mongodb'

const defineJobs = {
  NotifyUpcomingDonation: 'notify upcoming donation',
  ExpireBloodUnits: 'expire blood units',
  ExpireDonationRegistrations: 'expire donation registrations'
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

    // Format ngày hiến máu thành dd/mm/yyyy
    const donationDate = new Date(donation.start_date_donation).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
    const title = 'Sắp đến lịch hiến máu!'
    const body = `Bạn có lịch hiến máu vào ngày ${donationDate}. Hãy chuẩn bị sức khoẻ!`
    const now = new Date()

    // Kiểm tra đã gửi chưa (gợi ý: thêm field `type: 'upcoming_donation'`)
    const alreadyNotified = await databaseService.notifications.findOne({
      donation_registration_id: donation._id,
      type: 'upcoming_donation'
    })

    if (!alreadyNotified) {
      await databaseService.notifications.insertOne({
        receiver_id: user?._id as ObjectId,
        donation_registration_id: donation._id,
        title,
        message: body,
        created_at: now,
        type: 'upcoming_donation',
        is_read: false
      })

      if (user?.fcm_token) {
        await sendPushNotification({
          fcmToken: user.fcm_token,
          title,
          body
        })
      }
    }
  }
})

// Job tự động cập nhật trạng thái túi máu hết hạn
agenda.define(defineJobs.ExpireBloodUnits, async () => {
  const now = new Date()

  // Tìm tất cả các túi máu vừa hết hạn và chưa bị đánh dấu là "Expired"
  const expiredBloodUnits = await databaseService.bloodUnits
    .find({
      expired_at: { $lte: now },
      status: BloodUnitStatus.Available
    })
    .toArray()

  for (const unit of expiredBloodUnits) {
    // Tìm người phụ trách túi máu (giả sử có trường created_by là người tạo)
    // const user = await databaseService.users.findOne({ _id: unit.created_by })

    // const expiredDateFormatted = new Date(unit.expired_at).toLocaleDateString('vi-VN')
    // const title = `Túi máu hết hạn ngày ${expiredDateFormatted}`
    // const body = `Túi máu thuộc nhóm ${unit.blood_group} đã hết hạn sử dụng.`

    // Kiểm tra đã gửi thông báo trùng chưa (dựa theo blood_unit_id và title)
    // const alreadyNotified = await databaseService.notifications.findOne({
    //   blood_unit_id: unit._id,
    //   // title: { $regex: /^Túi máu hết hạn ngày/ }
    // })

    // if (!alreadyNotified) {
    //   // Tạo thông báo trong DB
    //   await databaseService.notifications.insertOne({
    //     receiver_id: user?._id ?? null,
    //     blood_unit_id: unit._id,
    //     title,
    //     message: body,
    //     created_at: now
    //   })

    //   // Gửi push nếu có FCM token
    //   if (user?.fcm_token) {
    //     await sendPushNotification({
    //       fcmToken: user.fcm_token,
    //       title,
    //       body
    //     })
    //   }
    // }

    // Cập nhật trạng thái túi máu thành Expired
    await databaseService.bloodUnits.updateOne(
      { _id: unit._id },
      { $set: { status: BloodUnitStatus.Expired, updated_at: now } }
    )
  }
})

// Job tự động cập nhật trạng thái đăng ký hiến máu hết hạn
agenda.define(defineJobs.ExpireDonationRegistrations, async () => {
  const now = new Date()
  const expirationDate = new Date(now.getTime() - 5 * 60 * 1000) // 5 phút trước

  // Tìm tất cả các đơn đã được duyệt nhưng quá hạn
  const expiredDonations = await databaseService.donationRegistrations
    .find({
      start_date_donation: { $lt: expirationDate },
      status: DonationRegistrationStatus.Approved
    })
    .toArray()

  for (const donation of expiredDonations) {
    const user = await databaseService.users.findOne({ _id: donation.user_id })

    // Format ngày hiến máu thành dd/mm/yyyy
    const donationDate = new Date(donation.start_date_donation).toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })

    const title = `Đơn đăng ký hiến máu ngày ${donationDate} đã hết hạn`
    const body = 'Đơn đăng ký hiến máu của bạn đã bị huỷ do không đến đúng giờ.'

    // Kiểm tra đã gửi thông báo cho đơn này chưa
    const alreadyNotified = await databaseService.notifications.findOne({
      donation_registration_id: donation._id,
      type: 'expire_donation'
    })

    if (!alreadyNotified) {
      // Gửi thông báo qua bảng notifications
      await databaseService.notifications.insertOne({
        receiver_id: user?._id as ObjectId,
        donation_registration_id: donation._id,
        title,
        message: body,
        created_at: now,
        type: 'expire_donation',
        is_read: false
      })

      // Gửi thông báo đẩy nếu có FCM token
      if (user?.fcm_token) {
        await sendPushNotification({
          fcmToken: user.fcm_token,
          title,
          body
        })
      }
    }

    // Cập nhật trạng thái đơn thành Rejected
    await databaseService.donationRegistrations.updateOne(
      { _id: donation._id },
      {
        $set: {
          status: DonationRegistrationStatus.Rejected,
          updated_at: now
        }
      }
    )
  }
})

// Hàm gọi để schedule các job
export async function scheduleJobs() {
  await agenda.start()
  await agenda.every('*/5 * * * *', defineJobs.NotifyUpcomingDonation) // Chạy mỗi 5 phút
  await agenda.every('*/5 * * * *', defineJobs.ExpireBloodUnits) // Chạy mỗi 5 phút
  await agenda.every('*/5 * * * *', defineJobs.ExpireDonationRegistrations) // Chạy mỗi 5 phút
  // await agenda.now(defineJobs.ExpireDonationRegistrations)
}
