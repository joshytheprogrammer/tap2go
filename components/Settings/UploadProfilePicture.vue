<template>
  <div>
    <div class="flex flex-col items-center mb-6">
      <img
        :src="profileUrl"
        alt="Profile Picture"
        class="w-24 h-24 rounded-full object-cover"
      />
      <button
        @click="changePicture"
        class="text-blue-600 text-sm mt-2 underline"
      >
        Change Picture
      </button>
    </div>

    <!-- UModal for uploading profile picture -->
    <UModal v-model="isOpen">
      <div class="p-6">
        <h3 class="text-lg font-semibold mb-8">Upload Profile Picture</h3>

        <label class="block mb-2 text-sm font-medium text-gray-900 dark:text-white" for="file_upload">Upload file</label>
        <input class="w-full text-gray-500 font-medium text-sm bg-gray-100 file:cursor-pointer cursor-pointer file:border-0 file:py-2.5 file:px-4 file:mr-4 file:bg-gray-800 file:hover:bg-gray-700 file:text-white rounded"
        type="file"
        accept="image/*"
        @change="onFileChange"
        id="file-upload" />
          
        <div v-if="uploading" class="mt-4">
          <p class="text-sm text-gray-500">Uploading... Please wait.</p>
        </div>
        <div v-else class="flex justify-between mt-6">
          <button
            @click="uploadPicture"
            class="px-4 py-2 bg-blue-600 text-white rounded-md"
            :disabled="!selectedFile"
          >
            Upload
          </button>
          <button
            @click="toggleModal"
            class="ml-2 px-4 py-2 bg-gray-300 text-black rounded-md"
          >
            Cancel
          </button>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup>
import { useUserStore } from '@/store/user';
import { doc, updateDoc } from 'firebase/firestore';

const props = defineProps(['profilePictureUrl']);
const emit = defineEmits(['update:profilePictureUrl']);

const isOpen = ref(false);
const selectedFile = ref(null);
const uploading = ref(false);
const profileUrl = ref(props.profilePictureUrl);
const toast = useToast();
const userStore = useUserStore();
const db = useFirestore();

const toggleModal = () => {
  isOpen.value = !isOpen.value;
};

const onFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    selectedFile.value = file;
  }
};

const generateSignature = async (folder, timestamp) => {
  const paramsToSign = { folder, timestamp };
  const serializedParams = Object.entries(paramsToSign)
    .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
    .map(([key, value]) => `${key}=${value}`)
    .join('&');

  const apiSecret = useRuntimeConfig().cloudinarySecret;
  const signatureString = `${serializedParams}${apiSecret}`;
  
  const encoder = new TextEncoder();
  const data = encoder.encode(signatureString);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
};

const uploadToCloudinary = async (formData) => {
  const cloudinaryResponse = await $fetch('https://api.cloudinary.com/v1_1/dsgvwxygr/image/upload', {
    method: 'POST',
    body: formData,
  });
  return cloudinaryResponse.secure_url;
};

const updateProfilePictureInFirestore = async (uploadedUrl) => {
  const userDocRef = doc(db, 'userProfile', userStore.getUser.uid);
  await updateDoc(userDocRef, { profilePicture: uploadedUrl });
};

const showToast = (message, color) => {
  toast.add({
    title: message.title,
    description: message.description,
    color,
  });
};

const uploadPicture = async () => {
  if (!selectedFile.value) {
    showToast({ title: 'No file selected', description: 'Please select an image to upload.' }, 'red');
    return;
  }

  uploading.value = true;

  try {
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = 'tap2go/profilePictures';

    const signature = await generateSignature(folder, timestamp);

    const formData = new FormData();
    formData.append('file', selectedFile.value);
    formData.append('folder', folder);
    formData.append('timestamp', timestamp);
    formData.append('signature', signature);
    formData.append('api_key', '521893998441623');

    const uploadedUrl = await uploadToCloudinary(formData);

    await updateProfilePictureInFirestore(uploadedUrl);

    profileUrl.value = uploadedUrl;
    showToast({ title: 'Upload Successful', description: 'Your profile picture has been updated.' }, 'green');
    toggleModal();
  } catch (error) {
    console.error('Error uploading profile picture:', error);
    showToast({ title: 'Upload Failed', description: 'An error occurred during the upload. Please try again.' }, 'red');
  } finally {
    uploading.value = false;
    selectedFile.value = null;
  }
};

const changePicture = () => {
  toggleModal();
};
</script>
