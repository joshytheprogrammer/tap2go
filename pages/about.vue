<template>
  <div class="w-full bg-gray-100 min-h-screen">
    <!-- Header -->
    <div class="flex justify-between items-center border-b p-4 border-gray-300 bg-white">
      <button class="rounded-full p-2 bg-gray-200" @click="$router.go(-1)">
        <ChevronLeftIcon class="size-5" />
      </button>
      <h1 class="text-lg font-medium text-gray-800">About Tap2Go</h1>
      <!-- Notification Icon -->
      <div @click="navigateTo('notifications')" class="relative bg-gray-300 rounded-full">
        <button class="p-2">
          <BellIcon class="size-5" />
        </button>
        <span v-if="hasUnreadNotifications" class="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
      </div>
    </div>

    <!-- Main Content -->
    <div class="px-4 py-6">
      <!-- Mission & Vision Section -->
      <section class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="mb-8">
          <h2 class="text-2xl font-bold text-blue-600 mb-4">Our Mission</h2>
          <p class="text-gray-700 leading-relaxed">
            At Tap2Go, our mission is to revolutionize campus transportation and payment systems by providing a seamless, 
            cashless solution that enhances the mobility experience for students, staff, and drivers alike. We aim to 
            create a more efficient, secure, and sustainable campus ecosystem through innovative technology.
          </p>
        </div>

        <div>
          <h2 class="text-2xl font-bold text-blue-600 mb-4">Our Vision</h2>
          <p class="text-gray-700 leading-relaxed mb-4">
            We envision a future where every campus in Africa embraces digital transformation, where transportation is 
            frictionless, and where financial transactions are secure and instantaneous. Our vision is to be the leading 
            provider of integrated mobility and payment solutions for educational institutions across the continent.
          </p>
          <p class="text-gray-700 leading-relaxed">
            By 2030, we aim to have connected over 100 campuses to our platform, serving millions of students and 
            drastically reducing the carbon footprint of campus transportation systems through improved efficiency and 
            resource allocation.
          </p>
        </div>
      </section>

      <!-- Values Section -->
      <section class="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 class="text-2xl font-bold text-blue-600 mb-4">Our Core Values</h2>
        
        <div class="space-y-4">
          <div class="flex items-start">
            <div class="bg-blue-100 p-2 rounded-full mr-4">
              <UIcon name="i-heroicons-shield-check" class="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 class="font-semibold text-lg text-gray-800">Security & Trust</h3>
              <p class="text-gray-600">We prioritize the security of transactions and user data, building trust through transparency and reliability.</p>
            </div>
          </div>
          
          <div class="flex items-start">
            <div class="bg-blue-100 p-2 rounded-full mr-4">
              <UIcon name="i-heroicons-sparkles" class="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 class="font-semibold text-lg text-gray-800">Innovation</h3>
              <p class="text-gray-600">We continuously seek new ways to improve our services and solve complex problems with elegant solutions.</p>
            </div>
          </div>
          
          <div class="flex items-start">
            <div class="bg-blue-100 p-2 rounded-full mr-4">
              <UIcon name="i-heroicons-user-group" class="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 class="font-semibold text-lg text-gray-800">Community</h3>
              <p class="text-gray-600">We believe in strengthening campus communities by improving mobility and accessibility for all.</p>
            </div>
          </div>
          
          <div class="flex items-start">
            <div class="bg-blue-100 p-2 rounded-full mr-4">
              <UIcon name="i-heroicons-globe-alt" class="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 class="font-semibold text-lg text-gray-800">Sustainability</h3>
              <p class="text-gray-600">We are committed to reducing the environmental impact of campus transportation through smart technology and efficient resource use.</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Impact Section -->
      <section class="bg-white rounded-lg shadow-sm p-6">
        <h2 class="text-2xl font-bold text-blue-600 mb-4">Our Impact</h2>
        
        <div class="grid grid-cols-2 gap-4 mb-6">
          <div class="bg-blue-50 p-4 rounded-lg text-center">
            <div class="text-3xl font-bold text-blue-700 mb-1">30+</div>
            <div class="text-sm text-gray-600">Campus Partners</div>
          </div>
          <div class="bg-blue-50 p-4 rounded-lg text-center">
            <div class="text-3xl font-bold text-blue-700 mb-1">15k+</div>
            <div class="text-sm text-gray-600">Daily Rides</div>
          </div>
          <div class="bg-blue-50 p-4 rounded-lg text-center">
            <div class="text-3xl font-bold text-blue-700 mb-1">50k+</div>
            <div class="text-sm text-gray-600">Active Students</div>
          </div>
          <div class="bg-blue-50 p-4 rounded-lg text-center">
            <div class="text-3xl font-bold text-blue-700 mb-1">95%</div>
            <div class="text-sm text-gray-600">Satisfaction Rate</div>
          </div>
        </div>
        
        <p class="text-gray-700">
          Tap2Go is more than a payment system—it's a movement toward smarter campuses and more connected communities.
          Join us in shaping the future of campus transportation and digital payments.
        </p>
      </section>
    </div>
    
    <!-- Bottom Navigation -->
    <AppBottom />
  </div>
</template>

<script setup>
import { ChevronLeftIcon, BellIcon } from '@heroicons/vue/24/outline';

definePageMeta({
  middleware: ['auth']
});

const hasUnreadNotifications = ref(false);
</script>
