# GarmentCalc — Garment Costing & TNA Tool

GarmentCalc is a professional, free-to-use tool designed for garment merchandisers and production managers. It simplifies the complex process of FOB costing and Time & Action (TNA) calendar management.

## 🚀 Features

- **FOB Costing Calculator**: Detailed breakdown of fabric, trims, manufacturing, and commercial costs with algebraic profit/drawback logic.
- **TNA Calendar**: Dynamic milestone generation based on shipment dates and lead times with real-time status tracking.
- **Quick Formulas**: Instant calculators for Fabric Consumption, Line Efficiency, and Production Capacity.
- **Local Persistence**: All data is auto-saved locally in your browser. No server-side storage required.
- **Export Options**: Generate professional PDF cost sheets and TNA calendars directly from the browser.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS
- **Animations**: Motion (Framer Motion)
- **Icons**: Lucide React
- **Date Handling**: date-fns
- **PDF Generation**: jsPDF & autoTable

## 📦 Deployment on Vercel

This project is ready for one-click deployment on Vercel.

1. Push this code to a GitHub repository.
2. Connect the repository to Vercel.
3. Vercel will automatically detect the Vite configuration and deploy the app.

### Environment Variables

If you use features requiring API keys, add the following to your Vercel project settings:
- `VITE_TRIAL_KEY_A`
- `VITE_TRIAL_KEY_B`

## 📄 License

MIT License - feel free to use and modify for your professional needs.
