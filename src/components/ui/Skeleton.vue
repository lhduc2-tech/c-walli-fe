<script setup lang="ts">
import { type HTMLAttributes, computed } from 'vue'
import { cn } from '@/lib/utils'

interface Props {
  class?: HTMLAttributes['class']
}

const props = defineProps<Props>()
const classes = computed(() => cn('animate-pulse rounded-md bg-muted/60', props.class))
</script>

<template>
  <div :class="classes" />
</template>
