<template>
  <section class="w-full min-h-screen bg-white">
    <!-- Header -->
    <div class="flex justify-between items-center p-4 border-b border-gray-300">
      <button class="rounded-full p-2 bg-gray-200" @click="$router.go(-1)">
        <ChevronLeftIcon class="size-5" />
      </button>
      <h1 class="text-lg font-semibold">Notifications</h1>
      <span></span>
    </div>

    <!-- Notifications Section -->
    <div class="p-4 space-y-6">

      <!-- Today Section -->
      <div>
        <h2 class="text-lg font-semibold text-gray-800 py-4">Today</h2>

        <div class="mt-2 space-y-3">
          <div class="flex justify-start items-center space-x-3 p-3 border rounded-lg shadow-sm">
            <div class="text-blue-600 text-2xl">💳</div>
            <p class="text-gray-700 text-sm">
              You just spent <span class="font-bold">₦2,000</span> on your ride.
            </p>
          </div>
        </div>
      </div>

      <!-- This Week Section -->
      <div>
        <h2 class="text-lg font-semibold text-gray-800 py-4">This Week</h2>
        
        <div class="flex justify-start items-center space-x-3 p-3 border rounded-lg shadow-sm">
            <div class="text-blue-600 text-2xl">📝</div>
            <p class="text-gray-700 text-sm">
              You haven't used your card in 30 years. Please na make we chop small.
            </p>
          </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'

definePageMeta({
  middleware: ['auth']
});
</script>


