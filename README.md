<div align="center">
 <img src="https://github.com/caocchinh/photospark/blob/master/client/public/vteam-logo.webp?raw=true" alt="Photospark Logo" width="167"/>
  <h1>Photospark 📸</h1>
  <p>
    <strong>A modern photo booth application built with Next.js and Socket.IO that offers real-time photo capture, custom frames, Instagram-style filters, and direct printing to Canon SELPHY CP1500 printers.</strong>
  </p>
  <p style="margin-top: 10px;">
    <a href="#-features">Features</a> •
    <a href="#-tech-stack">Tech Stack</a> •
    <a href="#-getting-started">Getting Started</a> •
    <a href="#-troubleshooting">Troubleshooting</a>
  </p>

  <p>
    <img src="https://img.shields.io/badge/license-MIT-blue.svg" alt="License" />
    <img src="https://img.shields.io/website?url=https%3A%2F%2Fphotospark.online&label=photospark.online&color=0084ff" alt="Website" />
  </p>
  
  <p>
    <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js&logoColor=white" alt="Next.js 15" />
    <img src="https://img.shields.io/badge/Socket.IO-4.8-black?logo=socket.io&logoColor=white" alt="Socket.IO" />
    <img src="https://img.shields.io/badge/TypeScript-5.0+-3178C6?logo=typescript&logoColor=white" alt="TypeScript" />
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?logo=tailwind-css&logoColor=white" alt="Tailwind CSS 3" />
    <img src="https://img.shields.io/badge/Drizzle-ORM-C5F74F?logo=drizzle&logoColor=black" alt="Drizzle ORM" />
    <img src="https://img.shields.io/badge/Neon-Database-00E599?logo=neon&logoColor=black" alt="Neon Database" />
  </p>
</div>

---

## 📖 Introduction

**Photospark** is a feature-rich photo booth application designed to capture memories with style. Built specifically for the **Vinschool Central Park Student Council's PROM event**, it's engineered to handle large-scale gatherings with up to **600 attendees**. The application integrates high-quality photo capture with a Canon camera with instant printing capabilities using the Canon SELPHY CP1500. With a custom frames, filters, and live video recording.

## 📷 Gallery

Beautiful, heartfelt memories captured by the app — bringing the countless smiles to students and teachers before and on the event 🥰📸:

<div align="center">
  <table>
    <tr>
      <td width="33%">
        <img src="https://placehold.co/400x300/png?text=PROM+Memories+1" alt="Gallery 1" style="border-radius: 10px; width: 100%;" />
      </td>
      <td width="33%">
        <img src="https://placehold.co/400x300/png?text=PROM+Memories+2" alt="Gallery 2" style="border-radius: 10px; width: 100%;" />
      </td>
      <td width="33%">
        <img src="https://placehold.co/400x300/png?text=PROM+Memories+3" alt="Gallery 3" style="border-radius: 10px; width: 100%;" />
      </td>
    </tr>
    <tr>
      <td width="33%">
        <img src="https://placehold.co/400x300/png?text=PROM+Memories+4" alt="Gallery 4" style="border-radius: 10px; width: 100%;" />
      </td>
      <td width="33%">
        <img src="https://placehold.co/400x300/png?text=PROM+Memories+5" alt="Gallery 5" style="border-radius: 10px; width: 100%;" />
      </td>
      <td width="33%">
        <img src="https://placehold.co/400x300/png?text=PROM+Memories+6" alt="Gallery 6" style="border-radius: 10px; width: 100%;" />
      </td>
    </tr>
  </table>
</div>

## ✨ Features

Photospark is packed with features to create the perfect photo booth experience:

- **🎨 Creative Themes**: Apply beautiful single or double layouts to your photos, perfect for branding or themed events.

<div align="center">
  <img src="https://github.com/caocchinh/photospark/blob/master/client/public/github/chose.webp?raw=true" alt="Filters and Themes" style="border-radius: 10px; margin-bottom: 20px;" />
  <img src="https://github.com/caocchinh/photospark/blob/master/client/public/github/frame.webp?raw=true" alt="Filters and Themes" style="border-radius: 10px; margin-bottom: 20px;" />
</div>

- **📸 Real-time Photo Capture**: High-quality webcam/camera support with real-time preview, allowing users to strike the perfect pose.

