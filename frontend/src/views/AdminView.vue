<script setup lang="ts">
import {onMounted, ref} from 'vue'

const activeTab = ref('users')
const feedback = ref('')
const isAdmin = ref(false)
const checkingAccess = ref(true)

onMounted(async () => {
    try {
        const response = await fetch('/api/me')

        if (response.ok) {
            const user = await response.json()
            isAdmin.value = user.is_admin === true
        }

        if (isAdmin.value) {
            await Promise.all([
                loadUsers(),
                loadCompanies(),
                loadAds(),
                loadApplis()
            ])
        }
    } finally {
        checkingAccess.value = false
    }
})
///////////////////////////////////////////////////////users/////////////////////////////////////////////////////////////////////
const editingUser = ref<AdminUser | null>(null)
const users = ref<AdminUser[]>([])
const showCreatedUser = ref(false)
const newUser = ref({
    name : '',
    firstname : '',
    email : '',
    password : ''
})

interface AdminUser  {
    id: number,
    name: string,
    firstname: string,
    email: string,
    phone: string | null,
    address: string | null,
    is_admin: number
}

function startEditUser(user: AdminUser){
    editingUser.value = {...user}
}

async function createUser(){
    const response = await fetch(`/api/users`,{
        method : 'POST',
        headers: {
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify(newUser.value)
    })
    const data = await response.json()
    feedback.value = data.message
    if(response.ok) {
        await loadUsers()
            showCreatedUser.value = false
    }
}

async function saveUser(){
    if(editingUser.value === null){
        return
    }
    const response = await fetch(`/api/users/${editingUser.value.id}`,{
        method: 'PUT',
        headers: {
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify(editingUser.value)
    })
    const data = await response.json()
    feedback.value = data.message
    if(response.ok){
        await loadUsers()
        editingUser.value = null
    }
}

async function loadUsers() {
   const response = await fetch('/api/users')
   if(!response.ok){
        return 
   }else{
        users.value = await response.json()
   }  
}

async function deleteUser(id :number){
    const response = await fetch(`/api/users/${id}`, {
        method: 'DELETE'
    })
    const data = await response.json();
    feedback.value = data.message
    if(response.ok){
        await loadUsers();
    }
}
/////////////////////////////////////////////////////companies///////////////////////////////////////////////////////////////////
const editingCompany = ref<AdminCompany | null>(null)
const companies = ref<AdminCompany[]>([])
const showCreatedCompany = ref(false)
const newCompany = ref({
    name : '',
    company_description: ''
})

interface AdminCompany {
    id: number,
    name: string,
    company_description: string | null
}

function startEditingCompany(company: AdminCompany){
    editingCompany.value = {...company}
}

async function createCompany(){
    const response = await fetch(`/api/companies`,{
        method : 'POST',
        headers: {
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify(newCompany.value)
    })
    const data = await response.json()
    feedback.value = data.message
    if(response.ok){
        await loadCompanies()
        showCreatedCompany.value = false
    }
}

async function saveCompany(){
    if(editingCompany.value === null){
        return
    }
    const response = await fetch(`/api/companies/${editingCompany.value.id}`,{
        method: 'PUT',
        headers: {
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify(editingCompany.value)
    })
    const data = await response.json()
    feedback.value = data.message
    if(response.ok){
        await loadCompanies()
        editingCompany.value = null
    }
}

async function loadCompanies(){
    const response = await fetch(`/api/companies`)
    if(!response.ok){
        return
    }else{
        companies.value = await response.json()
    }
}

async function deleteCompany(id : number){
    const response = await fetch(`/api/companies/${id}`,{
        method: 'DELETE'
    })
    const data = await response.json();
    feedback.value = data.message
    if(response.ok){
        await loadCompanies();
    }
}
///////////////////////////////////////////////////////ads///////////////////////////////////////////////////////////////////////
const editingAd = ref<AdminAd | null>(null)
const ads = ref<AdminAd[]>([])
const showCreatedAd = ref(false)
const newAd= ref({
    title : '',
    company_id: 0,
    one_sentence_description: '',
    full_description: '',
    wages: '',
    place: '',
    working_time:'',
    advantages:'',
    diploma_needed:''
})

interface AdminAd {
    id: number
    title: string
    company_id:number
    name_company: string
    one_sentence_description: string | null
    full_description: string | null
    wages: string | null
    place: string | null
    working_time: string | null
    advantages: string | null
    diploma_needed: string | null
}

function startEditingAd(ad: AdminAd){
    editingAd.value = {...ad}
}

async function createAd(){
    const response = await fetch(`/api/ads`,{
        method : 'POST',
        headers:{
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify(newAd.value)
    })
    const data = await response.json()
    feedback.value = data.message
    if(response.ok){
        await loadAds()
        showCreatedAd.value = false
    }
}

async function saveAd(){
    if(editingAd.value === null){
        return
    }
    const response = await fetch(`/api/ads/${editingAd.value.id}`, {
        method: 'PUT',
        headers  :{
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify(editingAd.value)
    })
    const data = await response.json()
    feedback.value = data.message
    if(response.ok){
        await loadAds()
        editingAd.value = null
    }
}

async function loadAds(){
    const response = await fetch(`/api/ads`)
    if(!response.ok){
        return
    }else{
        ads.value = await response.json()
    }
}

async function deleteAd(id: number){
    const response = await fetch(`/api/ads/${id}`,{
        method : 'DELETE'
    })
    const data = await response.json();
    feedback.value = data.message
    if(response.ok){
        await loadAds()
    }
}
//////////////////////////////////////////////////////////Candidatures///////////////////////////////////////////////////////////
const editingAppli = ref<AdminAppli | null> (null)
const applis = ref<AdminAppli[]>([])
const showCreatedAppli = ref(false)
const newAppli = ref({
    ad_id: 0,
    message : ''
})

interface AdminAppli {
    id: number
    ad_id: number
    user_id: number
    message: string | null
    applied_at: string | null
    name: string
    firstname: string
    title: string
}

function startEditingAppli(appli: AdminAppli){
    editingAppli.value = {...appli}
}

async function createAppli(){
    const response = await fetch(`/api/applications`,{
        method : 'POST',
        headers:{
            'Content-Type' : 'application/json'
        },
        body : JSON.stringify(newAppli.value)
    })
    const data = await response.json()
    feedback.value = data.message
    if(response.ok){
        await loadApplis()
        showCreatedAppli.value = false
    }
}

async function saveAppli(){
    if(editingAppli.value === null){
        return
    }
    const response = await fetch(`/api/applications/${editingAppli.value.id}`, {
        method: 'PUT',
        headers  :{
            'Content-Type' : 'application/json'
        },
        body: JSON.stringify(editingAppli.value)
    })
    const data = await response.json()
    feedback.value = data.message
    if(response.ok){
        await loadApplis()
        editingAppli.value = null
    }
}

async function loadApplis(){
    const response = await fetch(`/api/applications`)
    if(!response.ok){
        return
    }else{
        applis.value = await response.json()
    }
}

async function deleteAppli(id: number){
    const response = await fetch(`/api/applications/${id}`,{
        method : 'DELETE'
    })
    const data = await response.json();
    feedback.value = data.message
    if(response.ok){
        await loadApplis()
    }
}
</script>
<template>
<p v-if="checkingAccess" class="p-6">Chargement…</p>

<main
    v-else-if="!isAdmin"
    class="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-white text-gray-900"
>
    <div class="p-6 text-center">
        <h1 class="text-6xl font-bold">404</h1>
        <p class="mt-4 text-xl">Not Found</p>
    </div>
</main>
<main v-else class="min-h-screen bg-blue-300 p-4 sm:p-8">
    <h1 class="mb-8 text-center text-3xl font-bold">Administration</h1>
    <div class="mx-auto max-w-screen-2xl">
        <button type="button" class="mr-2 mb-3 rounded-xl px-5 py-3 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800" :class="activeTab === 'users' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-100 text-blue-900 hover:bg-blue-200'" :aria-pressed="activeTab === 'users'" @click="activeTab = 'users'"> Utilisateurs</button>
        <button type="button" class="mr-2 mb-3 rounded-xl px-5 py-3 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800" :class="activeTab === 'companies' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-100 text-blue-900 hover:bg-blue-200'" :aria-pressed="activeTab === 'companies'" @click="activeTab = 'companies'">Entreprises</button>
        <button type="button" class="mr-2 mb-3 rounded-xl px-5 py-3 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800" :class="activeTab === 'ads' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-100 text-blue-900 hover:bg-blue-200'" :aria-pressed="activeTab === 'ads'" @click="activeTab = 'ads'">Annonces</button>
        <button type="button" class="mr-2 mb-3 rounded-xl px-5 py-3 font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800" :class="activeTab === 'applications' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-100 text-blue-900 hover:bg-blue-200'" :aria-pressed="activeTab === 'applications'" @click="activeTab = 'applications'">Candidatures</button>
        <section class="mt-4 rounded-2xl bg-blue-50 p-4 shadow-lg sm:p-8" v-if="activeTab ==='users'">
            <h2 class="mb-5 text-2xl font-bold text-gray-900">Utilisateurs</h2>
            <button class="cursor-pointer rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800" type="button" @click = "showCreatedUser = true"> Ajouter un Utilisateur</button>
<form class="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-blue-200 bg-white p-4 shadow-md sm:grid-cols-2 sm:p-6" v-if="showCreatedUser" @submit.prevent="createUser">
                            <h3 class="text-xl font-bold text-gray-900 sm:col-span-2">Nouvel Utilisateur</h3>
                        <input class="w-full min-w-0 rounded-lg border border-blue-200 bg-blue-100 p-3 text-slate-900 placeholder:text-slate-600 focus:outline-2 focus:outline-offset-2 focus:outline-blue-700" type="text" v-model="newUser.name" placeholder="Nom" aria-label="Nom">
                        <input class="w-full min-w-0 rounded-lg border border-blue-200 bg-blue-100 p-3 text-slate-900 placeholder:text-slate-600 focus:outline-2 focus:outline-offset-2 focus:outline-blue-700" type="text" v-model="newUser.firstname" placeholder="Prénom" aria-label="Prénom">
                        <input class="w-full min-w-0 rounded-lg border border-blue-200 bg-blue-100 p-3 text-slate-900 placeholder:text-slate-600 focus:outline-2 focus:outline-offset-2 focus:outline-blue-700" type="email" v-model="newUser.email" placeholder="Adresse e-mail" aria-label="Adresse e-mail">
                        <input class="w-full min-w-0 rounded-lg border border-blue-200 bg-blue-100 p-3 text-slate-900 placeholder:text-slate-600 focus:outline-2 focus:outline-offset-2 focus:outline-blue-700" type="password" v-model="newUser.password" placeholder="Mot de passe" aria-label="Mot de passe">
                        <button class="cursor-pointer rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800" type = "submit">Créer</button>

                        </form>

            <div class="my-5 w-full overflow-x-auto rounded-xl border border-blue-200 bg-white"><table class="w-full border-collapse text-left text-sm">
                <thead>
                    <tr>
                        <th class="whitespace-nowrap bg-blue-100 p-4 font-semibold text-blue-900">ID</th>
                        <th class="whitespace-nowrap bg-blue-100 p-4 font-semibold text-blue-900">Nom</th>
                        <th class="whitespace-nowrap bg-blue-100 p-4 font-semibold text-blue-900">Prénom</th>
                        <th class="whitespace-nowrap bg-blue-100 p-4 font-semibold text-blue-900">Email</th>
                        <th class="whitespace-nowrap bg-blue-100 p-4 font-semibold text-blue-900">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="user in users" :key="user.id">
<tr class="even:bg-slate-50 hover:bg-blue-50">
                        <td class="min-w-24 max-w-xs border-t border-blue-100 p-4 align-top wrap-anywhere">{{user.id}}</td>
                        <td class="min-w-24 max-w-xs border-t border-blue-100 p-4 align-top wrap-anywhere">{{user.name}}</td>
                        <td class="min-w-24 max-w-xs border-t border-blue-100 p-4 align-top wrap-anywhere">{{user.firstname}}</td>
                        <td class="min-w-24 max-w-xs border-t border-blue-100 p-4 align-top wrap-anywhere">{{user.email}}</td>
                        <td class="min-w-24 max-w-xs border-t border-blue-100 p-4 align-top wrap-anywhere">
                            <button class="cursor-pointer rounded-lg bg-blue-100 px-4 py-2 font-semibold text-blue-800 transition-colors hover:bg-blue-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700" @click = "startEditUser(user)">Modifier</button>
                            <button class="ml-2 cursor-pointer rounded-lg bg-red-100 px-4 py-2 font-semibold text-red-800 transition-colors hover:bg-red-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700" @click = "deleteUser(user.id)">Supprimer</button>
                        </td>
                    </tr>
<tr v-if="editingUser && editingUser.id === user.id">
<td colspan="5" class="border-t border-blue-200 bg-blue-50 p-4">
<form class="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-blue-200 bg-white p-4 shadow-md sm:grid-cols-2 sm:p-6" v-if="editingUser" @submit.prevent="saveUser">
                        <input class="w-full min-w-0 rounded-lg border border-blue-200 bg-blue-100 p-3 text-slate-900 placeholder:text-slate-600 focus:outline-2 focus:outline-offset-2 focus:outline-blue-700" type="text" v-model="editingUser.name" placeholder="Nom" aria-label="Nom">
                        <input class="w-full min-w-0 rounded-lg border border-blue-200 bg-blue-100 p-3 text-slate-900 placeholder:text-slate-600 focus:outline-2 focus:outline-offset-2 focus:outline-blue-700" type="text" v-model="editingUser.firstname" placeholder="Prénom" aria-label="Prénom">
                        <input class="w-full min-w-0 rounded-lg border border-blue-200 bg-blue-100 p-3 text-slate-900 placeholder:text-slate-600 focus:outline-2 focus:outline-offset-2 focus:outline-blue-700" type="email" v-model="editingUser.email" placeholder="Adresse e-mail" aria-label="Adresse e-mail">
                        <button class="cursor-pointer rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800" type = "submit">Enregistrer</button>
                        <button class="cursor-pointer rounded-lg bg-slate-200 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700" type="button" @click="editingUser = null">Annuler</button>
                    </form>
</td>
</tr>
</template>
                </tbody>
            </table></div>
              
                
                    <p role="status" class="mt-5 rounded-lg bg-blue-100 p-4 text-center text-blue-900" v-if="feedback">{{ feedback }}</p>
        </section>
        <section class="mt-4 rounded-2xl bg-blue-50 p-4 shadow-lg sm:p-8" v-else-if="activeTab === 'companies'">
            <h2 class="mb-5 text-2xl font-bold text-gray-900">Entreprises</h2>
              <button class="cursor-pointer rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800" type="button" @click = "showCreatedCompany = true"> Ajouter une Entreprise</button>
<form class="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-blue-200 bg-white p-4 shadow-md sm:grid-cols-2 sm:p-6" v-if="showCreatedCompany" @submit.prevent="createCompany">
                            <h3 class="text-xl font-bold text-gray-900 sm:col-span-2">Nouvelle entreprise</h3>
                        <input class="w-full min-w-0 rounded-lg border border-blue-200 bg-blue-100 p-3 text-slate-900 placeholder:text-slate-600 focus:outline-2 focus:outline-offset-2 focus:outline-blue-700" type="text" v-model="newCompany.name" placeholder="Nom" aria-label="Nom">
                        <input class="w-full min-w-0 rounded-lg border border-blue-200 bg-blue-100 p-3 text-slate-900 placeholder:text-slate-600 focus:outline-2 focus:outline-offset-2 focus:outline-blue-700" type="text" v-model="newCompany.company_description" placeholder="Description entreprise" aria-label="Description entreprise">
                        <button class="cursor-pointer rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800" type = "submit">Créer</button>

                        </form>

            <div class="my-5 w-full overflow-x-auto rounded-xl border border-blue-200 bg-white"><table class="w-full border-collapse text-left text-sm">
                <thead>
                    <tr>
                        <th class="whitespace-nowrap bg-blue-100 p-4 font-semibold text-blue-900">ID</th>
                        <th class="whitespace-nowrap bg-blue-100 p-4 font-semibold text-blue-900">Entreprise</th>
                        <th class="whitespace-nowrap bg-blue-100 p-4 font-semibold text-blue-900">Description</th>
                        <th class="whitespace-nowrap bg-blue-100 p-4 font-semibold text-blue-900">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="company in companies" :key="company.id">
<tr class="even:bg-slate-50 hover:bg-blue-50">
                        <td class="min-w-24 max-w-xs border-t border-blue-100 p-4 align-top wrap-anywhere">{{company.id}}</td>
                        <td class="min-w-24 max-w-xs border-t border-blue-100 p-4 align-top wrap-anywhere">{{company.name}}</td>
                        <td class="min-w-24 max-w-xs border-t border-blue-100 p-4 align-top wrap-anywhere">{{company.company_description}}</td>
                        <td class="min-w-24 max-w-xs border-t border-blue-100 p-4 align-top wrap-anywhere">
                            <button class="cursor-pointer rounded-lg bg-blue-100 px-4 py-2 font-semibold text-blue-800 transition-colors hover:bg-blue-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700" @click = "startEditingCompany(company)">Modifier</button>
                            <button class="ml-2 cursor-pointer rounded-lg bg-red-100 px-4 py-2 font-semibold text-red-800 transition-colors hover:bg-red-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700" @click = "deleteCompany(company.id)">Supprimer</button>
                        </td>
                    </tr>
<tr v-if="editingCompany && editingCompany.id === company.id">
<td colspan="4" class="border-t border-blue-200 bg-blue-50 p-4">
<form class="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-blue-200 bg-white p-4 shadow-md sm:grid-cols-2 sm:p-6" v-if="editingCompany" @submit.prevent="saveCompany">
                        <input class="w-full min-w-0 rounded-lg border border-blue-200 bg-blue-100 p-3 text-slate-900 placeholder:text-slate-600 focus:outline-2 focus:outline-offset-2 focus:outline-blue-700" type="text" v-model="editingCompany.name" placeholder="Nom" aria-label="Nom">
                        <input class="w-full min-w-0 rounded-lg border border-blue-200 bg-blue-100 p-3 text-slate-900 placeholder:text-slate-600 focus:outline-2 focus:outline-offset-2 focus:outline-blue-700" type="text" v-model="editingCompany.company_description" placeholder="Description entreprise" aria-label="Description entreprise">
                        <button class="cursor-pointer rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800" type = "submit">Enregistrer</button>
                        <button class="cursor-pointer rounded-lg bg-slate-200 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700" type="button" @click="editingCompany = null">Annuler</button>
                    </form>
</td>
</tr>
</template>
                </tbody>
            </table></div>
              
                
                    <p role="status" class="mt-5 rounded-lg bg-blue-100 p-4 text-center text-blue-900" v-if="feedback">{{ feedback }}</p>
        </section>
        <section class="mt-4 rounded-2xl bg-blue-50 p-4 shadow-lg sm:p-8" v-else-if="activeTab === 'ads'">
            <h2 class="mb-5 text-2xl font-bold text-gray-900"> Annonces</h2>
            <button class="cursor-pointer rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800" type="button" @click = "showCreatedAd = true"> Ajouter une Annonce</button>
<form class="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-blue-200 bg-white p-4 shadow-md sm:grid-cols-2 sm:p-6" v-if="showCreatedAd" @submit.prevent="createAd">
                            <h3 class="text-xl font-bold text-gray-900 sm:col-span-2">Nouvelle Annonce</h3>
                        <input class="w-full min-w-0 rounded-lg border border-blue-200 bg-blue-100 p-3 text-slate-900 placeholder:text-slate-600 focus:outline-2 focus:outline-offset-2 focus:outline-blue-700" type="text" v-model="newAd.title" placeholder="Titre annonce" aria-label="Titre annonce">
                        <select class="w-full min-w-0 rounded-lg border border-blue-200 bg-blue-100 p-3 text-slate-900 focus:outline-2 focus:outline-offset-2 focus:outline-blue-700" v-model.number="newAd.company_id">
                            <option disabled :value="0">Choisir une entreprise</option>
                            <option
                                v-for="company in companies"
                                :key="company.id"
                                :value="company.id"
                            >
                                {{ company.name }}
                            </option>
                        </select>
                        <input class="w-full min-w-0 rounded-lg border border-blue-200 bg-blue-100 p-3 text-slate-900 placeholder:text-slate-600 focus:outline-2 focus:outline-offset-2 focus:outline-blue-700" type="text" v-model="newAd.one_sentence_description" placeholder="Phrase accroche" aria-label="Phrase accroche">
                        <input class="w-full min-w-0 rounded-lg border border-blue-200 bg-blue-100 p-3 text-slate-900 placeholder:text-slate-600 focus:outline-2 focus:outline-offset-2 focus:outline-blue-700" type="text" v-model="newAd.full_description" placeholder="Description complète" aria-label="Description complète">
                        <input class="w-full min-w-0 rounded-lg border border-blue-200 bg-blue-100 p-3 text-slate-900 placeholder:text-slate-600 focus:outline-2 focus:outline-offset-2 focus:outline-blue-700" type="text" v-model="newAd.wages" placeholder="Salaire" aria-label="Salaire">
                        <input class="w-full min-w-0 rounded-lg border border-blue-200 bg-blue-100 p-3 text-slate-900 placeholder:text-slate-600 focus:outline-2 focus:outline-offset-2 focus:outline-blue-700" type="text" v-model="newAd.place" placeholder="Lieu de travail" aria-label="Lieu de travail">
                        <input class="w-full min-w-0 rounded-lg border border-blue-200 bg-blue-100 p-3 text-slate-900 placeholder:text-slate-600 focus:outline-2 focus:outline-offset-2 focus:outline-blue-700" type="text" v-model="newAd.working_time" placeholder="Temps de travail" aria-label="Temps de travail">
                        <input class="w-full min-w-0 rounded-lg border border-blue-200 bg-blue-100 p-3 text-slate-900 placeholder:text-slate-600 focus:outline-2 focus:outline-offset-2 focus:outline-blue-700" type="text" v-model="newAd.advantages" placeholder="Avantages" aria-label="Avantages">
                        <input class="w-full min-w-0 rounded-lg border border-blue-200 bg-blue-100 p-3 text-slate-900 placeholder:text-slate-600 focus:outline-2 focus:outline-offset-2 focus:outline-blue-700" type="text" v-model="newAd.diploma_needed" placeholder="Diplôme demandé" aria-label="Diplôme demandé">
                        <button class="cursor-pointer rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800" type = "submit">Créer</button>
                        </form>

            <div class="my-5 w-full overflow-x-auto rounded-xl border border-blue-200 bg-white"><table class="w-full border-collapse text-left text-sm">
                <thead>
                    <tr>
                        <th class="whitespace-nowrap bg-blue-100 p-4 font-semibold text-blue-900">ID</th>
                        <th class="whitespace-nowrap bg-blue-100 p-4 font-semibold text-blue-900">Titre</th>
                        <th class="whitespace-nowrap bg-blue-100 p-4 font-semibold text-blue-900">Nom de l'Entreprise</th>
                        <th class="whitespace-nowrap bg-blue-100 p-4 font-semibold text-blue-900">Phrase d'accorche</th>
                        <th class="whitespace-nowrap bg-blue-100 p-4 font-semibold text-blue-900">Description</th>
                        <th class="whitespace-nowrap bg-blue-100 p-4 font-semibold text-blue-900">Salaire</th>
                        <th class="whitespace-nowrap bg-blue-100 p-4 font-semibold text-blue-900">Lieu de travail</th>
                        <th class="whitespace-nowrap bg-blue-100 p-4 font-semibold text-blue-900">Temps de travail</th>
                        <th class="whitespace-nowrap bg-blue-100 p-4 font-semibold text-blue-900">Avantages</th>
                        <th class="whitespace-nowrap bg-blue-100 p-4 font-semibold text-blue-900">Diplôme demandé</th>
                        <th class="whitespace-nowrap bg-blue-100 p-4 font-semibold text-blue-900">Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <template v-for="ad in ads" :key="ad.id">
<tr class="even:bg-slate-50 hover:bg-blue-50">
                        <td class="min-w-24 max-w-xs border-t border-blue-100 p-4 align-top wrap-anywhere">{{ad.id}}</td>
                        <td class="min-w-24 max-w-xs border-t border-blue-100 p-4 align-top wrap-anywhere">{{ad.title}}</td>
                        <td class="min-w-24 max-w-xs border-t border-blue-100 p-4 align-top wrap-anywhere">{{ad.name_company}}</td>
                        <td class="min-w-24 max-w-xs border-t border-blue-100 p-4 align-top wrap-anywhere">{{ad.one_sentence_description}}</td>
                        <td class="min-w-24 max-w-xs border-t border-blue-100 p-4 align-top wrap-anywhere">{{ad.full_description}}</td>
                        <td class="min-w-24 max-w-xs border-t border-blue-100 p-4 align-top wrap-anywhere">{{ad.wages}}</td>
                        <td class="min-w-24 max-w-xs border-t border-blue-100 p-4 align-top wrap-anywhere">{{ad.place}}</td>
                        <td class="min-w-24 max-w-xs border-t border-blue-100 p-4 align-top wrap-anywhere">{{ad.working_time}}</td>
                        <td class="min-w-24 max-w-xs border-t border-blue-100 p-4 align-top wrap-anywhere">{{ad.advantages}}</td>
                        <td class="min-w-24 max-w-xs border-t border-blue-100 p-4 align-top wrap-anywhere">{{ad.diploma_needed}}</td>
                        <td class="min-w-24 max-w-xs border-t border-blue-100 p-4 align-top wrap-anywhere">
                            <button class="cursor-pointer rounded-lg bg-blue-100 px-4 py-2 font-semibold text-blue-800 transition-colors hover:bg-blue-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700" @click = "startEditingAd(ad)">Modifier</button>
                            <button class="ml-2 cursor-pointer rounded-lg bg-red-100 px-4 py-2 font-semibold text-red-800 transition-colors hover:bg-red-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700" @click = "deleteAd(ad.id)">Supprimer</button>
                        </td>
                    </tr>
<tr v-if="editingAd && editingAd.id === ad.id">
<td colspan="11" class="border-t border-blue-200 bg-blue-50 p-4">
<form class="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-blue-200 bg-white p-4 shadow-md sm:grid-cols-2 sm:p-6" v-if="editingAd" @submit.prevent="saveAd">
                        <input class="w-full min-w-0 rounded-lg border border-blue-200 bg-blue-100 p-3 text-slate-900 placeholder:text-slate-600 focus:outline-2 focus:outline-offset-2 focus:outline-blue-700" type="text" v-model="editingAd.title" placeholder="Titre annonce" aria-label="Titre annonce">
                         <select class="w-full min-w-0 rounded-lg border border-blue-200 bg-blue-100 p-3 text-slate-900 focus:outline-2 focus:outline-offset-2 focus:outline-blue-700" v-model.number="editingAd.company_id">
                            <option disabled :value="0">Choisir une entreprise</option>
                            <option
                                v-for="company in companies"
                                :key="company.id"
                                :value="company.id"
                            >
                                {{ company.name }}
                            </option>
                        </select>
                        <input class="w-full min-w-0 rounded-lg border border-blue-200 bg-blue-100 p-3 text-slate-900 placeholder:text-slate-600 focus:outline-2 focus:outline-offset-2 focus:outline-blue-700" type="text" v-model="editingAd.one_sentence_description" placeholder="Phrase accroche" aria-label="Phrase accroche">
                        <input class="w-full min-w-0 rounded-lg border border-blue-200 bg-blue-100 p-3 text-slate-900 placeholder:text-slate-600 focus:outline-2 focus:outline-offset-2 focus:outline-blue-700" type="text" v-model="editingAd.full_description" placeholder="Description complète" aria-label="Description complète">
                        <input class="w-full min-w-0 rounded-lg border border-blue-200 bg-blue-100 p-3 text-slate-900 placeholder:text-slate-600 focus:outline-2 focus:outline-offset-2 focus:outline-blue-700" type="text" v-model="editingAd.wages" placeholder="Salaire" aria-label="Salaire">
                        <input class="w-full min-w-0 rounded-lg border border-blue-200 bg-blue-100 p-3 text-slate-900 placeholder:text-slate-600 focus:outline-2 focus:outline-offset-2 focus:outline-blue-700" type="text" v-model="editingAd.place" placeholder="Lieu de travail" aria-label="Lieu de travail">
                        <input class="w-full min-w-0 rounded-lg border border-blue-200 bg-blue-100 p-3 text-slate-900 placeholder:text-slate-600 focus:outline-2 focus:outline-offset-2 focus:outline-blue-700" type="text" v-model="editingAd.working_time" placeholder="Temps de travail" aria-label="Temps de travail">
                        <input class="w-full min-w-0 rounded-lg border border-blue-200 bg-blue-100 p-3 text-slate-900 placeholder:text-slate-600 focus:outline-2 focus:outline-offset-2 focus:outline-blue-700" type="text" v-model="editingAd.advantages" placeholder="Avantages" aria-label="Avantages">
                        <input class="w-full min-w-0 rounded-lg border border-blue-200 bg-blue-100 p-3 text-slate-900 placeholder:text-slate-600 focus:outline-2 focus:outline-offset-2 focus:outline-blue-700" type="text" v-model="editingAd.diploma_needed" placeholder="Diplôme demandé" aria-label="Diplôme demandé">
                        <button class="cursor-pointer rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800" type = "submit">Enregistrer</button>
                        <button class="cursor-pointer rounded-lg bg-slate-200 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700" type="button" @click="editingAd = null">Annuler</button>
                    </form>
</td>
</tr>
</template>
                </tbody>
            </table></div>
              
                
                    <p role="status" class="mt-5 rounded-lg bg-blue-100 p-4 text-center text-blue-900" v-if="feedback">{{ feedback }}</p>
        </section>
      <section class="mt-4 rounded-2xl bg-blue-50 p-4 shadow-lg sm:p-8" v-else-if="activeTab === 'applications'">
    <h2 class="mb-5 text-2xl font-bold text-gray-900">Candidatures</h2>

    <button class="cursor-pointer rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800" type="button" @click="showCreatedAppli = true">
        Ajouter une candidature
    </button>
<form class="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-blue-200 bg-white p-4 shadow-md sm:grid-cols-2 sm:p-6" v-if="showCreatedAppli" @submit.prevent="createAppli">
        <h3 class="text-xl font-bold text-gray-900 sm:col-span-2">Nouvelle candidature</h3>
        <p class="text-sm text-slate-600 sm:col-span-2">La candidature sera créée pour le compte connecté.</p>

        <label class="font-semibold text-slate-800 sm:col-span-2" for="application-ad">Annonce</label>
        <select class="w-full min-w-0 rounded-lg border border-blue-200 bg-blue-100 p-3 text-slate-900 focus:outline-2 focus:outline-offset-2 focus:outline-blue-700"
            id="application-ad"
            v-model.number="newAppli.ad_id"
            required
        >
            <option disabled :value="0">Choisir une annonce</option>
            <option v-for="ad in ads" :key="ad.id" :value="ad.id">
                {{ ad.title }}
            </option>
        </select>

        <label class="font-semibold text-slate-800 sm:col-span-2" for="application-message">Message</label>
        <textarea class="w-full min-w-0 resize-y rounded-lg border border-blue-200 bg-blue-100 p-3 text-slate-900 focus:outline-2 focus:outline-offset-2 focus:outline-blue-700 sm:col-span-2"
            id="application-message"
            v-model="newAppli.message"
            rows="5"
        ></textarea>

        <button class="cursor-pointer rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800" type="submit">Créer</button>
        <button class="cursor-pointer rounded-lg bg-slate-200 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700" type="button" @click="showCreatedAppli = false">
            Annuler
        </button>
    </form>


    <div class="my-5 w-full overflow-x-auto rounded-xl border border-blue-200 bg-white"><table class="w-full border-collapse text-left text-sm">
        <thead>
            <tr>
                <th class="whitespace-nowrap bg-blue-100 p-4 font-semibold text-blue-900">ID</th>
                <th class="whitespace-nowrap bg-blue-100 p-4 font-semibold text-blue-900">Annonce</th>
                <th class="whitespace-nowrap bg-blue-100 p-4 font-semibold text-blue-900">Candidat</th>
                <th class="whitespace-nowrap bg-blue-100 p-4 font-semibold text-blue-900">Message</th>
                <th class="whitespace-nowrap bg-blue-100 p-4 font-semibold text-blue-900">Date</th>
                <th class="whitespace-nowrap bg-blue-100 p-4 font-semibold text-blue-900">Actions</th>
            </tr>
        </thead>
        <tbody>
            <template v-for="appli in applis" :key="appli.id">
<tr class="even:bg-slate-50 hover:bg-blue-50">
                <td class="min-w-24 max-w-xs border-t border-blue-100 p-4 align-top wrap-anywhere">{{ appli.id }}</td>
                <td class="min-w-24 max-w-xs border-t border-blue-100 p-4 align-top wrap-anywhere">{{ appli.title }}</td>
                <td class="min-w-24 max-w-xs border-t border-blue-100 p-4 align-top wrap-anywhere">{{ appli.firstname }} {{ appli.name }}</td>
                <td class="min-w-24 max-w-xs border-t border-blue-100 p-4 align-top wrap-anywhere">{{ appli.message }}</td>
                <td class="min-w-24 max-w-xs border-t border-blue-100 p-4 align-top wrap-anywhere">{{ appli.applied_at }}</td>
                <td class="min-w-24 max-w-xs border-t border-blue-100 p-4 align-top wrap-anywhere">
                    <button class="cursor-pointer rounded-lg bg-blue-100 px-4 py-2 font-semibold text-blue-800 transition-colors hover:bg-blue-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-700" type="button" @click="startEditingAppli(appli)">
                        Modifier
                    </button>
                    <button class="ml-2 cursor-pointer rounded-lg bg-red-100 px-4 py-2 font-semibold text-red-800 transition-colors hover:bg-red-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700" type="button" @click="deleteAppli(appli.id)">
                        Supprimer
                    </button>
                </td>
            </tr>
<tr v-if="editingAppli && editingAppli.id === appli.id">
<td colspan="6" class="border-t border-blue-200 bg-blue-50 p-4">
<form class="mt-6 grid grid-cols-1 gap-4 rounded-xl border border-blue-200 bg-white p-4 shadow-md sm:grid-cols-2 sm:p-6" v-if="editingAppli" @submit.prevent="saveAppli">
        <h3 class="text-xl font-bold text-gray-900 sm:col-span-2">Modifier la candidature</h3>

        <label class="font-semibold text-slate-800 sm:col-span-2" for="edit-application-message">Message</label>
        <textarea class="w-full min-w-0 resize-y rounded-lg border border-blue-200 bg-blue-100 p-3 text-slate-900 focus:outline-2 focus:outline-offset-2 focus:outline-blue-700 sm:col-span-2"
            id="edit-application-message"
            v-model="editingAppli.message"
            rows="5"
        ></textarea>

        <button class="cursor-pointer rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition-colors hover:bg-blue-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-800" type="submit">Enregistrer</button>
        <button class="cursor-pointer rounded-lg bg-slate-200 px-4 py-3 font-semibold text-slate-700 hover:bg-slate-300 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-700" type="button" @click="editingAppli = null">
            Annuler
        </button>
    </form>
</td>
</tr>
</template>
        </tbody>
    </table></div>

    

    

    <p role="status" class="mt-5 rounded-lg bg-blue-100 p-4 text-center text-blue-900" v-if="feedback">{{ feedback }}</p>
</section>
    </div>
    </main>
</template>


