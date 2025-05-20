<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Driver Navbar -->
    <DriverNavbar />
    
    <UContainer class="py-6">
      <!-- Page Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-gray-900">Support & Help Center</h1>
        <p class="text-gray-500">Find answers to your questions and get help when you need it</p>
      </div>
      
      <!-- Search Box -->
      <div class="mb-6">
        <UInput
          v-model="searchQuery"
          placeholder="Search for help topics..."
          icon="i-heroicons-magnifying-glass"
          size="lg"
          class="w-full"
          @input="filterFaqs"
        />
      </div>
      
      <!-- FAQ Categories -->
      <div class="flex flex-wrap gap-2 mb-8">
        <UButton
          v-for="category in categories"
          :key="category"
          :color="selectedCategory === category ? 'blue' : 'gray'"
          variant="soft"
          @click="selectCategory(category)"
        >
          {{ category }}
        </UButton>
      </div>
      
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-10">
        <UIcon name="i-heroicons-arrow-path" class="text-blue-500 w-8 h-8 animate-spin mb-2" />
        <p class="text-gray-600">Loading help content...</p>
      </div>
      
      <!-- No Results State -->
      <div v-else-if="filteredFaqs.length === 0" class="text-center py-8 bg-gray-50 rounded-lg border border-gray-200">
        <UIcon name="i-heroicons-face-frown" class="w-12 h-12 text-gray-400 mx-auto mb-3" />
        <h3 class="font-medium text-gray-900">No results found</h3>
        <p class="text-gray-500 mt-1">Try adjusting your search or filter to find what you're looking for</p>
      </div>
      
      <!-- FAQ Content -->
      <div v-else class="space-y-6">
        <UCard
          v-for="(faq, index) in filteredFaqs"
          :key="index"
          :ui="{ divide: 'divide-y divide-gray-100' }"
        >
          <UAccordion
            :items="[{
              label: faq.question,
              slot: 'faq-' + index,
              icon: 'i-heroicons-question-mark-circle',
              color: 'blue',
              defaultOpen: index === 0
            }]"
          >
            <template #faq-{{index}}>
              <div class="prose prose-sm max-w-none py-3 text-gray-700">
                <p v-html="faq.answer"></p>
                <div v-if="faq.tags && faq.tags.length > 0" class="mt-3 flex flex-wrap gap-2">
                  <UBadge
                    v-for="tag in faq.tags"
                    :key="tag"
                    color="gray"
                    variant="subtle"
                    size="xs"
                  >
                    {{ tag }}
                  </UBadge>
                </div>
              </div>
            </template>
          </UAccordion>
        </UCard>
      </div>
      
      <!-- Contact Support -->
      <UCard class="mt-8">
        <template #header>
          <div class="flex items-center gap-2">
            <UIcon name="i-heroicons-chat-bubble-left-right" class="w-5 h-5 text-blue-500" />
            <h3 class="font-medium text-gray-900">Still need help?</h3>
          </div>
        </template>
        
        <div class="grid md:grid-cols-2 gap-4">
          <UButton
            block
            color="blue"
            variant="soft"
            to="/driver/profile"
            class="justify-start"
            icon="i-heroicons-document-text"
          >
            Submit a Support Ticket
          </UButton>
          
          <UButton
            block
            color="green"
            variant="soft"
            class="justify-start"
            icon="i-heroicons-phone"
            @click="showContactInfo = true"
          >
            Contact Support Team
          </UButton>
        </div>
      </UCard>
    </UContainer>
    
    <!-- Contact Info Modal -->
    <UModal v-model="showContactInfo">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-medium text-gray-900">Contact Information</h3>
            <UButton color="gray" variant="ghost" icon="i-heroicons-x-mark" @click="showContactInfo = false" />
          </div>
        </template>
        
        <div class="space-y-4">
          <div class="flex items-start">
            <UIcon name="i-heroicons-phone" class="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
            <div>
              <h4 class="font-medium text-gray-900">Support Hotline</h4>
              <p class="text-gray-600">+234 (0) 800-TAP2GO-HELP</p>
              <p class="text-xs text-gray-500">Available Monday-Friday, 8am-6pm</p>
            </div>
          </div>
          
          <div class="flex items-start">
            <UIcon name="i-heroicons-envelope" class="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
            <div>
              <h4 class="font-medium text-gray-900">Email Support</h4>
              <p class="text-gray-600">driver-support@tap2go.com</p>
              <p class="text-xs text-gray-500">We aim to respond within 24 hours</p>
            </div>
          </div>
          
          <div class="flex items-start">
            <UIcon name="i-heroicons-chat-bubble-left-ellipsis" class="w-5 h-5 text-blue-500 mr-3 mt-0.5" />
            <div>
              <h4 class="font-medium text-gray-900">Live Chat</h4>
              <p class="text-gray-600">Available in the Tap2Go Driver App</p>
              <p class="text-xs text-gray-500">Instant assistance for urgent matters</p>
            </div>
          </div>
        </div>
        
        <template #footer>
          <div class="flex justify-end">
            <UButton color="gray" @click="showContactInfo = false">Close</UButton>
          </div>
        </template>
      </UCard>
    </UModal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';

definePageMeta({
  middleware: ['auth']
});

// State
const searchQuery = ref('');
const selectedCategory = ref('All FAQs');
const loading = ref(true);
const showContactInfo = ref(false);

