<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import {
  Users,
  LogOut,
  Menu,
  X,
  ChevronRight
} from 'lucide-vue-next'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

const isMobileMenuOpen = ref(false)

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>

<template>
  <div class="min-h-screen bg-zinc-50 text-zinc-900 flex flex-col md:flex-row font-sans">
    <!-- Mobile Sidebar Backdrop -->
    <div
      v-if="isMobileMenuOpen"
      class="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
      @click="isMobileMenuOpen = false"
    />

    <!-- Sidebar -->
    <aside
      :class="[
        'fixed inset-y-0 left-0 z-50 w-64 border-r border-zinc-200 bg-white flex flex-col transition-transform duration-300 md:static md:translate-x-0',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full',
      ]"
    >
      <!-- Brand Logo -->
      <div class="h-16 flex items-center justify-between px-6 border-b border-zinc-200">
        <div class="flex items-center gap-2.5">
          <div class="h-9 w-9 rounded-xl bg-black flex items-center justify-center text-white font-black text-lg">
            C
          </div>
          <div>
            <h1 class="font-bold text-base tracking-tight leading-tight text-zinc-900">C-Walli</h1>
            <span class="text-[10px] uppercase tracking-wider font-semibold text-zinc-600 bg-zinc-100 px-1.5 py-0.5 rounded">Admin Backoffice</span>
          </div>
        </div>
        <button class="md:hidden p-1 text-zinc-500 hover:text-zinc-900" @click="isMobileMenuOpen = false">
          <X class="h-5 w-5" />
        </button>
      </div>

      <!-- Nav Links -->
      <div class="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
        <div class="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
          Quản trị Hệ thống
        </div>

        <router-link
          to="/admin/users"
          class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all"
          :class="[
            route.path.startsWith('/admin/users')
              ? 'bg-black text-white font-semibold shadow-sm'
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100',
          ]"
          @click="isMobileMenuOpen = false"
        >
          <Users class="h-4 w-4" />
          <span>Quản lý Người dùng</span>
        </router-link>
      </div>

      <!-- Current Admin Profile & Logout -->
      <div class="p-4 border-t border-zinc-200 bg-zinc-50 space-y-3">
        <div class="flex items-center gap-3">
          <div class="h-10 w-10 rounded-full bg-zinc-200 text-zinc-800 flex items-center justify-center font-bold text-sm border border-zinc-300">
            {{ (authStore.user?.fullName || 'AD').substring(0, 2).toUpperCase() }}
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-semibold text-zinc-900 truncate">
              {{ authStore.user?.fullName || 'Administrator' }}
            </p>
            <p class="text-xs text-zinc-500 truncate">
              {{ authStore.user?.email || authStore.user?.phoneNumber || 'Admin' }}
            </p>
          </div>
        </div>

        <button
          type="button"
          class="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
          @click="handleLogout"
        >
          <LogOut class="h-3.5 w-3.5" />
          <span>Đăng xuất</span>
        </button>
      </div>
    </aside>

    <!-- Main Content Area -->
    <div class="flex-1 flex flex-col min-w-0 min-h-screen">
      <!-- Top Navbar -->
      <header class="h-16 border-b border-zinc-200 bg-white px-6 flex items-center justify-between sticky top-0 z-30">
        <div class="flex items-center gap-3">
          <button
            type="button"
            class="md:hidden p-2 rounded-lg text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100"
            @click="isMobileMenuOpen = true"
          >
            <Menu class="h-5 w-5" />
          </button>

          <!-- Breadcrumbs -->
          <nav class="hidden sm:flex items-center gap-2 text-sm text-zinc-500">
            <span>C-Walli Portal</span>
            <ChevronRight class="h-3.5 w-3.5 text-zinc-400" />
            <span class="text-zinc-900 font-medium">Quản trị Người dùng</span>
          </nav>
        </div>
      </header>

      <!-- Page Content -->
      <main class="flex-1 p-6 max-w-7xl w-full mx-auto space-y-6">
        <router-view />
      </main>
    </div>
  </div>
</template>
