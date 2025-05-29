import { ObjectId } from "mongodb";
interface DonationRequestProcessType {
    _id?: ObjectId
    userId: ObjectId
    donationRegistrationId?: ObjectId
    volumeCollected?: number
    status: string
    donationDate?: Date
    createdDate: Date
    updatedDate: Date
    description?: string
}  
export default class DonationRequestProcess {
    _id?: ObjectId
    userId: ObjectId
    donationRegistrationId?: ObjectId
    volumeCollected?: number
    status: string
    donationDate?: Date
    createdDate: Date
    updatedDate: Date
    description?: string
    constructor(donationRequestProcess: DonationRequestProcessType) {
        const date = new Date()
        this._id = donationRequestProcess._id
        this.userId = donationRequestProcess.userId   
        this.donationRegistrationId = donationRequestProcess.donationRegistrationId
        this.volumeCollected = donationRequestProcess.volumeCollected
        this.status = donationRequestProcess.status
        this.donationDate = donationRequestProcess.donationDate || date
        this.createdDate = donationRequestProcess.createdDate || date
        this.updatedDate = donationRequestProcess.updatedDate || date
        this.description = donationRequestProcess.description
    }
}
      
