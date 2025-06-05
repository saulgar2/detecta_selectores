import re
import sys
from html.parser import HTMLParser
from urllib.parse import urljoin
from urllib.request import urlopen


def extract_css_selectors(css_text: str) -> list[str]:
    """Return a list of selectors found in the provided CSS text."""
    # Remove CSS comments
    css_text = re.sub(r"/\*.*?\*/", "", css_text, flags=re.DOTALL)
    selectors = []
    for block in re.findall(r"([^{}]+){", css_text):
        for part in block.split(','):
            selector = part.strip()
            if selector and not selector.startswith('@'):
                selectors.append(selector)
    return selectors


class _StyleParser(HTMLParser):
    def __init__(self, base_url: str):
        super().__init__()
        self.base_url = base_url
        self.css_blocks: list[str] = []
        self.links: list[str] = []
        self._in_style = False
        self._current = []

    def handle_starttag(self, tag, attrs):
        if tag == "style":
            self._in_style = True
        elif tag == "link":
            attrs_dict = dict(attrs)
            if attrs_dict.get("rel") == "stylesheet" and "href" in attrs_dict:
                self.links.append(urljoin(self.base_url, attrs_dict["href"]))

    def handle_endtag(self, tag):
        if tag == "style" and self._in_style:
            self.css_blocks.append("".join(self._current))
            self._current = []
            self._in_style = False

    def handle_data(self, data):
        if self._in_style:
            self._current.append(data)


def get_selectors(url: str) -> list[str]:
    """Fetch the page at *url* and return a list of CSS selectors found."""
    with urlopen(url) as resp:
        html = resp.read().decode(errors="ignore")

    parser = _StyleParser(url)
    parser.feed(html)

    css_texts = list(parser.css_blocks)
    for link in parser.links:
        try:
            with urlopen(link) as css_resp:
                css_texts.append(css_resp.read().decode(errors="ignore"))
        except Exception:
            pass  # ignore failing stylesheet fetches

    selectors = []
    for css in css_texts:
        selectors.extend(extract_css_selectors(css))

    # Return unique selectors preserving order
    seen = set()
    unique = []
    for sel in selectors:
        if sel not in seen:
            seen.add(sel)
            unique.append(sel)
    return unique


def main(argv: list[str] | None = None) -> None:
    argv = argv or sys.argv[1:]
    if not argv:
        print("Usage: python -m detecta_selectores <URL>")
        return
    url = argv[0]
    selectors = get_selectors(url)
    for sel in selectors:
        print(sel)


if __name__ == "__main__":
    main()
