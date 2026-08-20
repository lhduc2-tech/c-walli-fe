<script setup lang="ts">
import { ref } from 'vue'
import Dialog from '@/components/ui/Dialog.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import { adminUserService } from '@/services/admin-user.service'
import { getErrorMessage } from '@/services/api'
import type { AdminUserSummaryResponse } from '@/types/user.types'
import { Loader2, Hash, Trash2 } from 'lucide-vue-next'

interface Props {
  open: boolean
  user: AdminUserSummaryResponse | null
}

const props = defineProps<Props>()
const emits = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'updated'): void
}>()

const newPin = ref('')
const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

async function handleSetPin() {
  if (!props.user) return
  if (!/^\d{6}$/.test(newPin.value)) {
    errorMessage.value = 'Mã PIN phải bao gồm đúng 6 chữ số.'
    return
  }

  errorMessage.value = null
  isSubmitting.value = true

  try {
    await adminUserService.resetPin(props.user.id, { newPin: newPin.value.trim() })
    emits('updated')
    emits('update:open', false)
    newPin.value = ''
  } catch (err) {
    errorMessage.value = getErrorMessage(err)
  } finally {
    isSubmitting.value = false
  }
}

async function handleClearPin() {
  if (!props.user) return
  errorMessage.value = null
  isSubmitting.value = true

  try {
    await adminUserService.resetPin(props.user.id, { newPin: null })
    emits('updated')
    emits('update:open', false)
    newPin.value = ''
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
    :title="`Quản lý Mã PIN Giao dịch: ${user?.fullName || ''}`"
    description="Thiết lập mã PIN 6 số mới hoặc xóa mã PIN hiện tại để người dùng tự tạo lại"
    max-width="md"
    @update:open="(val) => emits('update:open', val)"
  >
    <div class="space-y-4 pt-2">
      <div v-if="errorMessage" class="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
        {{ errorMessage }}
      </div>

      <div class="space-y-1.5">
        <Label for="reset-pin-input" class="text-zinc-700">Mã PIN mới (6 chữ số)</Label>
        <Input
          id="reset-pin-input"
          type="password"
          maxlength="6"
          v-model="newPin"
          placeholder="Ví dụ: 123456"
          class="bg-white border-zinc-300 text-zinc-900 focus-visible:ring-black"
        />
        <p class="text-xs text-zinc-500">Mã PIN dùng để xác thực các giao dịch chuyển tiền và nạp rút ví C-Walli.</p>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-between gap-2 w-full">
        <Button variant="destructive" type="button" :disabled="isSubmitting" @click="handleClearPin">
          <Trash2 class="h-4 w-4 mr-1" />
          Xóa mã PIN
        </Button>
        <div class="flex items-center gap-2">
          <Button variant="outline" type="button" @click="emits('update:open', false)">
            Hủy
          </Button>
          <Button variant="default" type="button" class="bg-black text-white hover:bg-zinc-800" :disabled="isSubmitting || !newPin" @click="handleSetPin">
            <Loader2 v-if="isSubmitting" class="h-4 w-4 animate-spin mr-1" />
            <Hash v-else class="h-4 w-4 mr-1" />
            Lưu mã PIN mới
          </Button>
        </div>
      </div>
    </template>
  </Dialog>
</template>
