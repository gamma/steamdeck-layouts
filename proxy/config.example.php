<?php
// Copy to config.php next to api.php and adjust. config.php is not committed.
return [
    // Exact origins (scheme + host [+ port]) of the frontend, e.g. GitHub Pages.
    'allowed_origins' => [
        'https://<your-username>.github.io',
        'http://localhost:8000',
        'http://127.0.0.1:8000',
    ],
    // Keep the cache outside the web root if your hosting allows it.
    'cache_dir' => __DIR__ . '/cache',
];
