# Rustic Den Buying

A Next.js web application for buying DVDs and media. Users can scan barcodes or enter UPC codes to instantly see product information and purchase pricing based on current inventory levels.

## Features

- **Manual UPC Entry**: Type in UPC codes directly
- **Barcode Scanning**: Use your device camera to scan barcodes on DVD cases
- **Real-time Product Lookup**: Integration with UPC Database API
- **Dynamic Pricing**: Purchase prices adjust based on inventory levels
  - High demand items (0-5 in stock): $8.00
  - Medium demand items (6-15 in stock): $5.00
  - Low demand items (16-30 in stock): $3.00
  - Oversupplied items (30+ in stock): $1.00

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure API Key

Get your API key from [UPC Database](https://upcdatabase.org/account/api), then add it to `.env.local`:

```bash
UPC_API_KEY=your_api_key_here
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project Structure

```
app/
├── api/
│   ├── lookup-upc/    # UPC Database API integration
│   └── pricing/       # Pricing calculation endpoint
├── layout.js          # Root layout with metadata
└── page.js            # Main application page

components/
├── SearchInput.js     # Manual UPC entry component
├── BarcodeScanner.js  # Camera-based barcode scanning
└── ProductDisplay.js  # Product information and pricing display

lib/
└── inventory.js       # Inventory management and pricing logic
```

## How It Works

1. User enters a UPC code or scans a barcode
2. App queries UPC Database API for product information
3. App checks local inventory to determine pricing tier
4. Product information and purchase price are displayed

## Camera Permissions

The barcode scanner requires camera access. When you first use the scan feature, your browser will prompt you to allow camera permissions.

## Build for Production

```bash
npm run build
npm start
```

## Deploy on Vercel

The easiest way to deploy is using [Vercel](https://vercel.com/new). Make sure to add your `UPC_API_KEY` environment variable in the Vercel project settings.
# rustic-den-buying
