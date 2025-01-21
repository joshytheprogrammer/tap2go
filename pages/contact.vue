<template>
  <div class="w-full bg-gray-100 min-h-screen">
    <!-- Header -->
    <div class="flex justify-between items-center border-b p-4 border-gray-300 bg-white">
      
      <button class="rounded-full p-2 bg-gray-200" @click="$router.go(-1)">
        <ChevronLeftIcon class="size-5" />
      </button>
      <h1 class="text-lg font-medium text-gray-800">Contact</h1>
      <!-- Notification Icon -->
      <div @click="navigateTo('notifications')" class="relative bg-gray-300 rounded-full">
        <button class="p-2">
          <BellIcon class="size-5" />
        </button>
        <span v-if="hasUnreadNotifications" class="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
      </div>
    </div>

    <form @submit.prevent="" class="w-full space-y-4 p-4">
      <div class="space-y-2">
        <label class="block text-sm text-gray-600">
          Call us
        </label>
        <input
          type="text"
          value="+234 702 745 6123"
          class="w-full px-4 py-3 border rounded-md text-gray-800 focus:outline-none focus:ring-2 disabled:bg-gray-200 focus:ring-blue-500 "
          disabled
        />
      </div>
      <div class="space-y-2">
        <label class="block text-sm text-gray-600">
          Email
        </label>
        <input
          type="text"
          value="support@tap2go.com"
          class="w-full px-4 py-3 border rounded-md text-gray-800 focus:outline-none focus:ring-2 disabled:bg-gray-200 focus:ring-blue-500 "
          disabled
        />
      </div>
    </form>
  </div>
</template>

<script setup>
import { ChevronLeftIcon, BellIcon } from '@heroicons/vue/24/outline';

const hasUnreadNotifications = ref(true);


</script>