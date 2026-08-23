<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { adminFraudAlertService } from '@/services/admin-fraud-alert.service'
import { getErrorMessage } from '@/services/api'
import { formatDate, formatCurrency } from '@/lib/utils'
import type { FraudAlertDetail, TriggeredRule, UpdateFraudAlertStatusRequest } from '@/types/fraud-alert.types'

import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'
import Skeleton from '@/components/ui/Skeleton.vue'

import {
  X,
  AlertTriangle,
  ShieldAlert,
  ShieldCheck,
  ShieldOff,
  CheckCircle2,
  AlertCircle,
  Cpu,
  Activity,
  ArrowRight,
  CreditCard,
  User,
  Phone,
  Building2,
  ChevronRight,
} from 'lucide-vue-next'

interface Props {
  open: boolean
  alertId: string | null
}

const props = defineProps<Props>()
const emit = defineEmits<{
  'update:open': [value: boolean]
  'statusUpdated': []
}>()

const isLoading = ref(false)
const isUpdating = ref(false)
const errorMessage = ref<string | null>(null)
const successMessage = ref<string | null>(null)
const alert = ref<FraudAlertDetail | null>(null)

// Load detail when alertId changes
watch(() => [props.open, props.alertId], async ([open, id]) => {
  if (open && id) {
    await loadDetail(id as string)
  } else if (!open) {
    alert.value = null
    errorMessage.value = null
    successMessage.value = null
  }
}, { immediate: true })

async function loadDetail(id: string) {
  isLoading.value = true
  errorMessage.value = null
  try {
    alert.value = await adminFraudAlertService.getAlertDetail(id)
  } catch (err) {
    errorMessage.value = getErrorMessage(err)
  } finally {
    isLoading.value = false
  }
}

function close() {
  emit('update:open', false)
}

// Parse JSON fields safely
const parsedTriggeredRules = computed<TriggeredRule[]>(() => {
  if (!alert.value?.triggeredRules) return []
  try {
    if (typeof alert.value.triggeredRules === 'string') {
      return JSON.parse(alert.value.triggeredRules)
    }
    return alert.value.triggeredRules as TriggeredRule[]
  } catch {
    return []
  }
})

const parsedThreatWarnings = computed<string[]>(() => {
  if (!alert.value?.threatWarnings) return []
  try {
    if (typeof alert.value.threatWarnings === 'string') {
      return JSON.parse(alert.value.threatWarnings)
    }
    return alert.value.threatWarnings as string[]
  } catch {
    return []
  }
})

// Status helpers
function getRiskBadgeVariant(level?: string) {
  switch (level) {
    case 'HIGH': return 'destructive'
    case 'MEDIUM': return 'warning'
    case 'LOW': return 'success'
    default: return 'secondary'
  }
}

function getStatusBadgeVariant(status?: string) {
  switch (status) {
    case 'NEW': return 'info'
    case 'REVIEW': return 'warning'
    case 'RESOLVED': return 'success'
    case 'DISMISSED': return 'secondary'
    default: return 'outline'
  }
}

function getRiskScoreColor(score: number): string {
  if (score >= 80) return 'text-red-600'
  if (score >= 50) return 'text-amber-600'
  return 'text-emerald-600'
}

function getRiskScoreBarColor(score: number): string {
  if (score >= 80) return 'bg-red-500'
  if (score >= 50) return 'bg-amber-500'
  return 'bg-emerald-500'
}

// Status update
const selectedStatus = ref<'REVIEW' | 'RESOLVED' | 'DISMISSED' | ''>('')
const statusNote = ref('')

async function handleUpdateStatus() {
  if (!alert.value || !selectedStatus.value) return
  isUpdating.value = true
  errorMessage.value = null
  try {
    const req: UpdateFraudAlertStatusRequest = {
      status: selectedStatus.value,
      note: statusNote.value || undefined,
    }
    await adminFraudAlertService.updateAlertStatus(alert.value.id, req)
    alert.value.status = selectedStatus.value
    successMessage.value = `Đã cập nhật trạng thái thành ${selectedStatus.value}`
    selectedStatus.value = ''
    statusNote.value = ''
    emit('statusUpdated')
    setTimeout(() => { successMessage.value = null }, 3000)
  } catch (err) {
    errorMessage.value = getErrorMessage(err)
  } finally {
    isUpdating.value = false
  }
}
</script>

