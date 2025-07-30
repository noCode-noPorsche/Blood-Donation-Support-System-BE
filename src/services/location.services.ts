import { config } from 'dotenv'
import { isPointWithinRadius } from 'geolib'
import User from '~/models/schemas/User.schemas'
import databaseService from './database.services'
import { ObjectId } from 'mongodb'
import { BloodGroupEnum, UserRole } from '~/constants/enum'
import { bloodGroupMap } from '~/utils/utils'
import { ErrorWithStatus } from '~/models/Error'
import { HTTP_STATUS } from '~/constants/httpStatus'
import Notification from '~/models/schemas/Notification.schemas'
import { sendPushNotification } from '~/utils/notification'
config()

const DEFAULT_ORIGIN = {
  latitude: 10.870008,
  longitude: 106.803024
}

interface FindDonorsParams {
  radiusKm: number
  blood_group_name: BloodGroupEnum
}

class LocationService {
  async findCompatibleDonorsNearby(params: FindDonorsParams) {
    const { radiusKm, blood_group_name } = params

    const origin = DEFAULT_ORIGIN
    const radiusMeters = radiusKm * 1000

    // 1. Tìm tên các nhóm máu phù hợp từ bản đồ nhóm máu
    const compatibleBloodNames = bloodGroupMap[blood_group_name]
    if (!compatibleBloodNames || compatibleBloodNames.length === 0) {
      throw new ErrorWithStatus({
        message: `Không có nhóm máu phù hợp với ${blood_group_name}`,
        status: HTTP_STATUS.BAD_REQUEST
      })
    }

    // 2. Tìm các blood group IDs tương ứng từ DB
    const compatibleBloodGroups = await databaseService.bloodGroups
      .find({ name: { $in: compatibleBloodNames as BloodGroupEnum[] } })
      .toArray()
    const compatibleBloodGroupIds = compatibleBloodGroups.map((bg) => new ObjectId(bg._id))

    // 3. Query lọc trước các user đủ điều kiện + nhóm máu phù hợp
    const query: any = {
      location: { $exists: true },
      weight: { $gte: 42 },
      role: UserRole.Customer,
      blood_group_id: { $in: compatibleBloodGroupIds }
    }

    const users = await databaseService.users
      .find(query)
      .project({
        _id: 1,
        full_name: 1,
        blood_group_id: 1,
        location: 1,
        phone: 1,
        fcm_token: 1
      })
      .toArray()

    // 4. Lọc theo khoảng cách
    const nearbyUsers = users.filter((user) => {
      const [lng, lat] = user.location?.coordinates || [0, 0]
      return isPointWithinRadius({ latitude: lat, longitude: lng }, origin, radiusMeters)
    })

    //5. Gửi thông báo tới người dùng tìm thấy
    if (nearbyUsers.length === 0) {
      throw new ErrorWithStatus({
        message: 'Không tìm thấy người hiến máu phù hợp trong bán kính đã chỉ định',
        status: HTTP_STATUS.NOT_FOUND
      })
    } else {
      // Gửi thông báo tới từng người dùng (giả sử có hàm sendNotification)
      for (const user of nearbyUsers) {
        const title = 'Yêu cầu hỗ trợ hiến máu'
        const body = `Người cần máu nhóm ${blood_group_name} đang ở cơ sở y tế gần bạn. Bạn có thể mở ứng dụng để lên đặt lịch hiến ngay và di chuyển tới cơ sở y tế được hỗ trợ.`
        // Lưu thông báo vào DB
        const notification = new Notification({
          receiver_id: user._id,
          title,
          message: body
        })
        await databaseService.notifications.insertOne(notification)

        // Gửi push notification nếu có FCM token
        if (user.fcm_token) {
          await sendPushNotification({
            fcmToken: user.fcm_token,
            title,
            body
          })
        }
      }
    }

    return nearbyUsers.map((user) => new User(user as User))
  }
}

const locationService = new LocationService()
export default locationService
