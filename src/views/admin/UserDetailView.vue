<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { adminUserService } from '@/services/admin-user.service'
import { getErrorMessage } from '@/services/api'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { AdminUserDetailResponse } from '@/types/user.types'

import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardContent from '@/components/ui/CardContent.vue'
import Skeleton from '@/components/ui/Skeleton.vue'

// Modals
import EditUserModal from '@/components/admin/EditUserModal.vue'
import ChangeStatusModal from '@/components/admin/ChangeStatusModal.vue'
import ResetPasswordModal from '@/components/admin/ResetPasswordModal.vue'
import ResetPinModal from '@/components/admin/ResetPinModal.vue'
import ConfirmActionDialog from '@/components/admin/ConfirmActionDialog.vue'

import {
  ArrowLeft,
  Wallet,
  ShieldCheck,
  ShieldAlert,
  User,
  KeyRound,
  Hash,
  Edit3,
  Unlock,
  CheckCircle2,
  AlertCircle,
  Mail,
  Phone,
  Fingerprint
} from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()

const userId = route.params.id as string

const isLoading = ref(true)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const user = ref<AdminUserDetailResponse | null>(null)

// Modal states
const isEditModalOpen = ref(false)
const isStatusModalOpen = ref(false)
const isResetPassModalOpen = ref(false)
const isResetPinModalOpen = ref(false)
const isUnlockDialogOpen = ref(false)

async function loadUserDetail() {
  isLoading.value = true
  errorMessage.value = null

  try {
    const res = await adminUserService.getUserDetail(userId)
    user.value = res
  } catch (err) {
    errorMessage.value = getErrorMessage(err)
  } finally {
    isLoading.value = false
  }
}

async function handleUnlockConfirm() {
  if (!user.value) return
  try {
    await adminUserService.unlockUser(user.value.id)
    showSuccess('Mở khóa tài khoản thành công!')
    isUnlockDialogOpen.value = false
    loadUserDetail()
  } catch (err) {
    errorMessage.value = getErrorMessage(err)
  }
}

function showSuccess(msg: string) {
  successMessage.value = msg
  setTimeout(() => {
    successMessage.value = null
  }, 4000)
}

function getStatusBadgeVariant(status?: string) {
  switch (status?.toUpperCase()) {
    case 'ACTIVE': return 'success'
    case 'LOCKED': return 'destructive'
    case 'SUSPENDED': return 'warning'
    case 'RISK': return 'risk'
    case 'INACTIVE': return 'secondary'
    case 'DELETED': return 'secondary'
    case 'UNLINKED': return 'secondary'
    case 'PENDING': return 'info'
    case 'PENDING_EMAIL_VERIFICATION': return 'info'
    default: return 'outline'
  }
}

onMounted(() => {
  loadUserDetail()
})
</script>

