# Gouvernance

## RACI du pipeline CI/CD

| Activité                                 | Développeur | Chef de projet | DevOps | PO  |
| ---------------------------------------- | ----------- | -------------- | ------ | --- |
| Écriture du code applicatif              | R           | A              | C      | I   |
| Modification du pipeline YAML            | R           | A              | C      | I   |
| Validation d'une PR                      | C           | A              | R      | I   |
| Merge sur `main`                         | C           | A              | R      | I   |
| Mise à jour des dépendances (Dependabot) | R           | A              | C      | I   |
| Correction d'une alerte CodeQL / Trivy   | R           | A              | C      | I   |
| Mise à jour de la documentation          | R           | A              | C      | I   |

## Conventions de nommage

**Branches :**

| Type          | Format                  | Exemple                         |
| ------------- | ----------------------- | ------------------------------- |
| Feature       | `feature/[description]` | `feature/ajout-paiement-stripe` |
| Fix           | `fix/[description]`     | `fix/healthcheck-timeout`       |
| CI/CD         | `ci/[description]`      | `ci/ajout-trivy`                |
| Documentation | `docs/[description]`    | `docs/runbook-pipeline`         |

**Commits (Conventional Commits) :**

| Préfixe  | Usage                   | Exemple                                   |
| -------- | ----------------------- | ----------------------------------------- |
| `feat:`  | Nouvelle fonctionnalité | `feat: ajout endpoint POST /reservations` |
| `fix:`   | Correction de bug       | `fix: correction healthcheck timeout`     |
| `ci:`    | Modification pipeline   | `ci: ajout scan Trivy`                    |
| `docs:`  | Documentation           | `docs: ajout runbook pipeline`            |
| `test:`  | Tests                   | `test: ajout tests E2E reservations`      |
| `chore:` | Maintenance             | `chore: mise à jour dépendances npm`      |

## Definition of Done

- [ ] Code commité et poussé sur la branche de feature
- [ ] Pipeline CI/CD vert (BUILD + TEST + QUALITY)
- [ ] Tests unitaires couvrent les nouveaux cas nominaux, d'erreur et limites
- [ ] ESLint : 0 erreur, 0 warning
- [ ] Si nouvelle décision technique structurante : ADR rédigé
- [ ] Si nouvelle procédure opérationnelle : runbook mis à jour
- [ ] PR ouverte avec description claire
- [ ] PR approuvée par le chef de projet
- [ ] Merge sur `main` déclenche un pipeline vert jusqu'au job DEPLOY

## Doc as code

Toute la documentation est versionnée dans Git dans le dossier `docs/` au même titre que le code source. GitHub Pages est activé sur ce dépôt et publie automatiquement la documentation à l'adresse `https://[anonymisé].github.io/resa/` — accessible à tous les collaborateurs sans compte GitHub ni installation.

Structure du dossier `docs/` :

```
docs/
├── README.md                   ← Index GitHub Pages
├── onboarding/
│   └── index.md                ← Présentation, démarrage rapide, variables d'env
├── cartographie/
│   └── index.md                ← Diagrammes C4, flux du pipeline
├── design/
│   ├── index.md                ← Index des ADRs
│   ├── ADR-001-github-actions.md
│   ├── ADR-002-dockerfile-multi-stage.md
│   ├── ADR-003-deploiement-docker-runner.md
│   └── ADR-004-codeql-trivy-devsecops.md
├── reference/
│   ├── modules-api.md          ← Modules API, frontends, outils pipeline
│   └── qualite-securite.md     ← Rapport qualité & sécurité (ESLint, CodeQL, Trivy)
├── how-to/
│   └── pipeline-en-echec.md    ← Runbook : pipeline en échec
└── gouvernance/
    └── index.md                ← RACI, conventions, Definition of Done
```
