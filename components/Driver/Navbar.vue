<template>
  <div class="bg-white shadow-sm border-b border-gray-200">
    <UContainer>      <nav class="flex items-center justify-between h-16">
        <!-- Left side - Logo and brand -->
        <div class="flex items-center gap-2">
          <NuxtLink to="/driver/dashboard" class="flex items-center">
            <span class="text-blue-600 font-bold text-xl">Tap2Go</span>
            <span class="text-sm bg-blue-100 text-blue-700 font-medium px-2 py-0.5 rounded ml-2">Driver</span>
          </NuxtLink>
        </div>

        <!-- Hide all navigation on all screen sizes - move to mobile menu -->
        <div class="hidden">
          <!-- Navigation items moved to mobile menu -->
        </div>

        <!-- Right side - User actions -->
        <div class="flex items-center">
          <!-- Notifications -->
          <UButton
            icon="i-heroicons-bell"
            color="gray"
            variant="ghost"
            class="relative mr-2"
            :ui="{ rounded: 'rounded-full' }"
          >
            <UBadge color="red" size="xs" class="absolute -top-1 -right-1" v-if="notificationsCount > 0">
              {{ notificationsCount }}
            </UBadge>
          </UButton>
          
          <!-- User dropdown -->
          <UDropdown :items="userMenuItems" :popper="{ placement: 'bottom-end' }">
            <UButton color="gray" variant="ghost" :ui="{ rounded: 'rounded-full' }">
              <div class="flex items-center gap-2">
                <UAvatar 
                  v-if="userProfilePic" 
                  :src="userProfilePic" 
                  size="sm"
                />
                <UAvatar 
                  v-else
                  :ui="{ 
                    background: 'bg-blue-100',
                    text: 'text-blue-600 font-medium text-sm'
                  }"
                  size="sm"
                >
                  {{ userInitials }}
                </UAvatar>
                <!-- <UAvatar 
                  v-else
                  :ui="{ 
                    background: 'bg-blue-100',
                    text: 'text-blue-600 font-medium text-sm'
                  }"
                  size="sm"
                >
                  <img :src="userStore.getProfilePic" alt="User Initials" class="w-6 h-6 rounded-full" />
                </UAvatar> -->
                <span class="hidden sm:inline text-sm font-medium">{{ userName }}</span>
                <UIcon name="i-heroicons-chevron-down" class="w-4 h-4" />
              </div>
            </UButton>
          </UDropdown>
        </div>
      </nav>
    </UContainer>
    
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useUserStore } from '~/stores/user';
import { signOut } from 'firebase/auth';
import { useFirebaseAuth } from 'vuefire';

// State
const isMobileMenuOpen = ref(false);
const notificationsCount = ref(0);
const userStore = useUserStore();
const route = useRoute();
const auth = useFirebaseAuth();
const toast = useToast();

// Computed properties
const activeRoute = computed(() => {
  const path = route.path;
  if (path.includes('/driver/dashboard')) return 'dashboard';
  if (path.includes('/driver/profile')) return 'profile';
  return '';
});

const userName = computed(() => {
  return userStore.getUser?.displayName || 'Driver';
});

const userProfilePic = computed(() => {
  return userStore.getUser?.photoURL || '';
});

const userInitials = computed(() => {
  const name = userName.value;
  if (!name || name === 'Driver') return 'D';
  
  return name.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
});

// User menu dropdown items
const userMenuItems = computed(() => [
  [
    {
      label: 'My Profile',
      icon: 'i-heroicons-user-circle',
      to: '/driver/profile'
    },
    {
      label: 'Transaction History',
      icon: 'i-heroicons-clipboard-document-list',
      to: '/driver/transactions'
    },
    {
      label: 'Help & Support',
      icon: 'i-heroicons-question-mark-circle',
      to: '/driver/support'
    },
    {
      label: 'Settings',
      icon: 'i-heroicons-cog-6-tooth',
      to: '/driver/settings'
    }
  ],
  [
    {
      label: 'Logout',
      icon: 'i-heroicons-arrow-right-on-rectangle',
      click: logout,
      color: 'red'
    }
  ]
]);

// Methods
function navigateToDashboard(section) {
  // Implement navigation to specific dashboard sections
  // This is a placeholder for future functionality
  navigateTo('/driver/dashboard');
}

function reportIssue() {
  // This would typically open the issue reporter
  // For now, we'll just show a toast notification
  toast.add({
    title: 'Report an Issue',
    description: 'Issue reporting feature will be available soon',
    icon: 'i-heroicons-flag',
    color: 'yellow'
  });
}

async function logout() {
  try {
    await signOut(auth);
    userStore.clearUser();
    toast.add({
      title: 'Logged out',
      description: 'You have been successfully logged out',
      icon: 'i-heroicons-check-circle',
      color: 'green'
    });
    navigateTo('/driver/login');
  } catch (error) {
    console.error('Error signing out:', error);
    toast.add({
      title: 'Error',
      description: 'Could not log out. Please try again.',
      icon: 'i-heroicons-exclamation-triangle',
      color: 'red'
    });
  }
}

// Close mobile menu when route changes
watch(() => route.path, () => {
  isMobileMenuOpen.value = false;
});

// Fetch notification count (placeholder)
onMounted(() => {
  // This would typically fetch notifications from a backend
  // For now, we'll just use a static number
  notificationsCount.value = 2;
});
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
</style>
