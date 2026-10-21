<?php
// Steam Deck Layout Studio proxy: forwards a fixed set of upstream requests
// verbatim so the browser can read them despite missing CORS headers.
// Parsing happens client-side (core/community.js); this script only validates,
// fetches, caches and relays.

declare(strict_types=1);

$config = array_merge(
    [
        // Origins allowed to call this proxy from the browser.
        'allowed_origins' => ['http://localhost:8000', 'http://127.0.0.1:8000'],
        // Directory for cached upstream responses; must be writable.
        'cache_dir' => __DIR__ . '/cache',
        'timeout_seconds' => 10,
        'max_bytes' => 5 * 1024 * 1024,
    ],
    is_file(__DIR__ . '/config.php') ? (array) require __DIR__ . '/config.php' : []
);

const USER_AGENT = 'steamdeck-layouts/1.0';
const ALLOWED_HOSTS = ['store.steampowered.com', 'api.steampowered.com', 'www.steaminputdb.com', 'cdn.steamusercontent.com'];
const FILE_DETAILS_URL = 'https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/';
const QUERY_FILES_URL = 'https://api.steampowered.com/IPublishedFileService/QueryFiles/v1/';
// Steam Input layouts are UGC of the "Steam Controller Configs" app.
const CONTROLLER_CONFIGS_APP_ID = 241100;
const FILE_TYPE_CONTROLLER_BINDINGS = 15;
const QUERY_TYPES = ['vote' => 0, 'publication' => 1, 'trend' => 3, 'text_search' => 12];
const SORT_VALUES = ['vote', 'publication', 'trend', 'text_search'];

sendCorsHeaders($config['allowed_origins']);
header('X-Content-Type-Options: nosniff');
// Relayed HTML must never render or run scripts on this origin.
header("Content-Security-Policy: sandbox; default-src 'none'");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit;
}
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    fail(405, 'Method not allowed');
}

$endpoint = param('endpoint');
switch ($endpoint) {
    case 'store-search':
        $query = param('q');
        if ($query === '' || mb_strlen($query) > 200) fail(400, 'Invalid q');
        $upstream = 'https://store.steampowered.com/api/storesearch/?' . http_build_query([
            'term' => $query, 'l' => 'english', 'cc' => 'us',
        ]);
        relay($upstream, 'application/json; charset=utf-8', 3600, $config);
        break;

    case 'layouts':
        // Community layouts for a game straight from Steam (needs a Web API key).
        $key = (string) ($config['steam_api_key'] ?? '');
        if ($key === '') fail(503, 'Steam API key not configured');
        $appid = param('appid');
        if (!preg_match('/^\d{1,10}$/', $appid)) fail(400, 'Invalid appid');
        $sort = param('sort') ?: 'vote';
        if (!array_key_exists($sort, QUERY_TYPES)) fail(400, 'Invalid sort');
        $searchText = param('searchtext');
        if (mb_strlen($searchText) > 200) fail(400, 'Invalid searchtext');
        $page = param('page') ?: '1';
        if (!preg_match('/^\d{1,3}$/', $page) || (int) $page < 1) fail(400, 'Invalid page');
        $query = [
            'appid' => CONTROLLER_CONFIGS_APP_ID,
            'filetype' => FILE_TYPE_CONTROLLER_BINDINGS,
            'query_type' => QUERY_TYPES[$sort],
            'page' => (int) $page,
            'numperpage' => 50,
            'return_details' => true,
            'return_tags' => true,
            'return_kv_tags' => true,
            'return_vote_data' => true,
            'requiredtags' => ['controller_neptune'],
            'required_kv_tags' => [['key' => 'app', 'value' => $appid], ['key' => 'visibility', 'value' => 'public']],
        ];
        if ($sort === 'trend') $query['days'] = 30;
        if ($searchText !== '') $query['search_text'] = $searchText;
        $upstream = QUERY_FILES_URL . '?' . http_build_query(['key' => $key, 'input_json' => json_encode($query)]);
        relay($upstream, 'application/json; charset=utf-8', 1800, $config);
        break;

    case 'community-layouts':
        $appid = param('appid');
        if (!preg_match('/^\d{1,10}$/', $appid)) fail(400, 'Invalid appid');
        $query = [];
        $searchText = param('searchtext');
        if ($searchText !== '') {
            if (mb_strlen($searchText) > 200) fail(400, 'Invalid searchtext');
            $query['searchtext'] = $searchText;
        }
        $sort = param('sort');
        if ($sort !== '') {
            if (!in_array($sort, SORT_VALUES, true)) fail(400, 'Invalid sort');
            $query['sort-by'] = $sort;
        }
        $controllerType = param('controller_type');
        if ($controllerType !== '') {
            if (!preg_match('/^[a-z0-9_]{1,40}$/', $controllerType)) fail(400, 'Invalid controller_type');
            $query['controller_type'] = $controllerType;
        }
        $upstream = 'https://www.steaminputdb.com/app/' . $appid . ($query ? '?' . http_build_query($query) : '');
        relay($upstream, 'text/plain; charset=utf-8', 1800, $config);
        break;

    case 'file-details':
        // Keyless Steam Web API call; resolves a shared layout id to its file.
        $id = param('id');
        if (!preg_match('/^\d{1,20}$/', $id)) fail(400, 'Invalid id');
        $form = http_build_query(['itemcount' => 1, 'publishedfileids[0]' => $id]);
        relay(FILE_DETAILS_URL, 'application/json; charset=utf-8', 3600, $config, $form);
        break;

    case 'layout-file':
        $url = param('url');
        $parts = parse_url($url);
        if (
            !is_array($parts)
            || ($parts['scheme'] ?? '') !== 'https'
            || ($parts['host'] ?? '') !== 'cdn.steamusercontent.com'
            || isset($parts['user']) || isset($parts['pass']) || isset($parts['port'])
        ) {
            fail(400, 'Unsupported layout host');
        }
        // Published files are immutable; an update gets a new URL.
        relay($url, 'text/plain; charset=utf-8', 30 * 86400, $config);
        break;

    default:
        fail(404, 'Unknown endpoint');
}

