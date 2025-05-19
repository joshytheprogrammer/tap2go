<template>
  <section class="px-4 py-8">
    <!-- Enter Amount -->
    <div class="mb-6">
      <label
        for="amount"
        class="block text-sm font-medium text-gray-700 mb-2"
      >
        Enter Amount
      </label>
      <input
        id="amount"
        type="text"
        v-model="amount"
        placeholder="₦0"
        class="w-full px-4 py-2 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-semibold"
      />
    </div>

    <!-- Quick Actions -->
    <div class="mb-6">
      <p class="text-sm font-medium text-gray-700 mb-2">Quick Actions</p>
      <div class="flex justify-between">
        <button
          v-for="action in quickActions"
          :key="action"
          @click="selectQuickAction(action)"
          :class="[
            'px-4 py-2 rounded-md border text-sm font-medium',
            action === amount ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800',
          ]"
        >
          ₦{{ action }}
        </button>
      </div>
    </div>

    <!-- Next Button -->
    <button
      @click="proceedNext"
      :disabled="loading"
      class="w-full py-2 bg-blue-600 text-white rounded-md text-center font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
    >
      <span v-if="loading">Processing...</span>
      <span v-else>Next</span>
    </button>
  </section>
</template>

<script setup>
import { doc, updateDoc, collection, addDoc, Timestamp } from 'firebase/firestore';


const emit = defineEmits(['close-modal'])

const amount = ref("5000");
const quickActions = ref([1000, 5000, 10000]);
const loading = ref(false);
const toast = useToast();

const userStore = useUserStore();
const db = useFirestore();

const selectQuickAction = (value) => {
  amount.value = value.toString();
};

const proceedNext = async () => {
  try {
    loading.value = true;

    const enteredAmount = parseFloat(amount.value);
    if (isNaN(enteredAmount) || enteredAmount <= 0) {
      toast.add({
        title: 'Invalid Input',
        description: 'Please enter a valid amount.',
        color: 'red',
      });
      return;
    }

    const userDocRef = doc(db, 'users', userStore.getUser);
    const transactionRef = collection(db, 'transactions');

    // Update user balance in `users` collection
    await updateDoc(userDocRef, {
      balance: userStore.getBalance + enteredAmount,
    });

    // Log transaction in `transactions` collection
    await addDoc(transactionRef, {
      uid: userStore.getUser,
      type: 'credit',
      amount: enteredAmount,
      createdAt: Timestamp.now(),
    });

    toast.add({
      title: 'Payment Successful',
      description: `Your account has been credited with ₦${enteredAmount.toLocaleString()}.`,
      color: 'green',
    });

    // Emit close event to notify parent
    emit('close-modal');
  } catch (error) {
    console.error("Error processing payment:", error);
    toast.add({
      title: 'Transaction Failed',
      description: 'An error occurred while processing your request. Please try again later.',
      color: 'red',
    });
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
</style>
