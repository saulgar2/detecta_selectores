import unittest
from pathlib import Path

from detecta_selectores.detecta import get_selectors


class SelectorDetectorTest(unittest.TestCase):
    def test_local_html(self):
        html_path = Path(__file__).parent / "data" / "sample.html"
        url = html_path.resolve().as_uri()
        selectors = get_selectors(url)
        expected = {".a", "h1", "h2", "#id", ".class"}
        self.assertEqual(set(selectors), expected)


if __name__ == "__main__":
    unittest.main()
