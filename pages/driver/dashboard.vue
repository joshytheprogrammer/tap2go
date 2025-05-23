<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Driver Navbar -->
    <DriverNavbar />
    
    <!-- Header with user greeting -->
    <UContainer class="py-6">
      <div class="flex items-center justify-between mb-6">
        <div>
          <h1 class="text-2xl font-bold text-gray-900">Driver Dashboard</h1>
          <p class="text-gray-600">Welcome back, {{ driverName || 'Driver' }}!</p>
        </div>
        <UButton
          icon="i-heroicons-arrow-path"
          color="gray"
          variant="ghost"
          @click="refreshDashboard"
          class="flex items-center"
        >
          Refresh
        </UButton>
      </div>
      
      <!-- Stats Cards -->      
      <div class="block space-y-8">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-currency-dollar" class="text-green-500 w-6 h-6" />
                <h3 class="font-medium text-gray-700">Current Balance</h3>
              </div>
              <UButton 
                to="/driver/transactions" 
                size="xs" 
                color="blue" 
                variant="soft"
              >
                Withdrawal History
              </UButton>
            </div>
          </template>
          <ComponentsDriverWithdrawEarnings :initial-balance="driverBalance" />
          <template #footer>
            <div class="text-xs text-gray-500">Last updated: {{ lastUpdated }}</div>
          </template>
        </UCard>
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-truck" class="text-blue-500 w-6 h-6" />
              <h3 class="font-medium text-gray-700">License Plate</h3>
            </div>
          </template>
          <div class="text-2xl font-bold text-gray-900">{{ licensePlate || 'Not Registered' }}</div>
          <template #footer>
            <div class="text-xs text-gray-500">Vehicle Identification</div>
          </template>
        </UCard>
        <UCard>
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-heroicons-signal" class="w-6 h-6" :class="isConnected ? 'text-green-500' : 'text-red-500'" />
              <h3 class="font-medium text-gray-700">Connection Status</h3>
            </div>
          </template>
          <div class="text-2xl font-bold" :class="isConnected ? 'text-green-500' : 'text-red-500'">
            {{ isConnected ? 'Connected' : 'Disconnected' }}
          </div>
          <template #footer>
            <div class="text-xs text-gray-500">Terminal Connection</div>
          </template>
        </UCard>
      </div>
    
      <!-- Main Content Sections -->
      <div class="block space-y-8">
        <!-- Transaction History -->
        <div class="block my-8">
          <UCard class="h-full">
            <template #header>
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <UIcon name="i-heroicons-document-text" class="w-6 h-6 text-blue-500" />
                  <h2 class="text-lg font-medium">Transaction History</h2>
                </div>
                <UButton
                  color="gray" 
                  variant="ghost"
                  icon="i-heroicons-funnel"
                  size="sm"
                >
                  Filter
                </UButton>
              </div>
            </template>
            <ComponentsDriverTransactionHistory />
          </UCard>
        </div>
        
        <!-- Right Side Column -->
        <div class="block space-y-6">
          <!-- Report Issue -->
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-flag" class="w-6 h-6 text-amber-500" />
                <h2 class="text-lg font-medium">Report an Issue</h2>
              </div>
            </template>
            <ComponentsDriverIssueReporter />
          </UCard>
          
          <!-- Quick Links -->
          <UCard>
            <template #header>
              <div class="flex items-center gap-2">
                <UIcon name="i-heroicons-link" class="w-6 h-6 text-indigo-500" />
                <h2 class="text-lg font-medium">Quick Actions</h2>
              </div>
            </template>
            <div class="grid grid-cols-1 gap-2">
              <UButton block color="blue" variant="soft" to="/driver/profile" class="justify-start">
                <template #leading>
                  <UIcon name="i-heroicons-user-circle" />
                </template>
                Edit Profile
              </UButton>              <UButton block color="emerald" variant="soft" to="/driver/transactions" class="justify-start">
                <template #leading>
                  <UIcon name="i-heroicons-banknotes" />
                </template>
                Withdraw Earnings
              </UButton><UButton block color="amber" variant="soft" to="/driver/support" class="justify-start">
                <template #leading>
                  <UIcon name="i-heroicons-question-mark-circle" />
                </template>
                Help & Support
              </UButton>
            </div>
          </UCard>
        </div>
      </div>
    </UContainer>
  </div>
</template>

