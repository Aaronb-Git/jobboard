<script setup lang="ts">
import { onMounted, ref } from 'vue'

const apiStatus = ref('Vérification de l’API…')

onMounted(async () => {
  try {
    const response = await fetch('/api/health')
    const result: { status: string } = await response.json()
    apiStatus.value = `API : ${result.status}`
  } catch {
    apiStatus.value = 'API indisponible'
  }
})
</script>

<template>
  <main class="min-h-screen bg-slate-100 px-6 py-16 text-slate-900">
    <section class="mx-auto max-w-3xl rounded-2xl bg-white p-10 shadow-sm">
      <p class="text-sm font-semibold uppercase tracking-widest text-indigo-600">Epitech · Job Board</p>
      <h1 class="mt-4 text-4xl font-bold">Le projet démarre !</h1>
      <p class="mt-4 text-lg text-slate-600">
        Vue, TypeScript, Tailwind CSS, Express et MariaDB tournent dans Docker Compose.
      </p>
      <p class="mt-8 inline-flex rounded-full bg-slate-100 px-4 py-2 text-sm font-medium">
        {{ apiStatus }}
      </p>
    </section>
  </main>
</template>
