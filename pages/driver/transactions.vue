<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Driver Navbar -->
    <DriverNavbar />
    
    <UContainer class="py-6">
      <!-- Page Header -->
      <div class="mb-6">
        <div class="block space-y-4">
          <div>
            <h1 class="text-2xl font-bold text-gray-900">Withdrawal History</h1>
            <p class="text-gray-500">View and track all your withdrawal requests</p>
          </div>
          
          <div class="flex justify-between items-center gap-2">
            <UButton
              to="/driver/dashboard"
              color="gray"
              variant="soft"
              icon="i-heroicons-arrow-left"
              class="hidden sm:flex"
            >
              Back to Dashboard
            </UButton>
            <UButton
              color="blue"
              variant="soft"
              icon="i-heroicons-arrow-path"
              :loading="loading"
              @click="fetchWithdrawals"
            >
              Refresh
            </UButton>
          </div>
        </div>
      </div>
      
      <!-- Filters -->
      <div class="flex flex-wrap gap-3 mb-6">
        <USelect
          v-model="selectedStatus"
          :options="statusOptions"
          placeholder="Filter by status"
          size="sm"
          class="w-40"
        />
        
        <USelect
          v-model="selectedPeriod"
          :options="periodOptions"
          placeholder="Filter by period"
          size="sm"
          class="w-40"
        />
        
        <div class="flex-grow"></div>
        
        <UButton 
          icon="i-heroicons-document-text" 
          color="gray" 
          variant="soft" 
          @click="requestMonthlyStatement"
          :loading="generatingStatement"
        >
          Get Monthly Statement
        </UButton>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-10">
        <UIcon name="i-heroicons-arrow-path" class="text-blue-500 w-8 h-8 animate-spin mb-2" />
        <p class="text-gray-600">Loading your withdrawal history...</p>
      </div>
      
      <!-- Empty State -->
      <UCard v-else-if="filteredWithdrawals.length === 0" class="flex flex-col items-center text-center justify-center py-10">
        <UIcon name="i-heroicons-banknotes" class="text-gray-400 w-12 h-12 mb-3" />
        <h3 class="text-lg font-medium text-gray-900">No withdrawals found</h3>
        <p class="text-gray-500 text-center max-w-md mt-1">
          {{ 
            selectedStatus !== 'All' || selectedPeriod !== 'All' 
              ? 'Try adjusting your filters to see more results.' 
              : 'When you request a withdrawal, it will appear here.'
          }}
        </p>
        <UButton 
          color="blue" 
          class="mt-4" 
          to="/driver/dashboard"
        >
          Request a Withdrawal
        </UButton>
      </UCard>
      
      <!-- Withdrawal History Table -->
      <div v-else>
        <UTable 
          :rows="filteredWithdrawals" 
          :columns="columns" 
          :ui="tableStyles"
        >
          <!-- Render Amount column -->
          <template #amount-data="{ row }">
            <span class="font-medium text-gray-900">
              ₦{{ row.amount.toLocaleString() }}
            </span>
          </template>
          
          <!-- Render Bank Details column -->
          <template #bank-data="{ row }">
            <div>
              <div class="font-medium">{{ row.bankName }}</div>
              <div class="text-xs text-gray-500">{{ maskAccountNumber(row.accountNumber) }}</div>
            </div>
          </template>
          
          <!-- Render Date column -->
          <template #date-data="{ row }">
            <div>
              <div>{{ formatDate(row.requestedAt) }}</div>
              <div class="text-xs text-gray-500">{{ formatTime(row.requestedAt) }}</div>
            </div>
          </template>
          
          <!-- Render Status column -->
          <template #status-data="{ row }">
            <UBadge 
              :color="getStatusColor(row.status)" 
              variant="subtle"
              size="sm"
            >
              {{ row.status.charAt(0).toUpperCase() + row.status.slice(1) }}
            </UBadge>
          </template>
          
          <!-- Render Processed column -->
          <template #processed-data="{ row }">
            <div v-if="row.processedAt">
              {{ formatDate(row.processedAt) }}
            </div>
            <span v-else class="text-gray-400">-</span>
          </template>
        </UTable>
        
        <!-- Pagination -->
        <div class="flex justify-center mt-6" v-if="filteredWithdrawals.length > 0">
          <UPagination
            v-model="currentPage"
            :page-count="totalPages"
            :ui="{ 
              wrapper: 'flex items-center justify-center',
              rounded: 'rounded-full',
              default: {
                size: 'sm'
              } 
            }"
          />
        </div>
      </div>
    </UContainer>
    
    <!-- Statement Modal -->
    <UModal v-model="showStatementModal">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">Monthly Statement</h3>
          </div>
        </template>
        
        <div class="space-y-4">
          <p class="text-gray-700">
            Select a month to generate your statement. The statement will be emailed to your registered email address.
          </p>
          
          <UFormGroup label="Select Month" name="statementMonth">
            <UInput 
              v-model="statementMonth" 
              type="month" 
              :max="currentMonth"
            />
          </UFormGroup>
        </div>
        
        <template #footer>
          <div class="flex justify-end gap-3">
            <UButton color="gray" @click="showStatementModal = false">Cancel</UButton>
            <UButton 
              color="blue" 
              @click="generateMonthlyStatement" 
              :loading="generatingStatement"
            >
              Generate & Email Statement
            </UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { collection, query, where, orderBy, getDocs, Timestamp } from 'firebase/firestore';
import { useUserStore } from '~/stores/user';

// Router and page meta
definePageMeta({
  middleware: ['auth']
});

// Initialize stores and services
const db = useFirestore();
const toast = useToast();
const userStore = useUserStore();

