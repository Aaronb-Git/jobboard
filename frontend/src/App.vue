
<script setup lang="ts">
import { ref, onMounted, provide } from 'vue'
import Navbar from './components/Navbar.vue'
import UserNavbar from './components/UserNavbar.vue'

const isConnected = ref(false)
const isLoading = ref(true)

async function updateNavbar() {
    try {
        const response = await fetch('/api/me')
        isConnected.value = response.ok
    } catch {
        isConnected.value = false
    } finally {
        isLoading.value = false
    }
}

provide('updateNavbar', updateNavbar)

onMounted(() => {
    updateNavbar()
})
</script>

<template>
    <template v-if="!isLoading">
        <UserNavbar v-if="isConnected" />
        <Navbar v-else />
    </template>

    <RouterView />
</template>
