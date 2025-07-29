import { config } from 'dotenv'
import { Collection, Db, MongoClient } from 'mongodb'
import Answer from '~/models/schemas/Answer.schemas'
import Blog from '~/models/schemas/Blog.schemas'
import BloodComponent from '~/models/schemas/BloodComponent.schemas'
import BloodGroup from '~/models/schemas/BloodGroup.schemas'
import BloodUnit from '~/models/schemas/BloodUnit.schemas'
import DonationRequestProcess from '~/models/schemas/DonationProcess.schemas'
import DonationRegistration from '~/models/schemas/DonationRegistration.schemas'
import HealthCheck from '~/models/schemas/HealthCheck'
import Notification from '~/models/schemas/Notification.schemas'
import Question from '~/models/schemas/Question.schemas'
import RefreshToken from '~/models/schemas/RefreshToken.schemas'
import RequestProcess from '~/models/schemas/RequestProcess.schemas'
import RequestProcessBlood from '~/models/schemas/RequestProcessBlood.schemas'
import RequestProcessDetail from '~/models/schemas/RequestProcessDetail.schemas'
import RequestRegistration from '~/models/schemas/RequestRegistration.schemas'
import User from '~/models/schemas/User.schemas'

config()
const uri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@blooddonation.mfyc9dy.mongodb.net/?retryWrites=true&w=majority&appName=BloodDonation`

class DatabaseService {
  private client: MongoClient
  private db: Db
  constructor() {
    this.client = new MongoClient(uri)
    this.db = this.client.db(process.env.DB_NAME)
  }
  async connect() {
    try {
      await this.db.command({ ping: 1 })
      console.log('Pinged your deployment. You successfully connected to MongoDB!')
    } catch (error) {
      console.log('Error', error)
      throw error
    }
  }

  get users(): Collection<User> {
    return this.db.collection(process.env.DB_USERS_COLLECTION as string)
  }
  get refreshToken(): Collection<RefreshToken> {
    return this.db.collection(process.env.DB_REFRESH_TOKENS_COLLECTION as string)
  }
  get bloodGroups(): Collection<BloodGroup> {
    return this.db.collection(process.env.DB_BLOOD_GROUPS_COLLECTION as string)
  }
  get bloodComponents(): Collection<BloodComponent> {
    return this.db.collection(process.env.DB_BLOOD_COMPONENTS_COLLECTION as string)
  }
  get bloodUnits(): Collection<BloodUnit> {
    return this.db.collection(process.env.DB_BLOOD_UNITS_COLLECTION as string)
  }
  get donationRegistrations(): Collection<DonationRegistration> {
    return this.db.collection(process.env.DB_DONATION_REGISTRATIONS_COLLECTION as string)
  }
  get donationProcesses(): Collection<DonationRequestProcess> {
    return this.db.collection(process.env.DB_DONATION_PROCESSES_COLLECTION as string)
  }
  get healthChecks(): Collection<HealthCheck> {
    return this.db.collection(process.env.DB_HEALTH_CHECKS_COLLECTION as string)
  }
  get requestRegistrations(): Collection<RequestRegistration> {
    return this.db.collection(process.env.DB_REQUEST_REGISTRATIONS_COLLECTION as string)
  }
  get requestProcesses(): Collection<RequestProcess> {
    return this.db.collection(process.env.DB_REQUEST_PROCESSES_COLLECTION as string)
  }
  get requestProcessDetails(): Collection<RequestProcessDetail> {
    return this.db.collection(process.env.DB_REQUEST_PROCESS_DETAILS_COLLECTION as string)
  }
  get requestProcessBloods(): Collection<RequestProcessBlood> {
    return this.db.collection(process.env.DB_REQUEST_PROCESS_BLOODS_COLLECTION as string)
  }
  get blogs(): Collection<Blog> {
    return this.db.collection(process.env.DB_BLOGS_COLLECTION as string)
  }
  get notifications(): Collection<Notification> {
    return this.db.collection(process.env.DB_NOTIFICATIONS_COLLECTION as string)
  }
  get questions(): Collection<Question> {
    return this.db.collection(process.env.DB_QUESTIONS_COLLECTION as string)
  }
  get answers(): Collection<Answer> {
    return this.db.collection(process.env.DB_ANSWERS_COLLECTION as string)
  }
}

// Tạo object từ class DatabaseService
const databaseService = new DatabaseService()
export default databaseService
