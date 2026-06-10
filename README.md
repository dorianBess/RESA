# Résa — Plateforme SaaS de réservation de logements touristiques

> Épreuve EC02-P1 — EADL RNCP39765 — Juin 2026

## Présentation

Résa permet aux petites structures d'hébergement (gîtes, chambres d'hôtes, appartements) de proposer une réservation directe depuis leur site vitrine via un widget HTML intégrable en copier-coller.

## Architecture

Pattern hexagonal (Ports & Adapters) — monolithe modulaire NestJS.

```
src/
├── modules/
│   ├── logement/           # Catalogue, planning, tarifs
│   ├── reservation/        # Réservations, disponibilités, ReservationHold
│   ├── paiement/           # Stripe, acomptes, remboursements
│   ├── widget/             # Génération et personnalisation du widget
│   ├── synchronisation/    # Worker iCal Airbnb/Booking
│   └── notification/       # Emails transactionnels (AWS SES)
└── shared/
    ├── guards/             # JWT Guard, Tenant Guard
    ├── decorators/         # @CurrentTenant, @WidgetToken
    └── filters/            # Exception filters globaux
```

Chaque module respecte la structure :
```
module/
├── domain/
│   └── ports/              # Interfaces (contrats) — jamais de dépendances infra
├── application/
│   └── use-cases/          # Logique métier pure — testable sans base de données
└── infrastructure/
    ├── controllers/        # Port entrant REST
    ├── entities/           # Entités TypeORM
    └── repositories/       # Port sortant — implémentation concrète
```

## Prérequis

- Node.js >= 20
- PostgreSQL >= 16
- npm >= 10

## Installation

```bash
# Cloner le dépôt
git clone https://github.com/votre-org/resa.git
cd resa

# Installer les dépendances
npm install

# Copier et remplir les variables d'environnement
cp .env.example .env
# Éditer .env avec vos valeurs
```

## Démarrage en développement

```bash
# Lancer PostgreSQL (Docker)
docker run --name resa-db \
  -e POSTGRES_USER=resa \
  -e POSTGRES_PASSWORD=resa \
  -e POSTGRES_DB=resa_dev \
  -p 5432:5432 -d postgres:16

# Lancer l'API en mode watch
npm run start:dev
```

L'API est disponible sur `http://localhost:3000/api/v1`.

## Tests

```bash
# Tests unitaires
npm run test

# Tests unitaires avec couverture (cible : ≥ 80%)
npm run test:cov

# Tests end-to-end
npm run test:e2e

# Mode watch
npm run test:watch
```

### Stripe en développement local

Les webhooks Stripe nécessitent une URL publique. Utiliser le Stripe CLI :

```bash
# Installer le Stripe CLI
brew install stripe/stripe-cli/stripe  # macOS

# Rediriger les webhooks vers l'API locale
stripe listen --forward-to localhost:3000/api/v1/paiement/webhook
```

## CI/CD

Le pipeline GitHub Actions (`.github/workflows/ci.yml`) s'exécute à chaque push sur `main` et `develop` et à chaque Pull Request :

| Étape | Commande | Description |
|---|---|---|
| Lint | `npm run lint` | ESLint + Prettier |
| Tests unitaires | `npm run test:cov` | Jest avec couverture ≥ 80% |
| Tests E2E | `npm run test:e2e` | Tests d'intégration sur PostgreSQL |
| Build | `npm run build` | Compilation TypeScript |

## Conventions Git

- **Branches** : `feature/nom`, `fix/nom`, `docs/nom`
- **Commits** : format conventionnel — `feat:`, `fix:`, `docs:`, `chore:`, `test:`
- **Pull Requests** : revue obligatoire par 1 autre membre avant merge sur `main`

## Variables d'environnement

Voir `.env.example` pour la liste complète. Les variables obligatoires sont :

| Variable | Description |
|---|---|
| `DATABASE_URL` | URL de connexion PostgreSQL |
| `JWT_SECRET` | Secret de signature des tokens JWT |
| `STRIPE_SECRET_KEY` | Clé secrète Stripe |
| `STRIPE_WEBHOOK_SECRET` | Secret de validation des webhooks Stripe |

## Équipe

| Membre | Rôle |
|---|---|
| Membre 1 | Chef de projet |
| Membre 2 | Développeur back-end |
| Membre 3 | Développeur front-end |

---

*Projet réalisé dans le cadre de la certification EADL RNCP39765 — ESN81 — Juin 2026*
