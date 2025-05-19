<template>
  <div class="w-full bg-gray-100 min-h-screen">
    <!-- Header -->
    <div class="flex justify-between items-center border-b p-4 border-gray-300 bg-white">
      
      <button class="rounded-full p-2 bg-gray-200" @click="$router.go(-1)">
        <ChevronLeftIcon class="size-5" />
      </button>
      <h1 class="text-lg font-medium text-gray-800">Submit Complaint</h1>
      <!-- Notification Icon -->
      <div @click="navigateTo('notifications')" class="relative bg-gray-300 rounded-full">
        <button class="p-2">
          <BellIcon class="size-5" />
        </button>
        <span v-if="hasUnreadNotifications" class="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
      </div>
    </div>

    <form @submit.prevent="submitComplaint" class="w-full space-y-4 p-4">
      <div class="space-y-2">
        <label class="block text-sm text-gray-600">
          Complaint
        </label>
        <textarea
          type="text"
          placeholder="Enter your complaint"
          v-model="complaint"
          rows="4" cols="50"
          class="w-full px-4 py-3 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 "
        ></textarea>
      </div>
      <button
        type="submit"
        class="w-full py-4 bg-blue-600 text-white rounded-md text-center"
        :disabled="loading"
      >
        {{ loading ? "Submitting..." : "Submit Complaint" }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ChevronLeftIcon, BellIcon } from '@heroicons/vue/24/outline';
import { collection, addDoc } from 'firebase/firestore';


const db = useFirestore();
const userStore = useUserStore();
const toast = useToast();

 const hasUnreadNotifications = ref(false);
const loading = ref(false);

const complaint = ref('');

const submitComplaint = async () => {
  if (!complaint.value ) {
    toast.add({ title: 'Please fill in all fields', color: 'red' });
    return;
  }

  loading.value = true;
  try {
    const complaintsRef = collection(db, 'complaints');

    // Save the new request
    await addDoc(complaintsRef, {
      uid: userStore.getUser,
      message: complaint.value,
      timestamp: new Date()
    });

    toast.add({ title: 'Complaint submitted successfully', color: 'green' });

    // Reset form
    complaint.value = '';
  } catch (error) {
    console.error('Error submitting complaint:', error);
    toast.add({ title: 'Failed to submit complaint', color: 'red' });
  } finally {
    loading.value = false;
  }
};
</script>