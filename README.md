# Lakdive Sakmana · ලක්දිවේ සක්මන

*A stroll through Sri Lanka*: a calm isometric puzzle game that runs in the browser.

**▶ Play:** https://sahaaaan.github.io/REPO-NAME/ <!-- replace REPO-NAME with this repository's name -->

Works on laptops and phones (portrait or landscape). No install, no account, nothing to download.

---

## The journey

You travel across Sri Lanka, one chapter at a time. Between chapters, an animated map shows your journey from place to place: by train, tuk-tuk, safari jeep, bus and hot-air balloon.

| | Place | Chapter | What it's about |
|---|---|---|---|
| Prologue | Colombo | **Galle Face Green** | A guided tutorial at sunset by the sea: walk, pick things up, look behind things, stand on switches. |
| I | Polonnaruwa | **The Stupa House** | Bring water to the bo tree, then turn the terraces of an ancient stupa house to light its lamp. |
| II | Hiriketiya | **The Horseshoe Bay** | Help a fisherman, play with the tide, surf the last wave, and get the power back on along the main street. |
| III | Yala | **The Lost Calf** | Track a lost baby elephant by its prints and its calls, and lead it home to its herd. |
| IV | Ella | **The First Flush** | Tea estate puzzles, then timetables and signal levers at the Nine Arch Bridge. |
| V | Sigiriya | **The Lion Rock** | The hardest chapter: water gardens, the Mirror Wall, and the climb to the summit. |

Chapters unlock in order. You can replay any chapter you've finished from the map. Your progress is saved in your browser.

## How to play

- **Tap the ground** to walk.
- **Tap people and things** to go to them and use them.
- **Turn the view** with the ⟲ ⟳ buttons, or swipe sideways. Some things are hidden behind others.
- **Pinch or scroll** to zoom.
- **Stuck?** The 💡 bulb button shows you where to look.
- **Sound:** the speaker button lets you mute, or change the effects and surroundings volumes.

The Prologue walks you through all of this step by step.

## About the game

- **Style:** pastel low-poly islands floating in the sky, built in code. Each chapter is set at a different time of day.
- **Heroine:** an original character with a different outfit in each chapter. She was designed as image sheets, turned into a 3D model, then rigged and animated for the game.
- **Sound:** gentle, made entirely in code: birds, koels and temple bells, waves, insects, trains, tuk-tuks and soft chimes.
- **Puzzles:** every chapter's puzzles are checked by a solver, which proves the chapter can be finished and that no step can be skipped.

## Running it yourself

It's a static website: just HTML and JavaScript, using [three.js](https://threejs.org) from a CDN. Serve the folder with any web server, for example:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly from disk won't work, because browsers block module scripts loaded from `file://`.

```
index.html          the journey map and chapter select
levels/<chapter>/   one folder per chapter (colo, polo, hiri, yala, hill, sigi)
  index.html          loads the chapter
  engine.js           shared game engine (camera, walking, heroine, sound, HUD)
  level.js            the chapter's scene and story
  logic.js            the chapter's puzzle rules
  anim.js             the heroine's animations
  heroine.js          the heroine's 3D model for that chapter
```

## A note on places

The game is set in real places, several of them sacred. Temples, stupas and Buddha statues appear as calm backdrops and destinations, never as things to climb or play with.

## Credits

Made by sahaaaan. Built with three.js and the Web Audio API. Characters were made with AI image and 3D generation tools, and the code was written with help from Claude.
