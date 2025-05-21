<template>
  <div class="space-y-6">
    <!-- Balance Display -->
    <div class="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
      <div>
        <p class="text-sm text-gray-600">Current Balance</p>
        <p class="text-xl font-bold text-gray-900">₦{{ driverBalance.toFixed(2) }}</p>
      </div>
      <UBadge v-if="pendingWithdrawal" color="amber" size="lg" class="px-3 py-1">
        Pending Withdrawal: ₦{{ pendingAmount.toFixed(2) }}
      </UBadge>
    </div>

    <!-- Withdrawal Form -->
    <form @submit.prevent="requestWithdrawal" class="space-y-4">
      <UFormGroup label="Withdrawal Amount" name="amount">
        <div >
          <UInput
            v-model="amount"
            type="number"
            min="1000"
            :max="driverBalance"
            placeholder="Enter amount (min ₦1,000)"
            class="rounded-l-none w-full"
            required
            :disabled="!bankDetailsComplete || loading || pendingWithdrawal"
          >
            <template #leading>
              <span class="text-gray-500">₦</span>
            </template>
          </UInput>
        </div>
        <p class="text-xs text-gray-500 mt-1">
          <span v-if="!bankDetailsComplete" class="text-red-500">
            You must add your bank details in your profile before requesting withdrawals.
          </span>
          <span v-else-if="pendingWithdrawal" class="text-amber-600">
            You have a pending withdrawal request. Please wait for it to be processed.
          </span>
          <span v-else class="text-gray-500">
            Withdrawals are processed within 1-2 business days.
          </span>
        </p>
      </UFormGroup>

      <!-- Quick Actions -->
      <div v-if="!pendingWithdrawal && bankDetailsComplete" class="grid grid-cols-3 gap-2">
        <UButton 
          v-for="value in quickAmounts" 
          :key="value" 
          type="button"
          color="gray"
          variant="soft"
          :disabled="value > driverBalance || loading"
          @click="amount = value.toString()"
          class="text-center"
        >
          ₦{{ value.toLocaleString() }}
        </UButton>
      </div>

      <!-- Bank Details Preview -->
      <div v-if="bankDetailsComplete" class="bg-gray-50 p-3 rounded-md border border-gray-200">
        <p class="text-sm font-medium text-gray-700 mb-1">Withdrawal will be sent to:</p>
        <div class="flex items-center justify-between">
          <div class="text-sm text-gray-600">
            {{ bankName }} - {{ maskAccountNumber(accountNumber) }}
          </div>
          <UButton 
            to="/driver/profile"
            color="gray" 
            variant="ghost" 
            size="xs"
            icon="i-heroicons-pencil-square"
          >
            Edit
          </UButton>
        </div>
      </div>

      <!-- Submit Button -->
      <UButton
        type="submit"
        block
        color="blue"
        :loading="loading"
        :disabled="!bankDetailsComplete || pendingWithdrawal || loading || !isValidAmount"
      >
        {{ loading ? 'Processing...' : 'Request Withdrawal' }}
      </UButton>
    </form>

    <!-- Transaction History Link -->
    <div class="text-center border-t border-gray-200 pt-4 mt-4">
      <UButton
        to="/driver/transactions"
        variant="link"
        color="gray"
        icon="i-heroicons-clock"
      >
        View Previous Withdrawals
      </UButton>
    </div>
    
    <!-- Modal for confirmation -->
    <UModal v-model="showConfirmation">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">Confirm Withdrawal</h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="showConfirmation = false" />
          </div>
        </template>
        
        <div class="space-y-4">
          <p class="text-gray-700">
            Are you sure you want to withdraw <span class="font-semibold">₦{{ amount }}</span> to your account?
          </p>
          
          <div class="bg-gray-50 p-3 rounded-md border border-gray-200">
            <div class="grid grid-cols-2 gap-2">
              <div>
                <p class="text-xs text-gray-500">Bank Name</p>
                <p class="font-medium">{{ bankName }}</p>
              </div>
              <div>
                <p class="text-xs text-gray-500">Account Number</p>
                <p class="font-medium">{{ maskAccountNumber(accountNumber) }}</p>
              </div>
            </div>
          </div>
          
          <p class="text-sm text-gray-500">
            This amount will be deducted from your balance immediately. The transfer will be processed within 1-2 business days.
          </p>
        </div>
        
        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton color="gray" @click="showConfirmation = false">Cancel</UButton>
            <UButton color="blue" @click="confirmWithdrawal" :loading="loading">Confirm</UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { doc, getDoc, collection, query, where, getDocs, addDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { useUserStore } from '~/stores/user';

// Component props
const props = defineProps({
  initialBalance: {
    type: Number,
    default: 0
  }
});

// Initialize refs and reactive data
const db = useFirestore();
const userStore = useUserStore();
const toast = useToast();

// State
const driverBalance = ref(props.initialBalance);
const amount = ref("");
const bankName = ref("");
const accountNumber = ref("");
const loading = ref(false);
const pendingWithdrawal = ref(false);
const pendingAmount = ref(0);
const showConfirmation = ref(false);

// Quick amount options
const quickAmounts = [1000, 5000, 10000];

// Computed properties
const bankDetailsComplete = computed(() => {
  return bankName.value && accountNumber.value;
});

const isValidAmount = computed(() => {
  const amountNum = Number(amount.value);
  return amountNum >= 1000 && amountNum <= driverBalance.value;
});

// Methods
const fetchDriverDetails = async () => {
  try {
    const userId = userStore.getUser;
    if (!userId) return;

    // Fetch driver balance
    const userDocRef = doc(db, 'drivers_users', userId);
    const userDocSnap = await getDoc(userDocRef);
    
    if (userDocSnap.exists()) {
      driverBalance.value = userDocSnap.data().balance || 0;
    }
    
    // Fetch bank details
    const profileDocRef = doc(db, 'driverProfile', userId);
    const profileDocSnap = await getDoc(profileDocRef);
    
    if (profileDocSnap.exists()) {
      const data = profileDocSnap.data();
      bankName.value = data.bankName || '';
      accountNumber.value = data.accountNumber || '';
    }
    
    // Check for pending withdrawals
    const withdrawalRequestsRef = collection(db, 'driversWithdrawalRequests');
    const q = query(
      withdrawalRequestsRef, 
      where('driverUid', '==', userId),
      where('status', '==', 'pending')
    );
    
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      pendingWithdrawal.value = true;
      pendingAmount.value = querySnapshot.docs[0].data().amount || 0;
    }
  } catch (error) {
    console.error('Error fetching driver details:', error);
    toast.add({
      title: 'Error',
      description: 'Could not load your account information',
      color: 'red'
    });
  }
};

