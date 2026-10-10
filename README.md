# Seebird AI — Your Personal Bird Identification Assistant 🌿

A functional, modern bird-identification chatbot built with HTML5, CSS3, and modern JavaScript.

🔗 **GitHub Repository**: [https://github.com/yashbaghele-29/seebird-ai/tree/main](https://github.com/yashbaghele-29/seebird-ai/tree/main)

## Features

- 🦜 **Intelligent Chatbot Interface**: Ask any question about bird species, plumage patterns, feeding habits, migration, and conservation.
- 📸 **Photo Identification**: Upload or drag-and-drop any bird photo (or paste from clipboard). Seebird extracts visual color palettes and provides high-confidence species matches.
- 🔍 **Identify by Traits Wizard**: Interactive multi-select helper to identify unknown birds by Color, Size, and Habitat.
- 🔊 **Procedural Birdsong Synthesizer**: Uses native Web Audio API oscillators to play realistic chirps, trills, whistles, and hoots with zero external audio dependencies.
- 📖 **Interactive Field Guide**: Searchable species directory with scientific names, IUCN conservation status badges, and diet specs.
- 📝 **Birding Life List (Sightings Logger)**: Record bird sightings with date, location, and field notes; stored locally and exportable to JSON.
- ⚙️ **Dual AI Engine Modes**:
  1. **Built-in Naturalist AI**: Runs 100% offline and locally in the browser with no API key or installation needed.
  2. **Custom / Eachlabs AI Mode**: Supports connecting `kling/kling-element`, Eachlabs, or any OpenAI-compatible API endpoint with your own API key.
- 🌓 **Dark & Light Mode**: Accessible nature-inspired aesthetic.

## File Structure

```
seebird-ai/
├── index.html        # Main application layout and modal interfaces
├── styles.css        # Responsive styling and themes (Light & Dark)
├── birds-db.js       # Curated species database with acoustic & physical profiles
├── audio-synth.js    # Web Audio API bird song procedural synthesizer
├── app.js            # Chat controller, vision color analyzer, and life list manager
└── README.md         # Documentation
```

## How to Run

1. Open `index.html` directly in any modern web browser (Chrome, Edge, Firefox, Safari).
2. Alternatively, serve with a lightweight local web server:
   ```bash
   npx serve .
   # or
   python -m http.server 8000
   ```
