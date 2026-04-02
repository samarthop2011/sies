# SIES - Result Management System

**Satyajeet International English School** — A modern, full-stack school result management system.

## 🚀 Tech Stack

- **Frontend:** React 18 + Vite + Tailwind CSS v3 + Framer Motion
- **Backend:** Node.js + Express.js
- **Database:** MongoDB (Mongoose)
- **Auth:** JWT (JSON Web Tokens)
- **Charts:** Chart.js + react-chartjs-2
- **File Upload:** Multer (local storage)
- **PDF Export:** jsPDF + jspdf-autotable
- **Icons:** Lucide React

## 📁 Project Structure

```
sies/
├── client/          # React frontend
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── context/      # Auth & Theme providers
│   │   ├── layouts/      # Dashboard layout
│   │   ├── pages/        # All page components
│   │   ├── services/     # API layer
│   │   └── utils/        # Helpers & constants
│   └── ...
├── server/          # Express backend
│   ├── config/      # DB connection
│   ├── controllers/ # Route handlers
│   ├── middleware/   # Auth, roles, upload, errors
│   ├── models/      # Mongoose schemas
│   ├── routes/      # API routes
│   └── uploads/     # Uploaded files
└── .env             # Environment variables
```

## 🛠️ Setup & Run Locally

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd sies

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 2. Configure Environment

Edit `.env` in the root folder:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sies
JWT_SECRET=your_super_secret_key_change_this
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### 3. Seed Demo Data

```bash
cd server
npm run seed
```

This creates demo accounts:
| Role | Email | Password |
|------|-------|----------|
| Principal | principal@sies.edu | password123 |
| Teacher | anjali@sies.edu | password123 |
| Student | student1@sies.edu | password123 |

### 4. Run Development Servers

```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

Open http://localhost:5173

## 🎨 Features

### 👨‍🎓 Student
- View exam results with animated progress bars
- Subject-wise marks, total, percentage, grade
- Download results as PDF
- View uploaded exam papers
- Performance charts

### 👩‍🏫 Teacher
- Upload student marks (bulk)
- Upload exam papers (drag & drop)
- Manage student records
- Filter by class/section

### 🏛️ Principal
- Full analytics dashboard
- Class comparison charts
- Top students leaderboard
- Manage teachers & students
- Export reports as PDF

### 🎨 Design
- Light/Dark mode
- Glassmorphism UI
- Framer Motion animations
- Fully responsive
- Premium look & feel

## 🌐 VPS Deployment

See the deployment guide in `DEPLOYMENT.md` or the implementation plan.

## 📝 Subjects

Mathematics, Science, English, Hindi, Marathi, Social Studies, Computer Science

## 📜 License

MIT
