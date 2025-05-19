import { Timestamp } from 'firebase-admin/firestore';
import useFirebaseServer from '@/composables/useFirebaseServer.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { email, password, licensePlate, name, phoneNumber } = body;

    if (!email || !password || !licensePlate || !name || !phoneNumber) {
      return { statusCode: 400, body: { message: 'Missing required fields.' } };
    }

    const { db, auth } = useFirebaseServer();

    // 1. Create user with Firebase Admin Auth
    const userRecord = await auth.createUser({
      email: email,
      password: password,
      displayName: name, 
    });
    
    const user = { uid: userRecord.uid }; // Keep similar structure for subsequent logic

    if (user.uid) {
      // 2. Create a document in drivers_users collection
      const driverUserRef = db.collection('drivers_users').doc(user.uid);
      await driverUserRef.set({
        uid: user.uid,
        email: email,
        licensePlate: licensePlate,
        role: 'driver',
        balance: 0,
        createdAt: Timestamp.fromDate(new Date()), // Changed to Admin SDK Timestamp
      });

      // 3. Create a document in driversProfile collection
      const driverProfileRef = db.collection('driversProfile').doc(user.uid);
      await driverProfileRef.set({
        uid: user.uid,
        name: name,
        phoneNumber: phoneNumber,
        licensePlate: licensePlate, // Storing for easier lookup if needed
        bankName: '',
        accountNumber: '',
        profilePicture: '',
        createdAt: Timestamp.fromDate(new Date()), // Changed to Admin SDK Timestamp
      });

      return { statusCode: 201, body: { message: 'Driver registered successfully.', uid: user.uid } };
    } else {
      // This case should ideally not be reached if createUser is successful and throws on failure
      return { statusCode: 500, body: { message: 'Failed to create user in Firebase Auth.' } };
    }
  } catch (error) {
    console.error('Driver registration error:', error);
    // Adjust Firebase Admin SDK error codes
    if (error.code === 'auth/email-already-exists') { // Changed from 'auth/email-already-in-use'
      return { statusCode: 409, body: { message: 'Email already exists.' } };
    }
    if (error.code === 'auth/invalid-email') {
      return { statusCode: 400, body: { message: 'Invalid email format.' } };
    }
    // Admin SDK might use 'auth/invalid-password' or have different criteria for weak passwords
    if (error.code === 'auth/invalid-password' || error.message.includes('Password must be a string with at least 6 characters')) {
      return { statusCode: 400, body: { message: 'Password is too weak or invalid (must be at least 6 characters).' } };
    }
    // Firestore errors related to unique licensePlate (requires a server-side check or transaction)
    // This example still doesn't include a robust unique check for licensePlate before auth creation.
    return { statusCode: 500, body: { message: 'An error occurred during registration.', error: error.message } };
  }
});
