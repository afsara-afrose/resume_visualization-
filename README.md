# Afsara Afrose — Portfolio

A single-page personal website. Plain HTML, CSS and JavaScript: no build step, no dependencies to install.

## View it

Double-click `index.html`. It opens in any modern browser.

## What's inside

```
index.html              All the content (text, links, sections)
css/style.css           Design: colours, fonts, layout, animation
js/main.js              Interactions: theme toggle, scroll effects, counters
assets/portrait.jpg     The photo in the hero
assets/favicon.svg      Browser-tab icon
assets/Afsara_Afrose_CV.pdf   The file behind every "Download CV" button
```

## Common edits

**Change text or links** — open `index.html` and edit it directly. Each section is labelled with a comment
(`Hero`, `About`, `Experience`, `Expertise`, `Projects`, `Education`, `Contact`).

**Change the photo** — replace `assets/portrait.jpg` with a new file of the same name. A photo on a plain
white background works best, because the white is blended into the arch. If the new photo sits too high,
low or off-centre, adjust `.portrait__img` in `css/style.css` (`height` zooms, `translateX` moves it sideways).

**Replace the CV** — overwrite `assets/Afsara_Afrose_CV.pdf` with a new file of the same name.

**Change the colours** — the palette lives at the top of `css/style.css` under `:root` (light theme) and
`[data-theme="dark"]` (dark theme). `--accent` is the wine/rose highlight colour.

**Remove the phone number** — delete the `<li>` labelled `Phone` in the Contact section of `index.html`.

## Put it online (free)

- **Netlify** — go to https://app.netlify.com/drop and drag this whole folder onto the page.
- **GitHub Pages** — push the folder's contents to a repository named `afsara-afrose.github.io`,
  then enable Pages under *Settings → Pages*.

## Notes

- Fonts (Instrument Serif and Manrope) load from Google Fonts, so the page looks its best when online.
  Offline it falls back to Georgia and the system font.
- The site follows the visitor's light/dark preference and remembers their choice if they use the toggle.
