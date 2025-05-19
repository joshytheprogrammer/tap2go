<template>
  <section class="px-4 py-8">
    <h2 class="text-xl font-semibold pb-4">Last 30 Days</h2>
    
    <div class="flex justify-between gap-4">
      <!-- Cash In -->
      <div class="bg-primary-600 text-white rounded-lg w-full px-6 py-4 space-y-2 text-center">
        <p class="text-sm">Cash In</p>
        <p class="text-xl font-semibold">₦{{ cashIn.toLocaleString() }}</p>
      </div>

      <!-- Cash Out -->
      <div class="bg-yellow-500 text-white rounded-lg w-full px-6 py-4 space-y-2 text-center">
        <p class="text-sm">Cash Out</p>
        <p class="text-xl font-semibold">₦{{ cashOut.toLocaleString() }}</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { collection, query, where, onSnapshot } from 'firebase/firestore';


// Firestore setup
const db = useFirestore();
const userStore = useUserStore();
const uid = userStore.getUser;

// State variables
const cashIn = ref(0);
const cashOut = ref(0);
const loading = ref(true);
const error = ref(false);

// Fetch transactions for the last 30 days
const now = new Date();
const thirtyDaysAgo = new Date(now.setDate(now.getDate() - 30));

const unsubscribe = onSnapshot(
  query(collection(db, 'transactions'), where('uid', '==', uid)),
  (snapshot) => {
    let totalCashIn = 0;
    let totalCashOut = 0;

    snapshot.forEach((doc) => {
      const transaction = doc.data();
      const createdAt = transaction.createdAt.toDate();

      if (createdAt >= thirtyDaysAgo) {
        if (transaction.type === 'credit') {
          totalCashIn += transaction.amount;
        } else if (transaction.type === 'debit') {
          totalCashOut += transaction.amount;
        }
      }
    });

    cashIn.value = totalCashIn;
    cashOut.value = totalCashOut;
    loading.value = false;
  },
  (err) => {
    console.error(err);
    error.value = true;
    loading.value = false;
  }
);

onUnmounted(() => {
  unsubscribe();
});
</script>
