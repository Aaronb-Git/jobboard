<script setup lang="ts">
import { ref } from 'vue'
import {useRoute} from 'vue-router'

const message = ref('')
const feedback = ref('')
const route =useRoute()

async function submitApplication(){
    const appli = {
        message : message.value
    }
    const adId = route.params.id
    
    const response = await fetch(`/api/ads/${adId}/applications`, {
        method : 'POST',
        headers : {
            'Content-Type': 'application/json',
        },
        body : JSON.stringify(appli)
    })
    const data = await response.json()

    feedback.value = data.message;
}
</script>
<template>
    <main class = "min-h-screen flex items-center justify-center bg-green-300 p-6">
        <form @submit.prevent="submitApplication" class = "p-8 rounded-xl shadow-lg w-full max-w-2xl">
            <h1 class = "text-2xl font-bold text-center mb-6">Postule pour l'annonce</h1>
            <label for = "application-message" class="block mb-2 font-medium">Votre message</label>
            <textarea v-model="message" id ="application-message" rows = "6" placeholder = "SHOW US WHAT YOU GOT !!!" class="w-full p-3 shadow-lg rounded-lg mb-4 bg-blue-200 resize-y"></textarea>
            <button type="submit" class="w-full bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors duration-300 cursor-pointer">
            Envoyer ma candidature
            </button>
             <p v-if = "feedback" class = "text-center mt-4">{{ feedback }}</p>
        </form>
    </main>
    </template>