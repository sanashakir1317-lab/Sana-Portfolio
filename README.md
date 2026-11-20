# Sana Shakir — Video Editor & Graphic Designer

A cinematic, motion-led single-page portfolio built with plain HTML, CSS and JavaScript, enhanced with GSAP + ScrollTrigger (with a native fallback if the CDN is unavailable).

## Run locally

Open `index.html` in a modern browser, or serve the folder with any static server that supports HTTP ranges for smooth video playback. A range-enabled PowerShell server is available at `C:\Users\Sana Shakir\AppData\Local\Temp\opencode\serve-portfolio.ps1` (port 8123).

## Files

- `index.html` — cinematic intro, hero, gallery, showreel, skills, about, contact, footer, modal
- `styles.css` — motion-studio visual system, editorial gallery, responsive layout, reduced-motion rules
- `script.js` — intro sequence, GSAP scroll choreography, filters, modal timecode, cursor, interactions
- `favicon.svg` — site icon
- `work/video/` — original MP4 files (unchanged) plus two original graphic PNGs
- `work/images/` — original artwork and generated frame thumbnails in `thumbs/`

## Motion system

- Timed cinematic intro with name reveal, light beam, progress counter and curtain transition into the hero.
- Hero title masking, animated timeline composition, light streaks, audio meters, pointer depth and scroll parallax.
- Scroll-triggered reveals for every section; gallery images reveal with clip-path masks.
- Animated category filter with sliding indicator and staggered card entrance.
- Showreel HUD (timecode + progress) stays in sync with the video playing in the immersive modal.
- Magnetic buttons, cursor follower, marquee footer and hover choreography.
- Everything respects `prefers-reduced-motion` and falls back gracefully without GSAP.

## Typography

- Headings: Manrope (500–700) for the name, section titles, project titles and short statements.
- Body and UI: DM Sans (400–600) for descriptions, labels, filters, controls and footer details.
- Only these two complementary families are used; all weights stay medium-to-bold rather than heavy.
- Type scales are intentionally medium-sized with natural letter spacing, tuned at 1100px, 900px, 640px and 380px for balanced desktop and mobile proportions.
- Every word is solid filled — no text strokes, outlines or hollow lettering.

## Work included

Video Editing (11): Documentary Final Project, Burger Reel, Pizza Reel, Sushi Reel, Beef Toast, Papaya, Drink, New Car Reel, Head Phone Ad, New Video, Long Video.

Graphic Design (3): Dream to Reality — Education Poster, Online Presence — Social Graphic, SEO — Social Graphic.

The showreel uses `Sana Shakir reel.mp4`. `Sana Shakir sushi reel.mp4` is a byte-identical copy shown once as the Sushi Reel project.

## Editing the gallery

Each `.project` card carries `data-category`, `data-video`/`data-image`, `data-poster`, `data-title` and `data-description`, plus inline `--span` and `--ar` values for its grid size and aspect ratio. Update the filter counts in `index.html` when adding or removing cards.

## Notes

- Only real projects; no fake work, stock imagery or invented contact details.
- Skills are limited to Premiere Pro, After Effects, Photoshop and Illustrator.
- Videos open in a native HTML5 player with controls, no autoplay with sound, and metadata-only preload.
- All 14 project thumbnails are unique and generated from the original videos.
- Fully responsive down to 360px with no horizontal overflow.