<div align="center">
  <img src="https://github.com/caocchinh/photospark/blob/master/client/public/github/capture.webp?raw=true" alt="Real-time Capture" style="border-radius: 10px; margin-bottom: 20px;" />
</div>

- **🖨️ Direct Printing**: Seamless integration with Canon SELPHY CP1500 printers for instant physical keepsakes. Supports Japan Hagaki postcard size.

<div align="center">
  <img src="https://placehold.co/600x400/png?text=Direct+Printing" alt="Direct Printing" style="border-radius: 10px; margin-bottom: 20px;" />
</div>

- **🎞️ Custom Frames**: Choose from over 30 Instagram-style filters and multiple themes like PROM and Usagyuuun to match the event's vibe.

<div align="center">
  <img src="https://placehold.co/600x400/png?text=Custom+Frames" alt="Custom Frames" style="border-radius: 10px; margin-bottom: 20px;" />
</div>

- **🎥 Video Recording**: Capture moments in motion with video recording capabilities, processed automatically with FFmpeg.

- **📱 Smart QR Codes on Prints**: Each printed photo includes an embedded QR code that links to a personalized web page where users can:
  - **Edit Images**: Re-edit and adjust photos with different filters and frames
  - **Download**: Save full-resolution images or videos to their devices
  - **Share**: Generate and download QR codes or copy direct links for easy sharing with friends

<div align="center">
  <img src="https://placehold.co/600x400/png?text=QR+Code+Feature" alt="QR Code Feature" style="border-radius: 10px; margin-bottom: 20px;" />
</div>

- **☁️ Cloud Integration**: Securely store images using Cloudflare R2 and manage data with Neon PostgreSQL.

## 🛠️ Tech Stack

Photospark is built using modern web technologies for performance and reliability:

- **Frontend**: [Next.js 15](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [Framer Motion](https://www.framer.com/motion/)
- **Print server backend**: [Socket.IO](https://socket.io/) (Real-time communication), [Node.js](https://nodejs.org/)
- **Database**: [Neon](https://neon.tech/) (Serverless Postgres) with [Drizzle ORM](https://orm.drizzle.team/)
- **Storage**: [Cloudflare R2](https://www.cloudflare.com/developer-platform/r2/)
- **Processing**: [FFmpeg](https://ffmpeg.org/) (Video processing)
- **Hardware**: Canon SELPHY CP1500 Printer

## 🧩 Project Components

This project consists of multiple components working together:

- **🖥️ Client (port 8080)**: The main photo booth interface where users can take photos, apply filters, and send them to be printed.
- **🖥️ Print server (port 6969)**: Socket.IO server that handles printing requests and video processing.
- **🌐 Web**: Additional web interface component.
- **🛠️ Extras**: Administration tools and additional features.

## Getting Started

### Prerequisites

- **Node.js 18+** (Node.js 20 recommended)
- **npm** or another package manager (yarn/pnpm/bun)
- **Neon PostgreSQL** database account
- **FFmpeg** (for video processing)
- **Windows OS** (required for printing functionality)
- **Canon SELPHY CP1500 printer** ([Amazon Link](https://www.amazon.com/Canon-SELPHY-CP1500-Compact-Printer/dp/B0BF6T86WD))
- **CP1500 ink & paper** ([Amazon Link](https://www.amazon.com/KP-108IN-Cassette-Wireless-Compact-Printer/dp/B079B5LTGW))
- **Webcam** with 720p or higher resolution
- **Modern browser** (Chrome or Firefox recommended)

### Installation

1.  **Clone the Repository**

    ```bash
    git clone https://github.com/caocchinh/photobooth-cp1500.git
    cd photobooth-cp1500
    ```

2.  **Environment Setup**
    Copy the example environment files:

    ```bash
    # Root directory
    cp copy.env .env

    # For each subdirectory
    cd client && cp copy.env .env && cd ..
    cd server && cp copy.env .env && cd ..
    cd extras && cp copy.env .env && cd ..
    ```

    Configure the environment variables in each `.env` file:

    ```env
    # Main environment variables to set
    CLOUDFARE_ACCOUNT_ID=
    R2_ACCESS_KEY_ID=
    R2_SECRET_ACCESS_KEY=
    NEON_DATABASE_URL=
    NEXT_PUBLIC_QR_DOMAIN=https://photospark.online
    NEXT_PUBLIC_SOCKET_URL=http://localhost:6969
    NEXT_PUBLIC_ADMIN_PASSWORD=999999999
    NEXT_PUBLIC_R2_PUBLIC_BUCKET_DEVELOPMENT_URL=
    NEXT_PUBLIC_R2_PUBLIC_BUCKET_PRODUCTION_URL=
    R2_PUBLIC_BUCKET_DEVELOPMENT_NAME=
    R2_PUBLIC_BUCKET_PRODUCTION_NAME=
    ```

3.  **Install Dependencies**

    ```bash
    # Install root dependencies
    npm install

    # Install dependencies for all components
    cd client && npm install && cd ..
    cd server && npm install && cd ..
    cd web && npm install && cd ..
    cd extras && npm install && cd ..
    ```

4.  **Start Development Servers**
    ```bash
    # Start all services at once
    npm run dev
    ```
    This will concurrently start:
    - Client application at [http://localhost:8080](http://localhost:8080)
    - Socket.IO server on port 6969
    - Web interface
    - Extras interface

## 📊 Database Management

```bash
# Generate database migrations
npm run db:generate

# Apply migrations
npm run db:migrate

# Launch Drizzle Studio for database management
npm run db:studio
```

## 🖨️ Printer Setup

### Hardware Requirements

- Canon SELPHY CP1500 printer connected via USB-C
- KP-108IN paper cassette and ink loaded

### Setup Steps

1.  Connect the Canon SELPHY CP1500 to your Windows PC via USB-C cable.
2.  Install the official Canon SELPHY CP1500 drivers from the [Canon website](https://www.canon.com/support/).
3.  Ensure the printer name contains "CP1500" for auto-detection.
4.  Configure the printer for "Japan Hagaki postcard (148x100mm)" paper size.
5.  Test the printer using Canon's utilities before using with the photo booth.

> **Important**: The printer must be connected via USB-C cable (wireless printing not supported) and requires Windows OS.

## 🎥 Video Processing

The application uses FFmpeg for processing recorded videos:

- Speeds up videos by 2x
- Compresses for faster loading
- Converts WebM to MP4 format
- Applies H.264 encoding

**Note**: Make sure FFmpeg is installed and accessible in your system PATH.

## 🛠️ Development Workflows

### Client Development Only

```bash
cd client
npm run dev
```

### Server Development Only

```bash
cd server
npm run dev
```

### Building for Production

```bash
npm run build
```

## 📁 Project Structure

- `/client` - Next.js frontend application
- `/server` - Socket.IO backend print server
- `/web` - Additional web interface
- `/extras` - Admin tools and utilities
- `/client/src/components` - Reusable React components
- `/client/src/lib` - Utility functions and shared logic
- `/client/public` - Static assets including frames and images

## 🔧 Troubleshooting

### Common Issues

#### Webcam Not Working

- Ensure browser has camera permissions
- Refresh the page
- Check if webcam is being used by another application
- Verify webcam drivers are up to date

#### Printer Not Detected

- Verify printer name contains "CP1500"
- Check USB connection
- Restart Windows Print Spooler service:
  ```powershell
  net stop spooler
  net start spooler
  ```
- Reinstall printer drivers

#### Socket.IO Connection Issues

- Check that both client and server are running
- Verify port 6969 is not blocked by firewall
- Check for any CORS issues in browser console

## Hardware Requirements

- Windows PC or laptop with USB-C port
- Minimum 8GB RAM (16GB recommended)
- Intel i5/AMD Ryzen 5 or better processor
- Stable internet connection
- External webcam (1080p recommended for best quality)
- Canon SELPHY CP1500 printer and supplies

## ⚠️ Important Notes

- This application does not support mobile devices for capturing (yet).
- Enter full screen mode for the best experience.
- Designed to work with Canon SELPHY CP1500 printer only.
- Requires Windows OS for printing functionality.

## 📄 License

Distributed under the MIT License. See [LICENSE](LICENSE) for more information.

---

<div align="center">
  Made with ❤️ by <a href="https://github.com/caocchinh">Cao Cự Chính</a>
</div>
