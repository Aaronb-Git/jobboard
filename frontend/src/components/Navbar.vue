
<template>
  <nav class="flex items-center justify-between bg-gray-900 px-6 py-4">

    <RouterLink to="/" class="text-2xl font-bold text-white">
      JobBoard
    </RouterLink>

    <div class="flex gap-4">
       <RouterLink to="/login" class="rounded bg-gray-700 px-4 py-2 text-white">
          Se connecter
        </RouterLink>

      <RouterLink to="/register" class="rounded bg-indigo-600 px-4 py-2 text-white">
          S'inscrire
      </RouterLink>
    </div>

  </nav>
</template>
