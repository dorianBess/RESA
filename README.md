# Résa — Plateforme SaaS de réservation de logements touristiques

## Présentation

Résa est une plateforme SaaS multi-tenant qui permet aux hébergeurs (gîtes, chambres d'hôtes, appartements) de gérer leurs logements et de recevoir des réservations directement depuis leur site vitrine.

Le projet se compose de trois applications :

| Application    | Rôle                                           | Port par défaut |
| -------------- | ---------------------------------------------- | --------------- |
| **API NestJS** | Backend REST, logique métier, base de données  | `3001`          |
| **Backoffice** | Interface d'administration pour les hébergeurs | `5173`          |
| **Widget**     | Formulaire de réservation intégrable en iframe | `5174`          |

Le parcours utilisateur final est : accéder au widget → choisir un logement → sélectionner des dates → soumettre une demande de réservation.

---

## Architecture

Le backend suit le **pattern hexagonal (Ports & Adapters)** dans une architecture monolithe modulaire NestJS.

```
src/
├── modules/
│   ├── auth/               # Authentification JWT
│   ├── logement/           # Catalogue, planning, tarifs, blocages de dates
│   ├── reservation/        # Réservations, disponibilités, ReservationHold
│   ├── paiement/           # Stripe, acomptes, remboursements
│   ├── widget/             # Configuration et endpoints publics du widget
│   ├── tenant/             # Gestion des comptes hébergeurs (multi-tenant)
│   ├── synchronisation/    # Worker iCal Airbnb/Booking
│   └── notification/       # Emails transactionnels (AWS SES)
└── shared/
    ├── guards/             # JwtAuthGuard, TenantGuard
    └── decorators/         # @CurrentTenant, @WidgetToken
```

Chaque module suit la même structure interne :

```
module/
├── domain/
│   └── ports/              # Interfaces (contrats) — aucune dépendance infrastructure
├── application/
│   └── use-cases/          # Logique métier pure, testable sans base de données
└── infrastructure/
    ├── controllers/        # Contrôleurs REST (ports entrants)
    ├── entities/           # Entités TypeORM
    └── repositories/       # Implémentations des ports sortants
```

Les deux frontends sont des applications **React + Vite + Material UI** dans `apps/` :

```
apps/
├── backoffice/             # React 19, MUI 7, @mui/x-date-pickers
└── widget/                 # React 19, MUI 7, @mui/x-date-pickers, dayjs
```

---

## Prérequis

- **Node.js** >= 20
- **npm** >= 10
- **PostgreSQL** >= 16 (local ou Docker)

---

## Installation

```bash
# 1. Cloner le dépôt
git clone https://github.com/dorianBess/resa.git
cd resa

# 2. Installer les dépendances (backend + frontends)
npm install
cd apps/backoffice && npm install && cd ../..
cd apps/widget && npm install && cd ../..

# 3. Configurer les variables d'environnement
cp .env.example .env                                    # Backend
cp apps/backoffice/.env.example apps/backoffice/.env    # Backoffice
cp apps/widget/.env.example     apps/widget/.env        # Widget

# Éditer .env avec vos valeurs (DATABASE_URL, JWT_SECRET, etc.)
```

> **Important — membres de l'équipe :** les fichiers `.env` ne sont pas versionnés.
> Chaque développeur doit créer les siens depuis les `.env.example`.
> Si vous n'êtes pas sur la même machine que le backend, remplacez `localhost`
> par l'IP de la machine hôte (ex : `http://192.168.1.42:3001/api/v1`).

---

## Démarrage

### Base de données (Docker)

```bash
docker run --name resa-db \
  -e POSTGRES_USER=resa \
  -e POSTGRES_PASSWORD=resa \
  -e POSTGRES_DB=resa_dev \
  -p 5432:5432 -d postgres:16
```

### Backend (API NestJS)

```bash
# Depuis la racine du projet
npm run start:dev
```

L'API démarre sur **`http://localhost:3001/api/v1`**.  
Le schéma de base de données est synchronisé automatiquement au démarrage (`synchronize: true`).

### Backoffice

```bash
cd apps/backoffice
npm run dev
```

Accessible sur **`http://localhost:5173`**.

### Widget

```bash
cd apps/widget
npm run dev
```

Accessible sur **`http://localhost:5174?token=<tokenPublicWidget>`**.  
Le token est disponible dans le backoffice, section **Widget**.

---

## Tests

```bash
# Tests unitaires
npm run test

# Tests unitaires avec couverture
npm run test:cov

# Mode watch
npm run test:watch

# Tests end-to-end
npm run test:e2e
```

Les tests couvrent principalement les use-cases métier (`src/modules/*/application/use-cases/*.spec.ts`).
