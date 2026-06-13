<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <!-- SEO Meta Tags -->
        <meta name="description" content="Bocado | Pide desde tu mesa de forma rápida y sencilla en tus restaurantes favoritos. Mira la carta, ordena y paga al instante con código QR.">
        <meta name="keywords" content="bocado, pedir comida, mesa, restaurante, codigo qr, carta digital, menu qr, pagar mesa">
        <meta name="author" content="Bocado.click">
        <meta name="robots" content="index, follow">

        <!-- Open Graph / Facebook -->
        <meta property="og:type" content="website">
        <meta property="og:url" content="https://bocado.click/">
        <meta property="og:title" content="Bocado | Pide desde tu mesa de forma rápida">
        <meta property="og:description" content="Bocado te permite ver el menú, ordenar y pagar desde tu mesa de forma rápida y sencilla en tus restaurantes favoritos.">
        <meta property="og:image" content="https://bocado.click/favicon.ico">

        <!-- Twitter -->
        <meta property="twitter:card" content="summary_large_image">
        <meta property="twitter:url" content="https://bocado.click/">
        <meta property="twitter:title" content="Bocado | Pide desde tu mesa de forma rápida">
        <meta property="twitter:description" content="Bocado te permite ver el menú, ordenar y pagar desde tu mesa de forma rápida y sencilla en tus restaurantes favoritos.">
        <meta property="twitter:image" content="https://bocado.click/favicon.ico">

        <title inertia>{{ config('app.name', 'Bocado') }}</title>

        <!-- Fonts -->
        <link rel="preconnect" href="https://fonts.bunny.net">
        <link href="https://fonts.bunny.net/css?family=figtree:400,500,600&display=swap" rel="stylesheet" />

        <!-- Scripts -->
        @routes
        @viteReactRefresh
        @vite(['resources/js/app.tsx', "resources/js/Pages/{$page['component']}.tsx"])
        @inertiaHead
        <script>
            if (localStorage.getItem('theme') === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                document.documentElement.classList.add('dark');
            } else {
                document.documentElement.classList.remove('dark');
            }
        </script>
    </head>
    <body class="font-sans antialiased">
        @inertia
    </body>
</html>
