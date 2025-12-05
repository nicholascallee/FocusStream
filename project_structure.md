# Project Structure

## Root Directory
- **FocusStream.jsx**: Standalone component file.
- **index.html**: Entry point HTML file.
- **package.json** & **package-lock.json**: Project dependencies and scripts.
- **postcss.config.js**: Configuration for PostCSS.
- **tailwind.config.js**: Configuration for Tailwind CSS.
- **vite.config.js**: Configuration for Vite bundler.

## src/
- **App.jsx**: Main application component.
- **index.css**: Global styles.
- **main.jsx**: React entry point, mounts App to DOM.

## Note on node_modules
The `node_modules` directory contains all installed dependencies. It is large (approx 80MB) but this is normal for Node.js development. This folder should **not** be committed to version control.