function param(string $name): string
{
    $value = $_GET[$name] ?? '';
    return is_string($value) ? trim($value) : '';
}

function fail(int $status, string $message): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode(['error' => $message]);
    exit;
}

function sendCorsHeaders(array $allowedOrigins): void
{
    header('Vary: Origin');
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin !== '' && in_array($origin, $allowedOrigins, true)) {
        header('Access-Control-Allow-Origin: ' . $origin);
        header('Access-Control-Allow-Methods: GET, OPTIONS');
        header('Access-Control-Max-Age: 86400');
    }
}

function relay(string $url, string $contentType, int $ttl, array $config, ?string $form = null): never
{
    $cacheFile = rtrim($config['cache_dir'], '/') . '/' . hash('sha256', $url . "\n" . ($form ?? '')) . '.cache';
    $body = readCache($cacheFile, $ttl);
    $cacheState = 'HIT';
    if ($body === null) {
        $cacheState = 'MISS';
        $body = fetchUpstream($url, $config, $form);
        writeCache($cacheFile, $body);
    }

    http_response_code(200);
    header('Content-Type: ' . $contentType);
    header('Cache-Control: public, max-age=' . min($ttl, 3600));
    header('X-Proxy-Cache: ' . $cacheState);
    echo $body;
    exit;
}

function readCache(string $file, int $ttl): ?string
{
    if (!is_file($file) || filemtime($file) < time() - $ttl) return null;
    $body = file_get_contents($file);
    return $body === false ? null : $body;
}

function writeCache(string $file, string $body): void
{
    $dir = dirname($file);
    if (!is_dir($dir) && !@mkdir($dir, 0750, true)) return;
    $temp = $file . '.' . bin2hex(random_bytes(4)) . '.tmp';
    if (@file_put_contents($temp, $body) !== false) {
        @rename($temp, $file);
    }
}

/** Follows at most three redirects, each re-checked against the host allowlist. */
function fetchUpstream(string $url, array $config, ?string $form = null): string
{
    for ($redirects = 0; $redirects <= 3; $redirects++) {
        $host = parse_url($url, PHP_URL_HOST);
        if (parse_url($url, PHP_URL_SCHEME) !== 'https' || !in_array($host, ALLOWED_HOSTS, true)) {
            fail(502, 'Upstream redirected to an unsupported host');
        }

        $body = '';
        $tooLarge = false;
        $handle = curl_init($url);
        curl_setopt_array($handle, [
            CURLOPT_FOLLOWLOCATION => false,
            CURLOPT_PROTOCOLS => CURLPROTO_HTTPS,
            CURLOPT_CONNECTTIMEOUT => 5,
            CURLOPT_TIMEOUT => (int) $config['timeout_seconds'],
            CURLOPT_USERAGENT => USER_AGENT,
            CURLOPT_ENCODING => '',
            CURLOPT_HEADER => false,
            CURLOPT_WRITEFUNCTION => function ($ch, string $chunk) use (&$body, &$tooLarge, $config): int {
                if (strlen($body) + strlen($chunk) > $config['max_bytes']) {
                    $tooLarge = true;
                    return 0;
                }
                $body .= $chunk;
                return strlen($chunk);
            },
        ]);
        if ($form !== null) {
            curl_setopt($handle, CURLOPT_POSTFIELDS, $form);
        }
        $ok = curl_exec($handle);
        $status = (int) curl_getinfo($handle, CURLINFO_RESPONSE_CODE);
        $location = curl_getinfo($handle, CURLINFO_REDIRECT_URL);

        if ($tooLarge) fail(502, 'Upstream response too large');
        if ($ok === false) fail(502, 'Upstream request failed');
        if ($status >= 300 && $status < 400 && is_string($location) && $location !== '') {
            $url = $location;
            continue;
        }
        if ($status !== 200) fail(502, 'Upstream request failed: ' . $status);
        return $body;
    }
    fail(502, 'Too many upstream redirects');
}
