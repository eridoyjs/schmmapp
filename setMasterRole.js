// Firebase Admin SDK লোড করা
const admin = require('firebase-admin');

// সার্ভিস একাউন্ট ফাইল লোড
const serviceAccount = require('./serviceAccountKey.json');

// Firebase প্রজেক্টে কানেক্ট করা
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Master ইউজারের UID
const MASTER_USER_UID = '4KFDM0C1VNg2Cn7TOTaFwjVB0AK2';

// Master রোল সেট করা
admin.auth().setCustomUserClaims(MASTER_USER_UID, { role: 'master' })
  .then(() => {
    console.log('✅ Master role set successfully!');
  })
  .catch(error => {
    console.error('❌ Error setting role:', error);
  });