<script setup>
// Import components
import ComponentsDriverTransactionHistory from '~/components/Driver/TransactionHistory.vue';
import ComponentsDriverIssueReporter from '~/components/Driver/IssueReporter.vue';
import ComponentsDriverWithdrawEarnings from '~/components/Driver/WithdrawEarnings.vue';
import { ref, onMounted, onUnmounted } from 'vue';
import { doc, getDoc, onSnapshot, collection, query, where, orderBy, limit } from 'firebase/firestore';
import { useUserStore } from '~/stores/user';

definePageMeta({
  middleware: ['auth']
});

// Initialize stores and services
const db = useFirestore();
const toast = useToast();
const userStore = useUserStore();

// Dashboard data
const driverName = ref('');
const driverBalance = ref(0);
const licensePlate = ref('');
const isConnected = ref(true); // Default to true for now
const lastUpdated = ref(new Date().toLocaleString());

// Fetch driver data
const fetchDriverData = async () => {
  const userId = userStore.getUser;
  if (!userId) return;

  try {
    // Fetch both profile data and user data in parallel
    const profileRef = doc(db, 'driverProfile', userId);
    const userRef = doc(db, 'drivers_users', userId);
    const [profileSnap, userSnap] = await Promise.all([
      getDoc(profileRef),
      getDoc(userRef)
    ]);
    
    // Get profile data
    if (profileSnap.exists()) {
      const profileData = profileSnap.data();
      driverName.value = profileData.name || '';
      licensePlate.value = profileData.licensePlate || '';
    } 
    
    // Get balance and other user data
    if (userSnap.exists()) {
      const userData = userSnap.data();
      driverBalance.value = userData.balance || 0;
      if (!licensePlate.value) {
        licensePlate.value = userData.licensePlate || '';
      }
    }
    
    lastUpdated.value = new Date().toLocaleString();
  } catch (error) {
    console.error('Error fetching driver data:', error);
    toast.add({
      id: 'fetch-error',
      title: 'Data Fetch Error', 
      description: 'Could not load your profile data.',
      color: 'red'
    });
  }
};

// Set up real-time payment notifications
let unsubscribeTransactions = null;

const setupTransactionListener = () => {
  const userId = userStore.getUser;
  if (!userId) return;

  // Listen for new transactions
  const transactionsQuery = query(
    collection(db, 'drivers_transactions'),
    where('uid', '==', userId),
    where('status', 'in', ['successful', 'declined']),
    orderBy('createdAt', 'desc'),
    limit(10)
  );

  unsubscribeTransactions = onSnapshot(transactionsQuery, (snapshot) => {
    snapshot.docChanges().forEach((change) => {
      if (change.type === 'added') {
        const transaction = change.doc.data();
        
        // Check if this is a new transaction (within the last minute)
        const transactionTime = transaction.createdAt?.toDate() || new Date();
        const isRecent = (new Date() - transactionTime) < 60000;
        
        if (isRecent) {
          // Show notification for recent transactions
          const isSuccessful = transaction.status === 'successful';
          toast.add({
            id: change.doc.id,
            title: isSuccessful ? 'Payment Received' : 'Payment Declined',
            description: `${transaction.type === 'ride_fare' ? 'Ride payment' : 'Transaction'} of ₦${transaction.amount?.toFixed(2) || '0.00'}`,
            color: isSuccessful ? 'green' : 'red',
            timeout: 5000
          });
          
          // Update balance for successful transactions
          if (isSuccessful && transaction.type === 'ride_fare') {
            driverBalance.value += transaction.amount || 0;
            lastUpdated.value = new Date().toLocaleString();
          }
        }
      }
    });
  }, (error) => {
    console.error('Transaction listener error:', error);
  });
};

// Method to refresh dashboard data
const refreshDashboard = () => {
  loading.value = true;
  fetchDriverData();
  setupTransactionListener();
  
  // Show refresh toast
  toast.add({
    title: 'Dashboard Refreshed',
    description: 'Latest information has been loaded',
    icon: 'i-heroicons-check-circle',
    color: 'blue',
    timeout: 3000
  });
};

// Lifecycle hooks
onMounted(() => {
  fetchDriverData();
  setupTransactionListener();
  
  // Check connection status periodically
  const checkConnectionInterval = setInterval(() => {
    // Simulate connection status changes (replace with actual implementation)
    isConnected.value = navigator.onLine;
  }, 30000);
  
  // Cleanup function
  onUnmounted(() => {
    if (unsubscribeTransactions) {
      unsubscribeTransactions();
    }
    clearInterval(checkConnectionInterval);
  });
});
</script>

<style scoped>
/* Add any specific styling for the dashboard page here */
section {
  margin-bottom: 2rem;
}
</style>
