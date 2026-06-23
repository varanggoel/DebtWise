# DebtWise

A single **Next.js 15 + TypeScript** app for tracking debts and simulating Snowball vs
Avalanche payoff strategies — plus a standalone **Streamlit RAG** app
(`rag/`) for AI-powered analysis of financial documents.

## Stack

- **Next.js 15** (App Router) + **TypeScript**
- **NextAuth v5** (Credentials + Google OAuth)
- **MongoDB / Mongoose**
- **Tailwind CSS v4**, lucide-react, recharts, react-hot-toast
- **Streamlit + Gemini** for the document analyzer (`rag/`)

## Project structure

```
src/
  app/
    (auth)/login, (auth)/register      # auth pages
    (dashboard)/                       # protected layout + pages
      dashboard, debts/new, debts/[id]/edit, simulator, analyzer
    api/                               # route handlers
      auth/[...nextauth], register, debts, debts/[id], simulator, alerts
  components/                          # Navbar, DebtCard, DebtForm, AlertBanner, providers
  lib/                                 # db, auth, simulator, alerts
  models/                              # User, Debt (Mongoose)
  types/                               # shared interfaces
rag/                                   # standalone Streamlit app
```

## Running locally

### Next.js app

```bash
cp .env.local.example .env.local   # fill in values
npm install
npm run dev                         # http://localhost:3000
```

Required env vars (see `.env.local.example`): `MONGODB_URI`, `AUTH_SECRET`,
`NEXTAUTH_URL`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `NEXT_PUBLIC_STREAMLIT_URL`.

### Streamlit analyzer

```bash
cd rag
python -m venv .venv
.venv\Scripts\activate              # Windows (use: source .venv/bin/activate on macOS/Linux)
pip install -r requirements.txt
cp .env.example .env                # add GEMINI_API_KEY
streamlit run app.py                # http://localhost:8501
```

## Notes

- The in-app AI services (Gemini/DeepSeek recommendations & chat) were removed and
  decoupled into the Streamlit analyzer, surfaced via the `/analyzer` iframe page.
- Dashboard debt-trap alerts are generated server-side in `src/lib/alerts.ts` and served
  from `GET /api/alerts`.
