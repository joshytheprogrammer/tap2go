<template>
  <div class="w-full bg-gray-100 min-h-screen">
    <!-- Header -->
    <div class="flex justify-between items-center border-b p-4 border-gray-300 bg-white">
      <button class="rounded-full p-2 bg-gray-200" @click="$router.go(-1)">
        <ChevronLeftIcon class="size-5" />
      </button>
      <h1 class="text-lg font-medium text-gray-800">Request Card</h1>
      <!-- Notification Icon -->
      <div @click="navigateTo('notifications')" class="relative bg-gray-300 rounded-full">
        <button class="p-2">
          <BellIcon class="size-5" />
        </button>
        <span v-if="hasUnreadNotifications" class="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full"></span>
      </div>
    </div>

    <form @submit.prevent="submitRequest" class="w-full space-y-4 p-4">
      <div class="space-y-2">
        <label class="block text-sm text-gray-600"> Hall </label>
        <input
          type="text"
          placeholder="Enter your hall"
          v-model="hall"
          class="w-full px-4 py-3 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 "
          required
        />
      </div>
      <div class="space-y-2">
        <label class="block text-sm text-gray-600"> Room Number </label>
        <input
          type="text"
          placeholder="Enter your room number"
          v-model="room"
          class="w-full px-4 py-3 border rounded-md text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 "
          required
        />
      </div>
      <button
        type="submit"
        class="w-full py-4 bg-blue-600 text-white rounded-md text-center"
        :disabled="loading"
      >
        {{ loading ? "Submitting..." : "Request New Card" }}
      </button>
    </form>
  </div>
</template>

<script setup>
import { ChevronLeftIcon, BellIcon } from '@heroicons/vue/24/outline';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { useUserStore } from '@/store/user';

const db = useFirestore();
const userStore = useUserStore();
const toast = useToast();

 const hasUnreadNotifications = ref(false);
const hall = ref('');
const room = ref('');
const loading = ref(false);

const submitRequest = async () => {
  if (!hall.value || !room.value) {
    toast.add({ title: 'Please fill in all fields', color: 'red' });
    return;
  }

  loading.value = true;
  try {
    const cardRequestRef = collection(db, 'cardRequests');

    // Check if a request already exists for this user
    const q = query(cardRequestRef, where('uid', '==', userStore.getUser.uid));
    const querySnapshot = await getDocs(q);

    if (!querySnapshot.empty) {
      toast.add({ title: 'You have already requested a card', color: 'orange' });
      loading.value = false;
      return;
    }

    // Save the new request
    await addDoc(cardRequestRef, {
      uid: userStore.getUser.uid,
      hall: hall.value,
      room: room.value,
      timestamp: new Date()
    });

    toast.add({ title: 'Card request submitted successfully', color: 'green' });

    // Reset form
    hall.value = '';
    room.value = '';
  } catch (error) {
    console.error('Error submitting card request:', error);
    toast.add({ title: 'Failed to submit card request', color: 'red' });
  } finally {
    loading.value = false;
  }
};
</script>
