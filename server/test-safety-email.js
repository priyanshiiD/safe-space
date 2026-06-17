import 'dotenv/config';
import mongoose from 'mongoose';
import User from './models/User.js';
import { sendEmergencyAlertEmail } from './utils/sendgrid.js';

async function testSafetyEmail() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to DB');
    
    const user = await User.findOne({ email: 'dawarpriyanshii@gmail.com' });
    if (!user) {
      console.log('User not found');
      process.exit(1);
    }
    
    console.log('Found user:', user.fullName);

    const contactEmails = (user.emergencyContacts || [])
      .filter((contact) => contact.email)
      .map((contact) => ({
        name: contact.name,
        email: contact.email,
        phone: contact.phone
      }));

    console.log('Contacts to email:', contactEmails);

    if (contactEmails.length > 0) {
      const coordinates = [77.2090, 28.6139]; // Dummy coords
      const address = "Test Address 123";
      
      const mapsLink = `https://www.google.com/maps?q=${coordinates[1]},${coordinates[0]}`;
      const subject = 'SOS Alert: Immediate assistance needed';
      const text = `${user.fullName} has triggered an SOS alert.\n\nLocation: ${mapsLink}\n\nAddress: ${address}`;
      const html = `
        <p><strong>${user.fullName}</strong> has triggered an SOS alert.</p>
        <p>Address: ${address}</p>
        <p><a href="${mapsLink}">View live location</a></p>
      `;

      for (const contact of contactEmails) {
        console.log(`Sending to ${contact.email}...`);
        try {
            await sendEmergencyAlertEmail({
                to: contact.email,
                subject,
                text,
                html
            });
            console.log('Successfully sent to:', contact.email);
        } catch (error) {
            console.error('SendGrid Error details for', contact.email, ':');
            if (error.response) {
            console.error(JSON.stringify(error.response.body, null, 2));
            } else {
            console.error(error.message);
            }
        }
      }
    } else {
        console.log('No valid emergency contacts with email addresses found.');
    }
    process.exit(0);
  } catch (err) {
    console.error('Script Error:', err);
    process.exit(1);
  }
}

testSafetyEmail();
