<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { adminUserService } from '@/services/admin-user.service'
import { getErrorMessage } from '@/services/api'
import { formatDate } from '@/lib/utils'
import type { AdminUserSummaryResponse, AdminSearchUserRequest } from '@/types/user.types'
import type { PageResponse } from '@/types/api.types'

import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Badge from '@/components/ui/Badge.vue'
import Card from '@/components/ui/Card.vue'
import Table from '@/components/ui/Table.vue'
import TableHeader from '@/components/ui/TableHeader.vue'
import TableBody from '@/components/ui/TableBody.vue'
import TableRow from '@/components/ui/TableRow.vue'
import TableHead from '@/components/ui/TableHead.vue'
import TableCell from '@/components/ui/TableCell.vue'
import Skeleton from '@/components/ui/Skeleton.vue'

// Modals
import CreateUserModal from '@/components/admin/CreateUserModal.vue'
import EditUserModal from '@/components/admin/EditUserModal.vue'
import ChangeStatusModal from '@/components/admin/ChangeStatusModal.vue'
import ResetPasswordModal from '@/components/admin/ResetPasswordModal.vue'
import ResetPinModal from '@/components/admin/ResetPinModal.vue'
import ConfirmActionDialog from '@/components/admin/ConfirmActionDialog.vue'

import {
  Users,
  UserPlus,
  Search,
  RotateCcw,
  ShieldCheck,
  ShieldAlert,
  Unlock,
  KeyRound,
  Hash,
  Edit3,
  Trash2,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  MoreVertical,
  CheckCircle2
} from 'lucide-vue-next'

const router = useRouter()

// State
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)

const userPage = ref<PageResponse<AdminUserSummaryResponse>>({
  size: 10,
  totalElements: 0,
  totalPages: 0,
  content: [],
})

const filter = reactive<AdminSearchUserRequest>({
  pageIndex: 0,
  pageSize: 10,
  sort: 'createdAt',
  direction: 'DESC',
  search: '',
  status: '',
  tier: undefined,
  ekycStatus: '',
  roleCode: '',
  fromCreatedAt: '',
  toCreatedAt: '',
})

// Modal states
const isCreateModalOpen = ref(false)
const isEditModalOpen = ref(false)
const isStatusModalOpen = ref(false)
const isResetPassModalOpen = ref(false)
const isResetPinModalOpen = ref(false)
const isUnlockDialogOpen = ref(false)
const isDeleteDialogOpen = ref(false)

const selectedUser = ref<AdminUserSummaryResponse | null>(null)
const selectedUserDetail = ref<any>(null)

// Action menu dropdown state per row
const activeDropdownUserId = ref<string | null>(null)

function toggleActionDropdown(userId: string) {
  if (activeDropdownUserId.value === userId) {
    activeDropdownUserId.value = null
  } else {
    activeDropdownUserId.value = userId
  }
}

function closeDropdown() {
  activeDropdownUserId.value = null
}

// KPI Stats
const totalUsers = computed(() => userPage.value.totalElements)
const activeUsersCount = computed(() => userPage.value.content.filter((u) => u.status === 'ACTIVE').length)
const lockedUsersCount = computed(() => userPage.value.content.filter((u) => u.status === 'LOCKED' || u.failedLoginAttempts >= 5).length)
const ekycVerifiedCount = computed(() => userPage.value.content.filter((u) => u.ekycStatus === 'VERIFIED').length)

// Load Users
async function loadUsers(resetPage = false) {
  if (resetPage) {
    filter.pageIndex = 0
  }
  isLoading.value = true
  errorMessage.value = null
  closeDropdown()

  try {
    const payload: AdminSearchUserRequest = {
      ...filter,
      search: filter.search?.trim() || undefined,
      status: filter.status || undefined,
      tier: filter.tier !== undefined && filter.tier !== null && (filter.tier as any) !== '' ? Number(filter.tier) : undefined,
      ekycStatus: filter.ekycStatus || undefined,
      roleCode: filter.roleCode || undefined,
      fromCreatedAt: filter.fromCreatedAt ? new Date(filter.fromCreatedAt).toISOString() : undefined,
      toCreatedAt: filter.toCreatedAt ? new Date(filter.toCreatedAt).toISOString() : undefined,
    }

    const res = await adminUserService.searchUsers(payload)
    userPage.value = res
  } catch (err) {
    errorMessage.value = getErrorMessage(err)
  } finally {
    isLoading.value = false
  }
}

