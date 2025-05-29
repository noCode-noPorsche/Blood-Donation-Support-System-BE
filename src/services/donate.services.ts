import { ObjectId } from "mongodb"
import DonationRegister from "~/models/schemas/DonationRegister.schemas"
import DonationRequestProcess from "~/models/schemas/DonationRequestProcess.chemas"
import databaseService from "./database.services"

class DonationService {
  async registration(user_id: string,blood_group_id : string, blood_component_id: string) {
    let parsedUserId: ObjectId
    let parsedBloodGroupId: ObjectId
    let parsedBloodComponentId: ObjectId

    try {
      parsedUserId = new ObjectId(user_id)
      parsedBloodGroupId = new ObjectId(blood_group_id)
      parsedBloodComponentId = new ObjectId(blood_component_id)
    } catch (err) {
      return false;
    }
    const donationRegister = {
      userId: new ObjectId(parsedUserId),
      status: "pending",
      bloodGroupId: new ObjectId(parsedBloodGroupId), 
      bloodComponentId: new ObjectId(parsedBloodComponentId), 
      created_date: new Date(),
      updated_date: new Date(),
      startDateDonation: new Date() 
    }

    const resultRegist = await databaseService.donationRegistrations.insertOne({
      ...donationRegister
    })
    const donationRequestProcess = {
      userId: new ObjectId(parsedUserId),
      donationRegistrationId: resultRegist.insertedId,
      volumeCollected: 0,
      status: "pending",
      donationDate: new Date(),
      createdDate: new Date(),
      updatedDate: new Date(),
      description: "Donation registration process started"
    }
    

    const resultProcess = await databaseService.donationRequestProcess.insertOne({
      ...donationRequestProcess
    })
    return {
      donationRegistrationId: resultRegist.insertedId,
      donationRequestProcessId: resultProcess.insertedId
    }
  }
  async getDonationRegisters() {
    const donationHistory = await databaseService.donationRegistrations.find({}).toArray()
    return donationHistory.map((donation: any) => new DonationRegister(donation))
  }
  async getDonationRegister(donationRegisterId: string) {
    
    let parsedDonationRegisterId: ObjectId
    try {
      parsedDonationRegisterId = new ObjectId(donationRegisterId)
    } catch (err) {
      return false;
    }
    const donationRegister = await databaseService.donationRegistrations.findOne({ _id: parsedDonationRegisterId })
    if (!donationRegister) {
      return null
    }
    return new DonationRegister(donationRegister)
  }

  async updateDonationRegistration(
  id: string,
  updateData: Partial<Omit<DonationRegister, '_id' | 'userId' | 'created_date'>> // chỉ cho phép cập nhật một phần, trừ các trường không nên thay đổi
) {
  let parsedId: ObjectId
  try {
    parsedId = new ObjectId(id)
  } catch (err) {
    return null
  }

  // Bổ sung updated_date
  const updatedFields = {
    ...updateData,
    updated_date: new Date()
  }

  const result = await databaseService.donationRegistrations.findOneAndUpdate(
    { _id: parsedId },
    { $set: updatedFields },
    { returnDocument: 'after' }
  )

  if (!result) {
    return null
  }

  return new DonationRegister(result)
}
  async deleteDonationRegistration(id: string) {
    let parsedId: ObjectId
    try {
      parsedId = new ObjectId(id)
    } catch (err) {
      return false;
    }
    const deletedRegistration = await databaseService.donationRegistrations.findOneAndDelete({ _id: parsedId })
    if (!deletedRegistration) {
      return null
    }
    return new DonationRegister(deletedRegistration)
  }
  async getDonationRequestProcesses() {
    const donationRequestProcesses = await databaseService.donationRequestProcess.find({}).toArray()
    return donationRequestProcesses.map((process: any) => new DonationRequestProcess(process))
  }
  async getDonationRequestProcess(donationRequestProcessId: string) {
    let parsedDonationRequestProcessId: ObjectId
    try {
      parsedDonationRequestProcessId = new ObjectId(donationRequestProcessId)
    } catch (err) {
      return false;
    }
    const donationRequestProcess = await databaseService.donationRequestProcess.findOne({ _id: parsedDonationRequestProcessId })
    if (!donationRequestProcess) {
      return null
    }
    return new DonationRequestProcess(donationRequestProcess)
  }
  async updateDonationRequestProcess(
    id: string,
    updateData: {
      status?: string
      volumeCollected?: number
      donationDate?: Date
      description?: string
    }
  ) {
    let parsedId: ObjectId
    try {
      parsedId = new ObjectId(id)
    } catch (err) {
      return null
    }

    const result = await databaseService.donationRequestProcess.findOneAndUpdate(
      { _id: parsedId },
      {
        $set: {
          ...updateData,
          updatedDate: new Date()
        }
      },
      { returnDocument: 'after' } 
    )

    return result || null 
  }
  async deleteDonationRequestProcess(id: string) {
    let parsedId: ObjectId
    try {
      parsedId = new ObjectId(id)
    } catch (err) {
      return false;
    }
    const deletedProcess = await databaseService.donationRequestProcess.findOneAndDelete({ _id: parsedId })
    if (!deletedProcess) {
      return null
    }
    return new DonationRequestProcess(deletedProcess)
  }
  
}
const donationService = new DonationService()
export default donationService;