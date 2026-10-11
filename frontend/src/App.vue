<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import Navbar from './components/Navbar.vue'
import UserNavbar from './components/UserNavbar.vue'

const isConnected = ref(false)

function updateNavbar() {
    isConnected.value = localStorage.getItem('isConnected') === 'true'
}

onMounted(() => {
    updateNavbar()
    window.addEventListener('storage', updateNavbar)
    window.addEventListener('focus', updateNavbar)
})

onUnmounted(() => {
    window.removeEventListener('storage', updateNavbar)
    window.removeEventListener('focus', updateNavbar)
})
</script>

<template>
    <UserNavbar v-if="isConnected" />
    <Navbar v-else />

    <RouterView />
</template>