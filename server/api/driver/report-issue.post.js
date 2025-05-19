import { Timestamp } from 'firebase-admin/firestore';
import useFirebaseServer from '~/composables/useFirebaseServer.js'; // Adjusted path for server routes

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    const { driverUid, reportText } = body;

    if (!driverUid || !reportText) {
      return createError({
        statusCode: 400,
        statusMessage: 'Bad Request: Missing driverUid or reportText',
      });
    }

    // Validate reportText length or content if necessary
    if (reportText.trim().length < 10) { // Example validation
        return createError({
            statusCode: 400,
            statusMessage: 'Bad Request: Report text is too short.',
          });
    }

    const { db } = useFirebaseServer(); // Get db instance

    // Store the report in Firestore
    const issueReportRef = await db.collection('issueReports').add({
      driverUid,
      reportText,
      timestamp: Timestamp.now(), // Using Admin SDK Timestamp
      status: 'new', // Default status
    });

    // Email sending logic is on HOLD as per requirements.
    // If implemented, it would go here.
    // e.g., await sendEmail({ to: 'company@example.com', subject: 'New Issue Report', text: `...` });

    return {
      success: true,
      message: 'Issue reported successfully.',
      reportId: issueReportRef.id,
    };

  } catch (error) {
    console.error('Error in report-issue endpoint:', error);
    return createError({
      statusCode: 500,
      statusMessage: 'Internal Server Error: Could not process the report.',
      data: error.message, // Optionally send back error details in dev
    });
  }
});
