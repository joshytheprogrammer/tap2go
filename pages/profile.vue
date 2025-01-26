<template>
  <div class="w-full bg-gray-100 min-h-screen">
    <!-- Header -->
    <div class="flex justify-between items-center border-b p-4 border-gray-300 bg-white">
      
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

    <div class=" flex flex-col items-center px-4 py-6 " v-if="!loading" >
      <!-- Profile Picture -->
      <SettingsUploadProfilePicture :profilePictureUrl="profilePictureUrl" />
 
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
            class="w-full px-4 py-3 border rounded-md text-gray-800 focus:outline-none focus:ring-2 disabled:bg-gray-200 focus:ring-blue-500 "
            :disabled="field.disabled"
          />
          <a class="text-blue-600 text-sm mt-2 underline" v-if="field.name=='telegramAccount' && field.value.length == 0" :href="'https://t.me/tap2go_bot?start='+userStore.getUser.uid">Connect Telegram Account</a>
        </div>
        <button
          type="submit"
          class="w-full py-4 bg-blue-600 text-white rounded-md text-center"
        >
          Save
        </button>
      </form>
    </div>

    <p class="text-center text-gray-600 py-8" v-else>Loading...</p>
  </div>
</template>

<script setup>
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useUserStore } from '@/store/user';
import { ChevronLeftIcon, BellIcon } from '@heroicons/vue/24/outline';

definePageMeta({
  middleware: ['auth']
});

const hasUnreadNotifications = ref(false);

const db = useFirestore();
const userStore = useUserStore();
const profileFields = ref([
  { name: "name", label: "Your Name", placeholder: "Change Name", value: "", type: "text", disabled: false },
  { name: "email", label: "Email", placeholder: "", value: "", type: "email", disabled: true },
  { name: "matricNumber", label: "Matric Number", placeholder: "", value: "", type: "text", disabled: true },
  { name: "telegramAccount", label: "Connected Telegram Account", placeholder: "", value: "", type: "text", disabled: true },
  { name: "password", label: "Password", placeholder: "", value: "********", type: "password", disabled: true },
]);

const profilePictureUrl = ref('');
const loading = ref(true);

const fetchUserProfile = async () => {
  try {
    const userDoc = doc(db, 'users', userStore.getUser.uid);
    const userSnapshot = await getDoc(userDoc);
    let userData = {};
    
    if (userSnapshot.exists()) {
      userData = userSnapshot.data();
    }
    
    const profileDoc = doc(db, 'userProfile', userStore.getUser.uid);
    const profileSnapshot = await getDoc(profileDoc);
    
    if (profileSnapshot.exists()) {
      userData = { ...userData, ...profileSnapshot.data() };
    }

    profilePictureUrl.value = userData["profilePicture"];
    
    profileFields.value.forEach(field => {
      if (userData[field.name] !== undefined) {
        field.value = userData[field.name];
      }
    });

  } catch (error) {
    console.error('Error fetching profile:', error);
  } finally {
    loading.value = false;
  }
};

const isValidName = (name) => {
  const nameParts = name.trim().split(/\s+/);
  return nameParts.length >= 2;
};

const saveProfile = async () => {
  try {
    loading.value = true
    const nameField = profileFields.value.find(field => field.name === 'name');

    if (!isValidName(nameField.value)) {
      console.error('Invalid name. Please enter both first and last name.');
      return;
    }

    const profileDoc = doc(db, 'userProfile', userStore.getUser.uid);
    await updateDoc(profileDoc,  { name: nameField.value });
    
    toast.add({title: 'Profile updated successfully'});
  } catch (error) {
    console.error('Error updating profile:', error);
  } finally {
    loading.value = false;
  }
};

onMounted(fetchUserProfile);
</script>

