<template>
  <section class="flex justify-center w-full items-center text-center py-12">
    <div class="space-y-1.5">
      <p class="text-slate-500 text-sm">Available Balance</p>
      <h2 class="text-2xl font-bold">
        {{ 
          new Intl.NumberFormat('en-NG', {style: 'currency', currency: 'NGN'}).format(5000.75)
        }}
      </h2>
      <p>
        <NuxtLink class="text-base font-semibold  cursor-pointer text-primary-700 underline underline-offset-4">Fund Account</NuxtLink>
      </p>
    </div>
  </section>
</template>

<script setup>

</script>

<style lang="scss" scoped>

</style>