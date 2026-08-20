<script setup lang="ts">
import { ref } from 'vue'
import Dialog from '@/components/ui/Dialog.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import { adminUserService } from '@/services/admin-user.service'
import { getErrorMessage } from '@/services/api'
import type { AdminUserSummaryResponse } from '@/types/user.types'
import { Loader2, KeyRound } from 'lucide-vue-next'

interface Props {
  open: boolean
  user: AdminUserSummaryResponse | null
}

const props = defineProps<Props>()
const emits = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'updated'): void
}>()

const newPassword = ref('')
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

async function handleSubmit() {
  if (!props.user || !newPassword.value) return
  if (newPassword.value.length < 8) {
    errorMessage.value = 'Mật khẩu phải có tối thiểu 8 ký tự.'
    return
  }

  errorMessage.value = null
  isSubmitting.value = true

  try {
    await adminUserService.resetPassword(props.user.id, { newPassword: newPassword.value.trim() })
    emits('updated')
    emits('update:open', false)
    newPassword.value = ''
  } catch (err) {
    errorMessage.value = getErrorMessage(err)
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Dialog
    :open="open"
    :title="`Đặt lại Mật khẩu: ${user?.fullName || ''}`"
    description="Cấp mật khẩu đăng nhập mới cho người dùng C-Walli. Mật khẩu sẽ được mã hóa an toàn"
    max-width="md"
    @update:open="(val) => emits('update:open', val)"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4 pt-2">
      <div v-if="errorMessage" class="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
        {{ errorMessage }}
      </div>

      <div class="space-y-1.5">
        <Label for="reset-password-input" class="text-zinc-700">Mật khẩu mới *</Label>
        <Input
          id="reset-password-input"
          type="password"
          v-model="newPassword"
          placeholder="Tối thiểu 8 ký tự..."
          required
          class="bg-white border-zinc-300 text-zinc-900 focus-visible:ring-black"
        />
      </div>
    </form>

    <template #footer>
      <div class="flex items-center justify-end gap-2 w-full">
        <Button variant="outline" type="button" @click="emits('update:open', false)">
          Hủy bỏ
        </Button>
        <Button variant="default" type="button" class="bg-black text-white hover:bg-zinc-800" :disabled="isSubmitting || !newPassword" @click="handleSubmit">
          <Loader2 v-if="isSubmitting" class="h-4 w-4 animate-spin mr-1" />
          <KeyRound v-else class="h-4 w-4 mr-1" />
          Cập nhật mật khẩu
        </Button>
      </div>
    </template>
  </Dialog>
</template>
