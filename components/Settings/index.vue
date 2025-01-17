<template>
  <section class="w-full min-h-screen ">
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
    <div class="flex flex-col items-center mt-6">
      <img src="https://randomuser.me/api/portraits/men/1.jpg" alt="Profile" class="w-28 h-28 rounded-full border-2 border-gray-300">
      <p class="text-blue-600 text-xl font-semibold mt-2 ">Change Name</p>
    </div>

    <!-- Menu Options -->
    <div class="mt-8 space-y-3 px-4">
      <button @click="navigateTo('/profile')" class="w-full bg-blue-600 text-white p-4 rounded-lg text-center font-semibold flex justify-between items-center">
        Manage Profile
        <ChevronRightIcon class="size-5 text-white" />
      </button>
      <div v-for="option in menuOptions" :key="option.label" @click="navigateTo(option.url)" class="flex justify-between items-center p-4 border-b border-gray-200 cursor-pointer rounded-lg text-gray-700 hover:text-white hover:bg-blue-600">
        <p class="">{{ option.label }}</p>
        <ChevronRightIcon class="size-5" />
      </div>
      <AppLogoutButton />
    </div>
  </section>
</template>

<script setup>
import { ChevronLeftIcon, BellIcon, ChevronRightIcon } from '@heroicons/vue/24/outline'

const hasUnreadNotifications = ref(true)

const menuOptions = ref([
  { label: "Request New Card", url: 'request-card' },
  { label: "Submit Complaints", url: 'submit-complaint' },
  { label: "Contact", url: 'contact' }
]);

</script>
