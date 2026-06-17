# Cartographie — Architecture de la solution

## C'est quoi le modèle C4 ?

Le modèle C4 est une façon standardisée de représenter l'architecture d'un système à différents niveaux de zoom. Le niveau C1 montre le système dans son environnement global, le niveau C2 détaille les briques internes. Cela permet à n'importe quel collaborateur de comprendre l'architecture sans avoir besoin de lire le code.

## Niveau C1 — Contexte système

```mermaid
C4Context
  title Contexte — Solution Résa

  Person(hebergeur, "Hébergeur", "Gère ses logements et réservations via le backoffice")
  Person(voyageur, "Voyageur", "Consulte les disponibilités et réserve via le widget")
  Person(dev, "Développeur", "Pousse du code sur GitHub")

  System(resa, "Solution Résa", "API REST NestJS (archi hexagonale) + backoffice React + widget React")
  System(cicd, "Pipeline CI/CD", "GitHub Actions — build, tests, qualité, déploiement de l'API")

  System_Ext(ghcr, "GitHub Container Registry", "Stockage des images Docker de l'API")
  System_Ext(stripe, "Stripe", "Traitement des paiements en ligne")
  System_Ext(ical, "Calendriers iCal", "Synchronisation Airbnb / Booking.com")
  System_Ext(ses, "AWS SES", "Envoi d'emails de confirmation (module stub)")
  System_Ext(s3, "AWS S3", "Stockage des photos de logements (service stub)")

  Rel(dev, cicd, "Déclenche via push/PR", "Git")
  Rel(cicd, resa, "Build, teste et déploie l'API", "Docker")
  Rel(cicd, ghcr, "Publie les images Docker", "HTTPS")
  Rel(hebergeur, resa, "Gère via le backoffice", "HTTPS")
  Rel(voyageur, resa, "Réserve via le widget", "HTTPS")
  Rel(resa, stripe, "Traite les paiements", "HTTPS/API")
  Rel(resa, ical, "Synchronise les calendriers", "HTTPS/iCal")
  Rel(resa, ses, "Envoie les confirmations", "HTTPS/SMTP")
  Rel(resa, s3, "Stocke les photos", "HTTPS/S3")
```

## Niveau C2 — Conteneurs de la solution

```mermaid
C4Container
  title Conteneurs — Solution Résa

  Person(hebergeur, "Hébergeur", "")
  Person(voyageur, "Voyageur", "")

  Container(backoffice, "Backoffice", "React 19 + Vite + MUI 7", "Interface d'administration des logements, réservations, tarifs et widget")
  Container(widget, "Widget", "React 19 + Vite + MUI 7", "Widget embarquable — consultation disponibilités et réservation via token public")
  Container(api, "API REST", "NestJS 10 + TypeScript 5", "Logique métier hexagonale — 8 modules, prefix /api/v1")
  ContainerDb(db, "PostgreSQL 16", "Base de données", "Persistence — logements, réservations, paiements, tenants")

  System_Ext(stripe, "Stripe", "")
  System_Ext(s3, "AWS S3", "")

  Rel(hebergeur, backoffice, "Utilise", "HTTPS")
  Rel(voyageur, widget, "Réserve via", "HTTPS")
  Rel(backoffice, api, "Appelle", "REST/JSON + JWT")
  Rel(widget, api, "Appelle", "REST/JSON + token public")
  Rel(api, db, "Lit / écrit", "SQL/TypeORM")
  Rel(api, stripe, "Traite paiements", "HTTPS")
  Rel(api, s3, "Stocke photos", "HTTPS")
```

## Niveau C2 — Conteneurs du pipeline CI/CD

```mermaid
C4Container
  title Conteneurs — Pipeline CI/CD GitHub Actions

  Person(dev, "Développeur", "Pousse du code")

  Container(build, "Job BUILD", "GitHub Actions", "Construit 2 images Docker (builder + production) et les publie sur GHCR")
  Container(test, "Job TEST", "GitHub Actions + Docker", "Tests unitaires et E2E dans le container builder, PostgreSQL en sidecar")
  Container(quality, "Job QUALITY", "GitHub Actions", "ESLint, npm audit, CodeQL SAST, Trivy container scan")
  Container(deploy, "Job DEPLOY", "GitHub Actions + Docker", "Démarre le container de production et valide le healthcheck HTTP /health")

  ContainerDb(ghcr, "GHCR", "GitHub Container Registry", "Images builder et production taguées par SHA de commit")
  ContainerDb(postgres, "PostgreSQL 16", "Service Docker éphémère", "Base de données pour les tests E2E uniquement")

  Rel(dev, build, "Déclenche via push", "Git")
  Rel(build, ghcr, "Push images builder + production", "HTTPS")
  Rel(test, ghcr, "Pull image builder", "HTTPS")
  Rel(test, postgres, "Connexion tests E2E", "SQL")
  Rel(quality, ghcr, "Pull image production pour Trivy", "HTTPS")
  Rel(deploy, ghcr, "Pull image production", "HTTPS")
```

## Flux d'exécution du pipeline

```mermaid
flowchart LR
  push([Push / PR]) --> build

  subgraph "Stage 1"
    build[BUILD\nDockerfile multi-stage\nPush GHCR]
  end

  subgraph "Stage 2 - Parallèle"
    test[TEST\nTests unitaires Jest\nTests E2E Supertest\nRapport couverture]
    quality[QUALITY\nESLint\nnpm audit\nCodeQL\nTrivy]
  end

  subgraph "Stage 3 - main only"
    deploy[DEPLOY\nStart container prod\nHealthcheck GET /health]
  end

  build --> test
  build --> quality
  test --> deploy
  quality --> deploy
```
