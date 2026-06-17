# Documentation technique brute — Résa

---

## 1. Structure du monorepo

```
resa/
├── src/                          # API NestJS (backend principal)
│   ├── main.ts                   # Bootstrap, port, CORS, prefix global api/v1
│   ├── app.module.ts             # Module racine, TypeORM, ConfigModule
│   ├── health.controller.ts      # GET /health (exclu du prefix api/v1)
│   ├── modules/
│   │   ├── auth/
│   │   ├── logement/
│   │   ├── reservation/
│   │   ├── paiement/
│   │   ├── tenant/
│   │   ├── widget/
│   │   ├── synchronisation/
│   │   └── notification/
│   └── shared/
│       ├── decorators/current-tenant.decorator.ts
│       └── guards/jwt-auth.guard.ts
├── apps/
│   ├── backoffice/               # Frontend admin React/Vite
│   └── widget/                   # Frontend widget React/Vite
├── test/
│   └── jest-e2e.json
├── scripts/
│   └── deploy.sh
├── .github/
│   ├── workflows/ci.yml
│   └── dependabot.yml
├── docs/
├── Dockerfile
├── .dockerignore
├── .eslintrc.js
├── .prettierrc
├── jest.config.js
├── tsconfig.json
├── tsconfig.build.json
├── package.json
└── package-lock.json
```

Chaque module dans src/modules/ suit la même structure interne :
```
<module>/
├── application/use-cases/        # Logique métier (use cases)
├── domain/ports/                 # Interfaces (ports hexagonaux)
├── infrastructure/
│   ├── controllers/              # HTTP handlers NestJS
│   ├── entities/                 # Entités TypeORM
│   ├── repositories/             # Implémentations des ports
│   ├── dtos/                     # Data Transfer Objects
│   └── services/                 # Services techniques
└── <module>.module.ts
```

---

## 2. Modules NestJS

### AuthModule
- Fichier : src/modules/auth/auth.module.ts
- Use cases : LoginUseCase, RegisterUseCase
- Stratégie : JWT via passport-jwt (JwtStrategy)
- Authentification par email + mot de passe hashé bcryptjs
- Retourne un accessToken JWT + expiresAt

### LogementModule
- Fichier : src/modules/logement/logement.module.ts
- Use cases : CreerLogement, ModifierLogement, ListerLogements, ObtenirLogement, ArchiverLogement, UploaderPhoto, SupprimerPhoto, ReordonnerPhotos, UpsertTarifBase, CreerTarifSaisonnier, ModifierTarifSaisonnier, SupprimerTarifSaisonnier, CreerBlocage, SupprimerBlocage, UpsertConfigAcompte, ConfigurerIcal, SynchroniserIcal, VerifierDisponibiliteComplet
- Services : StorageService (AWS S3 stub), IcalFetcherService, NotificationService (stub)
- Entités TypeORM : LogementEntity, PhotoEntity, TarifBaseEntity, TarifSaisonnierEntity, BlocageDatesEntity, ConfigAcompteEntity

### ReservationModule
- Fichier : src/modules/reservation/reservation.module.ts
- Use cases : CreerReservation, AnnulerReservation, CalculerPrix, VerifierDisponibilite
- Services : StripeService (paiement, mode mock si clé absente)
- Entités TypeORM : ReservationEntity, ReservationHoldEntity

### PaiementModule
- Fichier : src/modules/paiement/paiement.module.ts
- Use cases : ConfirmerPaiement, RembourserPaiement
- Entités TypeORM : PaiementEntity
- Ports : IPaiementRepository, IReservationPaiementRepository

### TenantModule
- Fichier : src/modules/tenant/tenant.module.ts
- Use cases : CreerTenant, ListerTenants, ObtenirTenant, ModifierTenant, ModifierStatutTenant
- Entités TypeORM : TenantEntity (statut abonnement : ESSAI, ACTIF, SUSPENDU, EXPIRE)
- DTOs : CreerTenantDto, ModifierTenantDto, ModifierStatutDto

### WidgetModule
- Fichier : src/modules/widget/widget.module.ts
- Use cases : ObtenirConfigWidget, ModifierConfigWidget, RegénérerTokenWidget
- Deux controllers : WidgetController (authentifié, config), PublicWidgetController (public, token)

### SynchronisationModule
- Fichier : src/modules/synchronisation/synchronisation.module.ts
- Statut : stub vide — commentaires indiquent polling iCal toutes les 15 min (Airbnb/Booking)
- Use cases prévus : SynchroniserICalUseCase, DetecterConflitsUseCase (non implémentés)

### NotificationModule
- Fichier : src/modules/notification/notification.module.ts
- Statut : stub vide — commentaires indiquent port sortant AWS SES
- Use cases prévus : EnvoyerConfirmationReservationUseCase, EnvoyerAlerteConflitUseCase (non implémentés)

