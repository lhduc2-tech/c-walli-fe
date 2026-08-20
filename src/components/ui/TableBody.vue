<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
const classes = computed(() => cn('[&_tr:last-child]:border-0 divide-y divide-border/60', props.class))
</script>

<template>
  <tbody :class="classes">
    <slot />
  </tbody>
</template>
