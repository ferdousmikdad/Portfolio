# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React portfolio featuring an interactive Pac-Man game interface. The main application is in the `react-portfolio/` directory and uses Vite as the build tool.

## Development Commands

```bash
cd react-portfolio
npm run dev          # Start development server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint (NOTE: ESLint config is missing)
```

## Architecture

### Key Components Structure
- **App.jsx**: Main router with React Router setup, uses future flags for v7 compatibility
- **Navigation.jsx**: Site navigation component
- **PacmanGame.jsx**: Interactive Pac-Man game for project showcase
- **CustomCursor.jsx**: Custom cursor implementation
- **SoundManager.js**: Centralized audio management utility

### Pages
- **HomePage**: Features Pac-Man game and profile introduction
- **WorkPage**: Project gallery with detailed descriptions
- **ContactPage**: Interactive contact form

### Asset Structure
- `public/audio/`: Sound effects and background music
- `public/images/`: Static images and icons
- `public/work/`: Project showcase images
- `src/data/`: Project data and work information
- Custom font: `BoldPixels.otf` loaded from public directory

## Known Issues

### ESLint Configuration Missing
- ESLint is configured in package.json but no `.eslintrc.js` file exists
- Running `npm run lint` will fail until configuration is added
- To fix: Run `npm init @eslint/config` or create manual ESLint config

### Tailwind CSS Version
- Using Tailwind CSS v4.1.16 which is a newer version
- Custom PostCSS configuration present

## Development Notes

- Uses React Router v6 with future flags enabled
- Custom font loaded via CSS @font-face from public directory
- Sound management through centralized SoundManager utility
- Responsive design with Tailwind CSS utilities
- Custom animations and transitions defined in index.css

## File Paths

All React components use absolute imports from `src/` directory. Static assets are served from the `public/` directory and referenced with leading slashes (e.g., `/images/Noise.png`).