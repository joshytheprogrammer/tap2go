<template>
  <div>
    <AppBottom />
  </div>
</template>

<script setup>
definePageMeta({
  middleware: ['auth']
});
</script>