# Onboarding — Solution Résa

> **Note sur l'anonymisation** : Ce document a été anonymisé. Toutes les références nominatives (noms de développeurs, URLs de dépôts, identifiants d'organisation) ont été remplacées par "Anonyme" ou "[anonymisé]". Les contacts mentionnés dans les procédures désignent des rôles fonctionnels et non des personnes identifiables.

## C'est quoi la solution Résa ?

La solution Résa est une application construite selon une **architecture hexagonale modulaire** qui permet aux hébergeurs de gérer leurs locations de logements. Elle se compose de trois parties distinctes :

- **L'API REST** (NestJS) — le cœur de la solution, exposée sous le préfixe `/api/v1`. Elle gère l'authentification, les logements, les réservations, les paiements, les tenants et la configuration du widget.
- **Le backoffice** (React/Vite) — l'interface d'administration que les hébergeurs utilisent pour gérer leurs logements, consulter leurs réservations, configurer leurs tarifs et paramétrer le widget.
- **Le widget** (React/Vite) — un composant embarquable dans le site vitrine de l'hébergeur, accessible via un token public, qui permet aux voyageurs de consulter les disponibilités et d'effectuer une réservation directement.

Le backoffice et le widget sont deux applications frontend indépendantes, non conteneurisées dans le Dockerfile actuel — seule l'API est buildée et déployée via le pipeline CI/CD.

## Architecture hexagonale modulaire

Chaque module de l'API suit la même structure interne qui sépare clairement les responsabilités :

```
<module>/
├── application/use-cases/    ← Logique métier pure (indépendante du framework)
├── domain/ports/             ← Interfaces définissant les contrats (ports hexagonaux)
└── infrastructure/
    ├── controllers/          ← Entrées HTTP (adapters entrants)
    ├── repositories/         ← Accès base de données (adapters sortants)
    ├── entities/             ← Entités TypeORM
    ├── dtos/                 ← Objets de transfert de données
    └── services/             ← Services techniques (Stripe, S3, iCal...)
```

Cette structure garantit que la logique métier (use cases) ne dépend jamais directement de NestJS, de la base de données ou de services externes. Elle ne connaît que des interfaces (ports). Cela facilite les tests unitaires (les ports sont mockés) et l'évolution de l'infrastructure sans toucher au métier.

## Prérequis

| Outil      | Version | Utilité                             |
| ---------- | ------- | ----------------------------------- |
| Node.js    | 20.x    | Runtime de l'API                    |
| npm        | 9.x     | Gestionnaire de dépendances         |
| Docker     | 24.x    | Build et exécution du container API |
| Git        | 2.x     | Gestion du code source              |
| PostgreSQL | 16.x    | Base de données (ou via Docker)     |

## Démarrage rapide

```bash
git clone [anonymisé]
cd resa
npm install
cd apps/backoffice && npm install && cd ../..
cd apps/widget && npm install && cd ../..
cp .env.example .env
npm run start:dev
cd apps/backoffice && npm run dev
cd apps/widget && npm run dev
curl http://localhost:3000/health
```

## Variables d'environnement

**Variables utilisées dans le code :**

| Variable            | Fichier                                         | Usage                              | Obligatoire       |
| ------------------- | ----------------------------------------------- | ---------------------------------- | ----------------- |
| `NODE_ENV`          | `src/main.ts`, `src/app.module.ts`              | CORS origin, synchronize TypeORM   | Oui               |
| `PORT`              | `src/main.ts`                                   | Port d'écoute (défaut : 3000)      | Non               |
| `DATABASE_URL`      | `src/app.module.ts`                             | URL connexion PostgreSQL           | Oui               |
| `DATABASE_SSL`      | `src/app.module.ts`                             | SSL TypeORM (true sur Render)      | Non               |
| `JWT_SECRET`        | `src/modules/auth/.../jwt.strategy.ts`          | Clé signature JWT                  | Oui en production |
| `STRIPE_SECRET_KEY` | `src/modules/reservation/.../stripe.service.ts` | Clé API Stripe (mode mock si vide) | Non               |
| `AWS_S3_BUCKET`     | `src/modules/logement/.../storage.service.ts`   | Bucket S3 photos                   | Non               |
| `AWS_REGION`        | `src/modules/logement/.../storage.service.ts`   | Région AWS                         | Non               |

**Variables déclarées mais modules non encore implémentés (stubs) :**

| Variable                                        | Module concerné                   |
| ----------------------------------------------- | --------------------------------- |
| `JWT_EXPIRES_IN`                                | Auth                              |
| `STRIPE_WEBHOOK_SECRET`                         | Paiement                          |
| `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`    | Storage S3                        |
| `SES_FROM_EMAIL`                                | NotificationModule (stub vide)    |
| `AWS_CLOUDFRONT_URL`                            | Storage                           |
| `ICAL_SYNC_INTERVAL_MINUTES`                    | SynchronisationModule (stub vide) |
| `ADMIN_INITIAL_EMAIL`, `ADMIN_INITIAL_PASSWORD` | Non implémenté                    |

## Secrets GitHub à configurer

| Secret         | Utilité                                               |
| -------------- | ----------------------------------------------------- |
| `GITHUB_TOKEN` | Automatique — login GHCR, publication CodeQL et Trivy |

Aucun secret externe requis — le pipeline est entièrement autonome.

## Accessibilité de la documentation

La documentation est versionnée dans le dépôt Git dans le dossier `docs/` — c'est le principe du **doc as code** : la documentation évolue avec le code, est traçable via l'historique Git, et peut être corrigée via une Pull Request comme n'importe quel fichier de code.

**GitHub Pages est activé** sur ce dépôt. La documentation est automatiquement publiée en site web lisible à l'adresse suivante :

`https://[anonymisé].github.io/resa/`

Tout collaborateur avec l'URL peut lire la documentation dans un navigateur sans compte GitHub ni installation. Chaque push sur `main` met à jour le site automatiquement. Pour modifier un document, deux options :

- **Via l'interface web GitHub** : ouvrir le fichier dans le repo, cliquer sur le crayon en haut à droite, éditer directement et créer une PR.
- **En local** : cloner le repo, modifier le fichier `.md` dans `docs/`, commiter et pousser.
