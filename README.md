# Asia Outdoors — asiaoutdoors.vn

Static website for Asia Outdoors, adventure tourism on Cat Ba Island, Vietnam.
Deployed on **Netlify**; every push to `main` goes live.

## ⚠️ Source-of-truth policy

**This repository is the only source of truth.** The site began as a static
export of a WordPress/Elementor install. That WordPress install **no longer
exists and will never be used again**. There is no re-export, no sync, and no
upstream to diverge from.

Consequences:

- **Edit the HTML/CSS/JS in this repo directly.** Hand edits are not "lost on
  the next export" — there is no next export.
- WordPress-looking paths (`wp-content/`, `wp-includes/`) are just static
  asset folders now. They are kept because the pages reference them.
- Leftover WordPress/Cloudflare config strings inside the pages (e.g.
  `wp-json` rest URLs in inline JS) are inert and harmless; the endpoints are
  dead. Don't "fix" them unless they cause a real bug.
- Anyone (human or AI) working on this repo must not attempt to regenerate
  pages from WordPress, install WordPress tooling, or treat the export as
  stale.

## Layout

| Path | What it is |
|---|---|
| `index.html` | Home page (Elementor template 281) |
| `faq/index.html` | FAQ (template 550) |
| `contact-us/index.html` | Contact, form posts to `/api/contact` (template 1330) |
| `retraite-dws.html` | French DWS retreat page (template 2898) |
| `netlify/functions/` | Serverless functions (contact form + Turnstile verification) |
| `wp-content/`, `wp-includes/` | Static assets (images, CSS, JS) — referenced by the pages |
| `llms.txt`, `llms-fr.txt`, `ai-plugin.json` | AI/LLM discovery files |

## Conventions

- The four pages share custom code (language switcher, hero slideshow,
  mobile drawer fixes) but have **different Elementor element IDs** — apply
  shared changes to all four files individually.
- Language switching is Google-Translate-cookie based (`googtrans`); three
  synced `<select>`s: footer, fixed top-right pill, mobile drawer.
- Files use CRLF line endings.
- Secrets (e.g. Turnstile secret key) live only in Netlify environment
  variables — never in this repo.
