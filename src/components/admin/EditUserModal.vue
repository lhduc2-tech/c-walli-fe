<script setup lang="ts">
import { ref, reactive, watch } from 'vue'
import Dialog from '@/components/ui/Dialog.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import { adminUserService } from '@/services/admin-user.service'
import { getErrorMessage } from '@/services/api'
import type { AdminUserDetailResponse, AdminUpdateUserRequest } from '@/types/user.types'
import { Loader2, Save } from 'lucide-vue-next'

interface Props {
  open: boolean
  user: AdminUserDetailResponse | null
}

const props = defineProps<Props>()
const emits = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'updated'): void
}>()

const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

const form = reactive<AdminUpdateUserRequest>({
  fullName: '',
  identityNumber: '',
  dob: '',
  hometown: '',
  tier: 1,
  riskScore: 0,
  ekycStatus: '',
  roleCodes: ['USER'],
})

watch(
  () => props.user,
  (val) => {
    if (val) {
      form.fullName = val.fullName || ''
      form.identityNumber = val.identityNumber || ''
      form.dob = val.dob || ''
      form.hometown = val.hometown || ''
      form.tier = val.tier ?? 1
      form.riskScore = val.riskScore ?? 0
      form.ekycStatus = val.ekycStatus || ''
      form.roleCodes = val.roleCodes?.length ? [...val.roleCodes] : ['USER']
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
    const payload: AdminUpdateUserRequest = {
      fullName: form.fullName?.trim() || undefined,
      identityNumber: form.identityNumber?.trim() || undefined,
      dob: form.dob || undefined,
      hometown: form.hometown?.trim() || undefined,
      tier: form.tier !== undefined ? Number(form.tier) : undefined,
      riskScore: form.riskScore !== undefined ? Number(form.riskScore) : undefined,
      ekycStatus: form.ekycStatus || undefined,
      roleCodes: form.roleCodes,
    }

    await adminUserService.updateUser(props.user.id, payload)
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
    :title="`Cập nhật Hồ sơ: ${user?.fullName || ''}`"
    description="Chỉnh sửa thông tin định danh, phân quyền và hạn mức tài khoản C-Walli"
    max-width="2xl"
    @update:open="(val) => emits('update:open', val)"
  >
    <form @submit.prevent="handleSubmit" class="space-y-4 pt-2">
      <div v-if="errorMessage" class="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
        {{ errorMessage }}
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <!-- Họ và tên -->
        <div class="space-y-1.5">
          <Label for="edit-fullName" class="text-zinc-700">Họ và tên</Label>
          <Input id="edit-fullName" v-model="form.fullName" placeholder="Nguyễn Văn A" />
        </div>

        <!-- Số CCCD / CMND -->
        <div class="space-y-1.5">
          <Label for="edit-identity" class="text-zinc-700">Số CCCD / CMND</Label>
          <Input id="edit-identity" v-model="form.identityNumber" placeholder="12 chữ số" />
        </div>

        <!-- Ngày sinh -->
        <div class="space-y-1.5">
          <Label for="edit-dob" class="text-zinc-700">Ngày sinh</Label>
          <Input id="edit-dob" type="date" v-model="form.dob" />
        </div>

        <!-- Quê quán -->
        <div class="space-y-1.5">
          <Label for="edit-hometown" class="text-zinc-700">Quê quán / Địa chỉ</Label>
          <Input id="edit-hometown" v-model="form.hometown" placeholder="Hà Nội / TP. HCM" />
        </div>

        <!-- Tier / Cấp hạn mức -->
        <div class="space-y-1.5">
          <Label for="edit-tier" class="text-zinc-700">Hạn mức (Tier)</Label>
          <select
            id="edit-tier"
            v-model="form.tier"
            class="flex h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <option :value="0">Tier 0 (Cơ bản)</option>
            <option :value="1">Tier 1 (Phổ thông - 100M)</option>
            <option :value="2">Tier 2 (Nâng cao - 300M)</option>
          </select>
        </div>

        <!-- Điểm rủi ro -->
        <div class="space-y-1.5">
          <Label for="edit-risk" class="text-zinc-700">Điểm rủi ro (Risk Score)</Label>
          <Input id="edit-risk" type="number" step="0.01" min="0" max="1" v-model="form.riskScore" placeholder="0.00" />
        </div>

        <!-- Trạng thái eKYC -->
        <div class="space-y-1.5">
          <Label for="edit-ekyc" class="text-zinc-700">Trạng thái eKYC sinh trắc học</Label>
          <select
            id="edit-ekyc"
            v-model="form.ekycStatus"
            class="flex h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <option value="">Chưa đăng ký</option>
            <option value="PENDING">PENDING (Đang xử lý)</option>
            <option value="VERIFIED">VERIFIED (Đã xác minh)</option>
          </select>
        </div>

        <!-- Vai trò / Role -->
        <div class="space-y-1.5">
          <Label for="edit-role" class="text-zinc-700">Vai trò hệ thống</Label>
          <select
            id="edit-role"
            :value="form.roleCodes?.[0] || 'USER'"
            @change="(e: any) => form.roleCodes = [e.target.value]"
            class="flex h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <option value="USER">USER (Khách hàng)</option>
            <option value="ADMIN">ADMIN (Quản trị viên)</option>
          </select>
        </div>
      </div>
    </form>

    <template #footer>
      <div class="flex items-center justify-end gap-2 w-full">
        <Button variant="outline" type="button" @click="emits('update:open', false)">
          Hủy bỏ
        </Button>
        <Button variant="default" type="button" class="bg-black text-white hover:bg-zinc-800" :disabled="isSubmitting" @click="handleSubmit">
          <Loader2 v-if="isSubmitting" class="h-4 w-4 animate-spin mr-1" />
          <Save v-else class="h-4 w-4 mr-1" />
          Lưu thay đổi
        </Button>
      </div>
    </template>
  </Dialog>
</template>
