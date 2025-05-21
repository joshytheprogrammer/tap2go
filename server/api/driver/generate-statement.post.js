import useFirebaseServer from '@/composables/useFirebaseServer.js';

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { driverUid, year, month } = body;

    if (!driverUid || !year || !month) {
      return { 
        statusCode: 400, 
        body: { message: 'Missing required fields: driverUid, year, and month are required.' } 
      };
    }

    const { db } = useFirebaseServer();

    // Get driver data
    const driverProfileRef = db.collection('driverProfile').doc(driverUid);
    const driverUserRef = db.collection('drivers_users').doc(driverUid);

    const [profileDoc, userDoc] = await Promise.all([
      driverProfileRef.get(),
      driverUserRef.get()
    ]);

    if (!profileDoc.exists || !userDoc.exists) {
      return {
        statusCode: 404,
        body: { message: 'Driver not found.' }
      };
    }

    const profileData = profileDoc.data();
    const userData = userDoc.data();
    const driverEmail = userData.email;

    if (!driverEmail) {
      return {
        statusCode: 400,
        body: { message: 'Driver email not found.' }
      };
    }

    // Calculate date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59); // Last day of month

    // Get all transactions for the month
    const transactionsQuery = await db.collection('transactions')
      .where('uid', '==', driverUid)
      .where('createdAt', '>=', startDate)
      .where('createdAt', '<=', endDate)
      .get();

    // Get all withdrawals for the month
    const withdrawalsQuery = await db.collection('driversWithdrawalRequests')
      .where('driverUid', '==', driverUid)
      .where('requestedAt', '>=', startDate)
      .where('requestedAt', '<=', endDate)
      .get();

    // Process the data
    const transactions = [];
    transactionsQuery.forEach(doc => {
      transactions.push({
        id: doc.id,
        ...doc.data()
      });
    });

    const withdrawals = [];
    withdrawalsQuery.forEach(doc => {
      withdrawals.push({
        id: doc.id,
        ...doc.data()
      });
    });

    // Calculate summary statistics
    const totalEarnings = transactions
      .filter(t => t.type === 'ride_fare')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalWithdrawals = withdrawals
      .reduce((sum, w) => sum + w.amount, 0);

    // Generate a statement reference number
    const statementRef = `ST-${year}${month.toString().padStart(2, '0')}-${driverUid.slice(-6)}`;

    // In a real app, you would:
    // 1. Generate an HTML/PDF statement
    // 2. Email it to the driver
    // 3. Store a record of the statement
    
    // For this demo, we'll just simulate the above
    await db.collection('driverStatements').add({
      driverUid,
      email: driverEmail,
      year,
      month,
      statementRef,
      totalTransactions: transactions.length,
      totalWithdrawals: withdrawals.length,
      totalEarnings,
      totalWithdrawalAmount: totalWithdrawals,
      generatedAt: new Date(),
      status: 'completed' // or 'pending' if using a queue
    });

    return {
      statusCode: 200,
      body: {
        message: `Monthly statement for ${month}/${year} has been generated and sent to ${driverEmail}`,
        statementRef
      }
    };
  } catch (error) {
    console.error('Error generating monthly statement:', error);
    return {
      statusCode: 500,
      body: { message: 'Internal server error while generating statement.' }
    };
  }
});
