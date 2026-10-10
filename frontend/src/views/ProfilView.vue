
<script setup lang="ts">
import { ref } from 'vue'

const user = {
    firstname: 'Jean',
    lastname: 'Dupont',
    email: 'jean.dupont@gmail.com',
    address: '',
    phone: ''
}

const firstname = ref(user.firstname)
const lastname = ref(user.lastname)
const email = ref(user.email)
const address = ref(user.address)
const phone = ref(user.phone)
const password = ref('')
const confirmPassword = ref('')
const message = ref('')

function saveProfile() {
    if (password.value !== confirmPassword.value) {
        message.value = 'Les mots de passe ne correspondent pas'
        return
    }

    user.firstname = firstname.value
    user.lastname = lastname.value
    user.email = email.value
    user.address = address.value
    user.phone = phone.value

    message.value = 'Informations modifiées avec succès !'
}
</script>

<template>
    <main class="min-h-screen flex items-center justify-center bg-pink-300 p-6">

        <form @submit.prevent="saveProfile" class="p-8 rounded-xl shadow-lg w-full max-w-2xl">

            <h1 class="text-2xl font-bold text-center mb-6">
                Mon profil
            </h1>

            <div class="grid grid-cols-2 gap-6 mb-4">
                <input v-model="firstname" type="text" placeholder="Prénom" required
                    class="p-3 shadow-lg rounded-lg bg-pink-200 w-full">

                <input v-model="lastname" type="text" placeholder="Nom" required
                    class="p-3 shadow-lg rounded-lg bg-pink-200 w-full">
            </div>

            <div class="mb-4">
                <input v-model="email" type="email" placeholder="Adresse e-mail" required
                    class="p-3 shadow-lg rounded-lg bg-pink-200 w-full">
            </div>

            <div class="grid grid-cols-2 gap-6 mb-4">
                <input v-model="address" type="text" placeholder="Adresse (facultatif)"
                    class="p-3 shadow-lg rounded-lg bg-pink-200 w-full">

                <input v-model="phone" type="tel" placeholder="Téléphone (facultatif)"
                    class="p-3 shadow-lg rounded-lg bg-pink-200 w-full">
            </div>

            <h2 class="text-xl font-bold text-center my-6">
                Modifier mon mot de passe
            </h2>

            <div class="grid grid-cols-2 gap-6 mb-6">
                <input v-model="password" type="password" placeholder="Nouveau mot de passe"
                    class="p-3 shadow-lg rounded-lg bg-pink-200 w-full">

                <input v-model="confirmPassword" type="password" placeholder="Confirmer le mot de passe"
                    class="p-3 shadow-lg rounded-lg bg-pink-200 w-full">
            </div>

            <button type="submit"
                class="w-full bg-pink-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-pink-700 transition-colors duration-300 cursor-pointer">
                Enregistrer les modifications
            </button>

            <p class="text-center mt-4">
                {{ message }}
            </p>

        </form>

    </main>
</template>
