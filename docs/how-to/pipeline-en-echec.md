# How-To — Runbook : Pipeline en échec

**Owner** : Anonyme | **Criticité** : Moyenne | **Durée estimée** : 5 à 15 min

> **Contacts** : Dans ce runbook, "responsable backend" désigne le développeur référent de l'API NestJS, "responsable frontend" désigne le développeur référent des applications React, et "chef de projet" désigne le responsable technique global. Ces rôles sont anonymisés — se référer à l'annuaire interne du projet pour les identifier.

## Symptômes déclencheurs

- Un job apparaît en rouge dans GitHub Actions
- Une PR est bloquée par un check en échec
- Le badge de statut pipeline affiche "failing"

## Étape 1 — Identifier le job en échec

1. Aller dans l'onglet **Actions** du repo GitHub
2. Cliquer sur le run en rouge
3. Identifier le job marqué d'une croix rouge
4. Cliquer dessus pour voir les logs détaillés
5. Identifier le step exact en échec

## Étape 2 — Diagnostiquer selon le job

**Si BUILD échoue :**

| Symptôme              | Cause probable                  | Action                                                                                                            |
| --------------------- | ------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `npm ci` échoue       | `package-lock.json` non commité | Corriger si vous connaissez (`npm install` puis commiter le lockfile), sinon contacter le **responsable backend** |
| `docker build` échoue | Erreur Dockerfile               | Corriger si vous connaissez (lire le message Docker), sinon contacter le **responsable backend**                  |
| Push GHCR échoue      | Permissions insuffisantes       | Corriger si vous connaissez (vérifier `packages: write`), sinon contacter le **chef de projet**                   |

**Si TEST échoue :**

| Symptôme                | Cause probable              | Action                                                                                                              |
| ----------------------- | --------------------------- | ------------------------------------------------------------------------------------------------------------------- |
| `docker pull` échoue    | Image builder non publiée   | Vérifier que BUILD a réussi, sinon contacter le **responsable backend**                                             |
| Test unitaire échoue    | Régression dans le code     | Corriger si vous connaissez (lire le message Jest), sinon contacter le **responsable backend**                      |
| `postgres` injoignable  | Service sidecar non démarré | Corriger si vous connaissez (vérifier le bloc `services:` dans le YAML), sinon contacter le **responsable backend** |
| Couverture insuffisante | Tests manquants             | Corriger si vous connaissez (ajouter des tests), sinon contacter le **responsable backend**                         |

**Si QUALITY échoue :**

| Symptôme            | Cause probable                 | Action                                                                                             |
| ------------------- | ------------------------------ | -------------------------------------------------------------------------------------------------- |
| ESLint : erreurs    | Non-conformité du code         | Corriger si vous connaissez (`npm run lint` en local), sinon contacter le **responsable backend**  |
| CodeQL : alertes    | Vulnérabilité dans le code     | Corriger si vous connaissez (Security > Code scanning), sinon contacter le **responsable backend** |
| Trivy : exit code 1 | CVE critique ou secret détecté | Corriger si vous connaissez (Security > Code scanning), sinon contacter le **responsable backend** |

**Si DEPLOY échoue :**

| Symptôme                          | Cause probable                              | Action                                                                                                             |
| --------------------------------- | ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| Healthcheck KO                    | L'API ne démarre pas                        | Corriger si vous connaissez (logs du container en fin de job), sinon contacter le **responsable backend**          |
| `docker pull` échoue              | Image production non publiée                | Vérifier que BUILD a réussi, sinon contacter le **responsable backend**                                            |
| `GET /health` ne retourne pas 200 | Route health manquante ou base inaccessible | Corriger si vous connaissez (`health.controller.ts` et `DATABASE_URL`), sinon contacter le **responsable backend** |

## Étape 3 — Corriger et relancer

```bash
git add .
git commit -m "fix: description du correctif"
git push
```

Relancer sans modification (erreur ponctuelle) : GitHub Actions > run concerné > **Re-run failed jobs**

## Étape 4 — Rollback si nécessaire

```bash
# Option 1 — Revert propre (recommandé)
git revert HEAD
git push origin main

# Option 2 — Reset (perd l'historique, à éviter sur main)
git reset --hard HEAD~1
git push origin main --force
```

## Escalade

Si non résolu après 15 minutes, contacter le **chef de projet**. Inclure : lien vers le run en échec, screenshot des logs du step en erreur, dernières modifications sur la branche.
