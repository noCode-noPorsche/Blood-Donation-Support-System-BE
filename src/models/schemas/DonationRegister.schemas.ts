import { ObjectId } from "mongodb";
interface DonationRegisterType {
    _id?: ObjectId
    userId: ObjectId
    status: string
    bloodGroupId: ObjectId
    bloodComponentId: ObjectId
    created_date: Date
    updated_date: Date
    startDateDonation: Date
}  
export default class DonationRegister {
    _id?: ObjectId
    userId: ObjectId
    status: string
    bloodGroupId: ObjectId
    bloodComponentId: ObjectId
    created_date: Date
    updated_date: Date
    startDateDonation: Date
    constructor(donationRegister: DonationRegisterType) {
        const date = new Date()
        this._id = donationRegister._id
        this.userId = donationRegister.userId   
        this.status = donationRegister.status
        this.bloodGroupId = donationRegister.bloodGroupId
        this.bloodComponentId = donationRegister.bloodComponentId
        this.created_date = donationRegister.created_date || date
        this.updated_date = donationRegister.updated_date || date
        this.startDateDonation = donationRegister.startDateDonation || date
    }
}
      
