<?php
// Copy to config.php next to api.php and adjust. config.php is not committed.
return [
    // Exact origins (scheme + host [+ port]) of the frontend, e.g. GitHub Pages.
    'allowed_origins' => [
        'https://<your-username>.github.io',
        'http://localhost:8000',
        'http://127.0.0.1:8000',
    ],
    // Steam Web API key (https://steamcommunity.com/dev/apikey) for the
    // "layouts" endpoint. Never commit it.
    'steam_api_key' => '',
    // Keep the cache outside the web root if your hosting allows it.
    'cache_dir' => __DIR__ . '/cache',
    // Optional: per client IP and minute (all requests / requests reaching Steam)
    // and the cache size cap.
    // 'rate_limit_requests' => 120,
    // 'rate_limit_upstream' => 20,
    // 'cache_max_bytes' => 100 * 1024 * 1024,
];
