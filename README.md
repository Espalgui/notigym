# NotiGym - Track Your Gains

Application web de suivi sportif complet avec tracking des performances, nutrition, mensurations et communaute.

## Stack Technique

| Couche | Tech |
|--------|------|
| Frontend | React 18, Vite, Tailwind CSS, Recharts, Framer Motion |
| Backend | Python FastAPI, SQLAlchemy 2.0 (async), Alembic |
| Database | PostgreSQL 16 |
| Auth | JWT (access + refresh tokens) |
| Infra | Docker Compose, Nginx, Cloudflare Tunnel |

## Lancement Local (Dev)

```bash
# 1. Cloner et configurer
git clone https://github.com/CyberDev-IT/notigym.git
cd notigym
cp .env.example .env
# Editer .env si besoin

# 2. Lancer
docker compose up --build

# 3. Acceder
# Frontend : http://localhost:5173
# API docs : http://localhost:8000/docs
# API health : http://localhost:8000/api/health
```

## Fonctionnalites

- **Auth** : Inscription, connexion, JWT, profils prives/publics
- **Dashboard** : Vue d'ensemble, graphiques, actions rapides
- **Entrainements** : Programmes custom, logging de seances en temps reel, PRs
- **Suivi corporel** : Pesees, mensurations, photos avant/apres
- **Nutrition** : Calories, macros, objectifs, historique, suivi d'eau
- **Communaute** : Fil d'actualite, likes, commentaires, partage de progres
- **Multilingue** : FR + EN, choix au premier lancement
- **237+ exercices** pre-remplis (FR/EN)

## Structure

```
notigym/
├── api/                 # Backend FastAPI
│   ├── app/
│   │   ├── models/      # SQLAlchemy models
│   │   ├── schemas/     # Pydantic schemas
│   │   ├── routers/     # API endpoints
│   │   ├── auth/        # JWT auth
│   │   ├── main.py      # App entry point
│   │   └── seed.py      # Exercise library seed
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/            # React SPA
│   ├── src/
│   │   ├── pages/       # Route pages
│   │   ├── components/  # UI components
│   │   ├── stores/      # Zustand stores
│   │   ├── lib/         # API client, utils, i18n
│   │   └── locales/     # FR + EN translations
│   ├── Dockerfile
│   └── package.json
├── nginx/               # Reverse proxy (prod)
├── docker-compose.yml   # Dev
└── docker-compose.prod.yml
```

## API Endpoints

| Route | Description |
|-------|------------|
| `POST /api/auth/register` | Inscription |
| `POST /api/auth/login` | Connexion |
| `GET /api/users/me` | Profil utilisateur |
| `GET/POST /api/body/measurements` | Mensurations |
| `GET/POST /api/body/photos` | Photos de progression |
| `GET /api/exercises` | Bibliotheque d'exercices |
| `CRUD /api/workouts/programs` | Programmes |
| `CRUD /api/workouts/sessions` | Seances |
| `GET /api/workouts/stats` | Statistiques |
| `GET /api/workouts/records` | Records personnels |
| `CRUD /api/nutrition/entries` | Journal alimentaire |
| `GET /api/nutrition/summary` | Resume du jour |
| `GET /api/community/feed` | Fil d'actualite |
