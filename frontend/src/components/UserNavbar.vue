<script setup lang="ts">
import { inject, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const updateNavbar = inject<() => Promise<void>>('updateNavbar')
const router = useRouter()
const isAdmin = ref(false)

onMounted(async () => {
    try {
        const response = await fetch('/api/me')

        if (!response.ok) return

        const user = await response.json()
        isAdmin.value = user.is_admin === true
    } catch {
        isAdmin.value = false
    }
})

async function logout() {
    try {
        const response = await fetch('/api/logout', {
            method: 'POST'
        })

        if (response.ok) {
            await updateNavbar?.()
            await router.push('/')
        }
    } catch {
        console.error('Erreur de déconnexion')
    }
}
</script>

<template>
    <nav class="flex items-center justify-between bg-gray-900 px-6 py-4">
        <RouterLink to="/" class="text-2xl font-bold text-white">
            JobBoard
        </RouterLink>

        <div class="flex items-center gap-4">
            <RouterLink
                :to="isAdmin ? '/admin' : '/profil'"
                :aria-label="isAdmin ? 'Administration' : 'Mon profil'"
                class="text-white hover:text-indigo-400"
            >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="28"
                    height="28"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                >
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21a8 8 0 0 1 16 0" />
                </svg>
            </RouterLink>

            <button
                type="button"
                @click="logout"
                class="cursor-pointer rounded bg-indigo-600 px-4 py-2 text-white hover:bg-indigo-700"
            >
                Déconnexion
            </button>
        </div>
    </nav>
</template>