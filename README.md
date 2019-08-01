# page-renderer

##### HTML pages with proper meta and styles in pure Clojure

[![Clojars Project](https://img.shields.io/clojars/v/page-renderer.svg)](https://clojars.org/page-renderer)
[![CircleCI](https://circleci.com/gh/spacegangster/page-renderer.svg?style=svg)](https://circleci.com/gh/spacegangster/page-renderer)


## Features
Out of the box:
- Basic SEO meta
- Basic Twitter meta
- Basic Open Graph (Facebook) meta
- Basic Service Worker generator
- Clojure stylesheets with `garden`
- Clojure markup rendered with `hiccup`
- Built-in cache-busting for assets
- Async stylesheets loading
- And also: that responsive `viewport=something` meta tag and language tag

## Usage

### 1. Define a page
```clojure
(ns pages.home)

(def page
   ; essentials
  {:title "Lightpad"
   :body [:body.page [:h1 "Ah, a Page!"]]
   :head-tags [[:meta {:name "custom" :property "stuff"}]]
   :stylesheet-async "large-stuff.css" ; injects an async renderer(s)
   :script "/app.js" ; async by default
   :garden-css [:h1 {:font-size :20px}] ; critical path css
   
   ; seo and meta
   :description "Like a notepad but cyberpunk"
   :og-image "https://lightpad.ai/favicon.png"
   :twitter-site "@lightpad_ai"
   
   ; PWA stuff
   :manifest    true
   :lang        "en"
   :theme-color "hsl(0, 0%, 96%)"
   :service-worker "/service-worker.js" ; will inject also a service worker lifecycle script
   :sw-default-url "/app"
   :sw-add-assets ["/icons/fonts/icomoon.woff", "/lightning-150.png"]})
```

### 2. Wire it up to your routes (e.g. Compojure)
```clojure
(ns server
 (:require [page-renderer.core :as pr]
           [page-renderer.service-worker-generator :as sw]
           [compojure.core :refer [defroutes GET]] 
           [pages.home :as p]))

(defroutes
  (GET "/" []
   {:status 200
    :headers {"Content-Type" "text/html"}
    :body (pr/render-page p/page)})

    
  (GET "/service-worker.js" []
   {:status 200
    :headers {"Content-Type" "text/javascript"}
    ; will generate a simple Workbox-based service worker on the fly with cache-busting
    :body (sw/generate p/page)})

  (GET "/quicker-way" [] (pr/respond-page p/page)))
```

### 3. Celebrate
```html
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <link href="/favicon.png" rel="icon" type="image/png">
    <meta content="width=device-width, initial-scale=1, maximum-scale=1" name="viewport">
    <title>Page</title>
    <meta content="Some bird stuff" name="description">
    <meta content="summary" name="twitter:card">
    <meta content="birds.org" name="twitter:site">
    <meta content="Some bird stuff" name="twitter:description">
    <meta content="https://birds.org/great-tit.png?mtime=1560280129605" name="twitter:image">
    <meta content="Page" property="og:title">
    <meta content="Some bird stuff" property="og:description">
    <meta content="https://birds.org/great-tit.png?mtime=1560280129605" property="og:image">
    <style id="inline-css--garden">
    h1 {
    font-size: 20px;
    }
    </style>
</head>
<body class="page">
    <h1>Ah, a Page!</h1>
    <script>
    (function(){
    var link = document.createElement('link');
    link.rel='stylesheet';
    link.href='large-stuff.css';
    link.type='text/css';
    document.head.appendChild(link);
    })()
    </script>
</body>
</html>
```

## API
Use `page-renderer.core/render-page` and `page-renderer.core/respond-page`
Both functions have the same signature.

Each function accepts a map that may have properties enlisted below:

- `@param {hash-map} renderable` - the props map 
- `@param {vector} renderable.body` - data structure for Hiccup to render into HTML of the document's body
- `@param {string} renderable.meta-title` - content for title tag (preferred)
- `@param {string} renderable.title` - content for title tag
- `@param {string} renderable.meta-keywords` - content for title tag
- `@param {string} renderable.meta-description` - meta description
- `@param {map} meta-props` – meta which must be rendered as props.
    Example `{"fb:app_id" 123}`.
    For instance, Facebook `app_id` must be renderded as meta property not just meta tag.
    

##### Open Graph meta
- `@param {string} renderable.og-title` - OpenGraph title
- `@param {string} renderable.og-description` - OpenGraph description
- `@param {string} renderable.og-image` - absolute url to image for OpenGraph
- `@param {string} renderable.og-type`
- `@param {string} renderable.og-url` - OpenGraph page permalink
- `@param {string} renderable.head-tags` - data structure to render into HTML of the document's head

##### Twitter meta
Twitter meta – if you want it – be sure to include `:twitter-site` or `:twitter-creator`. Or both.

- `@param {string}  renderable.twitter-site` - twitter @username
- `@param {keyword} renderable.twitter-card-type` - twitter card type
    one of `#{:summary  :summary_large_image :app :player}`
- `@param {string}  renderable.twitter-description` - twitter card description
- `@param {string}  renderable.twitter-image` - twitter image
- `@param {string}  renderable.twitter-image-alt` - twitter image alt

##### Assets
- `@param {string} renderable.garden-css` - data structure for Garden CSS
- `@param {string/boolean} renderable.manifest` - truthy value will add a manifest link.
    If a string is passed – it'll be treated as a manifest url.
    Otherwise '/manifest.json' will be specified.
- `@param {string/collection<string>} renderable.stylesheet` - stylesheet filename, will be plugged into the head, will cause
browser waiting for download.
- `@param {string/collection<string>} renderable.stylesheet-inline` - stylesheet filename, will be inlined into the head.
- `@param {string/collection<string>} renderable.stylesheet-async` - stylesheet filename, will be loaded asynchronously by script.
- `@param {string/collection<string>} renderable.script` - script name, will be loaded asynchronously
- `@param {string/collection<string>} renderable.script-sync` - script name, will be loaded synchronously
- `@param {string/collection<string>} renderable.js-module` - entry point for JS modular app. If you prefer your scripts to be served as modules

## How cache-busting works here
`page-renderer` provides very basic, but bulletproof cache-busting by providing
a url param with last modification timestamp, like `/file?mtime=21112`.
For every stylesheet, script and image – it will attempt to look up for the
last modified date on the file. If the file can't be found on the classpath
or inside a local `resources/public` directory it will receive the library load time,
roughly equaling the application start time.

## License

Copyright © 2019 Ivan Fedorov

Distributed under the Eclipse Public License either version 1.0
 or (at your option) any later version.
