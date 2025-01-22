<template>
  <div class="sticky top-0 bg-white shadow-md flex items-center justify-between p-4">
    <!-- Profile Section -->
    <div @click="navigateTo('profile')" class="flex items-center gap-2 cursor-pointer">
      <AppUserProfilePicture width="10" height="10" />
    </div>

    <NuxtLink to="/" class="text-2xl text-gray-800 cursor-pointer uppercase font-semibold">Tap2Go</NuxtLink>

    <!-- Notification Icon -->
    <div @click="navigateTo('notifications')" class="relative bg-gray-300 rounded-full">
      <button class="p-2">
        <BellIcon class="size-5" />
      </button>
      <!-- Will only display if there is a notification that is marked as unread. -->
      <span class="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
    </div>
  </div>
</template>

<script setup>
  import { BellIcon } from '@heroicons/vue/24/outline'
</script>
