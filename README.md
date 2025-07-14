# HDI Property Visualization Interface

A React TypeScript application for visualizing Houston properties as interactive geometric shapes on a grid canvas.

## 🚀 Features

- **Interactive Property Grid**: HTML5 Canvas rendering with smooth pan/zoom
- **Property Search**: Full-width search bar with autocomplete suggestions
- **Property Details Panel**: Slides in from right showing HCAD + AI market data
- **Leads Management**: Expandable folder for tracking property leads
- **Dark Theme**: Professional HDI color scheme with cyan accents

## 🎨 Property Types

- **Residential**: Teal squares
- **Commercial**: Blue rectangles  
- **Land**: Green polygons
- Size based on property value

## 🛠️ Tech Stack

- React 18 + TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- Framer Motion for animations
- HTML5 Canvas for grid rendering

## 📊 Mock Data

Currently uses 10 mock Houston properties for development. Ready for integration with:
- PostgreSQL database (1.77M properties)
- Flask API endpoints
- Perplexity AI for $0 value estimation

## 🔗 API Integration Ready

The interface is designed to connect to your Railway deployment with endpoints:
- `/api/v1/properties/search` - Property search with autocomplete
- `/api/v1/properties/{address}` - Detailed property information
- `/api/v1/properties/nearby` - Nearby properties for grid display

## 🚀 Deployment

Optimized for Vercel deployment with production build configuration.

## 🎯 Usage

1. Click property shapes to view details
2. Search Houston addresses for instant results
3. Add properties to leads collection
4. Pan/zoom around the interactive grid
5. Manage leads with status tracking

Built for Houston Data Intelligence (HDI) property visualization and lead management.

## 🏃‍♂️ Development

```bash
npm install
npm run dev
```

## 🏗️ Build

```bash
npm run build
```