# 🎯 Open Wheel of Fortune

A fun and interactive web-based Wheel of Fortune game where you can add participants and spin to find a winner!

## Features

- 🎲 Interactive spinning wheel with smooth animations
- 👥 Add single or multiple participants
- 🎊 Celebration animations for winners
- 📱 Responsive design for mobile and desktop
- 💾 Automatic saving of participants list

## Live Demo

Visit the live application: [https://opendmx.github.io/open-wheel-of-fortune/](https://opendmx.github.io/open-wheel-of-fortune/)

## Local Development

To run locally:

1. Clone the repository
2. Open `index.html` in your browser, or
3. Serve with a local web server:
   ```bash
   python3 -m http.server 8000
   ```
   Then visit `http://localhost:8000`

## Deployment

This project is automatically deployed to GitHub Pages using GitHub Actions. The deployment workflow:

- Triggers on pushes to the `main` branch
- Can be manually triggered from the Actions tab
- Deploys the static files directly to GitHub Pages

The workflow file is located at `.github/workflows/deploy-pages.yml`.