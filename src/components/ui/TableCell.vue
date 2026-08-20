<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
const classes = computed(() => cn('p-4 align-middle [&:has([role=checkbox])]:pr-0 text-sm text-foreground/90', props.class))
</script>

<template>
  <td :class="classes">
    <slot />
  </td>
</template>
