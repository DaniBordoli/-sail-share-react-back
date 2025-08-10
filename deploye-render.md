# Render Deployment Blueprint for D-Unit

This document summarises the exact steps and configuration we implemented to deploy **both** the FastAPI backend and the Vite/React frontend on [Render](https://render.com).  Follow this as a blueprint to reproduce the same workflow for another project (or let an LLM automate the process).

---

## 1. Repository Layout

```
D-Unit/
├── backend/   # FastAPI application (Python)
└── frontend/  # Vite + React static site
```

*Both* services live in the **same GitHub repository** and are deployed from *different directories* using Render’s *monorepo* support.

---

## 2. render.yaml (monorepo specification)

Place this file at the repository root.  Render automatically reads it and provisions the services.

```yaml:render.yaml
services:
  - type: web
    name: dunit-backend
    runtime: python
    repo: https://github.com/Nahuel149/D-Unit.git   # <-- your fork/URL
    branch: main
    rootDir: backend
    buildCommand: pip install --upgrade pip && pip install -r requirements.txt
    startCommand: uvicorn main:app --host 0.0.0.0 --port $PORT

  - type: web
    name: dunit-frontend
    runtime: static
    repo: https://github.com/Nahuel149/D-Unit.git   # <-- your fork/URL
    branch: main
    rootDir: frontend
    buildCommand: npm ci && npm run build
    staticPublishPath: dist
    envVars:
      - key: VITE_API_URL
        fromService:
          type: web
          name: dunit-backend         # resolves to dunit-backend URL in production
          envVarKey: RENDER_EXTERNAL_URL
        previewValue: "https://dunit-backend-pr-{{ PR_NUMBER }}.onrender.com"
```

### How it works

| Section | Purpose |
| ------- | ------- |
| `rootDir` | Tells Render which sub-folder to build. |
| `buildCommand`/`staticPublishPath` | Standard build for Python & Vite static site. |
| `envVars` (`fromService`) | Injects the backend’s public URL into the frontend **automatically**. |
| `previewValue` | Overrides the variable during PR previews so each preview frontend points to its matching preview backend (<code>dunit-backend-pr-999.onrender.com</code>). |

---

## 3. Automatic Pull-Request Previews

1. In Render **Dashboard → Settings → Previews**, choose **Automatic** for both services.
2. No additional YAML is needed—the same `render.yaml` works for previews.
3. Each PR creates two preview URLs:
   * `https://dunit-backend-pr-<PR_NUMBER>.onrender.com`
   * `https://dunit-frontend-pr-<PR_NUMBER>.onrender.com`

---

## 4. CORS Adaptation (Backend)

FastAPI middleware updated to accept any Render preview origin:

```python:backend/middleware/cors.py
middleware = CORSMiddleware(
    allow_origins=settings.CORS_ORIGINS,
    allow_origin_regex=r"https://.*\.onrender\.com$",   # Accept ALL *.onrender.com
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Why?** Every PR preview lives on a unique subdomain (`*.onrender.com`).  Whitelisting the entire pattern avoids manual updates per preview.

---

## 5. Branch Workflow & Deployment

1. **Main** holds production code.
2. **Feature branches** trigger previews automatically thanks to the YAML.
3. Upon merging to *main*, Render redeploys production services.
4. We committed the CORS patch to both `main` and feature branches to keep environments consistent.

---

## 6. Step-by-Step Blueprint for Another Project

1. **Monorepo?** Keep `backend/` and `frontend/` (or similar) in the same repo.
2. **Create `render.yaml`** mirroring the structure above; adjust:
   * Service names (`<project>-backend`, `<project>-frontend`).
   * `rootDir`, runtime, build/start commands.
   * `previewValue` pattern (<code><project>-backend-pr-{{ PR_NUMBER }}.onrender.com</code>).
3. **Backend**: Add a permissive CORS rule for `*.onrender.com`.
4. **Frontend**: Read backend base URL from env var (here `VITE_API_URL`).
5. **Push to GitHub** → Create services in Render (import from repo).  Render auto-detects `render.yaml` and sets everything up.
6. **Enable Automatic Previews** for each service.
7. **Profit** – every PR spins up fully networked preview stacks without extra work.

---

## 7. Troubleshooting

| Symptom | Solution |
| ------- | -------- |
| *CORS errors on preview* | Ensure backend’s `allow_origin_regex` includes `*.onrender.com`. |
| Frontend can’t reach backend | Confirm `previewValue` pattern matches the backend preview subdomain. |
| Preview env var missing | The key under `envVars` **must** match runtime variable consumed by code (`VITE_API_URL` in this example). |

Poner en el render para el backend 
  CORS_ORIGINS=["https://dunit-frontend.onrender.com","https://dunit-frontend-pr-*.onrender.com"]
y para el frontend:
VITE_API_URL=["https://dunit-backend.onrender.com", "https://dunit-backend-pr-*.onrender.com"]
