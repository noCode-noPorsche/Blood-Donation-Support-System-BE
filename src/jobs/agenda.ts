// src/jobs/agenda.ts
import { Agenda } from 'agenda'
import { config } from 'dotenv'
config()

const mongoUri = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@blooddonation.mfyc9dy.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority&appName=BloodDonation`

const agenda = new Agenda({
  db: { address: mongoUri, collection: 'agendaJobs' }, // dùng chung MongoDB
  processEvery: '30 seconds'
})

export default agenda
