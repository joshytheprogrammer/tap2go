<template>
  <section class="px-4 py-8">
    <!-- <h2 class="text-4xl font-semibold text-blue-800 pb-8">Make Payment</h2> -->
    <!-- Enter Amount -->
    <div class="mb-6">
      <label
        for="amount"
        class="block text-sm font-medium text-gray-700 mb-2"
      >
        Enter Amount
      </label>
      <input
        id="amount"
        type="text"
        v-model="amount"
        placeholder="₦0"
        class="w-full px-4 py-2 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-semibold "
      />
    </div>

    <!-- Quick Actions -->
    <div class="mb-6">
      <p class="text-sm font-medium text-gray-700 mb-2">Quick Actions</p>
      <div class="flex justify-between">
        <button
          v-for="action in quickActions"
          :key="action"
          @click="selectQuickAction(action)"
          :class="[
            'px-4 py-2 rounded-md border text-sm font-medium',
            action === amount ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-800',
          ]"
        >
          ₦{{ action }}
        </button>
      </div>
    </div>

    <!-- Next Button -->
    <button
      @click="proceedNext"
      class="w-full py-2 bg-blue-600 text-white rounded-md text-center font-medium hover:bg-blue-700"
    >
      Next
    </button>
  </section>
</template>

<script setup>
const amount = ref("5000");
const quickActions = ref([1000, 5000, 10000]);

const selectQuickAction = (value) => {
  amount.value = value.toString();
};

const proceedNext = () => {
  console.log("Proceed with amount:", amount.value);
};

</script>

<style lang="scss" scoped>

</style>