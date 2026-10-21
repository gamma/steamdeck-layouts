"""Steam Deck Layout Studio for Decky: finds the controller layout Steam uses
for a game and hands its VDF text to the frontend, which renders it with the
same core modules as the web app.

Steam keeps per-account controller settings under
  <steam>/steamapps/common/Steam Controller Configs/<account>/config/
where configset_<controller>.vdf maps each game to a workshop layout, a
template or the player's own saved configuration. The exact layout of these
files is not documented, so lookups are defensive and every probed path is
reported back for diagnostics.
"""

import glob
import json
import os
import re
import time
import urllib.parse
import urllib.request

import decky

from vdf_lite import parse_vdf

FILE_DETAILS_URL = "https://api.steampowered.com/ISteamRemoteStorage/GetPublishedFileDetails/v1/"
CONTROLLER_CONFIGS_APP_ID = 241100
ALLOWED_DOWNLOAD_HOST = "cdn.steamusercontent.com"
UGC_PATH_PATTERN = re.compile(r"^/ugc/\d{1,24}/[0-9A-Fa-f]{40}/?$")
CACHE_TTL_SECONDS = 7 * 24 * 3600


def steam_roots():
    home = decky.DECKY_USER_HOME
    candidates = [
        os.path.join(home, ".local", "share", "Steam"),
        os.path.join(home, ".steam", "steam"),
    ]
    seen = set()
    roots = []
    for candidate in candidates:
        real = os.path.realpath(candidate)
        if os.path.isdir(real) and real not in seen:
            seen.add(real)
            roots.append(real)
    return roots


def config_dirs(root):
    pattern = os.path.join(root, "steamapps", "common", "Steam Controller Configs", "*", "config")
    return [path for path in glob.glob(pattern) if os.path.isdir(path)]


def read_text(path):
    with open(path, "r", encoding="utf-8", errors="replace") as handle:
        return handle.read()


def find_configset_entry(config_dir, appid, game_name, notes):
    """Returns (configset file, entry dict) for the game, preferring the Deck's own controller."""
    files = sorted(glob.glob(os.path.join(config_dir, "configset_*.vdf")), key=lambda path: "neptune" not in path)
    keys = {str(appid), (game_name or "").lower()}
    for path in files:
        try:
            tree = parse_vdf(read_text(path))
        except OSError as error:
            notes.append(f"unreadable {path}: {error}")
            continue
        root = next(iter(tree.values()), {}) if len(tree) == 1 else tree
        if not isinstance(root, dict):
            continue
        for key, value in root.items():
            if key.lower() in keys and isinstance(value, dict):
                notes.append(f"configset entry in {path}: {json.dumps(value)}")
                return path, value
        notes.append(f"no entry for {appid} in {path}")
    return None, None


def find_personal_config(config_dir, appid, game_name, notes):
    candidates = []
    for folder in {str(appid), (game_name or "").lower()}:
        if folder:
            candidates += glob.glob(os.path.join(config_dir, folder, "*.vdf"))
    candidates = [path for path in candidates if "controller" in os.path.basename(path)]
    if not candidates:
        return None
    candidates.sort(key=lambda path: ("neptune" not in path, -os.path.getmtime(path)))
    notes.append(f"personal config candidates: {candidates}")
    return candidates[0]


def find_template(root, name, notes):
    for path in [
        os.path.join(root, "controller_base", "templates", name),
        os.path.join(root, "controller_base", name),
    ]:
        if os.path.isfile(path):
            return path
    notes.append(f"template {name} not found under {root}/controller_base")
    return None


def http_json(url, form):
    data = urllib.parse.urlencode(form).encode()
    request = urllib.request.Request(url, data=data, headers={"User-Agent": "steamdeck-layout-studio-decky/1.0"})
    with urllib.request.urlopen(request, timeout=10) as response:
        return json.loads(response.read().decode("utf-8"))