function handleResetFilter() {
  filter.search = ''
  filter.status = ''
  filter.tier = undefined
  filter.ekycStatus = ''
  filter.roleCode = ''
  filter.fromCreatedAt = ''
  filter.toCreatedAt = ''
  loadUsers(true)
}

function handlePageChange(newPage: number) {
  if (newPage < 0 || newPage >= userPage.value.totalPages) return
  filter.pageIndex = newPage
  loadUsers()
}

// Modal Handlers
function openEditModal(user: AdminUserSummaryResponse) {
  selectedUser.value = user
  selectedUserDetail.value = {
    ...user,
    roleCodes: user.roleCodes,
  }
  isEditModalOpen.value = true
  closeDropdown()
}

function openStatusModal(user: AdminUserSummaryResponse) {
  selectedUser.value = user
  isStatusModalOpen.value = true
  closeDropdown()
}

function openResetPassModal(user: AdminUserSummaryResponse) {
  selectedUser.value = user
  isResetPassModalOpen.value = true
  closeDropdown()
}

function openResetPinModal(user: AdminUserSummaryResponse) {
  selectedUser.value = user
  isResetPinModalOpen.value = true
  closeDropdown()
}

function openUnlockDialog(user: AdminUserSummaryResponse) {
  selectedUser.value = user
  isUnlockDialogOpen.value = true
  closeDropdown()
}

function openDeleteDialog(user: AdminUserSummaryResponse) {
  selectedUser.value = user
  isDeleteDialogOpen.value = true
  closeDropdown()
}

async function handleUnlockConfirm() {
  if (!selectedUser.value) return
  try {
    await adminUserService.unlockUser(selectedUser.value.id)
    showSuccess('Mở khóa tài khoản thành công!')
    isUnlockDialogOpen.value = false
    loadUsers()
  } catch (err) {
    errorMessage.value = getErrorMessage(err)
  }
}

