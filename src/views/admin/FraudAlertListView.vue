<script setup lang="ts">
import { ref, reactive, onMounted, computed } from 'vue'
import { adminFraudAlertService } from '@/services/admin-fraud-alert.service'
import { getErrorMessage } from '@/services/api'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { FraudAlertSummary, FraudAlertSearchRequest } from '@/types/fraud-alert.types'
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
import FraudAlertDetailModal from '@/components/admin/FraudAlertDetailModal.vue'

import {
  ShieldAlert,
  Search,
  RotateCcw,
  Eye,
  ChevronLeft,
  ChevronRight,
  AlertCircle,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Activity,
} from 'lucide-vue-next'

// ── State ────────────────────────────────────────────────────────────────────
const isLoading = ref(false)
const errorMessage = ref<string | null>(null)

const alertPage = ref<PageResponse<FraudAlertSummary>>({
  size: 10,
  totalElements: 0,
  totalPages: 0,
  content: [],
})

const filter = reactive<FraudAlertSearchRequest>({
  pageIndex: 0,
  pageSize: 10,
  sort: 'createdAt',
  direction: 'DESC',
  search: '',
  riskLevel: '',
  status: '',
  fromCreatedAt: '',
  toCreatedAt: '',
})

// Modal state
const isDetailModalOpen = ref(false)
const selectedAlertId = ref<string | null>(null)

// ── KPI Stats ─────────────────────────────────────────────────────────────────
const totalAlerts = computed(() => alertPage.value.totalElements)
const highRiskCount = computed(() => alertPage.value.content.filter((a) => a.riskLevel === 'HIGH').length)
const mediumRiskCount = computed(() => alertPage.value.content.filter((a) => a.riskLevel === 'MEDIUM').length)
const newPendingCount = computed(() => alertPage.value.content.filter((a) => a.status === 'NEW').length)

// ── Data Fetching ─────────────────────────────────────────────────────────────
async function loadAlerts(resetPage = false) {
  if (resetPage) filter.pageIndex = 0
  isLoading.value = true
  errorMessage.value = null

  try {
    const payload: FraudAlertSearchRequest = {
      ...filter,
      search: filter.search?.trim() || undefined,
      riskLevel: filter.riskLevel || undefined,
      status: filter.status || undefined,
      fromCreatedAt: filter.fromCreatedAt ? new Date(filter.fromCreatedAt).toISOString() : undefined,
      toCreatedAt: filter.toCreatedAt ? new Date(filter.toCreatedAt).toISOString() : undefined,
    }
    alertPage.value = await adminFraudAlertService.searchAlerts(payload)
  } catch (err) {
    errorMessage.value = getErrorMessage(err)
  } finally {
    isLoading.value = false
  }
}

function handleResetFilter() {
  filter.search = ''
  filter.riskLevel = ''
  filter.status = ''
  filter.fromCreatedAt = ''
  filter.toCreatedAt = ''
  loadAlerts(true)
}

function handlePageChange(newPage: number) {
  if (newPage < 0 || newPage >= alertPage.value.totalPages) return
  filter.pageIndex = newPage
  loadAlerts()
}

// ── Modal ─────────────────────────────────────────────────────────────────────
function openDetail(alert: FraudAlertSummary) {
  selectedAlertId.value = alert.id
  isDetailModalOpen.value = true
}

function handleStatusUpdated() {
  loadAlerts()
}

// ── Badge Helpers ─────────────────────────────────────────────────────────────
function getRiskBadgeVariant(level: string) {
  switch (level) {
    case 'HIGH': return 'destructive'
    case 'MEDIUM': return 'warning'
    case 'LOW': return 'success'
    default: return 'secondary'
  }
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case 'NEW': return 'info'
    case 'REVIEW': return 'warning'
    case 'RESOLVED': return 'success'
    case 'DISMISSED': return 'secondary'
    default: return 'outline'
  }
}

function getRiskScoreClass(score: number): string {
  if (score >= 80) return 'text-red-600 font-bold'
  if (score >= 50) return 'text-amber-600 font-semibold'
  return 'text-emerald-600 font-medium'
}