def http_text(url):
    request = urllib.request.Request(url, headers={"User-Agent": "steamdeck-layout-studio-decky/1.0"})
    with urllib.request.urlopen(request, timeout=10) as response:
        return response.read(5 * 1024 * 1024).decode("utf-8", errors="replace")


def fetch_workshop_layout(file_id, roots, notes):
    """Local workshop copy first, then the cached download, then Steam."""
    for root in roots:
        for path in glob.glob(os.path.join(root, "steamapps", "workshop", "content", str(CONTROLLER_CONFIGS_APP_ID), str(file_id), "*")):
            if os.path.isfile(path):
                notes.append(f"workshop copy {path}")
                return {"text": read_text(path), "title": "", "path": path}

    cache_dir = os.path.join(decky.DECKY_PLUGIN_RUNTIME_DIR, "layouts")
    cache_path = os.path.join(cache_dir, f"{file_id}.json")
    if os.path.isfile(cache_path) and time.time() - os.path.getmtime(cache_path) < CACHE_TTL_SECONDS:
        with open(cache_path, "r", encoding="utf-8") as handle:
            notes.append(f"cached download {cache_path}")
            return json.load(handle)

    details = http_json(FILE_DETAILS_URL, {"itemcount": 1, "publishedfileids[0]": str(file_id)})
    entry = (details.get("response", {}).get("publishedfiledetails") or [{}])[0]
    file_url = entry.get("file_url") or ""
    if entry.get("result") != 1 or entry.get("creator_app_id") != CONTROLLER_CONFIGS_APP_ID or not file_url:
        notes.append(f"file {file_id} is not a downloadable controller layout")
        return None
    parsed = urllib.parse.urlparse(file_url)
    if parsed.scheme != "https" or parsed.hostname != ALLOWED_DOWNLOAD_HOST or parsed.query or not UGC_PATH_PATTERN.match(parsed.path):
        notes.append(f"unexpected download url for {file_id}")
        return None
    result = {"text": http_text(file_url), "title": entry.get("title") or "", "path": file_url}
    os.makedirs(cache_dir, exist_ok=True)
    with open(cache_path, "w", encoding="utf-8") as handle:
        json.dump(result, handle)
    notes.append(f"downloaded {file_id} from Steam")
    return result


class Plugin:
    async def find_layout(self, appid, game_name=""):
        """Locates the layout Steam uses for a game.

        Returns {found, source, title, text, fileId, notes}; notes lists every
        probed location so a miss can be diagnosed on the device.
        """
        notes = []
        roots = steam_roots()
        if not roots:
            return {"found": False, "notes": ["no Steam installation found"]}

        for root in roots:
            for config_dir in config_dirs(root):
                _, entry = find_configset_entry(config_dir, appid, game_name, notes)
                workshop = (entry or {}).get("workshop")
                template = (entry or {}).get("template")
                personal = find_personal_config(config_dir, appid, game_name, notes)

                # A saved personal configuration reflects edits made on the Deck.
                if personal and not workshop and not template:
                    return {"found": True, "source": "personal", "title": "", "text": read_text(personal), "fileId": "", "notes": notes}
                if workshop and str(workshop).isdigit():
                    try:
                        layout = fetch_workshop_layout(workshop, roots, notes)
                    except Exception as error:  # network or JSON errors
                        notes.append(f"workshop {workshop} failed: {error}")
                        layout = None
                    if layout:
                        return {"found": True, "source": "workshop", "title": layout.get("title", ""), "text": layout["text"], "fileId": str(workshop), "notes": notes}
                if template:
                    path = find_template(root, template, notes)
                    if path:
                        return {"found": True, "source": "template", "title": "", "text": read_text(path), "fileId": "", "notes": notes}
                if personal:
                    return {"found": True, "source": "personal", "title": "", "text": read_text(personal), "fileId": "", "notes": notes}

        notes.append("no layout found; the game may use Steam's default for its controller support")
        return {"found": False, "notes": notes}

    async def _main(self):
        decky.logger.info("Steam Deck Layout Studio loaded")

    async def _unload(self):
        pass
