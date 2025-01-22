<template>
  <div class="space-y-4 px-4 py-4">
    <h2 class="text-xl font-semibold pb-4">Recent Transactions</h2>

    <div v-if="loading" class="text-center text-gray-500">
      Loading transactions...
    </div>
    <div v-else-if="error" class="text-center text-red-500">
      Failed to load transactions. Please try again later.
    </div>
    <div v-else>
      <div
        v-for="transaction in transactions"
        :key="transaction.id"
        class="flex justify-between items-center gap-4 pb-4"
      >
        <!-- Icon -->
        <div class="flex gap-4">
          <!-- <AppUserProfilePicture width="12" height="12" /> -->

          <!-- Details -->
          <div class="flex flex-col">
            <p class="text-gray-800 font-medium">
              {{ transaction.type === 'credit' ? 'Credit Alert' : 'Debit Alert' }}
            </p>
            <p class="text-sm text-gray-500">
              {{ formatDate(transaction.createdAt) }}
            </p>
          </div>
        </div>

        <!-- Amount -->
        <p class="text-gray-800 font-medium text-lg">
          ₦{{ transaction.amount.toLocaleString() }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { useUserStore } from '@/store/user';

// Firestore setup
const db = useFirestore();
const userStore = useUserStore();
const uid = userStore.getUser.uid;

// State variables
const transactions = ref([]);
const loading = ref(true);
const error = ref(false);

// Fetch transactions
const unsubscribe = onSnapshot(
  query(collection(db, 'transactions'), where('uid', '==', uid)),
  (snapshot) => {
    const fetchedTransactions = [];
    snapshot.forEach((doc) => {
      fetchedTransactions.push({ id: doc.id, ...doc.data() });
    });

    transactions.value = fetchedTransactions.sort(
      (a, b) => b.createdAt.toDate() - a.createdAt.toDate()
    );
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

// Helper function to format date
function formatDate(timestamp) {
  const date = timestamp.toDate();
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return date.toLocaleDateString(undefined, options);
}
</script>
