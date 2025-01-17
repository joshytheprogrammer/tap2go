<template>
  <div class="space-y-4 px-4 py-4">
    <h2 class="text-xl font-semibold pb-4">Recent Transactions</h2>

    <div class="" v-for="(item, index) in 6"
    :key="index">
      <!-- Transaction Item -->
      <div class="flex justify-between items-center gap-4 pb-4">
        <!-- Icon -->
        <div class="flex gap-4">
          <img 
            src="https://randomuser.me/api/portraits/men/1.jpg" 
            alt="Transaction Icon" 
            class="w-12 h-12 rounded-full"
          />
          
          <!-- Details -->
          <div class="flex flex-col">
            <p class="text-gray-800 font-medium" v-if="item % 2 == 0">Credit Alert</p>
            <p class="text-gray-800 font-medium" v-else>Debit Alert</p>
            <p class="text-sm text-gray-500">3 Days Ago</p>
          </div>
        </div>
        
        <!-- Details -->
        <p class="text-gray-800 font-medium text-lg">₦10,000.00</p>
      </div>
    </div>

  </div>
</template>

<script setup>
</script>
