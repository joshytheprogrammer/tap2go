<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Page Header -->
    <div class="mb-8">
      <h1 class="text-2xl font-bold text-gray-900">Driver Profile</h1>
      <p class="text-gray-500">Manage your personal information and account settings</p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-10">
      <UIcon name="i-heroicons-arrow-path" class="text-blue-500 w-8 h-8 animate-spin mb-2" />
      <p class="text-gray-600">Loading your profile...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="p-6 bg-red-50 border border-red-200 rounded-lg text-center mb-6">
      <UIcon name="i-heroicons-exclamation-triangle" class="text-red-500 w-8 h-8 mx-auto mb-2" />
      <p class="text-red-600 font-medium">Error loading profile</p>
      <p class="text-red-500 text-sm mt-1">{{ error }}</p>
      <UButton color="red" variant="soft" size="sm" class="mt-3" @click="fetchProfile(userStore.getUser)">
        Try Again
      </UButton>
    </div>

    <div v-else class="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <!-- Left Column - Profile Picture and Stats -->
      <div class="lg:col-span-1">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900">Profile Information</h2>
              <UBadge color="green" variant="subtle">Active</UBadge>
            </div>
          </template>

          <!-- Profile Picture Section -->
          <div class="flex flex-col items-center py-4">
            <UAvatar 
              :src="editableProfileData.profilePicture || ''" 
              :alt="profileData.name || 'Driver'"
              size="2xl"
              class="mb-4 border-2 border-blue-100 ring-4 ring-blue-50"
            />
            <h3 class="text-xl font-medium text-gray-900 mt-2">
              {{ profileData.name || 'Driver Name' }}
            </h3>
            <p class="text-gray-500 flex items-center gap-1 mt-1">
              <UIcon name="i-heroicons-truck" class="w-4 h-4" />
              {{ profileData.licensePlate || 'No License Plate' }}
            </p>
            
            <div class="mt-6 w-full">
              <UFormGroup label="Profile Picture URL" name="profilePicture">
                <UInput 
                  v-model="editableProfileData.profilePicture"
                  placeholder="https://example.com/image.png"
                  icon="i-heroicons-photo"
                />
              </UFormGroup>
            </div>
          </div>

          <!-- Stats Section -->
          <div class="border-t border-gray-100 pt-4 mt-2">
            <h3 class="font-medium text-gray-900 mb-3">Driver Information</h3>
            <div class="space-y-3">
              <div class="flex justify-between items-center">
                <span class="text-gray-600">License Plate</span>
                <span class="font-medium">{{ profileData.licensePlate }}</span>
              </div>
              <div class="flex justify-between items-center">
                <span class="text-gray-600">Driver ID</span>
                <span class="font-medium truncate">{{ userStore.getUser?.slice(0, 8) || 'N/A' }}</span>
              </div>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Right Column - Editable Profile Information -->
      <div class="lg:col-span-2">
        <UCard>
          <template #header>
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-semibold text-gray-900">Edit Profile</h2>
              <UButton 
                color="blue" 
                variant="soft" 
                size="sm" 
                icon="i-heroicons-arrow-path"
                :loading="loading"
                @click="fetchProfile(userStore.getUser)"
              >
                Refresh
              </UButton>
            </div>
          </template>

          <form @submit.prevent="updateProfile" class="space-y-6">
            <!-- Personal Information Section -->
            <div>
              <h3 class="text-base font-medium text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Personal Information
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UFormGroup label="Full Name" name="name">
                  <UInput 
                    v-model="editableProfileData.name" 
                    placeholder="Enter your full name"
                    icon="i-heroicons-user"
                  />
                </UFormGroup>
                
                <UFormGroup label="Phone Number" name="phoneNumber">
                  <UInput 
                    v-model="editableProfileData.phoneNumber" 
                    placeholder="Enter your phone number"
                    icon="i-heroicons-phone"
                  />
                </UFormGroup>
                
                <UFormGroup label="License Plate (Read-only)" name="licensePlate">
                  <UInput 
                    :model-value="profileData.licensePlate" 
                    readonly
                    class="bg-gray-50"
                    icon="i-heroicons-truck"
                  />
                </UFormGroup>
              </div>
            </div>
            
            <!-- Bank Details Section -->
            <div>
              <h3 class="text-base font-medium text-gray-900 mb-4 pb-2 border-b border-gray-100">
                Bank Details
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <UFormGroup label="Bank Name" name="bankName">
                  <UInput 
                    v-model="editableProfileData.bankName" 
                    placeholder="Enter your bank name"
                    icon="i-heroicons-building-library"
                  />
                </UFormGroup>
                
                <UFormGroup label="Account Number" name="accountNumber">
                  <UInput 
                    v-model="editableProfileData.accountNumber" 
                    placeholder="Enter your account number"
                    icon="i-heroicons-credit-card"
                  />
                </UFormGroup>
              </div>
            </div>
            
            <UDivider />
            
            <!-- Form Actions -->
            <div class="flex justify-between items-center">
              <UButton 
                to="/driver/dashboard" 
                color="gray" 
                variant="soft"
                icon="i-heroicons-arrow-left"
              >
                Back to Dashboard
              </UButton>
              
              <UButton 
                type="submit" 
                color="blue"
                :loading="savingProfile" 
                :disabled="savingProfile"
                icon="i-heroicons-check"
              >
                {{ savingProfile ? 'Saving...' : 'Save Changes' }}
              </UButton>
            </div>
            
            <p v-if="saveMessage" :class="messageClass" class="mt-3 text-sm">
              {{ saveMessage }}
            </p>
          </form>
        </UCard>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, onUnmounted } from 'vue';