---

## 3. Routes API

Prefix global : /api/v1 (sauf /health)
Authentification : JWT Bearer token sur toutes les routes sauf auth et widget public

### Health
```
GET    /health
```

### Auth — /api/v1/auth (public)
```
POST   /api/v1/auth/login
POST   /api/v1/auth/register
```

### Logements — /api/v1/logements (JWT requis)
```
GET    /api/v1/logements
GET    /api/v1/logements/:id
POST   /api/v1/logements
PUT    /api/v1/logements/:id
DELETE /api/v1/logements/:id

GET    /api/v1/logements/:id/disponibilites?dateDebut=&dateFin=&nbPersonnes=

POST   /api/v1/logements/:id/photos               (multipart/form-data)
DELETE /api/v1/logements/:id/photos/:photoId
PUT    /api/v1/logements/:id/photos/ordre

GET    /api/v1/logements/:id/tarifs
PUT    /api/v1/logements/:id/tarifs/base
POST   /api/v1/logements/:id/tarifs/saisonniers
PUT    /api/v1/logements/:id/tarifs/saisonniers/:tarifId
DELETE /api/v1/logements/:id/tarifs/saisonniers/:tarifId

GET    /api/v1/logements/:id/blocages
POST   /api/v1/logements/:id/blocages
DELETE /api/v1/logements/:id/blocages/:blocageId

GET    /api/v1/logements/:id/config-acompte
PUT    /api/v1/logements/:id/config-acompte

PUT    /api/v1/logements/:id/ical
POST   /api/v1/logements/:id/ical/synchroniser
GET    /api/v1/logements/:id/ical/export
```

### Réservations — /api/v1/reservations (JWT requis)
```
GET    /api/v1/reservations
GET    /api/v1/reservations/:id
POST   /api/v1/reservations
PATCH  /api/v1/reservations/:id/annuler
```

### Paiements — /api/v1/paiements (JWT requis)
```
POST   /api/v1/paiements/confirmer
POST   /api/v1/paiements/:id/rembourser
```

### Tenants — /api/v1/tenants (JWT requis)
```
GET    /api/v1/tenants
GET    /api/v1/tenants/:id
POST   /api/v1/tenants
PUT    /api/v1/tenants/:id
PATCH  /api/v1/tenants/:id/statut
```

### Widget config — /api/v1/config/widget (JWT requis)
```
GET    /api/v1/config/widget
PUT    /api/v1/config/widget
POST   /api/v1/config/widget/regenerer-token
```

### Widget public — /api/v1/widget/:token (public, token dans URL)
```
GET    /api/v1/widget/:token
GET    /api/v1/widget/:token/logements
GET    /api/v1/widget/:token/disponibilites
GET    /api/v1/widget/:token/blocages
POST   /api/v1/widget/:token/reservations
```

---

## 4. Dépendances principales (depuis package.json)

### dependencies
```
@nestjs/common              ^10.0.0
@nestjs/config              ^3.0.0
@nestjs/core                ^10.0.0
@nestjs/jwt                 ^10.0.0
@nestjs/passport            ^10.0.0
@nestjs/platform-express    ^10.0.0
@nestjs/typeorm             ^10.0.0
bcryptjs                    ^2.4.3
class-transformer           ^0.5.0
class-validator             ^0.14.0
node-ical                   ^0.18.0
passport                    ^0.6.0
passport-jwt                ^4.0.0
pg                          ^8.11.0
reflect-metadata            ^0.1.13
rxjs                        ^7.8.1
stripe                      ^14.0.0
typeorm                     ^0.3.0
```

### devDependencies
```
@nestjs/cli                 ^10.0.0
@nestjs/schematics          ^10.0.0
@nestjs/testing             ^10.0.0
@types/bcryptjs             ^2.4.6
@types/express              ^4.17.17
@types/jest                 ^29.5.2
@types/multer               ^2.1.0
@types/node                 ^20.3.1
@types/passport-jwt         ^3.0.0
@types/supertest            ^2.0.12
@typescript-eslint/eslint-plugin  ^6.0.0
@typescript-eslint/parser   ^6.0.0
eslint                      ^8.42.0
eslint-config-prettier      ^9.0.0
eslint-plugin-prettier      ^5.0.0
jest                        ^29.5.0
prettier                    ^3.0.0
source-map-support          ^0.5.21
supertest                   ^6.3.3
ts-jest                     ^29.1.0
ts-loader                   ^9.4.3
ts-node                     ^10.9.1
tsconfig-paths              ^4.2.0
typescript                  ^5.1.3
```

---

## 5. Applications frontend (apps/)

