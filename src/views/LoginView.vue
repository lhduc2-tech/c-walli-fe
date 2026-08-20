<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import Button from '@/components/ui/Button.vue'
import Input from '@/components/ui/Input.vue'
import Label from '@/components/ui/Label.vue'
import Card from '@/components/ui/Card.vue'
import CardHeader from '@/components/ui/CardHeader.vue'
import CardTitle from '@/components/ui/CardTitle.vue'
import CardDescription from '@/components/ui/CardDescription.vue'
import CardContent from '@/components/ui/CardContent.vue'
import { Loader2, ShieldCheck, Eye, EyeOff, Lock, Phone } from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const showPassword = ref(false)

const form = reactive({
  phoneNumber: '',
  password: '',
})

async function handleLogin() {
  if (!form.phoneNumber || !form.password) return

  const success = await authStore.login({
    phoneNumber: form.phoneNumber.trim(),
    password: form.password,
  })

  if (success) {
    const redirect = (route.query.redirect as string) || '/admin/users'
    router.push(redirect)
  }
}
</script>

<template>
  <div class="min-h-screen w-full flex items-center justify-center p-4 bg-zinc-50 text-zinc-900 relative">
    <div class="w-full max-w-md space-y-6">
      <!-- Header Brand -->
      <div class="text-center space-y-2">
        <div class="inline-flex h-14 w-14 rounded-2xl bg-black items-center justify-center shadow-lg text-white font-black text-2xl mb-1">
          C
        </div>
        <h1 class="text-2xl font-bold tracking-tight text-zinc-900">C-Walli Admin Portal</h1>
        <p class="text-sm text-zinc-500">Đăng nhập tài khoản Quản trị viên để tiếp tục</p>
      </div>

      <!-- Login Card -->
      <Card class="border-zinc-200 bg-white text-zinc-900 shadow-xl rounded-2xl p-2">
        <CardHeader class="space-y-1 pb-4">
          <CardTitle class="text-lg font-semibold text-zinc-900">Xác thực Quản trị</CardTitle>
          <CardDescription class="text-zinc-500">Nhập số điện thoại và mật khẩu hệ thống C-Walli</CardDescription>
        </CardHeader>

        <CardContent>
          <form @submit.prevent="handleLogin" class="space-y-4">
            <!-- Alert Error -->
            <div
              v-if="authStore.error"
              class="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium"
            >
              {{ authStore.error }}
            </div>

            <!-- Phone number -->
            <div class="space-y-1.5">
              <Label for="login-phone" class="text-zinc-700">Số điện thoại *</Label>
              <div class="relative">
                <Phone class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  id="login-phone"
                  v-model="form.phoneNumber"
                  placeholder="0987654321"
                  required
                  class="pl-9 bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-black"
                />
              </div>
            </div>

            <!-- Password -->
            <div class="space-y-1.5">
              <Label for="login-password" class="text-zinc-700">Mật khẩu *</Label>
              <div class="relative">
                <Lock class="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  id="login-password"
                  :type="showPassword ? 'text' : 'password'"
                  v-model="form.password"
                  placeholder="••••••••"
                  required
                  class="pl-9 pr-10 bg-white border-zinc-300 text-zinc-900 placeholder:text-zinc-400 focus-visible:ring-black"
                />
                <button
                  type="button"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700"
                  @click="showPassword = !showPassword"
                >
                  <EyeOff v-if="showPassword" class="h-4 w-4" />
                  <Eye v-else class="h-4 w-4" />
                </button>
              </div>
            </div>

            <!-- Submit Button (Black bg, White text) -->
            <Button
              type="submit"
              variant="default"
              class="w-full h-11 text-base font-semibold bg-black text-white hover:bg-zinc-800 shadow-md mt-2"
              :disabled="authStore.isLoading"
            >
              <Loader2 v-if="authStore.isLoading" class="h-5 w-5 animate-spin mr-2" />
              <ShieldCheck v-else class="h-5 w-5 mr-2" />
              Đăng nhập Quản trị
            </Button>
          </form>
        </CardContent>
      </Card>

      <!-- Footer Info -->
      <div class="text-center text-xs text-zinc-400">
        &copy; 2026 C-Walli Platform. All rights reserved.
      </div>
    </div>
  </div>
</template>
