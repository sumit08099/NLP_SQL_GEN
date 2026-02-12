# 🎨 NLP SQL Master - Frontend

Modern React-based frontend for the NLP SQL Master platform. Built with **React 19**, **Vite 7**, and **TailwindCSS v4** for a premium, glassmorphic user experience.

## 🌟 Features

- **Data Upload Interface**: Drag-and-drop CSV/Excel file ingestion
- **Real-time Chat**: Interactive conversation with the AI
- **Schema Explorer**: Live view of database structure
- **SQL Visualization**: See generated queries with syntax highlighting
- **Results Display**: Clean table rendering with pagination
- **Dark Theme**: Modern glassmorphism design with smooth animations

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
Access at [http://localhost:5173](http://localhost:5173)

### Build for Production
```bash
npm run build
npm run preview
```

## 📦 Tech Stack

- **React 19.2.0** - Latest React with concurrent features
- **Vite 7.3.1** - Lightning-fast build tool
- **TailwindCSS 4.1.18** - Utility-first CSS framework (v4 beta)
- **Axios** - HTTP client for API calls
- **Lucide React** - Beautiful icon library

## 🎨 Design System

### Color Palette
- **Primary**: Purple gradient (`#8b5cf6` to `#7c3aed`)
- **Background**: Slate 950 (`#0f172a`)
- **Surface**: Slate 900/800 with glassmorphism
- **Text**: White to Slate 400 gradient

### Key Components
- **Sidebar**: Data ingestion + schema explorer
- **Chat Area**: Message bubbles with SQL and results
- **Input Bar**: Floating input with send button

## 🔧 Configuration

### API Endpoint
Update in `src/App.jsx`:
```javascript
const API_BASE_URL = 'http://localhost:8000';
```

### Tailwind Config
See `tailwind.config.js` for custom theme extensions.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── App.jsx           # Main application component
│   ├── index.css         # Global styles + Tailwind imports
│   └── main.jsx          # React entry point
├── public/               # Static assets
├── index.html            # HTML template
├── package.json          # Dependencies
├── vite.config.js        # Vite configuration
├── tailwind.config.js    # Tailwind configuration
└── postcss.config.js     # PostCSS configuration
```

## 🎯 Key Features Explained

### File Upload
- Accepts `.csv`, `.xlsx`, `.xls` files
- Auto-generates table name from filename
- Shows upload progress and success/error states

### Chat Interface
- Displays user queries and AI responses
- Shows generated SQL in code blocks
- Renders query results in tables
- Auto-scrolls to latest message

### Schema Explorer
- Fetches schema on component mount
- Updates after successful file upload
- Displays table structures in monospace font

## 🐛 Troubleshooting

### Blank Screen
- Check browser console for errors
- Ensure backend is running on port 8000
- Verify CORS is enabled in backend

### Tailwind Not Working
- Ensure `@tailwindcss/postcss` is installed
- Check `postcss.config.js` is present
- Restart dev server after config changes

### API Errors
- Verify `API_BASE_URL` matches backend
- Check network tab for failed requests
- Ensure backend is accessible

## 📄 License

MIT License - Part of NLP SQL Master project

## 👨‍💻 Author

**Sumit Karan**
