<script setup lang="ts">
import { ref, inject } from 'vue'
import { useRouter } from 'vue-router'

const email = ref('')
const password = ref('')
const message = ref('')
const router = useRouter()

const updateNavbar = inject<() => Promise<void>>('updateNavbar')

async function login() {
    const user = {
        email: email.value,
        password: password.value
    }

    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            headers: {
                'content-type': 'application/json'
            },
            body: JSON.stringify(user)
        })

        const data = await response.json()

        if (!response.ok) {
            message.value = data.message
        } else {
            message.value = 'Connexion réussie'

            await updateNavbar?.()

            const meResponse = await fetch('/api/me')

            if (!meResponse.ok) {
                message.value = 'Impossible de récupérer votre profil'
                return
            }

            const currentUser = await meResponse.json()

            if (currentUser.is_admin === true) {
                await router.push('/admin')
            } else {
                await router.push('/')
            }
        }
    } catch (error) {
        message.value = 'Erreur lors de la connexion'
        console.error(error)
    }
}
</script>



<template>
    <main class="min-h-screen flex items-center justify-center bg-blue-300">
        <form @submit.prevent="login" class="p-8 rounded-xl shadow-lg max-w-full">
            <h1 class="text-2xl font-bold text-center mb-6">Connexion</h1>
            <div class="flex justify-center gap-15 mb-4">
                <input v-model="email" type="email" placeholder="Adresse e-mail" required class="p-3 shadow-lg rounded-lg mb-4 bg-blue-200">
                <input v-model="password" type="password" placeholder="Mot de passe" required class="p-3 shadow-lg rounded-lg mb-4 bg-blue-200">
            </div>
            <button type="submit" class="w-full bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300 cursor-pointer">
            Se connecter
            </button>
            <p class="text-center mt-4">
                {{ message }}
            </p>
        </form>
    </main>
</template>