// Table definition
const columns = [
  { key: 'amount', label: 'Amount', sortable: true },
  { key: 'bank', label: 'Bank Details' },
  { key: 'date', label: 'Requested Date', sortable: true },
  { key: 'status', label: 'Status', sortable: true },
  { key: 'processed', label: 'Processed Date', sortable: true }
];

const tableStyles = {
  thead: { 
    base: 'bg-gray-50',
    th: { base: 'text-gray-700 font-medium py-3' }
  },
  tr: { 
    base: 'hover:bg-gray-50 border-b border-gray-100' 
  }
};

// State
const withdrawals = ref([]);
const loading = ref(true);
const selectedStatus = ref('All');
const selectedPeriod = ref('All');
const currentPage = ref(1);
const itemsPerPage = 10;
const showStatementModal = ref(false);
const statementMonth = ref('');
const generatingStatement = ref(false);

// Options for filters
const statusOptions = ['All', 'pending', 'processing', 'completed', 'failed'];
const periodOptions = ['All', 'Last 7 days', 'Last 30 days', 'Last 3 months', 'Last 6 months'];

// Get current month for statement generation
const now = new Date();
const currentMonth = computed(() => {
  const year = now.getFullYear();
  const month = (now.getMonth() + 1).toString().padStart(2, '0');
  return `${year}-${month}`;
});

// Computed properties
const filteredWithdrawals = computed(() => {
  let result = [...withdrawals.value];
  
  // Filter by status
  if (selectedStatus.value !== 'All') {
    result = result.filter(withdrawal => withdrawal.status === selectedStatus.value);
  }
  
  // Filter by period
  if (selectedPeriod.value !== 'All') {
    const today = new Date();
    let compareDate;
    
    switch (selectedPeriod.value) {
      case 'Last 7 days':
        compareDate = new Date(today);
        compareDate.setDate(today.getDate() - 7);
        break;
      case 'Last 30 days':
        compareDate = new Date(today);
        compareDate.setDate(today.getDate() - 30);
        break;
      case 'Last 3 months':
        compareDate = new Date(today);
        compareDate.setMonth(today.getMonth() - 3);
        break;
      case 'Last 6 months':
        compareDate = new Date(today);
        compareDate.setMonth(today.getMonth() - 6);
        break;
      default:
        compareDate = null;
    }
    
    if (compareDate) {
      result = result.filter(withdrawal => {
        const withdrawalDate = withdrawal.requestedAt.toDate();
        return withdrawalDate >= compareDate;
      });
    }
  }
  
  // Pagination
  const startIdx = (currentPage.value - 1) * itemsPerPage;
  const endIdx = startIdx + itemsPerPage;
  return result.slice(startIdx, endIdx);
});

const totalPages = computed(() => {
  return Math.ceil(withdrawals.value.length / itemsPerPage);
});

// Methods
const fetchWithdrawals = async () => {
  loading.value = true;
  
  try {
    const userId = userStore.getUser;
    if (!userId) {
      toast.add({
        title: 'Authentication Error',
        description: 'Please log in to view your withdrawal history.',
        color: 'red'
      });
      return;
    }
    
    const withdrawalsRef = collection(db, 'driversWithdrawalRequests');
    const q = query(
      withdrawalsRef,
      where('driverUid', '==', userId),
      orderBy('requestedAt', 'desc')
    );
    
    const querySnapshot = await getDocs(q);
    const fetchedWithdrawals = [];
    
    querySnapshot.forEach((doc) => {
      fetchedWithdrawals.push({ id: doc.id, ...doc.data() });
    });
    
    withdrawals.value = fetchedWithdrawals;
  } catch (error) {
    console.error('Error fetching withdrawals:', error);
    toast.add({
      title: 'Error',
      description: 'Failed to load withdrawal history. Please try again.',
      color: 'red'
    });
  } finally {
    loading.value = false;
  }
};

const requestMonthlyStatement = () => {
  statementMonth.value = currentMonth.value; // Default to current month
  showStatementModal.value = true;
};

const generateMonthlyStatement = async () => {
  generatingStatement.value = true;
  
  try {
    // Extract year and month from input
    const [year, month] = statementMonth.value.split('-').map(Number);
    
    // Call the API to generate and email the statement
    const response = await $fetch('/api/driver/generate-statement', {
      method: 'POST',
      body: {
        driverUid: userStore.getUser,
        year,
        month
      }
    });
    
    if (response.statusCode === 200) {
      toast.add({
        title: 'Statement Requested',
        description: 'Your monthly statement will be emailed to you shortly.',
        color: 'green'
      });
      showStatementModal.value = false;
    } else {
      throw new Error(response.body?.message || 'Unknown error');
    }
  } catch (error) {
    console.error('Error generating statement:', error);
    toast.add({
      title: 'Error',
      description: 'Failed to generate monthly statement. Please try again later.',
      color: 'red'
    });
  } finally {
    generatingStatement.value = false;
  }
};

// Utility functions
const formatDate = (timestamp) => {
  if (!timestamp) return 'N/A';
  
  const date = timestamp.toDate();
  return new Intl.DateTimeFormat('en-GB', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
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

const getStatusColor = (status) => {
  switch (status) {
    case 'pending': return 'amber';
    case 'processing': return 'blue';
    case 'completed': return 'green';
    case 'failed': return 'red';
    default: return 'gray';
  }
};

const maskAccountNumber = (accountNum) => {
  if (!accountNum) return '';
  
  // Show last 4 digits only
  const visiblePart = accountNum.slice(-4);
  const maskedPart = '*'.repeat(accountNum.length - 4);
  return maskedPart + visiblePart;
};

// Lifecycle hooks
onMounted(fetchWithdrawals);
</script>
