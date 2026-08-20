<script setup lang="ts">
import { ref } from 'vue'
import Dialog from '@/components/ui/Dialog.vue'
import Button from '@/components/ui/Button.vue'
import { Loader2, AlertTriangle, CheckCircle2 } from 'lucide-vue-next'

interface Props {
  open: boolean
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: 'destructive' | 'default' | 'fintech'
  icon?: 'alert' | 'check'
}

const props = withDefaults(defineProps<Props>(), {
  confirmText: 'Xác nhận',
  cancelText: 'Hủy',
  variant: 'default',
  icon: 'alert',
})

const emits = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'confirm'): void
}>()

const isSubmitting = ref(false)

async function handleConfirm() {
  isSubmitting.value = true
  try {
    emits('confirm')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <Dialog
    :open="open"
    :title="title"
    :description="description"
    max-width="md"
    @update:open="(val) => emits('update:open', val)"
  >
    <div class="flex items-center gap-3 p-3.5 rounded-xl bg-zinc-50 border border-zinc-200">
      <AlertTriangle v-if="icon === 'alert'" class="h-6 w-6 text-amber-600 flex-shrink-0" />
      <CheckCircle2 v-else class="h-6 w-6 text-emerald-600 flex-shrink-0" />
      <p class="text-sm text-zinc-700 leading-relaxed">
        Hành động này sẽ được ghi nhận vào nhật ký kiểm toán hệ thống C-Walli.
      </p>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-2 w-full">
        <Button variant="outline" type="button" @click="emits('update:open', false)">
          {{ cancelText }}
        </Button>
        <Button
          :variant="variant"
          type="button"
          :class="variant === 'default' ? 'bg-black text-white hover:bg-zinc-800' : ''"
          :disabled="isSubmitting"
          @click="handleConfirm"
        >
          <Loader2 v-if="isSubmitting" class="h-4 w-4 animate-spin mr-1" />
          {{ confirmText }}
        </Button>
      </div>
    </template>
  </Dialog>
</template>