<template>
  <div class="space-y-6">
    <!-- Top Action Bar -->
    <div class="flex items-center justify-between gap-4">
      <Button variant="outline" size="sm" @click="router.push('/admin/users')">
        <ArrowLeft class="h-4 w-4 mr-1.5" />
        Quay lại danh sách
      </Button>

      <div v-if="user" class="flex items-center gap-2 flex-wrap">
        <Button variant="outline" size="sm" @click="isUnlockDialogOpen = true">
          <Unlock class="h-3.5 w-3.5 mr-1 text-teal-600" />
          Mở khóa
        </Button>
        <Button variant="outline" size="sm" @click="isStatusModalOpen = true">
          <ShieldAlert class="h-3.5 w-3.5 mr-1 text-amber-600" />
          Đổi trạng thái
        </Button>
        <Button variant="outline" size="sm" @click="isResetPassModalOpen = true">
          <KeyRound class="h-3.5 w-3.5 mr-1 text-indigo-600" />
          Reset Mật khẩu
        </Button>
        <Button variant="outline" size="sm" @click="isResetPinModalOpen = true">
          <Hash class="h-3.5 w-3.5 mr-1 text-pink-600" />
          Quản lý PIN
        </Button>
        <Button variant="default" size="sm" class="bg-black text-white hover:bg-zinc-800" @click="isEditModalOpen = true">
          <Edit3 class="h-3.5 w-3.5 mr-1" />
          Chỉnh sửa hồ sơ
        </Button>
      </div>
    </div>

    <!-- Alert Messages -->
    <div v-if="successMessage" class="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 font-medium text-sm flex items-center gap-2">
      <CheckCircle2 class="h-5 w-5 flex-shrink-0" />
      <span>{{ successMessage }}</span>
    </div>

    <div v-if="errorMessage" class="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium text-sm flex items-center gap-2">
      <AlertCircle class="h-5 w-5 flex-shrink-0" />
      <span>{{ errorMessage }}</span>
    </div>

    <!-- Loading Skeleton -->
    <div v-if="isLoading" class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <Skeleton class="h-64 md:col-span-3 rounded-2xl bg-zinc-100" />
      <Skeleton class="h-48 rounded-2xl bg-zinc-100" />
      <Skeleton class="h-48 rounded-2xl bg-zinc-100" />
      <Skeleton class="h-48 rounded-2xl bg-zinc-100" />
    </div>

    <!-- Main Content Details -->
    <div v-else-if="user" class="space-y-6">
      <!-- Profile Header Hero Card (Clean White) -->
      <Card class="p-6 bg-white border border-zinc-200 shadow-sm relative overflow-hidden">
        <div class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
          <div class="flex items-center gap-5">
            <div class="h-20 w-20 rounded-2xl bg-black text-white font-black text-2xl flex items-center justify-center shadow-md">
              {{ (user.fullName || 'U').substring(0, 2).toUpperCase() }}
            </div>
            <div class="space-y-1.5">
              <div class="flex items-center gap-2.5 flex-wrap">
                <h2 class="text-2xl font-bold text-zinc-900">{{ user.fullName }}</h2>
                <Badge :variant="getStatusBadgeVariant(user.status)">
                  {{ user.status }}
                </Badge>
                <Badge variant="outline" class="border-zinc-300">
                  Tier {{ user.tier }}
                </Badge>
                <Badge v-for="r in user.roleCodes" :key="r" variant="purple" class="text-xs">
                  ROLE_{{ r }}
                </Badge>
              </div>

              <div class="flex items-center gap-4 text-xs text-zinc-500 flex-wrap">
                <span class="flex items-center gap-1">
                  <Phone class="h-3.5 w-3.5 text-zinc-400" />
                  {{ user.phoneNumber }}
                </span>
                <span class="flex items-center gap-1">
                  <Mail class="h-3.5 w-3.5 text-zinc-400" />
                  {{ user.email }}
                </span>
                <span class="flex items-center gap-1 font-mono">
                  <Fingerprint class="h-3.5 w-3.5 text-zinc-400" />
                  CCCD: {{ user.identityNumber || 'Chưa cập nhật' }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </Card>

      <!-- 3-Column Info Cards (Clean White) -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
        <!-- 1. Ví điện tử C-Walli -->
        <Card class="bg-white border border-zinc-200 shadow-sm flex flex-col">
          <CardHeader class="pb-3 border-b border-zinc-100">
            <CardTitle class="text-base flex items-center gap-2 text-zinc-900">
              <Wallet class="h-5 w-5 text-zinc-900" />
              Thông tin Ví điện tử C-Walli
            </CardTitle>
          </CardHeader>
          <CardContent class="pt-4 flex-1 space-y-3.5 text-sm">
            <div v-if="user.wallet" class="space-y-3">
              <div class="p-3.5 rounded-xl bg-zinc-50 border border-zinc-200 text-zinc-900">
                <span class="text-xs font-semibold uppercase tracking-wider text-zinc-500 block">Số dư khả dụng</span>
                <span class="text-2xl font-bold font-mono">{{ formatCurrency(user.wallet.availableBalance) }}</span>
              </div>

              <div class="flex items-center justify-between text-xs py-1 border-b border-zinc-100">
                <span class="text-zinc-500">Số dư tạm giữ (Holding):</span>
                <span class="font-mono font-medium text-zinc-900">{{ formatCurrency(user.wallet.holdingBalance) }}</span>
              </div>

              <div class="flex items-center justify-between text-xs py-1 border-b border-zinc-100">
                <span class="text-zinc-500">Tổng số dư:</span>
                <span class="font-mono font-semibold text-zinc-900">{{ formatCurrency(user.wallet.balance) }}</span>
              </div>

              <div class="flex items-center justify-between text-xs py-1 border-b border-zinc-100">
                <span class="text-zinc-500">Trạng thái ví:</span>
                <Badge variant="success">{{ user.wallet.walletStatus }}</Badge>
              </div>

              <div class="flex items-center justify-between text-xs py-1">
                <span class="text-zinc-500">Cấp hạn mức ví:</span>
                <span class="font-semibold text-zinc-900">Cấp {{ user.wallet.limitation }}</span>
              </div>
            </div>
            <div v-else class="text-center py-6 text-zinc-400 text-xs">
              Chưa liên kết ví điện tử
            </div>
          </CardContent>
        </Card>

        <!-- 2. Bảo mật & eKYC -->
        <Card class="bg-white border border-zinc-200 shadow-sm flex flex-col">
          <CardHeader class="pb-3 border-b border-zinc-100">
            <CardTitle class="text-base flex items-center gap-2 text-zinc-900">
              <ShieldCheck class="h-5 w-5 text-zinc-900" />
              Bảo mật & eKYC
            </CardTitle>
          </CardHeader>
          <CardContent class="pt-4 flex-1 space-y-3 text-sm">
            <div class="flex items-center justify-between text-xs py-1.5 border-b border-zinc-100">
              <span class="text-zinc-500">eKYC Sinh trắc học:</span>
              <Badge :variant="user.ekycStatus === 'VERIFIED' ? 'success' : 'warning'">
                {{ user.ekycStatus || 'Chưa đăng ký' }}
              </Badge>
            </div>

            <div class="flex items-center justify-between text-xs py-1.5 border-b border-zinc-100">
              <span class="text-zinc-500">Thời điểm eKYC:</span>
              <span class="font-medium text-zinc-900">{{ formatDate(user.ekycRegisteredAt) }}</span>
            </div>

            <div class="flex items-center justify-between text-xs py-1.5 border-b border-zinc-100">
              <span class="text-zinc-500">Mã PIN giao dịch:</span>
              <Badge :variant="user.hasPin ? 'success' : 'secondary'">
                {{ user.hasPin ? 'Đã thiết lập' : 'Chưa có PIN' }}
              </Badge>
            </div>

            <div class="flex items-center justify-between text-xs py-1.5 border-b border-zinc-100">
              <span class="text-zinc-500">Đăng nhập sai:</span>
              <span :class="user.failedLoginAttempts > 0 ? 'text-amber-600 font-bold' : 'text-zinc-900'">{{ user.failedLoginAttempts }} / 5 lần</span>
            </div>

            <div class="flex items-center justify-between text-xs py-1.5">
              <span class="text-zinc-500">Nhập sai PIN:</span>
              <span :class="user.pinFailedAttempts > 0 ? 'text-rose-600 font-bold' : 'text-zinc-900'">{{ user.pinFailedAttempts }} / 5 lần</span>
            </div>
          </CardContent>
        </Card>

        <!-- 3. Hồ sơ cá nhân & Audit -->
        <Card class="bg-white border border-zinc-200 shadow-sm flex flex-col">
          <CardHeader class="pb-3 border-b border-zinc-100">
            <CardTitle class="text-base flex items-center gap-2 text-zinc-900">
              <User class="h-5 w-5 text-zinc-900" />
              Định danh & Kiểm toán
            </CardTitle>
          </CardHeader>
          <CardContent class="pt-4 flex-1 space-y-3 text-sm">
            <div class="flex items-center justify-between text-xs py-1.5 border-b border-zinc-100">
              <span class="text-zinc-500">Ngày sinh:</span>
              <span class="text-zinc-900">{{ user.dob || '-' }}</span>
            </div>

            <div class="flex items-center justify-between text-xs py-1.5 border-b border-zinc-100">
              <span class="text-zinc-500">Quê quán / Địa chỉ:</span>
              <span class="text-zinc-900">{{ user.hometown || '-' }}</span>
            </div>

            <div class="flex items-center justify-between text-xs py-1.5 border-b border-zinc-100">
              <span class="text-zinc-500">Điểm rủi ro (Risk):</span>
              <span class="font-mono font-medium text-zinc-900">{{ user.riskScore ?? '0.00' }}</span>
            </div>

            <div class="flex items-center justify-between text-xs py-1.5 border-b border-zinc-100">
              <span class="text-zinc-500">Thời gian tạo:</span>
              <span class="text-zinc-900">{{ formatDate(user.createdAt) }}</span>
            </div>

            <div class="flex items-center justify-between text-xs py-1.5 border-b border-zinc-100">
              <span class="text-zinc-500">Đăng nhập cuối:</span>
              <span class="text-zinc-900">{{ formatDate(user.lastLoginAt) }}</span>
            </div>

            <div class="flex items-center justify-between text-xs py-1.5">
              <span class="text-zinc-500">Cập nhật lần cuối:</span>
              <span class="text-zinc-900">{{ formatDate(user.updatedAt) }}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>

    <!-- Modals -->
    <EditUserModal
      v-model:open="isEditModalOpen"
      :user="user"
      @updated="() => { showSuccess('Cập nhật người dùng thành công!'); loadUserDetail(); }"
    />

    <ChangeStatusModal
      v-model:open="isStatusModalOpen"
      :user="user"
      @updated="() => { showSuccess('Cập nhật trạng thái thành công!'); loadUserDetail(); }"
    />

    <ResetPasswordModal
      v-model:open="isResetPassModalOpen"
      :user="user"
      @updated="() => showSuccess('Đặt lại mật khẩu thành công!')"
    />

    <ResetPinModal
      v-model:open="isResetPinModalOpen"
      :user="user"
      @updated="() => { showSuccess('Cập nhật mã PIN thành công!'); loadUserDetail(); }"
    />

    <ConfirmActionDialog
      v-model:open="isUnlockDialogOpen"
      title="Mở khóa tài khoản"
      :description="`Bạn có chắc chắn muốn mở khóa tài khoản của ${user?.fullName}? Các bộ đếm sai mật khẩu/PIN sẽ được xóa về 0.`"
      confirm-text="Mở khóa ngay"
      variant="default"
      icon="check"
      @confirm="handleUnlockConfirm"
    />
  </div>
</template>
