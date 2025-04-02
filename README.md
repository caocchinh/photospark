# PhotoBooth CP1500 📸

A modern photo booth application built with Next.js and Socket.IO that offers real-time photo capture, custom frames, Instagram-style filters, and direct printing to Canon SELPHY CP1500 printers.

## 🌟 Features

- 📸 Real-time photo capture with webcam support
- 🖼️ Multiple theme options (PROM, Usagyuuun)
- ✨ 30+ Instagram-style filters
- 🎞️ Custom frame layouts (single and double formats)
- 🖨️ Direct printing support for Canon SELPHY CP1500
- 🎥 Video recording and processing capabilities
- 🔄 Real-time preview and editing
- 🌐 Socket.IO integration for real-time communication
- ☁️ Cloudflare R2 integration for image storage
- 🎨 Tailwind CSS with custom UI components
- 🚀 Smooth animations powered by Framer Motion

## 📋 Prerequisites

- Node.js 18+ (Node.js 20 recommended)
- npm or another package manager (yarn/pnpm/bun)
- Neon PostgreSQL database account
- FFmpeg (for video processing)
- Windows OS (required for printing functionality)
- Canon SELPHY CP1500 printer ([Amazon Link](https://www.amazon.com/Canon-SELPHY-CP1500-Compact-Printer/dp/B0BF6T86WD))
- CP1500 ink & paper ([Amazon Link](https://www.amazon.com/KP-108IN-Cassette-Wireless-Compact-Printer/dp/B079B5LTGW))
- Webcam with 720p or higher resolution
- Modern browser (Chrome or Firefox recommended)

## 🚀 Quick Start Guide

### 1. Clone the Repository

```bash
git clone https://github.com/ChinCao/photobooth-cp1500.git
cd photobooth-cp1500
```

### 2. Environment Setup

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

```
# Main environment variables to set
CLOUDFARE_ACCOUNT_ID=your_cloudflare_account_id
R2_ACCESS_KEY_ID=your_r2_access_key
R2_SECRET_ACCESS_KEY=your_r2_secret_key
NEON_DATABASE_URL=your_neon_database_url
```

### 3. Install Dependencies

```bash
# Install root dependencies
npm install

# Install dependencies for all components
cd client && npm install && cd ..
cd server && npm install && cd ..
cd web && npm install && cd ..
cd extras && npm install && cd ..
```

### 4. Start Development Servers

```bash
# Start all services at once
npm run dev
```

This will concurrently start:

- Client application at [http://localhost:8080](http://localhost:8080)
- Socket.IO server on port 6969
- Web interface
- Extras interface

## 🧩 Project Components

This project consists of multiple components working together:

### 📱 Client (port 8080)

The main photo booth interface where users can take photos, apply filters, and send them to be printed.

### 🖥️ Server (port 6969)

Socket.IO server that handles printing requests and video processing.

### 🌐 Web

Additional web interface component.

### 🛠️ Extras

Administration tools and additional features.

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

1. Connect the Canon SELPHY CP1500 to your Windows PC via USB-C cable
2. Install the official Canon SELPHY CP1500 drivers from the [Canon website](https://www.canon.com/support/)
3. Ensure the printer name contains "CP1500" for auto-detection
4. Configure the printer for "Japan Hagaki postcard (148x100mm)" paper size
5. Test the printer using Canon's utilities before using with the photo booth

> **Important**: The printer must be connected via USB-C cable (wireless printing not supported) and requires Windows OS.

## 🎥 Video Processing

The application uses FFmpeg for processing recorded videos:

- Speeds up videos by 2x
- Compresses for faster loading
- Converts WebM to MP4 format
- Applies H.264 encoding

Make sure FFmpeg is installed and accessible in your system PATH.

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
  ```
  net stop spooler
  net start spooler
  ```
- Reinstall printer drivers

#### Socket.IO Connection Issues

- Check that both client and server are running
- Verify port 6969 is not blocked by firewall
- Check for any CORS issues in browser console

## 📱 Hardware Requirements

- Windows PC or laptop with USB-C port
- Minimum 8GB RAM (16GB recommended)
- Intel i5/AMD Ryzen 5 or better processor
- Stable internet connection
- External webcam (1080p recommended for best quality)
- Canon SELPHY CP1500 printer and supplies

## ⚠️ Important Notes

- This application does not support mobile devices for capturing (yet).
- Enter full screen mode for the best experience
- Designed to work with Canon SELPHY CP1500 printer only
- Requires Windows OS for printing functionality

## 📄 License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

© 2024 [@ChinCao](https://github.com/ChinCao). All rights reserved.

## 🙏 Acknowledgments

- Developed by [@ChinCao](https://github.com/ChinCao)
- Sponsored by VECTR