<template>
  <!-- Backdrop -->
  <Teleport to="body">
    <div
      v-if="open"
      class="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <!-- Overlay -->
      <div
        class="absolute inset-0 bg-black/60 backdrop-blur-sm"
        @click="close"
      />

      <!-- Modal Panel -->
      <div
        class="relative bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden"
        @click.stop
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-zinc-50 flex-shrink-0">
          <div class="flex items-center gap-3">
            <div class="h-9 w-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <ShieldAlert class="h-5 w-5" />
            </div>
            <div>
              <h2 class="font-bold text-zinc-900 text-base leading-tight">Chi tiết Fraud Alert</h2>
              <p class="text-xs text-zinc-500 font-mono" v-if="alert">{{ alert.referenceCode }}</p>
            </div>
          </div>
          <button
            type="button"
            class="h-8 w-8 rounded-lg flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:bg-zinc-100 transition-colors"
            @click="close"
          >
            <X class="h-4 w-4" />
          </button>
        </div>

        <!-- Body -->
        <div class="flex-1 overflow-y-auto p-6 space-y-5">
          <!-- Loading -->
          <template v-if="isLoading">
            <div class="space-y-3">
              <Skeleton class="h-20 w-full bg-zinc-100 rounded-xl" />
              <Skeleton class="h-32 w-full bg-zinc-100 rounded-xl" />
              <Skeleton class="h-24 w-full bg-zinc-100 rounded-xl" />
            </div>
          </template>

          <!-- Error -->
          <div v-else-if="errorMessage && !alert" class="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex gap-2">
            <AlertCircle class="h-4 w-4 flex-shrink-0 mt-0.5" />
            {{ errorMessage }}
          </div>

          <!-- Content -->
          <template v-else-if="alert">
            <!-- Risk Score Hero -->
            <div class="rounded-xl border p-4 flex flex-col sm:flex-row sm:items-center gap-4"
              :class="{
                'bg-red-50 border-red-200': alert.riskLevel === 'HIGH',
                'bg-amber-50 border-amber-200': alert.riskLevel === 'MEDIUM',
                'bg-emerald-50 border-emerald-200': alert.riskLevel === 'LOW',
              }">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-1">
                  <span class="text-sm font-semibold text-zinc-600">Điểm rủi ro tổng hợp</span>
                  <Badge :variant="getRiskBadgeVariant(alert.riskLevel)" class="text-xs">{{ alert.riskLevel }}</Badge>
                  <Badge :variant="getStatusBadgeVariant(alert.status)" class="text-xs">{{ alert.status }}</Badge>
                </div>
                <div :class="['text-4xl font-black', getRiskScoreColor(alert.finalRiskScore)]">
                  {{ alert.finalRiskScore?.toFixed(1) }}<span class="text-lg font-semibold text-zinc-400">/100</span>
                </div>
                <!-- Score bar -->
                <div class="mt-2 h-2 bg-zinc-200 rounded-full overflow-hidden w-full max-w-xs">
                  <div
                    :class="['h-full rounded-full transition-all', getRiskScoreBarColor(alert.finalRiskScore)]"
                    :style="{ width: `${Math.min(alert.finalRiskScore, 100)}%` }"
                  />
                </div>
              </div>
              <div class="grid grid-cols-2 gap-3 text-center">
                <div class="bg-white/70 rounded-lg px-3 py-2">
                  <div class="text-xs text-zinc-500 font-medium">Rule Score</div>
                  <div class="text-lg font-bold text-zinc-800">{{ alert.ruleScore?.toFixed(1) }}</div>
                </div>
                <div class="bg-white/70 rounded-lg px-3 py-2">
                  <div class="text-xs text-zinc-500 font-medium">AI Score</div>
                  <div class="text-lg font-bold text-zinc-800">{{ alert.aiScore?.toFixed(1) }}</div>
                </div>
                <div class="bg-white/70 rounded-lg px-3 py-2">
                  <div class="text-xs text-zinc-500 font-medium">LightGBM</div>
                  <div class="text-lg font-bold text-zinc-800">{{ alert.lgbmProbPct?.toFixed(1) }}%</div>
                </div>
                <div class="bg-white/70 rounded-lg px-3 py-2">
                  <div class="text-xs text-zinc-500 font-medium">AE Error</div>
                  <div class="text-lg font-bold text-zinc-800">{{ alert.aeReconstructionError?.toFixed(4) }}</div>
                </div>
              </div>
            </div>

            <!-- Transaction Info -->
            <div class="rounded-xl border border-zinc-100 overflow-hidden">
              <div class="px-4 py-2.5 bg-zinc-50 border-b border-zinc-100 flex items-center gap-2">
                <CreditCard class="h-4 w-4 text-zinc-500" />
                <span class="text-xs font-semibold text-zinc-600 uppercase tracking-wide">Thông tin giao dịch</span>
              </div>
              <div class="p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                <div>
                  <p class="text-xs text-zinc-400 font-medium">Reference Code</p>
                  <p class="font-mono text-zinc-800 font-semibold text-xs break-all">{{ alert.referenceCode }}</p>
                </div>
                <div>
                  <p class="text-xs text-zinc-400 font-medium">Loại giao dịch</p>
                  <p class="font-semibold text-zinc-800">{{ alert.transactionType }}</p>
                </div>
                <div>
                  <p class="text-xs text-zinc-400 font-medium">Số tiền</p>
                  <p class="font-bold text-zinc-900 text-base">{{ formatCurrency(alert.amount) }}</p>
                </div>
                <div>
                  <p class="text-xs text-zinc-400 font-medium">Thời gian</p>
                  <p class="text-zinc-700">{{ formatDate(alert.createdAt) }}</p>
                </div>
                <div v-if="alert.bankCode">
                  <p class="text-xs text-zinc-400 font-medium">Ngân hàng</p>
                  <p class="font-semibold text-zinc-800">{{ alert.bankCode }}</p>
                </div>
                <div v-if="alert.accountNumber">
                  <p class="text-xs text-zinc-400 font-medium">Số tài khoản</p>
                  <p class="font-mono text-zinc-800">{{ alert.accountNumber }}</p>
                </div>
              </div>
            </div>

            <!-- User & Recipient Info -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <!-- Sender -->
              <div class="rounded-xl border border-zinc-100 overflow-hidden">
                <div class="px-4 py-2.5 bg-zinc-50 border-b border-zinc-100 flex items-center gap-2">
                  <User class="h-4 w-4 text-zinc-500" />
                  <span class="text-xs font-semibold text-zinc-600 uppercase tracking-wide">Người gửi</span>
                </div>
                <div class="p-4 space-y-2 text-sm">
                  <div>
                    <p class="text-xs text-zinc-400">Họ tên</p>
                    <p class="font-medium text-zinc-800">{{ alert.userFullName || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-zinc-400">Email</p>
                    <p class="text-zinc-700 break-all">{{ alert.userEmail || '—' }}</p>
                  </div>
                </div>
              </div>
              <!-- Recipient -->
              <div class="rounded-xl border border-zinc-100 overflow-hidden">
                <div class="px-4 py-2.5 bg-zinc-50 border-b border-zinc-100 flex items-center gap-2">
                  <ArrowRight class="h-4 w-4 text-zinc-500" />
                  <span class="text-xs font-semibold text-zinc-600 uppercase tracking-wide">Người nhận</span>
                </div>
                <div class="p-4 space-y-2 text-sm">
                  <div>
                    <p class="text-xs text-zinc-400">Họ tên</p>
                    <p class="font-medium text-zinc-800">{{ alert.recipientFullName || '—' }}</p>
                  </div>
                  <div>
                    <p class="text-xs text-zinc-400">Số điện thoại</p>
                    <p class="text-zinc-700">{{ alert.recipientPhoneNumber || '—' }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- System Action -->
            <div class="rounded-xl border border-zinc-100 bg-zinc-50 p-4">
              <p class="text-xs font-semibold text-zinc-500 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
                <Activity class="h-3.5 w-3.5" /> Quyết định hệ thống
              </p>
              <p class="text-sm text-zinc-700 font-medium">{{ alert.systemAction }}</p>
            </div>

            <!-- Triggered Rules -->
            <div v-if="parsedTriggeredRules.length > 0" class="rounded-xl border border-amber-200 overflow-hidden">
              <div class="px-4 py-2.5 bg-amber-50 border-b border-amber-200 flex items-center gap-2">
                <AlertTriangle class="h-4 w-4 text-amber-600" />
                <span class="text-xs font-semibold text-amber-700 uppercase tracking-wide">
                  Quy tắc bị kích hoạt ({{ parsedTriggeredRules.length }})
                </span>
              </div>
              <div class="divide-y divide-amber-100">
                <div v-for="rule in parsedTriggeredRules" :key="rule.code" class="p-4">
                  <div class="flex items-start justify-between gap-2">
                    <div class="flex-1">
                      <div class="flex items-center gap-2 mb-1">
                        <span class="font-mono text-[11px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold">{{ rule.code }}</span>
                        <span class="text-sm font-semibold text-zinc-800">{{ rule.name }}</span>
                      </div>
                      <p class="text-xs text-zinc-500 leading-relaxed">{{ rule.desc }}</p>
                    </div>
                    <div class="text-right flex-shrink-0">
                      <span class="text-xs text-zinc-500">Penalty</span>
                      <p class="text-base font-bold text-red-600">+{{ rule.penalty }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Threat Warnings -->
            <div v-if="parsedThreatWarnings.length > 0" class="space-y-2">
              <p class="text-xs font-semibold text-zinc-500 uppercase tracking-wide flex items-center gap-1.5">
                <ShieldAlert class="h-3.5 w-3.5" /> Cảnh báo nguy cơ
              </p>
              <div
                v-for="(warning, i) in parsedThreatWarnings"
                :key="i"
                class="text-sm text-zinc-700 bg-zinc-50 border border-zinc-100 rounded-lg p-3 leading-relaxed"
              >
                {{ warning }}
              </div>
            </div>

            <!-- AI Score Breakdown -->
            <div class="rounded-xl border border-zinc-100 overflow-hidden">
              <div class="px-4 py-2.5 bg-zinc-50 border-b border-zinc-100 flex items-center gap-2">
                <Cpu class="h-4 w-4 text-zinc-500" />
                <span class="text-xs font-semibold text-zinc-600 uppercase tracking-wide">Phân tích AI chi tiết</span>
              </div>
              <div class="p-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                <div class="text-center">
                  <p class="text-xs text-zinc-400 mb-1">LightGBM Prob</p>
                  <p class="text-xl font-bold text-zinc-800">{{ alert.lgbmProbPct?.toFixed(2) }}<span class="text-sm font-normal text-zinc-400">%</span></p>
                </div>
                <div class="text-center">
                  <p class="text-xs text-zinc-400 mb-1">AE Recon Error</p>
                  <p class="text-xl font-bold text-zinc-800 text-xs sm:text-base">{{ alert.aeReconstructionError?.toFixed(6) }}</p>
                </div>
                <div class="text-center">
                  <p class="text-xs text-zinc-400 mb-1">AE Threshold</p>
                  <p class="text-xl font-bold text-zinc-800 text-xs sm:text-base">{{ alert.aeThreshold?.toFixed(6) }}</p>
                </div>
                <div class="text-center">
                  <p class="text-xs text-zinc-400 mb-1">AE Anomaly</p>
                  <p class="font-bold" :class="alert.aeReconstructionError > alert.aeThreshold ? 'text-red-600' : 'text-emerald-600'">
                    {{ alert.aeReconstructionError > alert.aeThreshold ? '⚠ Bất thường' : '✓ Bình thường' }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Success / Error messages inside modal -->
            <div v-if="successMessage" class="p-3 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
              <CheckCircle2 class="h-4 w-4 flex-shrink-0" />
              {{ successMessage }}
            </div>
            <div v-if="errorMessage" class="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2">
              <AlertCircle class="h-4 w-4 flex-shrink-0" />
              {{ errorMessage }}
            </div>

            <!-- Update Status Panel -->
            <div v-if="alert.status !== 'RESOLVED' && alert.status !== 'DISMISSED'" class="rounded-xl border border-zinc-200 bg-white overflow-hidden">
              <div class="px-4 py-2.5 bg-zinc-50 border-b border-zinc-100 flex items-center gap-2">
                <ShieldCheck class="h-4 w-4 text-zinc-500" />
                <span class="text-xs font-semibold text-zinc-600 uppercase tracking-wide">Cập nhật trạng thái xử lý</span>
              </div>
              <div class="p-4 space-y-3">
                <div class="flex gap-2 flex-wrap">
                  <button
                    v-for="s in ['REVIEW', 'RESOLVED', 'DISMISSED']"
                    :key="s"
                    type="button"
                    :class="[
                      'px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all',
                      selectedStatus === s
                        ? s === 'RESOLVED' ? 'bg-emerald-600 text-white border-emerald-600'
                          : s === 'DISMISSED' ? 'bg-zinc-600 text-white border-zinc-600'
                          : 'bg-amber-500 text-white border-amber-500'
                        : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50'
                    ]"
                    @click="selectedStatus = selectedStatus === s ? '' : s as any"
                  >
                    {{ s === 'REVIEW' ? '🔍 Đang xem xét' : s === 'RESOLVED' ? '✅ Đã giải quyết' : '🚫 Bỏ qua' }}
                  </button>
                </div>
                <textarea
                  v-if="selectedStatus"
                  v-model="statusNote"
                  placeholder="Ghi chú của admin (tuỳ chọn)..."
                  class="w-full rounded-lg border border-zinc-200 px-3 py-2 text-sm text-zinc-800 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-black resize-none"
                  rows="2"
                />
                <Button
                  v-if="selectedStatus"
                  variant="default"
                  size="sm"
                  class="bg-black text-white hover:bg-zinc-800"
                  :disabled="isUpdating"
                  @click="handleUpdateStatus"
                >
                  {{ isUpdating ? 'Đang lưu...' : 'Xác nhận cập nhật' }}
                </Button>
              </div>
            </div>
          </template>
        </div>
      </div>
    </div>
  </Teleport>
</template>
