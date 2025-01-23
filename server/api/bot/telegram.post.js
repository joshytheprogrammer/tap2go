import TelegramBot from 'node-telegram-bot-api';
import useFirebaseServer from '@/composables/useFirebaseServer.js';
import { useRuntimeConfig } from '#imports';

const { db } = useFirebaseServer();
const config = useRuntimeConfig();

const bot = new TelegramBot(config.telegramBotToken);

// Initialize error logging collection
const errorLogs = db.collection('telegramBotErrorLogs');

// Add verification before setting webhook
if (!config.telegramBotToken || !config.telegramApiDomain) {
  throw createError({
    statusCode: 500,
    message: 'Missing Telegram configuration'
  });
}

// Configure webhook using runtime config
const webhookUrl = config.telegramApiDomain;
bot.setWebHook(webhookUrl);

// Add health check endpoint
bot.onText(/\/ping/, (msg) => {
  bot.sendMessage(msg.chat.id, '🏓 Pong! Webhook active');
});

// Cache frequently accessed documents
const userProfileCache = new Map();
const userCache = new Map();

// Error logging utility
async function logError(error, context = {}) {
  // Sanitize context to remove undefined values
  const sanitizedContext = Object.entries(context).reduce((acc, [key, value]) => {
    acc[key] = value === undefined ? null : value;
    return acc;
  }, {});

  const errorData = {
    timestamp: new Date().toISOString(),
    error: {
      message: error.message,
      stack: error.stack,
      code: error.code || 'N/A',
    },
    context: sanitizedContext,
  };

  try {
    await errorLogs.add(errorData);
  } catch (logError) {
    console.error('Failed to log sanitized error:', logError);
  }
}

// Optimized Firebase operations
async function cachedUserProfileLookup(telegramUserId) {
  if (userProfileCache.has(telegramUserId)) {
    return userProfileCache.get(telegramUserId);
  }

  try {
    const snapshot = await db.collection('userProfile')
      .where('telegramAccount', '==', telegramUserId)
      .limit(1)
      .get();

    const result = snapshot.empty ? null : snapshot.docs[0].id;
    userProfileCache.set(telegramUserId, result);
    return result;
  } catch (error) {
    await logError(error, { operation: 'userProfileLookup', telegramUserId });
    throw error;
  }
}

// Handle /start command
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const telegramUserId = msg.from.id;
  const telegramUsername = msg.chat.username || '';
  
  try {
    const linkedUserId = await cachedUserProfileLookup(telegramUserId);

    if (linkedUserId) {
      try {
        const [balance, transactions] = await Promise.all([
          fetchUserBalance(linkedUserId),
          fetchRecentTransactions(linkedUserId)
        ]);
    
        const transactionSummary = transactions
          .slice(0, 5)
          .map((txn, index) => {
            const date = txn.createdAt.toLocaleString('en-GB', {
              day: 'numeric',
              month: 'short',
              hour: 'numeric',
              minute: 'numeric',
              hour12: true
            });
            return `${index + 1}. ${date} - ₦${txn.amount.toLocaleString()}`;
          })
          .join('\n');
    
        const message = `Welcome back, ${telegramUsername}! Here's your account summary:\n\n` +
          `💰 Balance: ₦${balance.toLocaleString()}\n\n` +
          `📝 Recent Transactions:\n${transactionSummary}\n\n` +
          `What would you like to do next?`;
    
        await bot.sendMessage(chatId, message, {
          parse_mode: 'HTML',
          reply_markup: {
            inline_keyboard: [
              [{ text: "Refresh Balance", callback_data: "check_balance" }],
              [{ text: "View All Transactions", callback_data: "view_transactions" }],
              [{ text: "Get Help", callback_data: "help" }]
            ],
          },
        });
    
        await db.collection('userProfile').doc(linkedUserId).update({
          lastActive: new Date()
        });
    
        return;
      } catch (error) {
        await logError(error, { context: 'linkedUserWelcome', linkedUserId, chatId });
        await bot.sendMessage(chatId, 
          "We're having trouble loading your account details. Please try again later.",
          { reply_markup: { inline_keyboard: [[{ text: "Try Again", callback_data: "retry_welcome" }]] } }
        );
        return;
      }
    }

    const userUID = msg.text.split(' ')[1]?.trim();
    
    if (!userUID) {
      bot.sendMessage(chatId, "Failed to link. Please try again through the app/website.");
      bot.sendMessage(chatId, "You need to link your Tap2Go Account to your Telegram Number to continue:", {
        reply_markup: { inline_keyboard: [[{ text: "Link Profile", url: "https://tap2go.joshytheprogrammer.com/profile" }]] },
      });
      return;
    }

    await linkTelegramAccount(userUID, telegramUserId);
    userProfileCache.delete(telegramUserId);
    bot.sendMessage(chatId, "Account linked successfully!");
  } catch (error) {
    await logError(error, { command: '/start', chatId, telegramUserId });
    bot.sendMessage(chatId, 'Service unavailable. Our team has been notified.');
  }
});

