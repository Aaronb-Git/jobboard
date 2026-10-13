
<script setup lang="ts">
import { ref, onMounted } from 'vue'

const user = {
    id: 0,
    firstname: '',
    lastname: '',
    email: '',
    address: '',
    phone: ''
}

const firstname = ref('')
const lastname = ref('')
const email = ref('')
const address = ref('')
const phone = ref('')
const password = ref('')
const confirmPassword = ref('')
const message = ref('')
const isLoading = ref(true)
const isSaving = ref(false)

async function loadProfile() {
    isLoading.value = true

    try {
        const response = await fetch('/api/me', {
            credentials: 'include'
        })

        if (!response.ok) {
            message.value = 'Impossible de récupérer le profil'
            return
        }

        const data = await response.json()

        user.id = data.id
        user.firstname = data.firstname
        user.lastname = data.name
        user.email = data.email
        user.address = data.address ?? ''
        user.phone = data.phone ?? ''

        firstname.value = user.firstname
        lastname.value = user.lastname
        email.value = user.email
        address.value = user.address
        phone.value = user.phone

        message.value = ''
    } catch {
        message.value = 'Erreur de connexion au serveur'
    } finally {
        isLoading.value = false
    }
}

onMounted(loadProfile)

async function saveProfile() {
    if (isSaving.value) {
        return
    }

    if (user.id === 0) {
        message.value = 'Profil non chargé'
        return
    }

    if (password.value !== confirmPassword.value) {
        message.value = 'Les mots de passe ne correspondent pas'
        return
    }

    if (password.value !== '' && password.value.trim() === '') {
        message.value = 'Le mot de passe ne peut pas contenir uniquement des espaces'
        return
    }

    isSaving.value = true
    message.value = ''
    let profileSaved = false

    try {
        const response = await fetch(`/api/users/${user.id}`, {
            method: 'PUT',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: lastname.value,
                firstname: firstname.value,
                email: email.value,
                address: address.value,
                phone: phone.value
            })
        })

        if (!response.ok) {
            message.value = 'Impossible de modifier le profil'
            return
        }

        profileSaved = true

        user.firstname = firstname.value
        user.lastname = lastname.value
        user.email = email.value
        user.address = address.value
        user.phone = phone.value

        if (password.value !== '') {
            const passwordResponse = await fetch(`/api/users/${user.id}/password`, {
                method: 'PUT',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    newPassword: password.value
                })
            })

            if (!passwordResponse.ok) {
                message.value = 'Profil modifié, mais impossible de modifier le mot de passe'
                return
            }

            password.value = ''
            confirmPassword.value = ''
        }

        message.value = 'Modifications enregistrées avec succès !'
    } catch {
        message.value = profileSaved
            ? 'Profil modifié, mais erreur de connexion lors du changement de mot de passe'
            : 'Erreur de connexion au serveur'
    } finally {
        isSaving.value = false
    }
}
</script>

<template>
    <main class="min-h-screen flex items-center justify-center bg-pink-300 p-6">

        <form
            @submit.prevent="saveProfile"
            class="p-8 rounded-xl shadow-lg w-full max-w-2xl"
        >

            <h1 class="text-2xl font-bold text-center mb-6">
                Mon profil
            </h1>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
                <input
                    v-model="firstname"
                    type="text"
                    placeholder="Prénom"
                    autocomplete="given-name"
                    required
                    :disabled="isLoading || isSaving"
                    class="p-3 shadow-lg rounded-lg bg-pink-200 w-full"
                >

                <input
                    v-model="lastname"
                    type="text"
                    placeholder="Nom"
                    autocomplete="family-name"
                    required
                    :disabled="isLoading || isSaving"
                    class="p-3 shadow-lg rounded-lg bg-pink-200 w-full"
                >
            </div>

            <div class="mb-4">
                <input
                    v-model="email"
                    type="email"
                    placeholder="Adresse e-mail"
                    autocomplete="email"
                    required
                    :disabled="isLoading || isSaving"
                    class="p-3 shadow-lg rounded-lg bg-pink-200 w-full"
                >
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-4">
                <input
                    v-model="address"
                    type="text"
                    placeholder="Adresse (facultatif)"
                    autocomplete="street-address"
                    :disabled="isLoading || isSaving"
                    class="p-3 shadow-lg rounded-lg bg-pink-200 w-full"
                >

                <input
                    v-model="phone"
                    type="tel"
                    placeholder="Téléphone (facultatif)"
                    autocomplete="tel"
                    :disabled="isLoading || isSaving"
                    class="p-3 shadow-lg rounded-lg bg-pink-200 w-full"
                >
            </div>

            <h2 class="text-xl font-bold text-center my-6">
                Modifier mon mot de passe
            </h2>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
                <input
                    v-model="password"
                    type="password"
                    placeholder="Nouveau mot de passe"
                    autocomplete="new-password"
                    :disabled="isLoading || isSaving"
                    class="p-3 shadow-lg rounded-lg bg-pink-200 w-full"
                >

                <input
                    v-model="confirmPassword"
                    type="password"
                    placeholder="Confirmer le mot de passe"
                    autocomplete="new-password"
                    :disabled="isLoading || isSaving"
                    class="p-3 shadow-lg rounded-lg bg-pink-200 w-full"
                >
            </div>

            <button
                type="submit"
                :disabled="isLoading || isSaving || user.id === 0"
                class="w-full bg-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-pink-700 transition-colors duration-300 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {{ isSaving ? 'Enregistrement...' : 'Enregistrer les modifications' }}
            </button>

            <p
                v-if="message"
                role="status"
                aria-live="polite"
                class="text-center mt-4"
            >
                {{ message }}
            </p>

        </form>

    </main>
</template>
