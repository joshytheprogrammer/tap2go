<template>
  <div>
    <UProgress v-if="loading" class="mb-4" indeterminate />
      
    <div v-if="loading" class="flex flex-col items-center justify-center py-6">
      <UIcon name="i-heroicons-arrow-path" class="text-blue-500 w-8 h-8 animate-spin mb-2" />
      <p class="text-gray-500">Loading your transactions...</p>
    </div>
    
    <!-- Error State -->
    <div v-else-if="error" class="p-4 bg-red-50 border border-red-200 rounded-lg text-center">
      <UIcon name="i-heroicons-exclamation-triangle" class="text-red-500 w-8 h-8 mx-auto mb-2" />
      <p class="text-red-600 font-medium">Error loading transactions</p>
      <p class="text-red-500 text-sm mt-1">{{ error.message }}</p>
      <UButton color="red" variant="soft" size="sm" class="mt-3" @click="fetchTransactions">
        Try Again
      </UButton>
    </div>
    
    <!-- Empty State -->
    <div v-else-if="transactions.length === 0" class="flex flex-col items-center justify-center py-10 text-center">
      <UIcon name="i-heroicons-document-text" class="text-gray-400 w-12 h-12 mb-3" />
      <h3 class="text-xl text-gray-700 font-medium mb-1">No Transactions Yet</h3>
      <p class="text-gray-500 max-w-xs mx-auto">
        All your transactions will appear here once you start receiving payments.
      </p>
    </div>
    
    <!-- Transaction List -->
    <div v-else>
      <!-- Filter Controls -->
      <div class="bg-gray-50 p-3 rounded-lg mb-4">
        <div class="flex flex-col sm:flex-row justify-between gap-3 sm:items-center">
          <div>
            <UButtonGroup size="sm">
              <UButton @click="selectedPeriod = 'all'" :color="selectedPeriod === 'all' ? 'blue' : 'gray'">
                All
              </UButton>
              <UButton @click="selectedPeriod = 'week'" :color="selectedPeriod === 'week' ? 'blue' : 'gray'">
                This Week
              </UButton>
              <UButton @click="selectedPeriod = 'month'" :color="selectedPeriod === 'month' ? 'blue' : 'gray'">
                This Month
              </UButton>
            </UButtonGroup>
          </div>
          
          <div class="flex items-center gap-3">
            <USelect
              v-model="selectedType"
              :options="['All Types', 'Ride Fare', 'Withdrawal']"
              size="sm"
              placeholder="Filter by type"
              class="w-40"
            />
            
            <UInput
              v-model="searchQuery"
              placeholder="Search transactions"
              size="sm"
              icon="i-heroicons-magnifying-glass"
              class="w-48"
            />
          </div>
        </div>
      </div>
      
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <UCard class="bg-green-50">
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-arrow-trending-up" class="text-green-500 w-6 h-6" />
            <div>
              <div class="text-sm text-gray-500">Total Earnings</div>
              <div class="text-xl font-semibold text-gray-900">₦{{ totalEarnings.toFixed(2) }}</div>
            </div>
          </div>
        </UCard>
        
        <UCard class="bg-blue-50">
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-truck" class="text-blue-500 w-6 h-6" />
            <div>
              <div class="text-sm text-gray-500">Total Rides</div>
              <div class="text-xl font-semibold text-gray-900">{{ totalRides }}</div>
            </div>
          </div>
        </UCard>
        
        <UCard class="bg-red-50">
          <div class="flex items-center gap-3">
            <UIcon name="i-heroicons-banknotes" class="text-red-500 w-6 h-6" />
            <div>
              <div class="text-sm text-gray-500">Total Withdrawals</div>
              <div class="text-xl font-semibold text-gray-900">₦{{ totalWithdrawals.toFixed(2) }}</div>
            </div>
          </div>
        </UCard>
      </div>
      
      <UTable 
        :rows="paginatedTransactions" 
        :columns="columns"
        :ui="{ 
          thead: { 
            base: 'bg-gray-50',
            th: { base: 'text-gray-700 font-medium py-3' }
          },
          tr: { 
            base: 'hover:bg-gray-50 border-b border-gray-100' 
          }
        }"
      >
        <template #type-data="{ row }">
          <div class="flex items-center">
            <UIcon 
              :name="row.type === 'ride_fare' ? 'i-heroicons-truck' : 'i-heroicons-banknotes'" 
              class="w-4 h-4 mr-2"
              :class="row.type === 'ride_fare' ? 'text-green-500' : 'text-blue-500'"
            />
            {{ row.type === 'ride_fare' ? 'Ride Fare' : 'Withdrawal' }}
          </div>
          <div v-if="row.rideDetails" class="text-xs text-gray-500 mt-1">
            {{ row.rideDetails }}
          </div>
        </template>
        
        <template #amount-data="{ row }">
          <span class="font-medium" :class="getAmountClass(row)">
            {{ row.type === 'withdrawal' ? '-' : '+' }}₦{{ row.amount.toFixed(2) }}
          </span>
        </template>
        
        <template #date-data="{ row }">
          <div>{{ formatDateShort(row.createdAt) }}</div>
          <div class="text-xs text-gray-500">{{ formatTime(row.createdAt) }}</div>
        </template>
        
        <template #status-data="{ row }">
          <UBadge 
            :color="getStatusColor(row.status)"
            variant="subtle"
            size="sm"
          >
            {{ row.status }}
          </UBadge>
        </template>

        <template #actions-data="{ row }">
          <UDropdown :items="getActionItems(row)">
            <UButton color="gray" variant="ghost" icon="i-heroicons-ellipsis-vertical" />
          </UDropdown>
        </template>
      </UTable>
      
      <!-- Pagination -->
      <div class="mt-6 flex justify-between items-center">
        <p class="text-sm text-gray-500">
          Showing {{ ((currentPage - 1) * itemsPerPage) + 1 }} to 
          {{ Math.min(currentPage * itemsPerPage, filteredTransactions.length) }} 
          of {{ filteredTransactions.length }} transactions
        </p>
        
        <UPagination
          v-model="currentPage"
          :total="Math.ceil(filteredTransactions.length / itemsPerPage)"
          :ui="{ rounded: 'rounded-full' }"
          size="sm"
        />
      </div>
    </div>
    
    <UButton 
      color="blue" 
      variant="soft" 
      icon="i-heroicons-arrow-path" 
      size="sm" 
      @click="fetchTransactions"
      :loading="loading"
    >
      Refresh
    </UButton>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, onUnmounted, watch } from 'vue';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { useUserStore } from '~/stores/user';