// Handle inline button callbacks
bot.on('callback_query', async (callbackQuery) => {
  await bot.answerCallbackQuery(callbackQuery.id);

  const chatId = callbackQuery.message.chat.id;
  const telegramUserId = callbackQuery.from.id;
  const data = callbackQuery.data;

  try {
    const userUID = await cachedUserProfileLookup(telegramUserId);

    if (!userUID) {
      await bot.sendMessage(chatId, "User not linked. Please link your account first.");
      return;
    }

    switch (data) {
      case 'check_balance':
        const balance = await fetchUserBalance(userUID);
        await bot.sendMessage(chatId, `Your current balance: ₦<b>${balance.toLocaleString()}</b>`, {
          parse_mode: 'HTML'
        });
        break;

      case 'view_transactions':
        const transactions = await fetchRecentTransactions(userUID);
        if (transactions.length === 0) {
          await bot.sendMessage(chatId, "No transactions found.");
          break;
        }

        const transactionDetails = transactions
          .map((txn, index) => {
            const date = txn.createdAt.toLocaleString('en-GB', {
              weekday: 'short', 
              day: 'numeric',
              month: 'short', 
              year: 'numeric', 
              hour: 'numeric',
              minute: 'numeric', 
              hour12: true, 
            });
            return `${index + 1}. Date: <b>${date}</b>, Amount: ₦<b>${txn.amount.toLocaleString()}</b>`;
          })
          .join('\n');

        await bot.sendMessage(chatId, `Your Transactions:\n\n${transactionDetails}`, {
          parse_mode: 'HTML'
        });
        break;

      case 'retry_welcome':
        await bot.deleteMessage(chatId, callbackQuery.message.message_id);
        bot.emit('text', { chat: { id: chatId }, from: { id: telegramUserId }, text: '/start' });
        break;

      case 'help':
        await bot.sendMessage(chatId, "Need help? Contact support@tap2go.com");
        break;

      default:
        await bot.sendMessage(chatId, "Invalid option selected.");
    }
  } catch (error) {
    await logError(error, {
      context: 'callbackHandler',
      callbackData: data,
      chatId,
      telegramUserId
    });
    await bot.sendMessage(chatId, "An error occurred. Please try again.");
  }
});


// Firebase data functions
async function fetchRecentTransactions(userUID, limit = 10) {
  try {
    const snapshot = await db.collection('transactions')
      .where('uid', '==', userUID)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map(doc => ({
      ...doc.data(),
      createdAt: doc.data().createdAt.toDate()
    }));
  } catch (error) {
    await logError(error, { function: 'fetchRecentTransactions', userUID });
    throw error;
  }
}

async function fetchUserBalance(userUID) {
  if (userCache.has(userUID)) return userCache.get(userUID).balance;

  try {
    const doc = await db.collection('users').doc(userUID).get();
    if (!doc.exists) throw new Error('User not found');
    
    const userData = doc.data();
    userCache.set(userUID, userData);
    return userData.balance || 0;
  } catch (error) {
    await logError(error, { function: 'fetchUserBalance', userUID });
    throw error;
  }
}

async function linkTelegramAccount(userUID, telegramUserId) {
  const batch = db.batch();
  const profileRef = db.collection('userProfile').doc(userUID);

  batch.update(profileRef, { 
    telegramAccount: telegramUserId,
    linkedAt: new Date()
  });

  try {
    await batch.commit();
    userProfileCache.set(telegramUserId, userUID);
  } catch (error) {
    await logError(error, { function: 'linkTelegramAccount', userUID, telegramUserId });
    throw error;
  }
}

if (import.meta.env.DEV) {
  bot.onText(/\/healthcheck/, (msg) => {
    bot.sendMessage(msg.chat.id, 'Bot is operational ✅');
  });
}

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event);
    await bot.processUpdate(body);
  } catch (error) {
    await logError(error, {
      handler: 'webhook',
      body: safeStringify(event.body), // Use safe stringify
      headers: safeStringify(event.headers) // Handle undefined headers
    });
  }
});

function safeStringify(obj) {
  try {
    if (typeof obj === 'undefined') return null;
    return JSON.stringify(obj, (key, value) => 
      typeof value === 'undefined' ? null : value
    );
  } catch (e) {
    return 'unserializable-value';
  }
}
