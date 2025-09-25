# CNetAI Website

A sleek, modern PWA website for the CNetAI blockchain platform inspired by Megaman Battle Network aesthetics.

## Project Structure

```
.
├── index.html          # Main HTML file
├── manifest.json       # PWA manifest file
├── sw.js              # Service worker for offline functionality
├── README.md          # This file
├── SummaryforMichal.md # Original project summary
├── assets/
│   ├── icons/         # PWA icons in various sizes
│   └── images/        # Images and SVGs
├── styles/
│   └── main.css       # Main stylesheet
└── scripts/
    └── main.js        # Main JavaScript file
```

## Features

- **Progressive Web App (PWA)**: Installable on mobile and desktop devices
- **Responsive Design**: Optimized for both desktop and mobile viewing
- **Megaman Battle Network Inspired**: Cyberpunk aesthetics with glitch effects and neon colors
- **Smooth Animations**: Hypnotic animations throughout the page
- **Post-Quantum Security**: Information about CNetAI's advanced security features
- **Tokenomics Display**: Visual representation of $CNETAI token distribution

## How to Run

1. Serve the website using any local server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js (http-server)
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

2. Open your browser and navigate to `http://localhost:8000`

## PWA Functionality

This website is a fully functional PWA with:
- Offline support through service worker caching
- Installable on mobile and desktop devices
- App-like experience with standalone display mode
- Manifest file for metadata and icons

## Customization

To customize the website:
1. Modify `styles/main.css` to change colors, fonts, and layouts
2. Update content in `index.html`
3. Add or modify JavaScript functionality in `scripts/main.js`

## Technologies Used

- HTML5
- CSS3 (with modern features like CSS variables, flexbox, grid)
- JavaScript (ES6+)
- Service Workers for offline functionality
- Web App Manifest for PWA features

## Browser Support

This website works on all modern browsers that support:
- CSS Grid and Flexbox
- CSS Variables
- Service Workers
- Web App Manifest

For best experience, use the latest versions of Chrome, Firefox, Safari, or Edge.