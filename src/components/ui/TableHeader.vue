<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
const classes = computed(() => cn('[&_tr]:border-b bg-muted/40 font-semibold', props.class))
</script>

<template>
  <thead :class="classes">
    <slot />
  </thead>
</template>
