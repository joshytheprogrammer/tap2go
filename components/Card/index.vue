<template>
  <div class="w-full min-h-screen p-4">
    <!-- Card Display -->
    <div class="mt-6 flex justify-center">
      <div class="w-80 h-48 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-4 text-white shadow-lg flex justify-between items-end ">
        <span class="text-lg font-semibold">22CG032043</span>
        <img src="@/assets/card-chip.svg" alt="Card Chip" class="w-10" />
      </div>
    </div>

    <!-- Settings -->
    <div class="mt-6">
      <h2 class="text-lg font-semibold text-gray-800">Settings</h2>
      <div class="bg-gray-100 p-4 mt-3 rounded-xl flex justify-between items-center shadow">
        <div class="flex items-center space-x-3">
          <div class="text-blue-600 text-2xl">💳</div>
          <p class="text-gray-700 text-sm">Deactivate Card</p>
        </div>
        <input type="checkbox" v-model="isCardDeactivated" class="toggle-checkbox hidden">
        <div @click="toggleSwitch" class="w-12 h-6 flex items-center  rounded-full p-1 cursor-pointer"
          :class="{'bg-blue-500': isCardDeactivated, 'bg-gray-500': !isCardDeactivated}">
          <div class="w-5 h-5 bg-white rounded-full shadow-md transform transition-transform"
            :class="{'translate-x-5': isCardDeactivated, 'translate-x-0': !isCardDeactivated}">
          </div>
        </div>
      </div>
    </div>

    <!-- Save Button -->
    <div class="mt-6 flex justify-center">
      <button class="w-full max-w-xs bg-blue-600 text-white py-3 rounded-lg text-lg font-semibold shadow-md hover:bg-blue-700 transition">
        Save
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const isCardDeactivated = ref(false);

const toggleSwitch = () => {
  isCardDeactivated.value = !isCardDeactivated.value;
};
</script>
