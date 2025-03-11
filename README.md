# Photo Booth Application 📸

A modern photo booth application built with Next.js and Socket.IO, featuring real-time photo capture, custom frames, and image filters.

## Table of Contents

- [Features](#features)
- [Prerequisites](#prerequisites)
- [Quick Start Guide](#quick-start-guide)
- [Environment Setup](#environment-setup)
- [Installation](#installation)
- [Development](#development)
- [Database Management](#database-management)
- [Printer Setup](#printer-setup)
- [Video Processing](#video-processing)
- [Animations and Transitions](#animations-and-transitions)
- [Project Structure](#project-structure)
- [Technologies Used](#technologies-used)
- [Troubleshooting](#troubleshooting)
- [License](#license)
- [Acknowledgments](#acknowledgments)

## Features

- 📸 Real-time photo capture with webcam support
- 🖼️ Multiple theme options (PROM, Usagyuuun)
- ✨ 30+ Instagram-style filters
- 🎞️ Custom frame layouts (single and double formats)
- 🔄 Real-time preview and editing
- 🌐 Socket.IO integration for real-time communication
- ☁️ Cloudflare R2 integration for image storage
- 🎨 Tailwind CSS with custom UI components
- 🚀 Smooth animations powered by Framer Motion
- 🖨️ Direct printing support for Canon SELPHY CP1500

## Prerequisites

- Node.js 18+ (Node.js 20 recommended)
- npm/yarn/pnpm/bun
- Neon PostgreSQL database account
- FFmpeg (for video processing)
- Windows OS (for printing functionality)
- Canon SELPHY CP1500 printer ([Product Link](https://www.amazon.com/Canon-SELPHY-CP1500-Compact-Printer/dp/B0BF6T86WD))
- Canon SELPHY CP1500 ink & paper ([Product Link](https://www.amazon.com/KP-108IN-Cassette-Wireless-Compact-Printer/dp/B079B5LTGW))
- Webcam with 720p or higher resolution
- Modern browser (Chrome or Firefox recommended)

## Quick Start Guide

1. **Clone the repository:**

   ```bash
   git clone https://github.com/yourusername/photo-booth.git
   cd photo-booth
   ```

2. **Set up environment variables:**

   ```bash
   cp copy.env .env
   ```

   Then edit the `.env` file with your credentials

3. **Install dependencies and start development servers:**

   ```bash
   npm install
   npm run dev
   ```

4. **Access the application:**
   Open your browser and navigate to [http://localhost:8080](http://localhost:8080)

## Environment Setup

1. Copy the example environment file:

```bash
cp copy.env .env
```

2. Configure the following environment variables:

```bash
CLOUDFARE_ACCOUNT_ID=cloudfare_CLOUDFARE_ACCOUNT_ID
R2_ACCESS_KEY_ID=r2_access_key
R2_SECRET_ACCESS_KEY=r2_secret_key
NEON_DATABASE_URL=neon_NEON_DATABASE_URL
```

## Installation

1. Install client dependencies:

```bash
cd client
npm install
```

2. Install server dependencies:

```bash
cd server
npm install
```

3. Install root project dependencies (optional):

```bash
npm install
```

## Development

1. Start the client development server:

```bash
cd client
npm run dev
```

The client will be available at [http://localhost:8080](http://localhost:8080)

2. Start the server:

```bash
cd server
npm run dev
```

OR IF YOU WANT TO START THE CLIENT AND SERVER SIMULTANEOUSLY:

```bash
npm run dev
```

The Socket.IO server will run on port 6969 and the client will be available at [http://localhost:8080](http://localhost:8080)

## Database Management

Generate database migrations:

```bash
npm run db:generate
```

Apply migrations:

```bash
npm run db:migrate
```

Launch Drizzle Studio:

```bash
npm run db:studio
```

## Printer Setup

The application is designed to work with the Canon SELPHY CP1500 photo printer. This compact printer offers:

- High-quality 300x300 DPI photo printing
- Support for postcard size (148x100mm)
- Borderless printing capability
- Direct USB-C connectivity
- Dye-sublimation printing technology for professional quality prints

### Printer Installation Steps:

1. Connect the Canon SELPHY CP1500 to your Windows PC via USB-C cable
2. Install the official Canon SELPHY CP1500 drivers from the [Canon website](https://www.canon.com/support/)
3. Ensure the printer name contains "CP1500" for auto-detection
4. Configure the printer for "Japan Hagaki postcard (148x100mm)" paper size
5. Test the printer using Canon's utilities before using with the photo booth

Printer Requirements:

1. Must be connected via USB-C cable (wireless printing not supported)
2. Windows OS required (not compatible with macOS or Linux)
3. Printer name must contain "CP1500" for auto-detection
4. Windows Print Spooler service must be running and properly configured
5. Paper type must be set to "Japan Hagaki postcard (148x100mm)"

## Video Processing

The application uses FFmpeg for video processing with the following optimizations:

- Speeds up recorded videos by 2x
- Compresses videos for faster loading
- Converts WebM to MP4 format
- Applies H.264 encoding for broad compatibility
- Maintains quality while reducing file size

FFmpeg must be installed and accessible in the system PATH for video processing to work.

## Animations and Transitions

This project utilizes [Framer Motion](https://motion.dev/) to create smooth and performant animations and page transitions. Framer Motion is used throughout the application to enhance the user experience with animated transitions, loading effects, and interactive UI elements.

## Project Structure

- `/client` - Next.js frontend application
- `/server` - Socket.IO backend print server
- `/public` - Static assets including frames and images
- `/src/components` - Reusable React components
- `/src/lib` - Utility functions and shared logic
- `/src/constants` - Application constants and configurations

## Technologies Used

- [Next.js](https://nextjs.org/) - React framework
- [Socket.IO](https://socket.io/) - Real-time communication
- [Tailwind CSS](https://tailwindcss.com/) - Styling
- [shadcn/ui](https://ui.shadcn.com/) - UI components
- [Drizzle ORM](https://orm.drizzle.team/) - Database ORM
- [Cloudflare R2](https://www.cloudflare.com/products/r2/) - Image storage
- [TypeScript](https://www.typescriptlang.org/) - Type safety
- [Neon](https://neon.tech) - Serverless Postgres database
- [Framer Motion](https://www.framer.com/motion/) - Animations and transitions

## Troubleshooting

### Common Issues

#### Webcam Not Working

- Ensure browser has camera permissions
- Try refreshing the page
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

#### Image Upload Failures

- Verify Cloudflare R2 credentials in `.env` file
- Check network connectivity
- Ensure database connection is working

#### Database Connection Issues

- Verify Neon database URL in `.env` file
- Check if IP is allowlisted in Neon dashboard
- Run database migrations

### Getting Help

If you encounter issues not covered here, please check the GitHub issues page or contact the developers directly.

## Deployment

### Production Setup

1. Build the client:

   ```bash
   cd client
   npm run build
   ```

2. Build the server:

   ```bash
   cd server
   npm run build
   ```

3. Start the production services:
   ```bash
   npm run start:prod
   ```

### Hardware Requirements for Production

- Windows PC or laptop with USB-C port
- Minimum 8GB RAM, 16GB recommended
- Intel i5/AMD Ryzen 5 or better processor
- Stable internet connection
- External webcam (1080p recommended for best quality)
- Sufficient disk space for image storage (minimum 10GB)

## Updates and Maintenance

### Updating the Application

1. Pull the latest changes:

   ```bash
   git pull
   ```

2. Install any new dependencies:

   ```bash
   npm install
   ```

3. Apply database migrations:

   ```bash
   npm run db:migrate
   ```

4. Restart the application

### Backing Up Data

It's recommended to regularly back up your Neon database and Cloudflare R2 storage.

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

© 2024 [@ChinCao](https://github.com/ChinCao). All rights reserved.

## Acknowledgments

- Developed by [@ChinCao](https://github.com/ChinCao) and sponsored by VECTR.
- All rights reserved to [@ChinCao](https://github.com/ChinCao).
- Does not support mobile devices.
- Enter full screen mode for a better experience.
