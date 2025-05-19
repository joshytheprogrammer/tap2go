<template>
  <UForm :state="state" @submit.prevent="submitReport" class="space-y-4">
    <UFormGroup label="Describe the issue" name="reportText">
      <UTextarea
        v-model="state.reportText"
        placeholder="Please provide details about the issue you encountered..."
        :rows="5"
        required
        autoresize
      />
    </UFormGroup>

    <UButton
      type="submit"
      :loading="submitting"
      label="Submit Report"
      block
      icon="i-heroicons-paper-airplane"
    />

    <UAlert
      v-if="submitMessage"
      :title="messageType === 'success' ? 'Report Submitted' : 'Submission Error'"
      :description="submitMessage"
      :color="messageType === 'success' ? 'green' : 'red'"
      variant="subtle"
      icon="i-heroicons-check-circle"
      v-show="submitMessage !== ''"
      @close="submitMessage = ''"
      closable
    />
  </UForm>
</template>

<script setup>
import { ref, reactive } from 'vue';
import { useUserStore } from '~/stores/user'; // Assuming your store path

const userStore = useUserStore();
const toast = useToast(); // For more global notifications if needed

const state = reactive({
  reportText: '',
});

const submitting = ref(false);
const submitMessage = ref('');
const messageType = ref(''); // 'success' or 'error'

const submitReport = async () => {
  submitting.value = true;
  submitMessage.value = '';
  messageType.value = '';

  if (!userStore.isAuthenticated) {
    submitMessage.value = 'Error: You must be logged in to submit a report.';
    messageType.value = 'error';
    submitting.value = false;
    toast.add({ title: 'Authentication Error', description: submitMessage.value, color: 'red' });
    return;
  }

  if (!state.reportText.trim()) {
    submitMessage.value = 'Error: Please describe the issue.';
    messageType.value = 'error';
    submitting.value = false;
    toast.add({ title: 'Validation Error', description: submitMessage.value, color: 'orange' });
    return;
  }
  if (state.reportText.trim().length < 10) {
    submitMessage.value = 'Error: Please provide a more detailed description (at least 10 characters).';
    messageType.value = 'error';
    submitting.value = false;
    toast.add({ title: 'Validation Error', description: submitMessage.value, color: 'orange' });
    return;
  }

  try {
    const response = await fetch('/api/driver/report-issue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        driverUid: userStore.getUser, // Ensure getUser provides the UID
        reportText: state.reportText,
      }),
    });

    const result = await response.json();

    if (response.ok && result.success) {
      submitMessage.value = result.message || 'Report submitted successfully!';
      messageType.value = 'success';
      state.reportText = ''; // Clear the textarea
      toast.add({ title: 'Report Sent', description: submitMessage.value, color: 'green' });
    } else {
      throw new Error(result.message || 'Failed to submit report. Please try again.');
    }
  } catch (error) {
    console.error('Error submitting report:', error);
    submitMessage.value = error.message || 'An unexpected error occurred.';
    messageType.value = 'error';
    toast.add({ title: 'Submission Failed', description: submitMessage.value, color: 'red' });
  } finally {
    submitting.value = false;
  }
};
</script>

<style scoped>
/* Scoped styles for issue reporter can be added here if needed */
</style>
