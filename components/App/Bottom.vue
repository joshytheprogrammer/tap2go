<template>
  <div class="fixed bottom-0 left-0 w-full shadow-lg">
    <div class="w-full max-w-md mx-auto flex bg-white justify-between p-4 border-t-1">
      <NuxtLink to="/" class="flex flex-col items-center text-gray-600">
        <HomeIcon class="size-5" />
        <span class="text-sm">Home</span>
      </NuxtLink>
      
      <!-- Icon 2 -->
      <NuxtLink to="/schedule" class="flex flex-col items-center text-gray-600">
        <CalendarDaysIcon class="size-5" />
        <span class="text-sm">Schedule</span>
      </NuxtLink>

      <!-- Icon 3 -->
      <NuxtLink to="/cards" class="flex flex-col items-center text-gray-600">
        <CreditCardIcon class="size-5" />
        <span class="text-sm">Cards</span>
      </NuxtLink>

      <!-- Icon 4 -->
      <NuxtLink to="/settings" class="flex flex-col items-center text-gray-600">
        <Cog6ToothIcon class="size-5" />
        <span class="text-sm">Profile</span>
      </NuxtLink>
    </div>
  </div>
</template>

<script setup>
  import { HomeIcon, CalendarDaysIcon, CreditCardIcon, Cog6ToothIcon } from '@heroicons/vue/24/outline'
</script>

