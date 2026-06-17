import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';

async function checkUser() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Connected to DB');
  
  const users = await User.find({});
  console.log(`Found ${users.length} users`);
  
  for (const user of users) {
    console.log(`User: ${user.email}, Name: ${user.fullName}`);
    console.log('Emergency Contacts:', user.emergencyContacts);
  }
  
  process.exit(0);
}

checkUser().catch(console.error);
