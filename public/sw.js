// Service worker mínimo: solo existe para que el navegador permita
// "Instalar" el sitio como app en el celular. No guarda nada en caché a
// propósito — el directorio se actualiza en vivo desde Supabase y una
// copia guardada mostraría datos desactualizados.
self.addEventListener('install', () => {
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('fetch', () => {
  // Sin manejo especial: deja que cada solicitud vaya directo a la red.
})
