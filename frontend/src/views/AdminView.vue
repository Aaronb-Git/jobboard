<script setup lang="ts">
import {ref} from 'vue'

const activeTab = ref('users')
</script>
<template>
    <main class = "p-6">
    <h1>Administration</h1>
    <div>
        <button @click="activeTab = 'users'"> Utilisateurs</button>
        <button @click="activeTab = 'companies'">Entreprises</button>
        <button @click="activeTab = 'ads'">Annonces</button>
        <button @click="activeTab = 'applications'">Candidatures</button>
        <section v-if="activeTab ==='users'">
            <h2>Utilisateurs</h2>
        </section>
        <section v-else-if="activeTab === 'companies'">
            <h2>Entreprises</h2>
        </section>
        <section v-else-if="activeTab === 'ads'">
            <h2> Annonces</h2>
        </section>
        <section v-else-if="activeTab === 'applications'">
            <h2>Candidatures</h2>
        </section>
    </div>
    </main>
</template>