importScripts('https://storage.googleapis.com/workbox-cdn/releases/4.3.1/workbox-sw.js')

workbox.precaching.precacheAndRoute([
    { url: '/heavy-stuff.css', revision: 'file-hash' },
    { url: '/fonts/icomoon.woff', revision: 'file-hash' },
    { url: '/lightpad/compiled/app.js', revision: 'file-hash' },
    { url: '/favicon.png', revision: 'file-hash' },
    { url: '/app', revision: 'file-hash' }
], { ignoreURLParametersMatching: [/hash/] })

workbox.routing.registerNavigationRoute(
    workbox.precaching.getCacheKeyForURL('/app'), {
        whitelist: [ /^\/app/ ],
        blacklist: [ /^\/app\/service-worker.js/ ]
    }
)

workbox.routing.setCatchHandler(({event}) => {
    console.log('swm: event ', event)
})

addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        console.log('swm: skipping waiting')
        skipWaiting()
    }
})

self.addEventListener('activate', () => {
    console.log('swm: activated')
})

self.addEventListener('install', () => {
    console.log('swm: installed')
})