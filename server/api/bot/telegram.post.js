import TelegramBot from 'node-telegram-bot-api';
import useFirebaseServer from '@/composables/useFirebaseServer.js';

const { db, getAuth } = useFirebaseServer();
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

// Set the webhook URL
const webhookUrl = `https://60de-165-73-223-224.ngrok-free.app/api/bot/telegram`;
bot.setWebHook(webhookUrl);

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;

  console.log(chatId)
  console.log(telegramId)

  // Check if user is already linked
  const isLinked = await checkIfUserIsLinked(telegramId);

  if (isLinked) {
    bot.sendMessage(chatId, "You're already logged in! Use /help to see available commands.");
  } else {
    const loginLink = await generateLoginLink(telegramId);
    bot.sendMessage(
      chatId,
      `Welcome to Tap2Go! 🚍\nTo get started, please log in using the link below:\n\n ${loginLink}`
    );
  }
});


export default defineEventHandler(async (event) => {
  const body = await readBody(event); 
  

  // Process Telegram updates
  bot.processUpdate(body);

  // bot.onText(/\/help/, (msg) => {
  //   const chatId = msg.chat.id;
  //   bot.sendMessage(chatId, "Available commands:\n- /start: Start the bot\n- /help: Show this help message\n- /balance: Check your balance");
  // });

  // bot.onText(/\/balance/, async (msg) => {
  //   const chatId = msg.chat.id;
  //   const telegramId = msg.from.id;

  //   const isLinked = await checkIfUserIsLinked(telegramId);
  //   if (!isLinked) {
  //     bot.sendMessage(chatId, "You need to log in first. Use /start to get started.");
  //     return;
  //   }

  //   const balance = await getUserBalance(telegramId);
  //   bot.sendMessage(chatId, `Your current balance is: ₦${balance}`);
  // });

});

// Check if the user is linked to a Tap2Go account
async function checkIfUserIsLinked(telegramId) {
  // const userDoc = await db.collection('users').doc(telegramId).get();
  return false;
}

// // Generate a login link for the user
async function generateLoginLink(telegramId) {
  const auth = getAuth();
  const customToken = await auth.createCustomToken("22n0neRrR7cAYoV44E8cYWjMpt9eB3");
  const loginUrl = `https://localhost:3000/login?token=${customToken}`;
  return loginUrl;
}

// // Get the user's balance from the database
// async function getUserBalance(telegramId) {
//   const userDoc = await db.collection('users').doc(telegramId).get();
//   if (!userDoc.exists) {
//     throw new Error("User not found");
//   }
//   const userData = userDoc.data();
//   return userData.balance || 0;
// }
