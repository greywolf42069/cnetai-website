# CNetAI Website

A Progressive Web App (PWA) for the CNetAI blockchain platform with a cyberpunk aesthetic inspired by Megaman Battle Network.

## Features

- Fully responsive design optimized for both desktop and mobile
- Progressive Web App capabilities with offline support
- Cyberpunk aesthetic with neon colors and digital grid elements
- Advanced animations and visual effects
- Complete blockchain information presentation

## Deployment to GitHub Pages

This website is configured to be deployed to GitHub Pages using GitHub Actions.

### Prerequisites

1. Create a new repository on GitHub
2. Push this code to your repository
3. Enable GitHub Pages in your repository settings:
   - Go to Settings → Pages
   - Select "GitHub Actions" as the source

### GitHub Actions Workflow

The workflow is defined in `.github/workflows/deploy.yml` and will automatically deploy the site when changes are pushed to the `main` branch.

### Manual Deployment Steps

1. Update the `manifest.json` file to reflect your repository name:
   ```json
   {
     "start_url": "/your-repo-name/",
     "scope": "/your-repo-name/"
   }
   ```

2. Update the `sw.js` file to reflect your repository name:
   ```javascript
   const urlsToCache = [
     '/your-repo-name/',
     '/your-repo-name/index.html',
     // ... other paths
   ];
   ```

3. Update the service worker registration in `index.html`:
   ```javascript
   navigator.serviceWorker.register('/your-repo-name/sw.js')
   ```

## PWA Features

- Installable on desktop and mobile devices
- Offline functionality through service worker caching
- Push notifications support (if implemented)
- App-like experience with standalone display mode

## Development

To run the website locally:

```bash
python3 -m http.server 3002
```

Then open http://localhost:3002 in your browser.

## Customization

### Icons
The PWA includes a complete set of icons for various devices:
- 72x72px
- 96x96px
- 128x128px
- 144x144px
- 152x152px
- 192x192px
- 384x384px
- 512x512px

### Theme Colors
- Primary: #003366 (Dark Blue)
- Secondary: #0066cc (Blue)
- Accent: #00ffff (Cyan)
- Accent: #ff6600 (Orange)

## Technologies Used

- HTML5
- CSS3 with custom properties and animations
- JavaScript ES6+
- Progressive Web App (PWA) standards
- Service Worker API
- Web App Manifest
- Responsive design techniques

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## License

This project is open source and available under the MIT License.