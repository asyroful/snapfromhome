# SnapFromHome 📸

A modern, scalable, and fully client-side (frontend-heavy) photobooth web application built with React, Vite, and Tailwind CSS. SnapFromHome allows users to choose customizable frame templates, take a series of 3 photos using a countdown auto-capture flow, and generate beautiful photostrips instantly with the Canvas API—complete with print-ready 4x6 layouts.

## 🌟 Features

- **PWA / Browser-First:** Runs entirely in the browser using the `getUserMedia` API. No app installation required.
- **Auto Capture Flow:** Structured 7-second countdowns between shots with synthetic shutter sounds and flash animations.
- **Canvas Image Processing:** Combines multiple photos into frames cleanly bridging custom overlays and text instantly using the HTML Canvas API.
- **Real-time Retake:** Select individual generated photostrip thumbnails to retake *just* that specific photo without restarting the entire session.
- **Print-Ready Layouts:** Optionally export high-resolution (1800x2700px) 4x6 inch double-strip layouts with dashed cut-guides optimized for physical photo-booth printers.
- **Admin Dashboard:** Access a password-protected environment (`/admin`) to Add, Edit, or Delete frame templates, and adjust footers to have custom text per-event.
- **Netlify Serverless Ready:** Pre-configured with Netlify Edge Functions for generating secured Cloudinary upload URLs along with robust rate limit checking.

## 🛠️ Tech Stack

- **Frontend Core:** React 18, Vite
- **Styling:** Vanilla CSS & Tailwind CSS 3 (Custom Themes)
- **State Management:** Zustand
- **Icons:** Lucide React
- **Backend / Deployment Settings:** Netlify Functions
- **Image Storage Strategy:** Cloudinary (Serverless Signed Upload)
- **Analytics:** Google Analytics 4 (GA4 Event Hooks Built-in)

## 🚀 Getting Started

### Prerequisites

Ensure you have **Node.js** (version 18 or above) installed on your system. 

### Installation & Execution

1. Navigate to your project directory.
2. Install npm dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables. Duplicate the `.env.example` file and rename it to `.env`:
   ```bash
   cp .env.example .env
   ```
   *Edit the `.env` file to customize your Admin Panel Password and Cloudinary Variables.*

4. Spin up the development server:
   ```bash
   npm run dev
   ```
5. Dive into the photobooth by opening your browser to `http://localhost:5173/`

*(Note: Certain devices on Mobile view may require your application to be served over `HTTPS` to grant native camera access).*

## 🔐 Environment Variables

| Variable | Target Area | Description |
| --- | --- | --- |
| `VITE_ADMIN_USERNAME` | Frontend (Admin) | Username for `/admin` login. Default: `admin` |
| `VITE_ADMIN_PASSWORD` | Frontend (Admin) | Password for `/admin` login. Default: `admin123` |
| `CLOUDINARY_CLOUD_NAME` | Backend (Netlify) | Your Cloudinary instance cloud name. |
| `CLOUDINARY_API_KEY` | Backend (Netlify) | Cloudinary authentication API Key. |
| `CLOUDINARY_API_SECRET` | Backend (Netlify) | Cloudinary authentication API Secret. |
| `VITE_GA_MEASUREMENT_ID`| Frontend (Stats) | Google Analytics 4 Measurement ID (Tracking). |

## 📂 Architecture Overview

```text
├── netlify/               # Serverless backend functions (upload handlers & limiters)
├── src/
│   ├── components/        # Reusable UI Blocks (Booth Overlays, Buttons, Modals)
│   ├── config/            # Initial static configuration data (frames.json)
│   ├── hooks/             # Custom Logic Hooks (useCamera, useDownload, useAnalytics)
│   ├── lib/               # Underlying Core Logic (Heavy Canvas Processing Utilities)
│   ├── pages/             # Route specific files (Landing, Camera Booth, Preview, Admin)
│   └── stores/            # Zustand global state configurations
├── dist/                  # Production artifacts output folder
├── netlify.toml           # Netlify routing definitions and settings
└── tailwind.config.js     # Master styling constants and configuration variables
```

## 📜 Build For Production

To bundle your application and ready it for web deployment to static hosting configurations:
```bash
npm run build
```
The output will reside in your `dist/` directory, ready to be deployed.