// Sample FAQ data - in a real app, this would come from an API or Firestore
const faqs = ref([
  {
    category: 'Account Management',
    question: 'How do I update my driver profile?',
    answer: 'To update your driver profile, navigate to <strong>Profile</strong> in the main menu. Click on <strong>Edit Profile</strong> to make changes to your personal information, contact details, or vehicle information. Click <strong>Save Changes</strong> when done.',
    tags: ['profile', 'account', 'settings']
  },
  {
    category: 'Account Management',
    question: 'How do I reset my password?',
    answer: 'To reset your password, go to the login screen and click on "Forgot Password." Enter the email associated with your account and follow the instructions sent to your email. For security reasons, password reset links expire after 24 hours.',
    tags: ['password', 'security', 'login']
  },
  {
    category: 'Earnings & Payments',
    question: 'How often will I get paid?',
    answer: 'Payments are processed weekly, with the payment cycle closing every Sunday at midnight. Funds are typically transferred to your account within 1-2 business days after the cycle closes. You can view your payment history in the Transactions section.',
    tags: ['payment', 'earnings', 'transfer']
  },
  {
    category: 'Earnings & Payments',
    question: 'How do I withdraw my earnings?',
    answer: 'To withdraw your earnings, navigate to the Dashboard and click on <strong>Request Withdrawal</strong>. Enter the amount you wish to withdraw (minimum ₦1,000) and confirm. The transfer will typically be processed within 24 hours to your registered bank account.',
    tags: ['withdrawal', 'transfer', 'earnings']
  },
  {
    category: 'Earnings & Payments',
    question: 'Why was my withdrawal request declined?',
    answer: 'Withdrawal requests may be declined for several reasons: insufficient balance, account verification issues, suspicious activity, or system maintenance. Check the specific error message displayed, or contact support if you need assistance resolving the issue.',
    tags: ['withdrawal', 'declined', 'error']
  },
  {
    category: 'Technical Issues',
    question: 'The app keeps crashing, what should I do?',
    answer: 'If the app is crashing, try these steps: <br>1. Close and restart the app<br>2. Check for app updates<br>3. Clear the app cache (Settings > Apps > Tap2Go > Clear Cache)<br>4. Restart your device<br>5. Uninstall and reinstall the app<br><br>If the problem persists, contact support with details about your device and when the crashes occur.',
    tags: ['crash', 'app', 'technical']
  },
  {
    category: 'Technical Issues',
    question: 'My transactions are not showing up in my history',
    answer: 'If you don\'t see recent transactions, first check your internet connection and refresh the app. There may also be a delay in processing transactions during high traffic periods. If transactions are missing after 24 hours, please contact support with specific details about the missing transactions.',
    tags: ['transactions', 'history', 'missing']
  },
  {
    category: 'Technical Issues',
    question: 'How do I report issues with the card reader?',
    answer: 'To report card reader issues, go to the Dashboard and click on <strong>Report an Issue</strong>. Select "Card Reader Problem" from the dropdown menu and provide details about the problem. Include the reader ID (found on the back of the device) and specific error messages if any appear.',
    tags: ['card reader', 'hardware', 'technical']
  },
  {
    category: 'Campus Rules',
    question: 'What are the operating hours for campus transportation?',
    answer: 'Standard operating hours for campus transportation are from 6:00 AM to 10:00 PM, Monday through Friday, and 8:00 AM to 8:00 PM on weekends. Hours may vary during holidays, exam periods, or special events, so always check the announcements section for updates.',
    tags: ['hours', 'schedule', 'operations']
  },
  {
    category: 'Campus Rules',
    question: 'Are there restricted areas on campus?',
    answer: 'Yes, there are restricted areas where drivers should not operate. These include pedestrian-only zones, academic quads during class hours, and residential areas after 9:00 PM. A map of restricted areas is available in the app under Menu > Campus Map. Violations may result in penalties.',
    tags: ['restricted areas', 'rules', 'campus']
  },
  {
    category: 'Account Management',
    question: 'How do I deactivate my driver account?',
    answer: 'To deactivate your account, go to Profile > Settings > Account Management > Deactivate Account. You\'ll need to provide a reason and confirm your decision. Note that deactivation is different from deletion - deactivated accounts can be reactivated within 30 days by contacting support.',
    tags: ['deactivate', 'account', 'settings']
  }
]);

// Available categories for filtering
const categories = computed(() => {
  const allCategories = ['All FAQs', ...new Set(faqs.value.map(faq => faq.category))];
  return allCategories;
});

// Filter FAQs based on search query and selected category
const filteredFaqs = computed(() => {
  let result = faqs.value;
  
  // Filter by category
  if (selectedCategory.value !== 'All FAQs') {
    result = result.filter(faq => faq.category === selectedCategory.value);
  }
  
  // Filter by search query
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(faq => 
      faq.question.toLowerCase().includes(query) || 
      faq.answer.toLowerCase().includes(query) || 
      (faq.tags && faq.tags.some(tag => tag.toLowerCase().includes(query)))
    );
  }
  
  return result;
});

// Methods
const selectCategory = (category) => {
  selectedCategory.value = category;
};

const filterFaqs = () => {
  // This could include additional logic or debouncing if needed
};

// Lifecycle hooks
onMounted(() => {
  // In a real app, this would fetch data from an API or Firestore
  setTimeout(() => {
    loading.value = false;
  }, 1000); // Simulate loading for demo purposes
});
</script>
