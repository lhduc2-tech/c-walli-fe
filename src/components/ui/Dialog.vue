<script setup lang="ts">
import { computed } from 'vue'
import { X } from 'lucide-vue-next'
import { cn } from '@/lib/utils'

interface Props {
  open: boolean
  title?: string
  description?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl'
}

const props = withDefaults(defineProps<Props>(), {
  maxWidth: 'lg',
})

const emits = defineEmits<{
  (e: 'update:open', value: boolean): void
  (e: 'close'): void
}>()

const maxWidthClass = computed(() => {
  switch (props.maxWidth) {
    case 'sm': return 'max-w-sm'
    case 'md': return 'max-w-md'
    case 'lg': return 'max-w-lg'
    case 'xl': return 'max-w-xl'
    case '2xl': return 'max-w-2xl'
    case '3xl': return 'max-w-3xl'
    default: return 'max-w-lg'
  }
})

function close() {
  emits('update:open', false)
  emits('close')
}
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      enter-to-class="opacity-100"
      leave-active-class="transition duration-150 ease-in"
      leave-from-class="opacity-100"
      leave-to-class="opacity-0"
    >
      <div
        v-if="open"
        class="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
        @click.self="close"
      >
        <Transition
          enter-active-class="transition duration-200 ease-out"
          enter-from-class="opacity-0 scale-95 translate-y-2"
          enter-to-class="opacity-100 scale-100 translate-y-0"
          leave-active-class="transition duration-150 ease-in"
          leave-from-class="opacity-100 scale-100 translate-y-0"
          leave-to-class="opacity-0 scale-95 translate-y-2"
        >
          <div
            v-if="open"
            :class="cn('relative w-full rounded-2xl bg-card border border-border/80 p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] flex flex-col', maxWidthClass)"
          >
            <!-- Close Button -->
            <button
              type="button"
              class="absolute right-4 top-4 rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
              @click="close"
            >
              <X class="h-5 w-5" />
              <span class="sr-only">Đóng</span>
            </button>

            <!-- Header -->
            <div v-if="title || $slots.header" class="space-y-1 pr-6 flex-shrink-0">
              <slot name="header">
                <h2 v-if="title" class="text-lg font-semibold tracking-tight text-foreground">
                  {{ title }}
                </h2>
                <p v-if="description" class="text-sm text-muted-foreground">
                  {{ description }}
                </p>
              </slot>
            </div>

            <!-- Body -->
            <div class="overflow-y-auto flex-1 pr-1 space-y-4">
              <slot />
            </div>

            <!-- Footer -->
            <div v-if="$slots.footer" class="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-3 border-t border-border/60 flex-shrink-0">
              <slot name="footer" />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
