# Project Setup Guide

This guide details how to set up the Pomodoro App on a new machine after cloning the repository.

## Prerequisites

- **Node.js**: Ensure you have Node.js installed. We recommend the latest LTS version. You can check if it's installed by running `node -v` in your terminal.
- **npm**: This typically comes installed with Node.js. Check with `npm -v`.

## Installation

1.  **Clone the repository:**
    ```bash
    git clone <repository-url>
    ```

2.  **Navigate to the project directory:**
    ```bash
    cd pomodoroApp
    ```

3.  **Install dependencies:**
    Since `node_modules` is not committed to git, you need to install the project dependencies listed in `package.json`.
    ```bash
    npm install
    ```

## Running the Application

1.  **Start the development server:**
    ```bash
    npm run dev
    ```

2.  **Open in Browser:**
    The terminal will show a local URL (usually `http://localhost:5173/`). Open this link in your web browser to view the application.

## Building for Production

To build the app for production deployment:

```bash
npm run build
```

This will generate a `dist` folder with the compiled assets.