const transactions = ref([]);
const loading = ref(true);
const error = ref(null);
const selectedPeriod = ref('all');
const selectedType = ref('All Types');
const searchQuery = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;

// Table configuration
const columns = [
  {
    key: 'type',
    label: 'Transaction',
  },
  {
    key: 'amount',
    label: 'Amount',
    sortable: true,
  },
  {
    key: 'date',
    label: 'Date',
    sortable: true,
  },
  {
    key: 'status',
    label: 'Status',
  },
  {
    key: 'actions',
    label: '',
  }
];

const db = useFirestore();
const auth = useFirebaseAuth();
const userStore = useUserStore();
const toast = useToast();

// Filtered transactions based on selected filters
const filteredTransactions = computed(() => {
  let result = [...transactions.value];
  
  // Filter by period
  if (selectedPeriod.value !== 'all') {
    const now = new Date();
    let compareDate;
    
    if (selectedPeriod.value === 'week') {
      compareDate = new Date();
      compareDate.setDate(compareDate.getDate() - 7);
    } else if (selectedPeriod.value === 'month') {
      compareDate = new Date();
      compareDate.setMonth(compareDate.getMonth() - 1);
    }
    
    result = result.filter(transaction => {
      const transactionDate = transaction.createdAt?.toDate?.() || new Date();
      return transactionDate >= compareDate;
    });
  }
  
  // Filter by type
  if (selectedType.value !== 'All Types') {
    const filterType = selectedType.value === 'Ride Fare' ? 'ride_fare' : 'withdrawal';
    result = result.filter(transaction => transaction.type === filterType);
  }
  
  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(transaction => 
      transaction.rideDetails?.toLowerCase().includes(query) || 
      transaction.status?.toLowerCase().includes(query)
    );
  }
  
  return result;
});

// Paginated transactions
const paginatedTransactions = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredTransactions.value.slice(start, end);
});

