<template>
  <div class="w-full h-screen overflow-y-auto">
    <!-- Header -->
    <div class="flex justify-between items-center p-4 border-b border-gray-300 bg-white">
      <button class="rounded-full p-2 bg-gray-200" @click="$router.go(-1)">
        <ChevronLeftIcon class="size-5" />
      </button>
      <h1 class="text-lg font-semibold">Settings</h1>

      <!-- Notification Icon -->
      <div @click="navigateTo('notifications')" class="relative bg-gray-300 rounded-full">
        <button class="p-2">
          <BellIcon class="size-5" />
        </button>
        <span v-if="hasUnreadNotifications" class="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
      </div>
    </div>

    <!-- Profile Section -->
    <div class="flex flex-col items-center pt-6">
      <img :src="profilePicture" alt="Profile" class="w-28 h-28 rounded-full border-2 border-gray-300">
      <p class="text-blue-600 text-xl font-semibold mt-2 ">{{ userName }}</p>
    </div>

    <!-- <div class="">
      <HomeBalance />
      <HomeSummary />
      <HomeRecent />
    </div> -->

    <!-- Menu Options -->
    <div class="py-8 mb-16 space-y-3 px-4 block">
      <button @click="navigateTo('/profile')" class="w-full bg-blue-600 text-white p-4 rounded-lg text-center font-semibold flex justify-between items-center">
        Manage Profile
        <ChevronRightIcon class="size-5 text-white" />
      </button>
      <button v-for="option in menuOptions" :key="option.label" @click="navigateTo(option.url)" class="flex justify-between items-center w-full p-4 border-b border-gray-200 cursor-pointer rounded-lg text-gray-700 hover:text-white hover:bg-blue-600">
        <p class="">{{ option.label }}</p>
        <ChevronRightIcon class="size-5" />
      </button>
      <AppLogoutButton />
    </div>
  </div>
</template>

<script setup>
import { doc, onSnapshot } from 'firebase/firestore';


import { ChevronLeftIcon, BellIcon, ChevronRightIcon } from '@heroicons/vue/24/outline';

const db = useFirestore();
const userStore = useUserStore();

const profilePicture = ref('');
const userName = ref('Loading...');
const hasUnreadNotifications = ref(false);

const menuOptions = ref([
  { label: "Request New Card", url: 'request-card' },
  { label: "Submit Complaints", url: 'submit-complaint' },
  { label: "Contact", url: 'contact' },
  { label: "About Tap2Go", url: 'about' }
]);

// Fetch profile details in real-time
const fetchUserProfile = () => {
  const profileDocRef = doc(db, 'userProfile', userStore.getUser);

  const unsubscribe = onSnapshot(profileDocRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      profilePicture.value = data.profilePicture || 'https://randomuser.me/api/portraits/men/1.jpg';
      userName.value = data.name || 'Change Name';
    }
  }, (error) => {
    console.error('Error fetching profile:', error);
  });

  // Cleanup listener on unmount
  onUnmounted(() => unsubscribe());
};

// Call fetchUserProfile immediately
fetchUserProfile();
</script>