onMounted(() => loadAlerts())
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
          <ShieldAlert class="h-6 w-6 text-red-500" />
          Quản lý Fraud Alerts
        </h1>
        <p class="text-sm text-zinc-500 mt-0.5">
          Giám sát và xử lý cảnh báo gian lận giao dịch từ AI Engine 3 tầng
        </p>
      </div>
      <Button
        variant="outline"
        size="sm"
        class="border-zinc-300 text-zinc-700 hover:bg-zinc-50"
        :disabled="isLoading"
        @click="loadAlerts()"
      >
        <RotateCcw class="h-3.5 w-3.5 mr-1.5" :class="{ 'animate-spin': isLoading }" />
        Làm mới
      </Button>
    </div>

    <!-- Error Banner -->
    <div v-if="errorMessage" class="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 font-medium text-sm flex items-center gap-2">
      <AlertCircle class="h-5 w-5 flex-shrink-0" />
      <span>{{ errorMessage }}</span>
    </div>

    <!-- KPI Cards -->
    <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card class="p-4 flex items-center gap-3.5 bg-white border border-zinc-200 shadow-sm">
        <div class="h-11 w-11 rounded-xl bg-zinc-100 text-zinc-700 flex items-center justify-center">
          <Activity class="h-5 w-5" />
        </div>
        <div>
          <p class="text-xs text-zinc-500 font-medium">Tổng alerts</p>
          <h3 class="text-xl font-bold text-zinc-900">{{ totalAlerts }}</h3>
        </div>
      </Card>

      <Card class="p-4 flex items-center gap-3.5 bg-white border border-zinc-200 shadow-sm">
        <div class="h-11 w-11 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
          <ShieldAlert class="h-5 w-5" />
        </div>
        <div>
          <p class="text-xs text-zinc-500 font-medium">Rủi ro CAO</p>
          <h3 class="text-xl font-bold text-red-600">{{ highRiskCount }}</h3>
        </div>
      </Card>

      <Card class="p-4 flex items-center gap-3.5 bg-white border border-zinc-200 shadow-sm">
        <div class="h-11 w-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
          <AlertTriangle class="h-5 w-5" />
        </div>
        <div>
          <p class="text-xs text-zinc-500 font-medium">Rủi ro VỪA</p>
          <h3 class="text-xl font-bold text-amber-600">{{ mediumRiskCount }}</h3>
        </div>
      </Card>

      <Card class="p-4 flex items-center gap-3.5 bg-white border border-zinc-200 shadow-sm">
        <div class="h-11 w-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
          <Clock class="h-5 w-5" />
        </div>
        <div>
          <p class="text-xs text-zinc-500 font-medium">Chờ xử lý</p>
          <h3 class="text-xl font-bold text-blue-600">{{ newPendingCount }}</h3>
        </div>
      </Card>
    </div>

    <!-- Filter Card -->
    <Card class="p-5 bg-white border border-zinc-200 shadow-sm space-y-4">
      <form @submit.prevent="loadAlerts(true)" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <!-- Keyword -->
        <div class="space-y-1 sm:col-span-2">
          <label class="text-xs font-semibold text-zinc-700">Từ khóa tìm kiếm</label>
          <div class="relative">
            <Search class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              v-model="filter.search"
              placeholder="Mã GD, Email, Họ tên người dùng..."
              class="pl-9 h-9 bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-black"
            />
          </div>
        </div>

        <!-- Risk Level -->
        <div class="space-y-1">
          <label class="text-xs font-semibold text-zinc-700">Mức rủi ro</label>
          <select
            v-model="filter.riskLevel"
            class="flex h-9 w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <option value="">Tất cả mức rủi ro</option>
            <option value="HIGH">HIGH — Rủi ro cao</option>
            <option value="MEDIUM">MEDIUM — Rủi ro vừa</option>
            <option value="LOW">LOW — Rủi ro thấp</option>
          </select>
        </div>

        <!-- Status -->
        <div class="space-y-1">
          <label class="text-xs font-semibold text-zinc-700">Trạng thái xử lý</label>
          <select
            v-model="filter.status"
            class="flex h-9 w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="NEW">NEW — Chờ xử lý</option>
            <option value="REVIEW">REVIEW — Đang xem xét</option>
            <option value="RESOLVED">RESOLVED — Đã xử lý</option>
            <option value="DISMISSED">DISMISSED — Bỏ qua</option>
          </select>
        </div>

        <!-- From date -->
        <div class="space-y-1">
          <label class="text-xs font-semibold text-zinc-700">Từ ngày</label>
          <input
            v-model="filter.fromCreatedAt"
            type="datetime-local"
            class="flex h-9 w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          />
        </div>

        <!-- To date -->
        <div class="space-y-1">
          <label class="text-xs font-semibold text-zinc-700">Đến ngày</label>
          <input
            v-model="filter.toCreatedAt"
            type="datetime-local"
            class="flex h-9 w-full rounded-lg border border-zinc-300 bg-white px-3 py-1.5 text-xs text-zinc-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black"
          />
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

    <!-- Data Table -->
    <div class="relative bg-white border border-zinc-200 rounded-xl shadow-sm overflow-hidden">
      <Table class="border-0">
        <TableHeader>
          <TableRow class="bg-zinc-50 border-b border-zinc-200">
            <TableHead class="text-zinc-600">Mã giao dịch</TableHead>
            <TableHead class="text-zinc-600">Người dùng</TableHead>
            <TableHead class="text-zinc-600">Giao dịch</TableHead>
            <TableHead class="text-zinc-600">Điểm rủi ro</TableHead>
            <TableHead class="text-zinc-600">Mức rủi ro</TableHead>
            <TableHead class="text-zinc-600">Trạng thái</TableHead>
            <TableHead class="text-zinc-600">Thời gian</TableHead>
            <TableHead class="text-right text-zinc-600">Thao tác</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          <!-- Loading -->
          <template v-if="isLoading">
            <TableRow v-for="i in 5" :key="i">
              <TableCell v-for="j in 8" :key="j">
                <Skeleton class="h-5 w-full bg-zinc-100" />
              </TableCell>
            </TableRow>
          </template>

          <!-- Empty -->
          <template v-else-if="alertPage.content.length === 0">
            <TableRow>
              <TableCell colspan="8" class="h-48 text-center">
                <div class="flex flex-col items-center justify-center space-y-2">
                  <ShieldAlert class="h-8 w-8 text-zinc-300" />
                  <p class="font-medium text-zinc-600">Không tìm thấy fraud alert nào</p>
                  <p class="text-xs text-zinc-400">Hãy thử thay đổi bộ lọc hoặc khoảng thời gian</p>
                </div>
              </TableCell>
            </TableRow>
          </template>

          <!-- Rows -->
          <template v-else>
            <TableRow
              v-for="alert in alertPage.content"
              :key="alert.id"
              class="border-b border-zinc-100 hover:bg-zinc-50/80"
              :class="{
                'border-l-2 border-l-red-400': alert.riskLevel === 'HIGH',
                'border-l-2 border-l-amber-400': alert.riskLevel === 'MEDIUM',
              }"
            >
              <!-- Reference Code -->
              <TableCell>
                <div class="space-y-0.5">
                  <div class="font-mono text-[11px] font-semibold text-zinc-800 bg-zinc-100 px-1.5 py-0.5 rounded inline-block max-w-[140px] truncate">
                    {{ alert.referenceCode }}
                  </div>
                  <div class="text-[10px] text-zinc-400 font-mono max-w-[140px] truncate">
                    {{ alert.id.substring(0, 8) }}...
                  </div>
                </div>
              </TableCell>

              <!-- User -->
              <TableCell>
                <div class="text-xs space-y-0.5">
                  <div class="font-medium text-zinc-900 max-w-[130px] truncate">{{ alert.userFullName || '—' }}</div>
                  <div class="text-zinc-500 max-w-[130px] truncate">{{ alert.userEmail || '—' }}</div>
                </div>
              </TableCell>

              <!-- Transaction -->
              <TableCell>
                <div class="text-xs space-y-0.5">
                  <div class="font-semibold text-zinc-800">{{ formatCurrency(alert.amount) }}</div>
                  <div class="text-zinc-500 uppercase tracking-wide">{{ alert.transactionType }}</div>
                  <div v-if="alert.recipientFullName" class="text-zinc-400 truncate max-w-[100px]">→ {{ alert.recipientFullName }}</div>
                </div>
              </TableCell>

              <!-- Score -->
              <TableCell>
                <div class="space-y-1">
                  <span :class="['text-base', getRiskScoreClass(alert.finalRiskScore)]">
                    {{ alert.finalRiskScore?.toFixed(1) }}
                  </span>
                  <div class="h-1.5 bg-zinc-100 rounded-full overflow-hidden w-16">
                    <div
                      class="h-full rounded-full"
                      :class="{
                        'bg-red-500': alert.riskLevel === 'HIGH',
                        'bg-amber-500': alert.riskLevel === 'MEDIUM',
                        'bg-emerald-500': alert.riskLevel === 'LOW',
                      }"
                      :style="{ width: `${Math.min(alert.finalRiskScore, 100)}%` }"
                    />
                  </div>
                </div>
              </TableCell>

              <!-- Risk Level -->
              <TableCell>
                <Badge :variant="getRiskBadgeVariant(alert.riskLevel)" class="text-xs">
                  {{ alert.riskLevel }}
                </Badge>
              </TableCell>

              <!-- Status -->
              <TableCell>
                <Badge :variant="getStatusBadgeVariant(alert.status)" class="text-xs">
                  {{ alert.status }}
                </Badge>
              </TableCell>

              <!-- Created At -->
              <TableCell class="text-xs text-zinc-500 whitespace-nowrap">
                {{ formatDate(alert.createdAt) }}
              </TableCell>

              <!-- Actions -->
              <TableCell class="text-right">
                <Button
                  variant="ghost"
                  size="icon"
                  class="h-8 w-8 text-zinc-500 hover:text-black hover:bg-zinc-100"
                  title="Xem chi tiết"
                  @click="openDetail(alert)"
                >
                  <Eye class="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          </template>
        </TableBody>
      </Table>
    </div>

    <!-- Pagination -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-zinc-500 px-2">
      <div>
        Hiển thị trang {{ (filter.pageIndex || 0) + 1 }} / {{ alertPage.totalPages || 1 }}
        (Tổng số {{ alertPage.totalElements }} bản ghi)
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
          :disabled="(filter.pageIndex || 0) >= alertPage.totalPages - 1 || isLoading"
          @click="handlePageChange((filter.pageIndex || 0) + 1)"
        >
          Trang sau
          <ChevronRight class="h-3.5 w-3.5 ml-1" />
        </Button>
      </div>
    </div>

    <!-- Detail Modal -->
    <FraudAlertDetailModal
      v-model:open="isDetailModalOpen"
      :alert-id="selectedAlertId"
      @status-updated="handleStatusUpdated"
    />
  </div>
</template>