// Calculate summary metrics
const totalEarnings = computed(() => {
  return transactions.value
    .filter(t => t.type === 'ride_fare' && t.status?.toLowerCase() === 'successful')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
});

const totalRides = computed(() => {
  return transactions.value.filter(t => t.type === 'ride_fare').length;
});

const totalWithdrawals = computed(() => {
  return transactions.value
    .filter(t => t.type === 'withdrawal' && t.status?.toLowerCase() === 'successful')
    .reduce((sum, t) => sum + (t.amount || 0), 0);
});

// Get action items for dropdown
const getActionItems = (transaction) => {
  return [
    [
      {
        label: 'View Details',
        icon: 'i-heroicons-eye',
        click: () => viewTransactionDetails(transaction)
      },
      {
        label: 'Download Receipt',
        icon: 'i-heroicons-document-arrow-down',
        click: () => downloadReceipt(transaction)
      }
    ],
    [
      {
        label: 'Report an Issue',
        icon: 'i-heroicons-flag',
        click: () => reportIssue(transaction)
      }
    ]
  ]
};

const fetchTransactions = async () => {
  loading.value = true;
  error.value = null;
  
  // Get UID from the user store
  const userId = userStore.getUser;

  if (!userId) {
    error.value = { message: "User not authenticated." };
    transactions.value = []; 
    loading.value = false;
    return;
  }

  try {
    const q = query(
      collection(db, 'drivers_transactions'),
      where('uid', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    transactions.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (e) {
    console.error("Error fetching transactions:", e);
    error.value = e;
  } finally {
    loading.value = false;
  }
};

// View transaction details
const viewTransactionDetails = (transaction) => {
  // This would typically open a modal with transaction details
  // For now, we'll just show a toast notification
  toast.add({
    title: 'Transaction Details',
    description: `${transaction.type === 'ride_fare' ? 'Ride Fare' : 'Withdrawal'} - ₦${transaction.amount.toFixed(2)}`,
    icon: 'i-heroicons-information-circle',
    color: 'blue'
  });
};

// Download receipt
const downloadReceipt = (transaction) => {
  toast.add({
    title: 'Receipt Download Started',
    description: 'Your receipt will be downloaded shortly',
    icon: 'i-heroicons-document-arrow-down',
    color: 'green'
  });
};

// Report an issue
const reportIssue = (transaction) => {
  // This would typically navigate to the issue reporter or open a modal
  toast.add({
    title: 'Report an Issue',
    description: 'Issue reporting feature will be available soon',
    icon: 'i-heroicons-flag',
    color: 'yellow'
  });
};

// Create a watcher to reset pagination when filters change
watch([selectedPeriod, selectedType, searchQuery], () => {
  currentPage.value = 1;
});

onMounted(() => {
  fetchTransactions();
});

// Date formatting utilities
const formatDateShort = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  const date = timestamp.toDate();
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(date);
};

const formatTime = (timestamp) => {
  if (!timestamp) return '';
  
  const date = timestamp.toDate();
  return new Intl.DateTimeFormat('en-GB', {
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};

// Legacy formatter for backward compatibility
const formatDate = (timestamp) => {
  if (!timestamp) return 'Date not available';
  return timestamp.toDate().toLocaleDateString() + ' ' + timestamp.toDate().toLocaleTimeString();
};

// Styling utilities
const getStatusColor = (status) => {
  switch (status?.toLowerCase()) {
    case 'successful':
      return 'green';
    case 'reversed':
      return 'yellow';
    case 'declined':
      return 'red';
    default:
      return 'gray';
  }
};

const getAmountClass = (transaction) => {
  if (transaction.type === 'withdrawal') return 'text-red-500';
  if (transaction.status?.toLowerCase() === 'successful') return 'text-green-500';
  if (transaction.status?.toLowerCase() === 'declined') return 'text-red-500';
  return 'text-gray-700';
};

// Keep getStatusClass for backward compatibility
const getStatusClass = (status) => {
  switch (status?.toLowerCase()) {
    case 'successful':
      return 'bg-green-100 text-green-700';
    case 'reversed':
      return 'bg-yellow-100 text-yellow-700';
    case 'declined':
      return 'bg-red-100 text-red-700';
    default:
      return 'bg-gray-100 text-gray-700';
  }
};
</script>

<style scoped>
/* Scoped styles for transaction history */
</style>
