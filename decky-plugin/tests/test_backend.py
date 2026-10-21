"""Backend tests with a fake Steam directory. Run: python3 -m unittest discover decky-plugin/tests"""

import asyncio
import os
import sys
import tempfile
import types
import unittest

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, "..", "py_modules"))
sys.path.insert(0, os.path.join(HERE, ".."))

decky_stub = types.ModuleType("decky")
sys.modules["decky"] = decky_stub

import main  # noqa: E402
from vdf_lite import parse_vdf  # noqa: E402


class VdfLiteTest(unittest.TestCase):
    def test_parses_like_core(self):
        tree = parse_vdf('"a"\n{\n // c "x" {\n bare val\n "k" "1"\n "k" "2"\n "e" "q\\"t"\n}')
        self.assertEqual(tree["a"]["bare"], "val")
        self.assertEqual(tree["a"]["k"], ["1", "2"])
        self.assertEqual(tree["a"]["e"], 'q"t')


class FindLayoutTest(unittest.TestCase):
    def setUp(self):
        self.home = tempfile.mkdtemp()
        decky_stub.DECKY_USER_HOME = self.home
        decky_stub.DECKY_PLUGIN_RUNTIME_DIR = os.path.join(self.home, "runtime")
        self.steam = os.path.join(self.home, ".local", "share", "Steam")
        self.config = os.path.join(self.steam, "steamapps", "common", "Steam Controller Configs", "123", "config")
        os.makedirs(self.config)

    def write(self, path, text):
        os.makedirs(os.path.dirname(path), exist_ok=True)
        with open(path, "w", encoding="utf-8") as handle:
            handle.write(text)

    def find(self, appid, name=""):
        return asyncio.run(main.Plugin().find_layout(appid, name))

    def test_template_entry(self):
        self.write(os.path.join(self.config, "configset_controller_neptune.vdf"),
                   '"controller_config" { "620" { "template" "controller_neptune_wasd.vdf" } }')
        self.write(os.path.join(self.steam, "controller_base", "templates", "controller_neptune_wasd.vdf"), '"controller_mappings" {}')
        result = self.find(620)
        self.assertTrue(result["found"])
        self.assertEqual(result["source"], "template")

    def test_personal_config_by_game_name(self):
        self.write(os.path.join(self.config, "portal 2", "controller_neptune.vdf"), '"controller_mappings" { "title" "Mine" }')
        result = self.find(620, "Portal 2")
        self.assertEqual(result["source"], "personal")
        self.assertIn("Mine", result["text"])

    def test_workshop_copy_on_disk(self):
        self.write(os.path.join(self.config, "configset_controller_neptune.vdf"),
                   '"controller_config" { "620" { "workshop" "987" } }')
        self.write(os.path.join(self.steam, "steamapps", "workshop", "content", "241100", "987", "layout.vdf"), '"controller_mappings" {}')
        result = self.find(620)
        self.assertEqual(result["source"], "workshop")
        self.assertEqual(result["fileId"], "987")

    def test_miss_reports_notes(self):
        result = self.find(999)
        self.assertFalse(result["found"])
        self.assertTrue(result["notes"])


if __name__ == "__main__":
    unittest.main()
