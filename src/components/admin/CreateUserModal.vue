<script setup lang="ts">
import { ref, reactive } from 'vue'
import Dialog from '@/components/ui/Dialog.vue'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import { adminUserService } from '@/services/admin-user.service'
import { getErrorMessage } from '@/services/api'
import type { AdminCreateUserRequest } from '@/types/user.types'
import { Loader2, Plus } from 'lucide-vue-next'

interface Props {
  open: boolean
}

const props = defineProps<Props>()
const emits = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'created'): void
}>()

const isSubmitting = ref(false)
const errorMessage = ref<string | null>(null)

const form = reactive<AdminCreateUserRequest>({
  email: '',
  password: '',
  fullName: '',
  phoneNumber: '',
  identityNumber: '',
  dob: '',
  hometown: '',
  tier: 1,
  riskScore: 0,
  status: 'ACTIVE',
  roleCodes: ['USER'],
})

function resetForm() {
  form.email = ''
  form.password = ''
  form.fullName = ''
  form.phoneNumber = ''
  form.identityNumber = ''
  form.dob = ''
  form.hometown = ''
  form.tier = 1
  form.riskScore = 0
  form.status = 'ACTIVE'
  form.roleCodes = ['USER']
  errorMessage.value = null
}

async function handleSubmit() {
  errorMessage.value = null
  isSubmitting.value = true

  try {
    const payload: AdminCreateUserRequest = {
      ...form,
      email: form.email.trim(),
      phoneNumber: form.phoneNumber.trim(),
      fullName: form.fullName.trim(),
      identityNumber: form.identityNumber ? form.identityNumber.trim() : undefined,
      hometown: form.hometown ? form.hometown.trim() : undefined,
      dob: form.dob ? form.dob : undefined,
      tier: form.tier ? Number(form.tier) : undefined,
      riskScore: form.riskScore !== undefined ? Number(form.riskScore) : undefined,
    }

    await adminUserService.createUser(payload)
    emits('created')
    emits('update:open', false)
    resetForm()
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
    title="Tạo mới Người dùng C-Walli"
    description="Khởi tạo tài khoản người dùng và tự động liên kết Ví điện tử C-Walli mặc định"
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
          <Label for="create-fullName" class="text-zinc-700">Họ và tên *</Label>
          <Input id="create-fullName" v-model="form.fullName" placeholder="VD: Nguyễn Văn Bình" required />
        </div>

        <!-- Số điện thoại -->
        <div class="space-y-1.5">
          <Label for="create-phone" class="text-zinc-700">Số điện thoại *</Label>
          <Input id="create-phone" v-model="form.phoneNumber" placeholder="10 chữ số (VD: 0912345678)" required />
        </div>

        <!-- Email -->
        <div class="space-y-1.5">
          <Label for="create-email" class="text-zinc-700">Email *</Label>
          <Input id="create-email" type="email" v-model="form.email" placeholder="example@cwalli.vn" required />
        </div>

        <!-- Mật khẩu -->
        <div class="space-y-1.5">
          <Label for="create-password" class="text-zinc-700">Mật khẩu khởi tạo *</Label>
          <Input id="create-password" type="password" v-model="form.password" placeholder="Tối thiểu 8 ký tự" required />
        </div>

        <!-- Số CCCD / CMND -->
        <div class="space-y-1.5">
          <Label for="create-identity" class="text-zinc-700">Số CCCD / CMND</Label>
          <Input id="create-identity" v-model="form.identityNumber" placeholder="12 chữ số" />
        </div>

        <!-- Ngày sinh -->
        <div class="space-y-1.5">
          <Label for="create-dob" class="text-zinc-700">Ngày sinh</Label>
          <Input id="create-dob" type="date" v-model="form.dob" />
        </div>

        <!-- Quê quán -->
        <div class="space-y-1.5">
          <Label for="create-hometown" class="text-zinc-700">Quê quán / Địa chỉ</Label>
          <Input id="create-hometown" v-model="form.hometown" placeholder="TP. Hồ Chí Minh" />
        </div>

        <!-- Tier / Cấp hạn mức -->
        <div class="space-y-1.5">
          <Label for="create-tier" class="text-zinc-700">Hạn mức (Tier)</Label>
          <select
            id="create-tier"
            v-model="form.tier"
            class="flex h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <option :value="0">Tier 0 (Chưa định danh / <18 tuổi)</option>
            <option :value="1">Tier 1 (Cơ bản - 100M/tháng)</option>
            <option :value="2">Tier 2 (Nâng cao - 300M/tháng)</option>
          </select>
        </div>

        <!-- Trạng thái -->
        <div class="space-y-1.5">
          <Label for="create-status" class="text-zinc-700">Trạng thái ban đầu</Label>
          <select
            id="create-status"
            v-model="form.status"
            class="flex h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <option value="ACTIVE">ACTIVE (Hoạt động)</option>
            <option value="PENDING">PENDING (Chờ duyệt)</option>
            <option value="PENDING_EMAIL_VERIFICATION">PENDING_EMAIL_VERIFICATION (Chờ xác thực Email)</option>
            <option value="LOCKED">LOCKED (Khóa)</option>
          </select>
        </div>

        <!-- Vai trò / Role -->
        <div class="space-y-1.5">
          <Label for="create-role" class="text-zinc-700">Vai trò hệ thống</Label>
          <select
            id="create-role"
            :value="form.roleCodes?.[0] || 'USER'"
            @change="(e: any) => form.roleCodes = [e.target.value]"
            class="flex h-10 w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <option value="USER">USER (Khách hàng thông thường)</option>
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
          <Plus v-else class="h-4 w-4 mr-1" />
          Tạo người dùng
        </Button>
      </div>
    </template>
  </Dialog>
</template>
