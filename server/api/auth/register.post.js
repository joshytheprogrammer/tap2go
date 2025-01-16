import useFirebaseServer from '@/composables/useFirebaseServer.js';
import { Timestamp } from 'firebase-admin/firestore';

export default defineEventHandler(async (event) => {
  const rawBody = await readBody(event);

  const { db } = useFirebaseServer();

  try {
    await db.collection('users').doc(rawBody.uid).set({
      email: rawBody.email,
      matric: rawBody.matric,
      balance: 0,
      cardId: null,
      createdAt: Timestamp.fromDate(new Date()),
    });

    await db.collection('userProfile').doc(rawBody.uid).set({
      name: '',
      profilePicture: '',
      telegramNumber: ''
    });

    return new Response("User data stored successfully", { status: 201 });
  } catch (error) {
    console.error("An error occurred while processing the request:", error);
    return new Response(error.message, { status: 400 });
  }
});
