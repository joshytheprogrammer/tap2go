import { Timestamp } from 'firebase-admin/firestore';
import useFirebaseServer from '@/composables/useFirebaseServer.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { driverUid, amount } = body;

    if (!driverUid || !amount) {
      return { 
        statusCode: 400, 
        body: { message: 'Missing required fields: driverUid and amount are required.' } 
      };
    }

    // Validate amount is a number greater than 1000
    const amountNum = Number(amount);
    if (isNaN(amountNum) || amountNum < 1000) {
      return { 
        statusCode: 400, 
        body: { message: 'Invalid amount. Must be a number greater than or equal to 1000.' } 
      };
    }

    const { db } = useFirebaseServer();

    // 1. Get driver's current balance
    const driverRef = db.collection('drivers_users').doc(driverUid);
    const driverDoc = await driverRef.get();

    if (!driverDoc.exists) {
      return { 
        statusCode: 404, 
        body: { message: 'Driver not found.' } 
      };
    }

    const driverData = driverDoc.data();
    const currentBalance = driverData.balance || 0;

    // 2. Check if balance is sufficient
    if (amountNum > currentBalance) {
      return { 
        statusCode: 400, 
        body: { message: 'Insufficient balance for withdrawal.' } 
      };
    }

    // 3. Check if driver has bank details
    const profileRef = db.collection('driverProfile').doc(driverUid);
    const profileDoc = await profileRef.get();

    if (!profileDoc.exists) {
      return { 
        statusCode: 400, 
        body: { message: 'Driver profile not found. Please complete your profile first.' } 
      };
    }

    const profileData = profileDoc.data();
    if (!profileData.bankName || !profileData.accountNumber) {
      return { 
        statusCode: 400, 
        body: { message: 'Bank details not found. Please add your bank details in your profile.' } 
      };
    }

    // 4. Check if there's already a pending withdrawal request
    const withdrawalQuerySnapshot = await db.collection('driversWithdrawalRequests')
      .where('driverUid', '==', driverUid)
      .where('status', '==', 'pending')
      .get();

    if (!withdrawalQuerySnapshot.empty) {
      return { 
        statusCode: 400, 
        body: { message: 'You already have a pending withdrawal request.' } 
      };
    }

    // 5. Create withdrawal request
    const timestamp = Timestamp.now();
    const withdrawalRequest = {
      driverUid,
      amount: amountNum,
      bankName: profileData.bankName,
      accountNumber: profileData.accountNumber,
      status: 'pending',
      requestedAt: timestamp
    };

    const withdrawalRef = await db.collection('driversWithdrawalRequests').add(withdrawalRequest);

    // 6. Update driver's balance
    const newBalance = currentBalance - amountNum;
    await driverRef.update({ balance: newBalance });

    // 7. Create a transaction record
    const transactionRef = await db.collection('transactions').add({
      uid: driverUid,
      amount: amountNum,
      type: 'withdrawal_request',
      status: 'pending',
      withdrawalRequestId: withdrawalRef.id,
      createdAt: timestamp
    });

    return {
      statusCode: 200,
      body: {
        message: 'Withdrawal request submitted successfully.',
        withdrawalId: withdrawalRef.id,
        transactionId: transactionRef.id,
        newBalance
      }
    };
  } catch (error) {
    console.error('Error processing withdrawal request:', error);
    return {
      statusCode: 500,
      body: { message: 'Internal server error.' }
    };
  }
});
