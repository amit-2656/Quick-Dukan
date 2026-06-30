# Smart Dukaan 🏪

A smart billing and inventory management app for small shop owners, with barcode scanning (simulated), voice input (simulated), automatic stock tracking, and low-stock alerts.

## Project Structure

```
smart-dukaan/
├── backend/          → Node.js + Express + SQLite API server
│   ├── server.js      (all API routes)
│   ├── db.js           (database setup, uses the built-in node:sqlite module)
│   └── package.json
├── frontend/         → Static HTML/CSS/JS (no build step required)
│   └── index.html
└── README.md
```
## Images
# Dashboard
<img width="1900" height="918" alt="Screenshot 2026-06-30 132055" src="https://github.com/user-attachments/assets/1c6e5557-ccbb-4245-bc86-4c86f51dafe8" />
# stock
<img width="1862" height="822" alt="Screenshot 2026-06-30 132129" src="https://github.com/user-attachments/assets/5a29035f-0c12-418b-9e86-b666ee58d394" />


## Features
- 📊 Dashboard — today's sales, total bills, low stock alerts
- 🧾 Billing — build a cart, generate a bill, stock auto-deducts
- 📦 Stock management — view products, add/delete items
- 📷 Barcode scan (simulated demo)
- 🎤 Voice input (simulated demo — recognizes a few sample voice commands)

## Tech Stack

- **Backend:** Node.js, Express, SQLite (using the built-in `node:sqlite` module — requires Node 22.5+, no extra native dependency needed)
- **Frontend:** Plain HTML/CSS/JavaScript (no framework or build step)

## Local Setup

### 1. Run the backend

```bash
cd backend
npm install
npm start
```

The server runs on `http://localhost:3000`. On first run, it automatically creates a `dukaan.db` file and seeds a few demo products.

### 2. Open the frontend

Open `frontend/index.html` directly in your browser (double-click it), or serve it with any simple static server:

```bash
cd frontend
npx serve .
```

By default the frontend connects to `http://localhost:3000/api` (see the `API_BASE_URL` variable in `frontend/index.html` — update it if your backend runs on a different URL/port).

## API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Server health check |
| GET | `/api/products` | Get all products |
| POST | `/api/products` | Add a new product |
| PUT | `/api/products/:id` | Update a product |
| DELETE | `/api/products/:id` | Delete a product |
| POST | `/api/bills` | Generate a bill (auto-deducts stock) |
| GET | `/api/bills` | Get recent bills |
| GET | `/api/stats` | Dashboard stats (today's sales, low stock, etc.) |

## Deployment

- **Backend:** Deploy to Railway, Render, or any Node.js host (free tiers available)
- **Frontend:** Deploy to Netlify, Vercel, or GitHub Pages — just update `API_BASE_URL` to point to your deployed backend URL

## License

MIT
