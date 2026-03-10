# 📸 Photo Gallery App

A responsive, feature-rich photo gallery built with **React** and **Tailwind CSS**, featuring album-based browsing, dynamic color theming, smooth animations, and full dark mode support.

---

## 🚀 Tech Stack

| Technology | Purpose |
|---|---|
| React (Hooks) | UI logic and state management |
| Tailwind CSS | Utility-first styling |
| Framer Motion | Animations and transitions |
| ColorThief | Dominant color extraction from images |
| Lucide React | Icon library |
| Unsplash | Photo source (via URL params) |

---

## 🧠 Logical Architecture

### Data Layer — `galleryData.js`

All photo data lives in a flat `photos` array. Each photo object carries:

- `id`, `title`, `category`, `imageUrl`, `photographer`, `likes`

Two derived exports are built from this flat array at module load time:

- **`albumData`** — an array of 6 album objects, each filtering `photos` by category (Nature, Urban, Sea, Travel, Space, Winter). Each album also carries a `coverImage` and `description`.
- **`allPhotosAlbum`** — a special pseudo-album containing the full unfiltered photos list, used as the default view.

This separation means albums are not hardcoded duplicates — they're live views over the same data source.

### State Management — `App.jsx`

All application state is managed locally via `useState` hooks. The key state variables and their roles:

| State | Type | Purpose |
|---|---|---|
| `selectedAlbum` | object | Currently active album (defaults to `allPhotosAlbum`) |
| `search` | string | Live search query filtering by title or photographer |
| `category` | string | Active category filter chip (`"All"` or a specific category name) |
| `currentPage` | number | Active page in the paginated photo grid |
| `selectedPhoto` | object / null | Photo object for the detail modal (`null` = closed) |
| `themeColor` | string | RGB string extracted from the last opened photo |
| `darkMode` | boolean | Global dark/light mode toggle |
| `loading` | boolean | Controls splash screen visibility |
| `sidebarOpen` | boolean | Mobile sidebar drawer open state |
| `isDesktop` | boolean | Tracks viewport width ≥ 768px for responsive sidebar logic |

### Filtering & Pagination Logic

Filtering is computed on every render as a derived value — no extra state needed:

```
filteredPhotos = selectedAlbum.photos
  → filter by search (title OR photographer, case-insensitive)
  → filter by category chip
```

Pagination then slices `filteredPhotos` into pages of 20. Changing search, album, or category resets `currentPage` to 1 and scrolls to the top via a `useEffect` dependency on those three values.

---

## ✨ Features

### 🎨 Dynamic Color Theming
When a photo card is clicked to open the detail modal, **ColorThief** extracts the dominant RGB color from the image. This color is applied as a dynamic `themeColor` that tints:
- Photo card glassmorphism backgrounds and box shadows
- The modal background gradient

This creates a unique ambient color experience per image.

### 🌙 Dark Mode
Dark mode is persisted to `localStorage` and also respects the OS-level `prefers-color-scheme` as a default on first load. The toggle button (bottom-right FAB) animates between Sun and Moon icons using Framer Motion's `AnimatePresence`.

### 📁 Album Sidebar
The left sidebar lists all albums with cover images. Clicking an album swaps `selectedAlbum`, triggering a fade/scale transition on the grid via Framer Motion's `AnimatePresence`. On mobile, the sidebar slides in as a drawer with a backdrop overlay.

### 🔍 Search & Category Filters
- Real-time search filters by photo title and photographer name simultaneously.
- Category chips (auto-generated from unique categories in data) allow single-category filtering.
- Both filters compose — you can search within a category.

### 🖼️ Photo Detail Modal
Clicking any photo card opens a full-screen modal with:
- High-resolution image (`?w=1200`)
- Dynamic gradient background tinted by the photo's dominant color
- A **Download** button that fetches the image as a Blob and triggers a native browser download (avoids browser-blocked direct link downloads)

### 📄 Pagination
Photos are paginated at 20 per page with Prev/Next buttons and numbered page buttons. Page state resets automatically on any filter change.

### 🔊 Audio Feedback
A subtle page-turn audio clip (`page_changing.mp3`) plays on page navigation via a `useRef`-held `Audio` instance (persistent across renders, no re-instantiation).

### ⏳ Loading Screen — `Loading.jsx`
A branded splash screen shown for 2 seconds on app mount, featuring:
- Animated gradient icon
- Animated progress bar (`loadingBar` CSS keyframe)
- Reads dark mode preference from `localStorage` independently so the splash matches the user's saved theme

---

## 📁 Project Structure

```
src/
├── App.jsx              # Root component — all layout, state, and logic
├── galleryData.js       # Static photo data, album groupings, allPhotosAlbum
├── index.css            # Tailwind import + custom keyframe animations
└── components/
    └── Loading.jsx      # Splash screen shown on initial app load
audio/
    └── page_changing.mp3
```

---

## 🛠️ Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### Required Dependencies

```bash
npm install framer-motion colorthief lucide-react
```

Tailwind CSS v4 is used via `@import "tailwindcss"` in `index.css` — ensure your bundler supports this (e.g. Vite with the Tailwind v4 Vite plugin).

---

## 📌 Notes & Potential Improvements

- **ColorThief** requires `crossOrigin = "anonymous"` on images and a CORS-permissive image host. Unsplash supports this.
- The `Loading.jsx` component reads `localStorage` independently from `App.jsx` — these could be unified under a shared context or lifted state to avoid duplication.
- `albumData` is currently imported in `App.jsx` for the sidebar list but `allPhotosAlbum` is used as the default view — both are derived from the same `photos` array, keeping data in sync automatically.
- The audio ref (`changePageAudio`) is initialized but the play trigger can be wired to the pagination `onClick` handlers for sound feedback.

---

## 📄 License

MIT — free to use and modify.
