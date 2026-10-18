# Sri Sai Raj — Portfolio

A *2001: A Space Odyssey*-inspired portfolio site built on the film's
poster palette: vermilion red-orange over poster-orange sections, warm-black
starfields, the monolith, cream cards and telemetry-style mono labels —
plus a pod-bay-door boot screen, a live mission clock, a scrolling
telemetry ticker and a scroll progress bar. Built from a real
researcher's resume.

**Live site (after enabling GitHub Pages):** https://srisairaj-7.github.io

## Stack

Pure HTML / CSS / JavaScript. No build step, no dependencies, no framework.
Three files do all the work:

```
index.html      all content and structure
css/style.css   the 2001 look: poster red-orange, warm black, cream
js/main.js      boot screen, mission clock, parallax, reveals, nav
```

## Local preview

Open `index.html` directly in a browser, or run:

```bash
python -m http.server 8907
# then visit http://127.0.0.1:8907
```

## Deploying to GitHub Pages

1. Push this repo to GitHub as `SriSaiRaj-7.github.io`
   (the special "user site" repo name)
2. On GitHub: **Settings → Pages → Source: Deploy from a branch → main / (root)**
3. Wait ~1 minute. Done — free HTTPS hosting forever.

No Python, no Node, no build pipeline required for deployment — it's a static site.

## Social preview card

`assets/og-image.jpg` (1200×630) is the image WhatsApp/LinkedIn/X show when the
link is shared. It was rendered from `og-card.html` with headless Chrome:

```bash
python -m http.server 8907
"C:/Program Files/Google/Chrome/Application/chrome.exe" --headless=new \
  --window-size=1200,630 --virtual-time-budget=8000 \
  --screenshot=assets/og-image.png http://127.0.0.1:8907/og-card.html
python -c "from PIL import Image; Image.open('assets/og-image.png').convert('RGB').save('assets/og-image.jpg', 'JPEG', quality=85, optimize=True)"
```

Scrapers cache previews aggressively; after changing the image, refresh via
[opengraph.xyz](https://www.opengraph.xyz) or LinkedIn's Post Inspector.
