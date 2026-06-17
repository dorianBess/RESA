# Référence — Description détaillée

## Modules de l'API

| Module                    | Use cases                                                                       | Entités TypeORM                                                                                              | Statut                          |
| ------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------- |
| **AuthModule**            | LoginUseCase, RegisterUseCase                                                   | —                                                                                                            | Implémenté                      |
| **LogementModule**        | 17 use cases (CRUD, photos, tarifs, blocages, iCal, disponibilités)             | LogementEntity, PhotoEntity, TarifBaseEntity, TarifSaisonnierEntity, BlocageDatesEntity, ConfigAcompteEntity | Implémenté                      |
| **ReservationModule**     | CreerReservation, AnnulerReservation, CalculerPrix, VerifierDisponibilite       | ReservationEntity, ReservationHoldEntity                                                                     | Implémenté                      |
| **PaiementModule**        | ConfirmerPaiement, RembourserPaiement                                           | PaiementEntity                                                                                               | Implémenté                      |
| **TenantModule**          | CreerTenant, ListerTenants, ObtenirTenant, ModifierTenant, ModifierStatutTenant | TenantEntity (ESSAI, ACTIF, SUSPENDU, EXPIRE)                                                                | Implémenté                      |
| **WidgetModule**          | ObtenirConfigWidget, ModifierConfigWidget, RegénérerTokenWidget                 | —                                                                                                            | Implémenté                      |
| **SynchronisationModule** | SynchroniserICalUseCase, DetecterConflitsUseCase                                | —                                                                                                            | Stub — polling iCal 15min prévu |
| **NotificationModule**    | EnvoyerConfirmationReservationUseCase, EnvoyerAlerteConflitUseCase              | —                                                                                                            | Stub — AWS SES prévu            |

## Applications frontend

|              | Backoffice                                  | Widget                                      |
| ------------ | ------------------------------------------- | ------------------------------------------- |
| Package      | `@resa/backoffice`                          | `@resa/widget`                              |
| Rôle         | Administration hébergeur                    | Réservation voyageur                        |
| Stack        | React 19.1.0, TypeScript 5.8.3, Vite 6.3.5 | React 19.1.0, TypeScript 5.8.3, Vite 6.3.5 |
| UI           | MUI 7.1.0 + Emotion                         | MUI 7.1.0 + Emotion                         |
| Dates        | @mui/x-date-pickers 9.4.0 + dayjs           | @mui/x-date-pickers 8.6.0 + dayjs           |
| Accès API    | JWT Bearer token                            | Token public dans l'URL                     |
| Conteneurisé | Non                                         | Non                                         |

## Outils du pipeline — Justification des choix

| Outil             | Version      | Rôle                         | Pourquoi ce choix                                                                                                                                                                     | Continue on error |
| ----------------- | ------------ | ---------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| **Docker Buildx** | latest       | Build images multi-stage     | Support natif du cache multicouche (`type=gha`) — les layers déjà construits sont réutilisés sur les runs suivants, réduisant le temps de build                                       | Non               |
| **GHCR**          | natif GitHub | Registre d'images Docker     | Intégré à GitHub, authentification via `GITHUB_TOKEN` automatique, visibilité contrôlée par les permissions du repo                                                                   | Non               |
| **Jest**          | 29.x         | Tests unitaires + couverture | Framework standard NestJS, intégration native `ts-jest` pour TypeScript, génération rapports de couverture HTML et JSON                                                               | Non               |
| **Supertest**     | 6.3.3        | Tests E2E HTTP               | Appelle l'API HTTP réelle sans démarrer un vrai serveur, s'intègre directement avec NestJS `INestApplication`                                                                         | Oui               |
| **PostgreSQL**    | 16-alpine    | BDD tests E2E                | Service Docker éphémère — chaque run repart d'une base propre sans données parasites                                                                                                  | Non               |
| **ESLint**        | 8.42.0       | Linter TypeScript            | Standard écosystème NestJS/TypeScript, seuil `--max-warnings 0` pour zéro tolérance                                                                                                  | Non               |
| **npm audit**     | natif npm    | Audit dépendances            | Outil natif Node.js, compare l'arbre de dépendances complet contre la base CVE npm. `continue-on-error` car dépendances transitives non corrigeables sans breaking change             | Oui               |
| **CodeQL**        | v3           | SAST TypeScript              | Natif GitHub, aucun compte externe, publie en Security > Code scanning, queries `security-and-quality` couvrent injections, XSS, exposition de données sensibles                      | Non               |
| **Trivy**         | 0.71.1       | Container scan + secret scan | Scanner open source, analyse CVE packages Alpine et Node.js + secrets dans l'image, publie en SARIF. `continue-on-error` car CVE Alpine non corrigeables sans changer d'image de base | Oui               |
| **Dependabot**    | natif GitHub | Surveillance dépendances     | Surveillance continue entre les runs — PR automatiques chaque lundi, mises à jour `minor` et `major` uniquement (patch ignorés pour réduire le bruit)                                 | N/A               |
