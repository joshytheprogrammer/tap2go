<template>
  <div class="bg-gray-100 flex flex-col items-center px-4 py-6">
    <!-- Header -->
    <div class="w-full flex items-center justify-between mb-6">
      
      <button class="rounded-full p-2 bg-gray-200" @click="$router.go(-1)">
        <ChevronLeftIcon class="size-5" />
      </button>
      <h1 class="text-lg font-medium text-gray-800">Profile</h1>
      <!-- Notification Icon -->
      <div @click="navigateTo('notifications')" class="relative bg-gray-300 rounded-full">
        <button class="p-2">
          <BellIcon class="size-5" />
        </button>
        <span v-if="hasUnreadNotifications" class="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
      </div>
    </div>

    <!-- Profile Picture -->
    <div class="flex flex-col items-center mb-6">
      <img
        src="https://randomuser.me/api/portraits/men/1.jpg"
        alt="Profile Picture"
        class="w-24 h-24 rounded-full object-cover"
      />
      <button
        @click="changePicture"
        class="text-blue-600 text-sm mt-2 underline"
      >
        Change Picture
      </button>
    </div>

    <!-- Form Fields -->
    <form @submit.prevent="saveProfile" class="w-full space-y-4">
      <div v-for="(field, index) in profileFields" :key="index" class="space-y-2">
        <label :for="field.name" class="block text-sm text-gray-600">
          {{ field.label }}
        </label>
        <input
          :id="field.name"
          :type="field.type"
          :placeholder="field.placeholder"
          v-model="field.value"
          class="w-full px-4 py-3 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          :disabled="field.disabled"
        />
      </div>
      <button
        type="submit"
        class="w-full py-4 bg-blue-600 text-white rounded-md text-center"
      >
        Save
      </button>
    </form>
  </div>
</template>

<script setup>
import { ChevronLeftIcon, BellIcon } from '@heroicons/vue/24/outline';

const hasUnreadNotifications = ref(true);

const profileFields = ref([
  { name: "name", label: "Your Name", placeholder: "Change Name", value: "", type: "text", disabled: false },
  { name: "email", label: "Email", placeholder: "", value: "Jonathan.123@stu.cu.edu.ng", type: "email", disabled: true },
  { name: "matric", label: "Matric Number", placeholder: "", value: "22CG032043", type: "text", disabled: true },
  { name: "telegram", label: "Connected Telegram Number", placeholder: "", value: "07092123434", type: "text", disabled: true },
  { name: "password", label: "Password", placeholder: "", value: "********", type: "password", disabled: true },
]);

const changePicture = () => {
  console.log("Change picture clicked");
};

const saveProfile = () => {
  console.log("Save profile", profileFields.value);
};

</script>

