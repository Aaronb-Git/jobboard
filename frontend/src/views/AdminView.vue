<script setup lang="ts">
import {onMounted, ref} from 'vue'

const activeTab = ref('users')
const feedback = ref('')

interface AdminUser  {
    id: number,
    name: string,
    firstname: string,
    email: string,
    phone: string | null,
    address: string | null,
    is_admin: number
}
const editingUser = ref<AdminUser | null>(null)
const users = ref<AdminUser[]>([])

function startEditUser(user: AdminUser){
    editingUser.value = {...user}
}

async function loadUsers() {
   const response = await fetch('/api/users')

   if(!response.ok){
    return 
   }else{
    users.value = await response.json()
   }  
}
onMounted(loadUsers);

async function deleteUser(id :number){
    const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE',
    })
    const data = await response.json();
    feedback.value = data.message
    if(response.ok){
        await loadUsers();
    }
}
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
            <table>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Nom</th>
                        <th>Prénom</th>
                        <th>Email</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for = "user in users" :key="user.id">
                        <td>{{user.id}}</td>
                        <td>{{user.name}}</td>
                        <td>{{user.firstname}}</td>
                        <td>{{user.email}}</td>
                        <td>
                            <button @click = "startEditUser(user)">Modifier</button>
                            <button @click = "deleteUser(user.id)">Supprimer</button>
                        </td>
                    </tr>
                    <p v-if = "feedback != ''">{{ feedback}}</p>
                </tbody>
            </table>
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