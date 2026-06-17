import 'dotenv/config';
import mongoose from 'mongoose';
import EmergencyAlert from './models/EmergencyAlert.js';

async function checkAlerts() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');
  
  const alerts = await EmergencyAlert.find().sort({ createdAt: -1 }).limit(3);
  console.log('Latest 3 Emergency Alerts:');
  
  for (const alert of alerts) {
    console.log(`Alert ID: ${alert._id}, Created At: ${alert.createdAt}`);
    console.log(`User ID: ${alert.userId}`);
    console.log('Contacts Notified:', alert.contactsNotified);
    console.log('---');
  }
  
  process.exit(0);
}

checkAlerts().catch(console.error);