async function handleDeleteConfirm() {
  if (!selectedUser.value) return
  try {
    await adminUserService.deleteUser(selectedUser.value.id)
    showSuccess('Vô hiệu hóa (xóa mềm) tài khoản thành công!')
    isDeleteDialogOpen.value = false
    loadUsers()
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

// Helper status badges
function getStatusBadgeVariant(status: string) {
  switch (status?.toUpperCase()) {
    case 'ACTIVE': return 'success'
    case 'LOCKED': return 'destructive'
    case 'SUSPENDED': return 'warning'
    case 'INACTIVE': return 'secondary'
    case 'PENDING': return 'info'
    default: return 'outline'
  }
}

function getEkycBadgeVariant(status?: string) {
  switch (status?.toUpperCase()) {
    case 'VERIFIED': return 'success'
    case 'PENDING': return 'warning'
    default: return 'secondary'
  }
}

onMounted(() => {
  loadUsers()
})
</script>

<template>
  <div class="space-y-6" @click="closeDropdown">
    <!-- Header Title & Create Button -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-zinc-900">Quản lý Người dùng C-Walli</h1>
        <p class="text-sm text-zinc-500">Tra cứu, phân quyền, cấu hình hạn mức và kiểm soát tài khoản ví điện tử C-Walli</p>
      </div>

      <!-- Black Button with White Text -->
      <Button variant="default" class="bg-black text-white hover:bg-zinc-800 shadow-md" @click="isCreateModalOpen = true">
        <UserPlus class="h-4 w-4 mr-2" />
        Tạo người dùng mới
      </Button>
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

    <!-- KPI Summary Cards (Clean White Background) -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card class="p-4 flex items-center gap-3.5 bg-white border border-zinc-200 shadow-sm">
        <div class="h-11 w-11 rounded-xl bg-zinc-100 text-zinc-900 flex items-center justify-center font-bold">
          <Users class="h-5 w-5" />
        </div>
        <div>
          <p class="text-xs text-zinc-500 font-medium">Tổng người dùng</p>
          <h3 class="text-xl font-bold text-zinc-900">{{ totalUsers }}</h3>
        </div>
      </Card>

      <Card class="p-4 flex items-center gap-3.5 bg-white border border-zinc-200 shadow-sm">
        <div class="h-11 w-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
          <CheckCircle2 class="h-5 w-5" />
        </div>
        <div>
          <p class="text-xs text-zinc-500 font-medium">Đang hoạt động</p>
          <h3 class="text-xl font-bold text-zinc-900">{{ activeUsersCount }}</h3>
        </div>
      </Card>

      <Card class="p-4 flex items-center gap-3.5 bg-white border border-zinc-200 shadow-sm">
        <div class="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
          <ShieldAlert class="h-5 w-5" />
        </div>
        <div>
          <p class="text-xs text-zinc-500 font-medium">Đang bị khóa / lỗi PIN</p>
          <h3 class="text-xl font-bold text-zinc-900">{{ lockedUsersCount }}</h3>
        </div>
      </Card>

      <Card class="p-4 flex items-center gap-3.5 bg-white border border-zinc-200 shadow-sm">
        <div class="h-11 w-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
          <ShieldCheck class="h-5 w-5" />
        </div>
        <div>
          <p class="text-xs text-zinc-500 font-medium">Đã xác minh eKYC</p>
          <h3 class="text-xl font-bold text-zinc-900">{{ ekycVerifiedCount }}</h3>
        </div>
      </Card>
    </div>

    <!-- Search & Filter Card (Clean White) -->
    <Card class="p-5 bg-white border border-zinc-200 shadow-sm space-y-4">
      <form @submit.prevent="loadUsers(true)" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <!-- Search Keyword -->
        <div class="space-y-1 sm:col-span-2">
          <label class="text-xs font-semibold text-zinc-700">Từ khóa tìm kiếm</label>
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              v-model="filter.search"
              placeholder="Tên, Email, Số điện thoại, CCCD/CMND..."
              class="pl-9 h-9 bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-black"
            />
          </div>
        </div>

        <!-- Trạng thái -->
        <div class="space-y-1">
          <label class="text-xs font-semibold text-zinc-700">Trạng thái tài khoản</label>
          <select
            v-model="filter.status"
            class="flex h-9 w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="ACTIVE">ACTIVE (Hoạt động)</option>
            <option value="LOCKED">LOCKED (Khóa)</option>
            <option value="SUSPENDED">SUSPENDED (Tạm đình chỉ)</option>
            <option value="INACTIVE">INACTIVE (Vô hiệu)</option>
            <option value="PENDING">PENDING (Chờ duyệt)</option>
          </select>
        </div>

        <!-- Tier / Hạn mức -->
        <div class="space-y-1">
          <label class="text-xs font-semibold text-zinc-700">Hạn mức (Tier)</label>
          <select
            v-model="filter.tier"
            class="flex h-9 w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <option :value="undefined">Tất cả Tier</option>
            <option :value="0">Tier 0 (Cơ bản)</option>
            <option :value="1">Tier 1 (Phổ thông)</option>
            <option :value="2">Tier 2 (Nâng cao)</option>
          </select>
        </div>

        <!-- Trạng thái eKYC -->
        <div class="space-y-1">
          <label class="text-xs font-semibold text-zinc-700">eKYC Sinh trắc học</label>
          <select
            v-model="filter.ekycStatus"
            class="flex h-9 w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <option value="">Tất cả eKYC</option>
            <option value="VERIFIED">VERIFIED (Đã xác minh)</option>
            <option value="PENDING">PENDING (Chờ xử lý)</option>
          </select>
        </div>

        <!-- Role -->
        <div class="space-y-1">
          <label class="text-xs font-semibold text-zinc-700">Vai trò</label>
          <select
            v-model="filter.roleCode"
            class="flex h-9 w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <option value="">Tất cả vai trò</option>
            <option value="USER">USER (Khách hàng)</option>
            <option value="ADMIN">ADMIN (Quản trị viên)</option>
          </select>
        </div>

        <!-- Buttons -->
        <div class="sm:col-span-2 flex items-end justify-end gap-2 pt-1">
          <Button variant="outline" size="sm" type="button" @click="handleResetFilter">
            <RotateCcw class="h-3.5 w-3.5 mr-1" />
            Đặt lại
          </Button>
          <Button variant="default" size="sm" type="submit" class="bg-black text-white hover:bg-zinc-800">
            <Search class="h-3.5 w-3.5 mr-1" />
            Tìm kiếm
          </Button>
        </div>
      </form>
    </Card>

    <!-- Data Table (Clean White) -->
    <div class="relative bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
      <Table class="border-0">
        <TableHeader>
          <TableRow class="bg-zinc-50 border-b border-zinc-200">
            <TableHead class="text-zinc-600">Người dùng</TableHead>
            <TableHead class="text-zinc-600">Liên hệ</TableHead>
            <TableHead class="text-zinc-600">Định danh CCCD</TableHead>
            <TableHead class="text-zinc-600">Hạn mức</TableHead>
            <TableHead class="text-zinc-600">eKYC</TableHead>
            <TableHead class="text-zinc-600">Trạng thái</TableHead>
            <TableHead class="text-zinc-600">Bảo mật & Thất bại</TableHead>
            <TableHead class="text-zinc-600">Ngày tạo</TableHead>
            <TableHead class="text-right text-zinc-600">Thao tác</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <!-- Loading Skeletons -->
          <template v-if="isLoading">
            <TableRow v-for="i in 5" :key="i">
              <TableCell v-for="j in 9" :key="j">
                <Skeleton class="h-5 w-full bg-zinc-100" />
              </TableCell>
            </TableRow>
          </template>

          <!-- Empty State -->
          <template v-else-if="userPage.content.length === 0">
            <TableRow>
              <TableCell colspan="9" class="h-48 text-center text-zinc-400">
                <div class="flex flex-col items-center justify-center space-y-2">
                  <Users class="h-8 w-8 text-zinc-300" />
                  <p class="font-medium text-zinc-600">Không tìm thấy người dùng nào phù hợp</p>
                  <p class="text-xs text-zinc-400">Hãy thử thay đổi từ khóa tìm kiếm hoặc bộ lọc</p>
                </div>
              </TableCell>
            </TableRow>
          </template>

          <!-- Rows -->
          <template v-else>
            <TableRow v-for="user in userPage.content" :key="user.id" class="border-b border-zinc-100 hover:bg-zinc-50/80">
              <!-- Avatar & Name -->
              <TableCell>
                <div class="flex items-center gap-3">
                  <div class="h-9 w-9 rounded-full bg-black text-white font-bold text-xs flex items-center justify-center shadow-sm">
                    {{ (user.fullName || 'U').substring(0, 2).toUpperCase() }}
                  </div>
                  <div>
                    <div class="font-semibold text-zinc-900 flex items-center gap-1.5">
                      {{ user.fullName }}
                      <Badge v-if="user.roleCodes?.includes('ADMIN')" variant="purple" class="text-[10px] px-1.5 py-0">
                        ADMIN
                      </Badge>
                    </div>
                    <div class="text-[11px] text-zinc-400">ID: {{ user.id.substring(0, 8) }}...</div>
                  </div>
                </div>
              </TableCell>

              <!-- Contact -->
              <TableCell>
                <div class="text-xs space-y-0.5">
                  <div class="font-medium text-zinc-900">{{ user.phoneNumber }}</div>
                  <div class="text-zinc-500">{{ user.email }}</div>
                </div>
              </TableCell>

              <!-- Identity -->
              <TableCell>
                <span class="text-xs font-mono bg-zinc-100 text-zinc-800 px-2 py-0.5 rounded border border-zinc-200">
                  {{ user.identityNumber || '-' }}
                </span>
              </TableCell>

              <!-- Tier -->
              <TableCell>
                <Badge variant="outline" class="font-semibold text-xs border-zinc-300">
                  Tier {{ user.tier }}
                </Badge>
              </TableCell>

              <!-- eKYC -->
              <TableCell>
                <Badge :variant="getEkycBadgeVariant(user.ekycStatus)">
                  {{ user.ekycStatus || 'Chưa eKYC' }}
                </Badge>
              </TableCell>

              <!-- Status -->
              <TableCell>
                <Badge :variant="getStatusBadgeVariant(user.status)">
                  {{ user.status }}
                </Badge>
              </TableCell>

              <!-- Security Counters -->
              <TableCell>
                <div class="text-xs space-y-0.5">
                  <div :class="user.failedLoginAttempts > 0 ? 'text-amber-600 font-semibold' : 'text-zinc-500'">
                    Sai Login: {{ user.failedLoginAttempts }}/5
                  </div>
                  <div :class="user.pinFailedAttempts > 0 ? 'text-rose-600 font-semibold' : 'text-zinc-500'">
                    Sai PIN: {{ user.pinFailedAttempts }}/5
                  </div>
                </div>
              </TableCell>

              <!-- Created At -->
              <TableCell class="text-xs text-zinc-500 whitespace-nowrap">
                {{ formatDate(user.createdAt) }}
              </TableCell>

              <!-- Action Menu -->
              <TableCell class="text-right relative">
                <div class="inline-flex items-center gap-1">
                  <!-- Quick View Button -->
                  <Button
                    variant="ghost"
                    size="icon"
                    class="h-8 w-8 text-zinc-500 hover:text-black hover:bg-zinc-100"
                    title="Xem chi tiết"
                    @click="router.push(`/admin/users/${user.id}`)"
                  >
                    <Eye class="h-4 w-4" />
                  </Button>

                  <!-- More Action Dropdown Toggle -->
                  <div class="relative">
                    <Button
                      variant="ghost"
                      size="icon"
                      class="h-8 w-8 text-zinc-500 hover:text-black hover:bg-zinc-100"
                      @click.stop="toggleActionDropdown(user.id)"
                    >
                      <MoreVertical class="h-4 w-4" />
                    </Button>

                    <!-- Dropdown Menu Box (Clean White) -->
                    <div
                      v-if="activeDropdownUserId === user.id"
                      class="absolute right-0 top-9 z-50 w-52 rounded-xl bg-white border border-zinc-200 p-1.5 shadow-2xl text-left space-y-0.5"
                      @click.stop
                    >
                      <button
                        type="button"
                        class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-800 hover:bg-zinc-100 transition-colors"
                        @click="router.push(`/admin/users/${user.id}`)"
                      >
                        <Eye class="h-3.5 w-3.5 text-blue-600" />
                        <span>Xem chi tiết & Ví</span>
                      </button>

                      <button
                        type="button"
                        class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-800 hover:bg-zinc-100 transition-colors"
                        @click="openEditModal(user)"
                      >
                        <Edit3 class="h-3.5 w-3.5 text-emerald-600" />
                        <span>Chỉnh sửa hồ sơ</span>
                      </button>

                      <button
                        type="button"
                        class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-800 hover:bg-zinc-100 transition-colors"
                        @click="openStatusModal(user)"
                      >
                        <ShieldAlert class="h-3.5 w-3.5 text-amber-600" />
                        <span>Đổi trạng thái</span>
                      </button>

                      <button
                        type="button"
                        class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-800 hover:bg-zinc-100 transition-colors"
                        @click="openUnlockDialog(user)"
                      >
                        <Unlock class="h-3.5 w-3.5 text-teal-600" />
                        <span>Mở khóa tài khoản</span>
                      </button>

                      <button
                        type="button"
                        class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-800 hover:bg-zinc-100 transition-colors"
                        @click="openResetPassModal(user)"
                      >
                        <KeyRound class="h-3.5 w-3.5 text-indigo-600" />
                        <span>Đặt lại Mật khẩu</span>
                      </button>

                      <button
                        type="button"
                        class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-zinc-800 hover:bg-zinc-100 transition-colors"
                        @click="openResetPinModal(user)"
                      >
                        <Hash class="h-3.5 w-3.5 text-pink-600" />
                        <span>Quản lý Mã PIN</span>
                      </button>

                      <div class="h-px bg-zinc-100 my-1" />

                      <button
                        type="button"
                        class="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                        @click="openDeleteDialog(user)"
                      >
                        <Trash2 class="h-3.5 w-3.5" />
                        <span>Vô hiệu hóa (Xóa mềm)</span>
                      </button>
                    </div>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination Controls -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-500 px-2">
      <div>
        Hiển thị trang {{ (filter.pageIndex || 0) + 1 }} / {{ userPage.totalPages || 1 }} (Tổng số {{ userPage.totalElements }} bản ghi)
      </div>

      <div class="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          :disabled="(filter.pageIndex || 0) <= 0 || isLoading"
          @click="handlePageChange((filter.pageIndex || 0) - 1)"
        >
          <ChevronLeft class="h-3.5 w-3.5 mr-1" />
          Trang trước
        </Button>
        <Button
          variant="outline"
          size="sm"
          :disabled="(filter.pageIndex || 0) >= userPage.totalPages - 1 || isLoading"
          @click="handlePageChange((filter.pageIndex || 0) + 1)"
        >
          Trang sau
          <ChevronRight class="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </div>

    <!-- Modals -->
    <CreateUserModal
      v-model:open="isCreateModalOpen"
      @created="() => { showSuccess('Tạo người dùng thành công!'); loadUsers(true); }"
    />

    <EditUserModal
      v-model:open="isEditModalOpen"
      :user="selectedUserDetail"
      @updated="() => { showSuccess('Cập nhật người dùng thành công!'); loadUsers(); }"
    />

    <ChangeStatusModal
      v-model:open="isStatusModalOpen"
      :user="selectedUser"
      @updated="() => { showSuccess('Cập nhật trạng thái thành công!'); loadUsers(); }"
    />

    <ResetPasswordModal
      v-model:open="isResetPassModalOpen"
      :user="selectedUser"
      @updated="() => showSuccess('Đặt lại mật khẩu thành công!')"
    />

    <ResetPinModal
      v-model:open="isResetPinModalOpen"
      :user="selectedUser"
      @updated="() => showSuccess('Cập nhật mã PIN thành công!')"
    />

    <ConfirmActionDialog
      v-model:open="isUnlockDialogOpen"
      title="Mở khóa tài khoản"
      :description="`Bạn có chắc chắn muốn mở khóa tài khoản của ${selectedUser?.fullName}? Các bộ đếm nhập sai mật khẩu/PIN sẽ được đặt lại về 0.`"
      confirm-text="Mở khóa ngay"
      variant="default"
      icon="check"
      @confirm="handleUnlockConfirm"
    />

    <ConfirmActionDialog
      v-model:open="isDeleteDialogOpen"
      title="Vô hiệu hóa (Xóa mềm) người dùng"
      :description="`Bạn có chắc muốn chuyển trạng thái tài khoản của ${selectedUser?.fullName} thành INACTIVE? Dữ liệu ví và lịch sử giao dịch vẫn được bảo toàn an toàn.`"
      confirm-text="Xác nhận vô hiệu hóa"
      variant="destructive"
      icon="alert"
      @confirm="handleDeleteConfirm"
    />
  </div>
</template>
