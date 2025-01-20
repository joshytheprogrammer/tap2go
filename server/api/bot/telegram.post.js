import TelegramBot from 'node-telegram-bot-api';
import useFirebaseServer from '@/composables/useFirebaseServer.js';

const { db } = useFirebaseServer();
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN);

// Set the webhook URL
const webhookUrl = process.env.TELEGRAM_API_DOMAIN;
bot.setWebHook(webhookUrl);

bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const telegramUserId = msg.from.id;
  const telegramUsername = msg.chat.username || ''; // Optional username

  try {
    // Step 1: Check if the Telegram account is already linked
    const linkedUserId = await findLinkedUserId(telegramUserId);

    if (linkedUserId) {
      // Telegram account is already linked
      // Display options
      bot.sendMessage(chatId, `Welcome back, ${telegramUsername}! What would you like to do?`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Check balance", callback_data: "check_balance" }],
            [{ text: "Check transaction history", callback_data: "view_transactions" }],
          ],
        },
      });
      return;
    }

    // Step 2: Extract UID from the /start message
    const userUID = extractUIDFromStartMessage(msg.text);
    if (!userUID) {
      bot.sendMessage(chatId, "Failed to link. Please try again through the app/website.");
      bot.sendMessage(chatId, "You need to link your Tap2Go Account to your Telegram Number to continue:", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "Link Profile", url: "https://tap2go.joshytheprogrammer.com/profile" }],
          ],
        },
      });
      return;
    }

    // Step 3: Link the Telegram account
    await linkTelegramAccount(userUID, telegramUserId);
    bot.sendMessage(chatId, "Your Telegram account has been successfully linked!");
  } catch (error) {
    console.error('Error processing /start command:', error);
    bot.sendMessage(chatId, 'An error occurred while processing your request. Please try again later.');
  }
});

// Handle callback queries for inline buttons
bot.on('callback_query', async (callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const telegramUserId = callbackQuery.from.id;
  const data = callbackQuery.data;

  try {
    const userUID = await findLinkedUserId(telegramUserId);

    if (!userUID) {
      bot.sendMessage(chatId, "User not linked. Please link your account first.");
      return;
    }

    switch (data) {
      case 'check_balance':
        const balance = await fetchUserBalance(userUID);
        bot.sendMessage(chatId, `Your current balance is: ₦<b>${balance}</b>`,
          {
            parse_mode: 'HTML', 
          }
        );
        break;

      case 'view_transactions':
        let transactions = await fetchTransactionHistory(userUID);
        transactions = transactions.sort(
          (a, b) => b.createdAt.toDate() - a.createdAt.toDate()
        );
        
        if (transactions.length === 0) {
          bot.sendMessage(chatId, "No transactions found.");
        } else {
          const transactionDetails = transactions
          .map((txn, index) => {
            const date = txn.createdAt.toDate();
            const formattedDate = date.toLocaleString('en-GB', {
              weekday: 'short', 
              day: 'numeric',
              month: 'short', 
              year: 'numeric', 
              hour: 'numeric',
              minute: 'numeric', 
              hour12: true, 
            });
            return `${index + 1}. Date: <b>${formattedDate}</b>, Amount: ₦<b>${txn.amount.toLocaleString()}</b>`;
          })
          .join('\n');

          bot.sendMessage(
            chatId,
            `Your Transactions:\n\n${transactionDetails}`,
            {
              parse_mode: 'HTML', 
            }
          );
        }
        break;

      default:
        bot.sendMessage(chatId, "Invalid option selected.");
    }
  } catch (error) {
    console.error('Error handling callback query:', error);
    bot.sendMessage(chatId, 'An error occurred. Please try again later.');
  }
});

// Fetch user balance from Firestore
async function fetchUserBalance(userUID) {
  try {
    const userDoc = await db.collection('users').doc(userUID).get();
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    return userDoc.data().balance || 0;
  } catch (error) {
    console.error('Error fetching user balance:', error);
    throw error;
  }
}

// Fetch transaction history from Firestore
async function fetchTransactionHistory(userUID) {
  try {
    const querySnapshot = await db
      .collection('transactions')
      .where('uid', '==', userUID)
      .get();

    return querySnapshot.docs.map((doc) => doc.data());
  } catch (error) {
    console.error('Error fetching transaction history:', error);
    throw error;
  }
}


async function linkTelegramAccount(userUID, telegramUserId) {
  try {
    await db.collection('userProfile').doc(userUID).update({
      telegramAccount: telegramUserId
    });
  } catch (error) {
    throw new Error('Error updating Firestore');
  }
}

// Find the `userID` linked to the Telegram account
async function findLinkedUserId(telegramUserId) {
  try {
    const querySnapshot = await db
      .collection('userProfile')
      .where('telegramAccount', '==', telegramUserId)
      .get();

    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return doc.id; // The `userID` is the document ID
    }
    return null; // No linked user found
  } catch (error) {
    console.error('Error finding linked user ID:', error);
    throw error;
  }
}

function extractUIDFromStartMessage(text) {
  // Example: Parse UID from '/start <UID>'
  const parts = text.split(' ');
  return parts.length > 1 ? parts[1] : null;
}

// Handle Telegram webhook updates
export default defineEventHandler(async (event) => {
  const body = await readBody(event);

  try {
    // Process Telegram updates
    bot.processUpdate(body);
  } catch (error) {
    console.error('Error processing Telegram webhook update:', error);
  }
});