const maskAccountNumber = (accountNum) => {
  if (!accountNum) return '';
  
  // Show last 4 digits only
  const visiblePart = accountNum.slice(-4);
  const maskedPart = '*'.repeat(accountNum.length - 4);
  return maskedPart + visiblePart;
};

const requestWithdrawal = () => {
  if (!isValidAmount.value || !bankDetailsComplete.value) return;
  
  showConfirmation.value = true;
};

const confirmWithdrawal = async () => {
  loading.value = true;
  showConfirmation.value = false;
  
  try {
    const userId = userStore.getUser;
    const amountNum = Number(amount.value);
    
    // 1. Submit the withdrawal request
    const withdrawalData = {
      driverUid: userId,
      amount: amountNum,
      bankName: bankName.value,
      accountNumber: accountNumber.value,
      status: 'pending',
      requestedAt: Timestamp.now()
    };
    
    const withdrawalRef = collection(db, 'driversWithdrawalRequests');
    const newWithdrawalDoc = await addDoc(withdrawalRef, withdrawalData);
    
    // 2. Update the driver's balance
    const driverRef = doc(db, 'drivers_users', userId);
    await updateDoc(driverRef, {
      balance: driverBalance.value - amountNum
    });
    
    // 3. Create a transaction record
    const transactionRef = collection(db, 'transactions');
    await addDoc(transactionRef, {
      uid: userId,
      amount: amountNum,
      type: 'withdrawal_request',
      status: 'pending',
      withdrawalRequestId: newWithdrawalDoc.id,
      createdAt: Timestamp.now()
    });
    
    // 4. Update local state
    driverBalance.value -= amountNum;
    pendingWithdrawal.value = true;
    pendingAmount.value = amountNum;
    amount.value = "";
    
    toast.add({
      title: 'Withdrawal Requested',
      description: `Your withdrawal request for ₦${amountNum.toLocaleString()} has been submitted.`,
      color: 'green'
    });
  } catch (error) {
    console.error('Error processing withdrawal:', error);
    toast.add({
      title: 'Withdrawal Failed',
      description: 'An error occurred while processing your request. Please try again later.',
      color: 'red'
    });
  } finally {
    loading.value = false;
  }
};

// Lifecycle hooks
onMounted(() => {
  fetchDriverDetails();
});
</script>
