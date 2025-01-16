<template>
  <div>
    <AppComingSoon />
    <AppBottom />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['auth']
});
</script>