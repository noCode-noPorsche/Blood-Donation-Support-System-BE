import { config } from 'dotenv'
import { UpdateBloodInventoryThresholdReqBody } from '~/models/requests/BloodInventoryThreshold.requests'
import databaseService from './database.services'
import { BloodUnitStatus } from '~/constants/enum'
import { ObjectId } from 'mongodb'
import { HTTP_STATUS } from '~/constants/httpStatus'
import { ErrorWithStatus } from '~/models/Error'
import { BLOOD_MESSAGES } from '~/constants/messages'
config()

class BloodInventoryThresholdService {
  async getAllBloodInventoryThreshold() {
    const bloodGroups = await databaseService.bloodGroups.find().toArray()
    const bloodComponents = await databaseService.bloodComponents.find().toArray()

    // Lấy tất cả threshold hiện có
    const existingThresholds = await databaseService.bloodInventoryThreshold.find().toArray()

    const results: any[] = []

    for (const group of bloodGroups) {
      for (const component of bloodComponents) {
        // Lấy tồn kho từ blood_units
        const bloodUnits = await databaseService.bloodUnits
          .find({
            blood_group_id: group._id,
            blood_component_id: component._id,
            status: BloodUnitStatus.Available
          })
          .toArray()

        const totalUnits = bloodUnits.length
        const totalVolume = bloodUnits.reduce((sum, unit) => sum + (unit.volume || 0), 0)

        // Kiểm tra đã tồn tại threshold chưa
        let threshold = existingThresholds.find(
          (t) =>
            t.blood_group_id.toString() === group._id.toString() &&
            t.blood_component_id.toString() === component._id.toString()
        )

        if (!threshold) {
          // Nếu chưa có thì tạo mới
          threshold = {
            _id: new ObjectId(),
            blood_group_id: group._id,
            blood_component_id: component._id,
            threshold_unit: totalUnits,
            threshold_volume_ml: totalVolume,
            threshold_unit_stable: 0,
            created_at: new Date(),
            updated_at: new Date(),
            updated_by: new ObjectId(), // or assign a specific ObjectId if available
            is_stable: true
          }
          await databaseService.bloodInventoryThreshold.insertOne(threshold)
        } else {
          // Nếu đã có thì cập nhật is_stable
          const isStable = totalUnits > (threshold.threshold_unit_stable || 0)
          await databaseService.bloodInventoryThreshold.updateOne(
            { _id: threshold._id },
            {
              $set: {
                is_stable: isStable,
                updated_at: new Date()
              }
            }
          )
          threshold.threshold_unit = totalUnits
          threshold.threshold_volume_ml = totalVolume
          threshold.is_stable = isStable
          threshold.updated_by = new ObjectId(threshold.updated_by)
        }

        results.push({
          _id: threshold._id,
          blood_group_id: group._id,
          blood_group_name: group.name,
          blood_component_id: component._id,
          blood_component_name: component.name,
          threshold_unit: threshold.threshold_unit,
          threshold_volume_ml: threshold.threshold_volume_ml,
          threshold_unit_stable: threshold.threshold_unit_stable || 0,
          total_units: totalUnits,
          total_volume_ml: totalVolume,
          is_stable: threshold.is_stable
        })
      }
    }
    return results
  }

  async updateBloodInventoryThresholdById({
    user_id,
    id,
    payload
  }: {
    user_id: string
    id: string
    payload: UpdateBloodInventoryThresholdReqBody
  }) {
    // Tìm threshold theo id
    const threshold = await databaseService.bloodInventoryThreshold.findOne({
      _id: new ObjectId(id)
    })

    if (!threshold) {
      throw new ErrorWithStatus({
        message: BLOOD_MESSAGES.BLOOD_INVENTORY_THRESHOLD_NOT_FOUND,
        status: HTTP_STATUS.NOT_FOUND
      })
    }

    // Lấy tồn kho từ blood_units để tính is_stable
    const bloodUnits = await databaseService.bloodUnits
      .find({
        blood_group_id: threshold.blood_group_id,
        blood_component_id: threshold.blood_component_id,
        status: BloodUnitStatus.Available
      })
      .toArray()

    const totalUnits = bloodUnits.length
    const totalVolume = bloodUnits.reduce((sum, unit) => sum + (unit.volume || 0), 0)

    // Xác định trạng thái ổn định
    const isStable = totalUnits > payload.threshold_unit_stable

    // Cập nhật threshold
    const result = await databaseService.bloodInventoryThreshold.findOneAndUpdate(
      { _id: threshold._id },
      {
        $set: {
          threshold_unit_stable: payload.threshold_unit_stable,
          threshold_unit: totalUnits,
          threshold_volume_ml: totalVolume,
          updated_by: new ObjectId(user_id),
          updated_at: new Date(),
          is_stable: isStable
        }
      },
      { returnDocument: 'after' }
    )

    return result
  }
}

const bloodInventoryThresholdService = new BloodInventoryThresholdService()
export default bloodInventoryThresholdService