### apps/backoffice
- Nom package : @resa/backoffice
- Rôle : interface d'administration pour les hébergeurs (gestion logements, réservations, tarifs, paramètres widget)
- Stack : React 19.1.0, TypeScript 5.8.3, Vite 6.3.5
- UI : MUI (Material UI) 7.1.0 + @emotion/react + @emotion/styled
- Dates : @mui/x-date-pickers 9.4.0 + dayjs 1.11.21
- Structure src : App.tsx, main.tsx, components/, pages/, services/, theme/, types.ts
- Build : Vite
- Déploiement : séparé de l'API (non conteneurisé dans le Dockerfile actuel)

### apps/widget
- Nom package : @resa/widget
- Rôle : widget de réservation embarquable dans le site vitrine de l'hébergeur, accès via token public
- Stack : React 19.1.0, TypeScript 5.8.3, Vite 6.3.5
- UI : MUI 7.1.0 + @emotion/react + @emotion/styled
- Dates : @mui/x-date-pickers 8.6.0 + dayjs 1.11.13
- Structure src : App.tsx, main.tsx, components/, pages/, services/, theme/, types.ts
- Différence avec backoffice : version @mui/x-date-pickers différente (8 vs 9)
- Déploiement : séparé de l'API (non conteneurisé dans le Dockerfile actuel)

---

## 6. Variables d'environnement utilisées dans le code

### Utilisées directement (process.env)
| Variable   | Fichier                | Usage                            |
|------------|------------------------|----------------------------------|
| NODE_ENV   | src/main.ts            | CORS origin (* si dev, false si prod) |
| PORT       | src/main.ts            | Port d'écoute du serveur (défaut : 3000) |

### Utilisées via ConfigService.get()
| Variable          | Fichier                                          | Usage                                      |
|-------------------|--------------------------------------------------|--------------------------------------------|
| DATABASE_URL      | src/app.module.ts                                | URL connexion PostgreSQL TypeORM           |
| DATABASE_SSL      | src/app.module.ts                                | SSL TypeORM (true → rejectUnauthorized: false) |
| NODE_ENV          | src/app.module.ts                                | synchronize et logging TypeORM (dev seulement) |
| JWT_SECRET        | src/modules/auth/infrastructure/strategies/jwt.strategy.ts | Clé signature JWT (défaut : 'default-secret') |
| STRIPE_SECRET_KEY | src/modules/reservation/infrastructure/services/stripe.service.ts | Clé API Stripe (mock si vide ou contient '...') |
| AWS_S3_BUCKET     | src/modules/logement/infrastructure/services/storage.service.ts | Nom bucket S3 (défaut : 'resa-dev') |
| AWS_REGION        | src/modules/logement/infrastructure/services/storage.service.ts | Région AWS (défaut : 'eu-west-3') |

### Déclarées dans .env.example mais non trouvées dans le code source actuel
| Variable                    | Description déclarée                     |
|-----------------------------|------------------------------------------|
| JWT_EXPIRES_IN              | Durée validité token JWT                 |
| STRIPE_WEBHOOK_SECRET       | Secret validation webhooks Stripe       |
| AWS_ACCESS_KEY_ID           | Clé IAM AWS (SDK non encore intégré)    |
| AWS_SECRET_ACCESS_KEY       | Secret IAM AWS (SDK non encore intégré) |
| SES_FROM_EMAIL              | Expéditeur emails SES (module stub)     |
| AWS_CLOUDFRONT_URL          | CDN CloudFront (non référencé)          |
| ICAL_SYNC_INTERVAL_MINUTES  | Intervalle sync iCal (module stub)      |
| ADMIN_INITIAL_EMAIL         | Email admin initial (non implémenté)    |
| ADMIN_INITIAL_PASSWORD      | Mot de passe admin initial              |

---

## 7. Dockerfile

Fichier : Dockerfile
Image de base : node:20-alpine

### Stage 1 — builder
```dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
```
- Installe toutes les dépendances (prod + dev)
- Compile le TypeScript avec nest build → génère dist/
- Image utilisée dans le CI pour exécuter les tests (npm run test:cov)
- Taille : ~500MB+ (node_modules complets)

### Stage 2 — production
```dockerfile
FROM node:20-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package*.json ./
RUN npm ci --omit=dev && npm cache clean --force
COPY --from=builder /app/dist ./dist
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1
CMD ["node", "dist/main"]
```
- Repart d'une image alpine propre
- Installe uniquement les dépendances de production (--omit=dev)
- Copie uniquement dist/ depuis le stage builder
- Expose port 3000
- HEALTHCHECK natif Docker sur GET /health
- Commande de démarrage : node dist/main (pas nest start)
- Taille estimée : ~200MB

### .dockerignore (fichiers exclus du build context)
```
node_modules, apps/*/node_modules, dist, .git, .gitignore,
.env, .env.*, coverage, *.log, .vscode, .idea, .DS_Store, .github
```
