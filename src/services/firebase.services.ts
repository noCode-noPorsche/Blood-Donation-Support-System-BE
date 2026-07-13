import admin from 'firebase-admin'
import envConfig from '~/config'

// 1. Đọc chuỗi string JSON từ biến môi trường
const serviceAccountRaw = envConfig.FIREBASE_SERVICE_ACCOUNT

if (!serviceAccountRaw) {
  throw new Error('❌Biến môi trường FIREBASE_SERVICE_ACCOUNT!')
}

// 2. Parse chuỗi string ngược thành Object JSON
const serviceAccount = JSON.parse(serviceAccountRaw)

// 3. Khởi tạo Admin SDK (Giữ nguyên logic cũ của bạn)
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
  })
}

export default admin
