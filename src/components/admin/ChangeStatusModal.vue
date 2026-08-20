<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import Dialog from '@/components/ui/Dialog.vue'
import Button from '@/components/ui/Button.vue'
import Label from '@/components/ui/Label.vue'
import { adminUserService } from '@/services/admin-user.service'
import { getErrorMessage } from '@/services/api'
import type { AdminUserSummaryResponse, AdminUpdateUserStatusRequest } from '@/types/user.types'
import { Loader2, ShieldAlert } from 'lucide-vue-next'

interface Props {
  open: boolean
  user: AdminUserSummaryResponse | null
}

const props = defineProps<Props>()
const emits = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'updated'): void
}>()

const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

const form = reactive<AdminUpdateUserStatusRequest>({
  status: 'ACTIVE',
  reason: '',
})

watch(
  () => props.user,
  (val) => {
    if (val) {
      form.status = val.status || 'ACTIVE'
      form.reason = ''
      errorMessage.value = null
    }
  },
  { immediate: true }
)

async function handleSubmit() {
  if (!props.user) return
  errorMessage.value = null
  isSubmitting.value = true

  try {
    await adminUserService.updateUserStatus(props.user.id, form)
    emits('updated')
    emits('update:open', false)
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
    :title="`Đổi trạng thái tài khoản: ${user?.fullName || ''}`"
    description="Thay đổi trạng thái hoạt động hoặc tạm đình chỉ tài khoản người dùng C-Walli"
    max-width="md"
    @update:open="(val) => emits('update:open', val)"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4 pt-2">
      <div v-if="errorMessage" class="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
        {{ errorMessage }}
      </div>

      <div class="space-y-1.5">
        <Label for="change-status-select" class="text-zinc-700">Trạng thái mới *</Label>
        <select
          id="change-status-select"
          v-model="form.status"
          class="flex h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
        >
          <option value="ACTIVE">ACTIVE (Hoạt động bình thường)</option>
          <option value="LOCKED">LOCKED (Khóa do bảo mật)</option>
          <option value="SUSPENDED">SUSPENDED (Tạm đình chỉ giao dịch)</option>
          <option value="INACTIVE">INACTIVE (Vô hiệu hóa)</option>
        </select>
      </div>

      <div class="space-y-1.5">
        <Label for="change-status-reason" class="text-zinc-700">Lý do thay đổi (tùy chọn)</Label>
        <textarea
          id="change-status-reason"
          v-model="form.reason"
          rows="3"
          placeholder="Nhập lý do hoặc ghi chú nội bộ..."
          class="flex w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 placeholder:text-zinc-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
        />
      </div>
    </form>

    <template #footer>
      <div class="flex items-center justify-end gap-2 w-full">
        <Button variant="outline" type="button" @click="emits('update:open', false)">
          Hủy bỏ
        </Button>
        <Button variant="default" type="button" class="bg-black text-white hover:bg-zinc-800" :disabled="isSubmitting" @click="handleSubmit">
          <Loader2 v-if="isSubmitting" class="h-4 w-4 animate-spin mr-1" />
          <ShieldAlert v-else class="h-4 w-4 mr-1" />
          Cập nhật trạng thái
        </Button>
      </div>
    </template>
  </Dialog>
</template>