import { doc, getDoc, setDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { useUserStore } from '~/stores/user';

const db = useFirestore();
const auth = useFirebaseAuth();
const userStore = useUserStore();
const toast = useToast();

const profileData = ref({
  name: '',
  phoneNumber: '',
  profilePicture: '',
  licensePlate: '',
  bankName: '',
  accountNumber: '',
});

const editableProfileData = reactive({ ...profileData.value });
const loading = ref(true);
const error = ref(null);
const savingProfile = ref(false);
const saveMessage = ref('');
const messageClass = ref('');
let authUnsubscribe = null;

const fetchProfile = async (userId) => {
  loading.value = true;
  error.value = null;

  if (!userId) {
    error.value = "User not authenticated or UID not available in store.";
    loading.value = false;
    return;
  }

  try {
    const profileDocRef = doc(db, 'driverProfile', userId);
    const profileDocSnap = await getDoc(profileDocRef);

    if (profileDocSnap.exists()) {
      const data = profileDocSnap.data();
      profileData.value = {
        name: data.name || '',
        phoneNumber: data.phoneNumber || '',
        profilePicture: data.profilePicture || '',
        licensePlate: data.licensePlate || '',
        bankName: data.bankName || '',
        accountNumber: data.accountNumber || '',
      };
    } else {
      console.log("No driver profile document found in 'driverProfile'. Checking 'drivers_users' for license plate.");
      // Fallback for licensePlate if driverProfile doesn't exist
      const userDocRef = doc(db, 'drivers_users', userId);
      const userDocSnap = await getDoc(userDocRef);
      if (userDocSnap.exists() && userDocSnap.data().licensePlate) {
        profileData.value.licensePlate = userDocSnap.data().licensePlate;
      } else {
        console.log("License plate not found in 'drivers_users' either.");
      }
      // Other fields remain default/empty as driverProfile is the primary source for them
    }
    Object.assign(editableProfileData, profileData.value);

  } catch (e) {
    console.error("Error fetching profile: ", e);
    error.value = e.message;
  } finally {
    loading.value = false;
  }
};

const updateProfile = async () => {
  savingProfile.value = true;
  saveMessage.value = '';
  const userId = userStore.getUser;

  if (!userId) {
    saveMessage.value = "User not authenticated. Cannot update profile.";
    messageClass.value = "text-red-500";
    savingProfile.value = false;
    return;
  }

  try {
    const profileDocRef = doc(db, 'driverProfile', userId);
    
    const dataToSave = {
      name: editableProfileData.name,
      phoneNumber: editableProfileData.phoneNumber,
      profilePicture: editableProfileData.profilePicture,
      bankName: editableProfileData.bankName,
      accountNumber: editableProfileData.accountNumber,
      licensePlate: profileData.value.licensePlate, // Keep the original license plate
      uid: userId,
      updatedAt: Timestamp.now(),
    };

    const profileDocSnap = await getDoc(profileDocRef);
    if (profileDocSnap.exists()) {
      await updateDoc(profileDocRef, dataToSave);
    } else {
      // Document doesn't exist, create it with createdAt
      await setDoc(profileDocRef, {
        ...dataToSave,
        createdAt: Timestamp.now(),
      });
    }
    
    profileData.value = { ...profileData.value, ...dataToSave };
    
    saveMessage.value = "Profile updated successfully!";
    messageClass.value = "text-green-500";
    
    // Show a toast notification
    toast.add({
      title: 'Profile Updated',
      description: 'Your profile has been updated successfully',
      icon: 'i-heroicons-check-circle',
      color: 'green'
    });
  } catch (e) {
    console.error("Error updating profile: ", e);
    saveMessage.value = "Failed to update profile: " + e.message;
    messageClass.value = "text-red-500";
  } finally {
    savingProfile.value = false;
  }
};

onMounted(() => {
  authUnsubscribe = auth.onAuthStateChanged(async (user) => {
    if (user) {
      const userIdFromStore = userStore.getUser;
      if (userIdFromStore) {
        await fetchProfile(userIdFromStore);
      } else {
        error.value = "User authenticated, but UID not available in store. Please refresh or try again.";
        loading.value = false;
      }
    } else {
      loading.value = false;
      error.value = "User not authenticated.";
      Object.keys(profileData.value).forEach(key => profileData.value[key] = '');
      Object.keys(editableProfileData).forEach(key => editableProfileData[key] = '');
    }
  });
});

onUnmounted(() => {
  if (authUnsubscribe) {
    authUnsubscribe();
  }
});
</script>

<style scoped>
/* Scoped styles for profile page */
</style>
