<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-lg">
      <h1 class="text-2xl font-bold mb-6 text-center">Driver Registration</h1>

      <form @submit.prevent="handleRegister">
        <div class="block gap-4">
          <div class="mb-4">
            <label for="name" class="block text-sm font-medium text-gray-700">Full Name</label>
            <UInput
              id="name"
              v-model="name"
              type="text"
              required
              placeholder="Enter your full name"
              class="mt-1 block w-full"
            />
          </div>

          <div class="mb-4">
            <label for="licensePlate" class="block text-sm font-medium text-gray-700">License Plate</label>
            <UInput
              id="licensePlate"
              v-model="licensePlate"
              type="text"
              required
              placeholder="e.g., ABC123XYZ"
              class="mt-1 block w-full"
            />
          </div>

          <div class="mb-4">
            <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
            <UInput
              id="email"
              v-model="email"
              type="email"
              required
              placeholder="Enter your email"
              class="mt-1 block w-full"
            />
          </div>

          <div class="mb-4">
            <label for="phoneNumber" class="block text-sm font-medium text-gray-700">Phone Number</label>
            <UInput
              id="phoneNumber"
              v-model="phoneNumber"
              type="tel"
              required
              placeholder="Enter your phone number"
              class="mt-1 block w-full"
            />
          </div>

          <div class="mb-4">
            <label for="password" class="block text-sm font-medium text-gray-700">Password</label>
            <UInput
              id="password"
              v-model="password"
              type="password"
              required
              placeholder="Create a password"
              class="mt-1 block w-full"
            />
          </div>

          <div class="mb-4">
            <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirm Password</label>
            <UInput
              id="confirmPassword"
              v-model="confirmPassword"
              type="password"
              required
              placeholder="Confirm your password"
              class="mt-1 block w-full"
            />
          </div>
        </div>

        <UButton
          type="submit"
          label="Register"
          color="primary"
          block
          class="mt-6"
          :loading="loading"
        />

        <div v-if="error" class="mt-4 text-red-500 text-sm text-center">
          {{ error }}
        </div>
      </form>

      <p class="mt-6 text-center text-sm text-gray-600">
        Already have an account?
        <NuxtLink to="/driver/login" class="font-medium text-indigo-600 hover:text-indigo-500">
          Login here
        </NuxtLink>
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useUserStore } from '~/stores/user'

const name = ref('')
const licensePlate = ref('')
const email = ref('')
const phoneNumber = ref('')
const password = ref('')
const confirmPassword = ref('')
const loading = ref(false)
const error = ref(null)

const router = useRouter()
const toast = useToast()
const userStore = useUserStore()

const handleRegister = async () => {
  loading.value = true
  error.value = null

  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.'
    loading.value = false
    return
  }

  try {
    const response = await $fetch('/api/auth/driver/register', {
      method: 'POST',
      body: {
        name: name.value,
        licensePlate: licensePlate.value.toUpperCase(),
        email: email.value,
        phoneNumber: phoneNumber.value,
        password: password.value,
      },
    })

    if (response.statusCode === 201) {
      toast.add({
        title: 'Registration Successful',
        description: 'Please login to continue.',
        color: 'green',
      })
      router.push('/driver/login')
    } else {
      error.value = response.body.message || 'Registration failed. Please try again.'
    }
  } catch (err) {
    console.error('Registration error:', err)

    if (err?.data?.body?.message) {
      error.value = err.data.body.message
    } else if (err.message) {
      error.value = err.message
    } else {
      error.value = 'An unexpected error occurred. Please try again.'
    }
  }

  loading.value = false
};

// Optional page middleware
// definePageMeta({
//   middleware: 'redirect-if-authenticated'
// })
</script>

<style scoped>
/* Add any specific styles for the registration page here */
</style>
