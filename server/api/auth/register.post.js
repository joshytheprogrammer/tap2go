import { Timestamp } from 'firebase-admin/firestore'; // Added for Admin SDK
import useFirebaseServer from '@/composables/useFirebaseServer.js'; // Changed import

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { uid, name, matricNumber, email, cardSerialNumber } = body;

  if (!uid || !name || !matricNumber || !email) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Missing required fields (uid, name, matricNumber, email).' }),
    };
  }

  const { db, auth } = useFirebaseServer();

  // Validate matric number format (example)
  const matricRegex = /^\d{2}[A-Za-z]{2}\d{6}$/;
  if (!matricRegex.test(matricNumber)) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid matric number format.' }),
    };
  }

  // Validate email domain (example)
  if (!email.endsWith('@stu.cu.edu.ng')) {
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid email domain. Must be @stu.cu.edu.ng.' }),
    };
  }

  try {
    // The user is already created in Firebase by the frontend.
    // This backend endpoint is now primarily for storing additional user details
    // in your own database (e.g., Firestore, PostgreSQL, etc.) linked to the Firebase UID.

    // Example: Storing user data in Firestore (assuming you have a 'students' collection)
    // import { adminDb } from '~/server/utils/firebaseAdmin'; // Assuming adminDb is your Firestore instance
    // await adminDb.collection('students').doc(uid).set({
    //   name,
    //   matricNumber,
    //   email,
    //   cardSerialNumber, // Optional, if you store it
    //   createdAt: new Date(),
    //   emailVerified: false, // Firebase Auth handles actual email verification status
    // });

    // For now, let's assume you are just confirming the data received
    // and would perform database operations here.

    console.log(`Student data received for UID ${uid}:`, { name, matricNumber, email, cardSerialNumber });

    // Since user creation and email verification are handled by Firebase client SDK,
    // this endpoint's role changes. It might not need to return a full user object
    // or token unless you have specific reasons (e.g., custom session management).

    return {
      statusCode: 201, // Or 200 if you're just updating/confirming data
      body: JSON.stringify({ 
        message: 'Student data received and processed successfully.', 
        uid: uid, 
        // emailVerified: false // Client will handle verification flow
      }),
    };

  } catch (error) {
    console.error('Error in student registration backend:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: error.message || 'Internal Server Error' }),
    };
  }
});
