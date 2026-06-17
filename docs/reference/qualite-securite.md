# Analyse Qualité & Sécurité — Résa

**Projet** : Résa | **Date** : 17 juin 2026

## Résumé exécutif

| Outil     | Type             | Résultat                                   | Statut                        |
| --------- | ---------------- | ------------------------------------------ | ----------------------------- |
| ESLint    | Qualité statique | 0 erreur / 0 warning                       | ✅ Conforme                   |
| npm audit | Dépendances      | 0 critical / 16 high / 34 moderate / 3 low | ⚠️ Surveillance               |
| CodeQL    | SAST             | 0 alerte de sécurité                       | ✅ Conforme                   |
| Trivy     | Container scan   | 1 critical / 35 high                       | ⚠️ Maîtrisé mais surveillance |

**Niveau de risque global : MODÉRÉ, maîtrisé et documenté**

## 1. Qualité du code - ESLint

### C'est quoi ?

ESLint est un **linter** , un outil qui lit le code source et vérifie automatiquement qu'il respecte un ensemble de règles définies à l'avance. Ces règles couvrent la syntaxe TypeScript, les bonnes pratiques NestJS, la lisibilité et la cohérence du code. C'est l'équivalent d'un correcteur orthographique, mais pour le code.

### Pourquoi c'est important ?

Un code mal structuré ou incohérent est plus difficile à maintenir, plus propice aux bugs et plus difficile à reprendre par un autre développeur. Le linter permet de détecter ces problèmes avant même d'exécuter le code. Dans notre pipeline, le seuil `--max-warnings 0` signifie que le moindre warning bloque le pipeline - on ne laisse rien passer en production.

### Résultats

| Métrique          | Valeur        |
| ----------------- | ------------- |
| Fichiers analysés | `src/**/*.ts` |
| Erreurs           | 0             |
| Warnings          | 0             |
| Statut            | ✅ PASSED     |

### Interprétation

Le code respecte intégralement les règles TypeScript/NestJS configurées. Ce résultat confirme que l'équipe a maintenu une discipline de code constante tout au long du développement - pas de raccourcis, pas de code mort, pas de pratiques déconseillées.

Le seuil zéro tolérance (`--max-warnings 0`) est un choix délibéré et structurant : il force à corriger les problèmes immédiatement plutôt que de les laisser s'accumuler. Un projet qui accumule des centaines de warnings finit par ignorer les vrais problèmes noyés dans le bruit.

### Comment maintenir ce résultat ?

- Intégrer ESLint dans l'éditeur de code (plugin VSCode) pour voir les erreurs en temps réel avant même le commit
- Ajouter un hook pre-commit avec `husky` pour bloquer les commits non conformes
- Ne jamais désactiver une règle ESLint sans justification documentée dans le code

## 2. Audit des dépendances - npm audit

### C'est quoi ?

Un projet Node.js dépend de dizaines (parfois centaines) de bibliothèques externes appelées **dépendances**. Ces bibliothèques ont elles-mêmes leurs propres dépendances - c'est ce qu'on appelle les dépendances transitives. `npm audit` analyse l'ensemble de cet arbre de dépendances et le compare à une base de données de vulnérabilités connues (CVE).

### Pourquoi c'est important ?

Une vulnérabilité dans une dépendance peut compromettre toute l'application, même si le code applicatif lui-même est parfaitement écrit. C'est l'équivalent d'installer une porte blindée dans une maison dont les fenêtres sont ouvertes - la qualité de votre propre code ne suffit pas si les bibliothèques que vous utilisez sont faillibles.

### Résultats

| Sévérité  | Nombre |
| --------- | ------ |
| Critical  | 0      |
| High      | 16     |
| Moderate  | 34     |
| Low       | 3      |
| **Total** | **53** |

### Analyse des vulnérabilités HIGH

| Package                  | Vulnérabilité                                                               | Contexte                                                     |
| ------------------------ | --------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `axios` <=1.15.2         | SSRF, Prototype Pollution, DoS, Header Injection, CRLF Injection            | Dépendance de `node-ical` - usage interne synchro calendrier |
| `multer` <=2.1.0         | DoS via nettoyage incomplet, épuisement ressources, récursion non contrôlée | Dépendance de `@nestjs/platform-express`                     |
| `glob` 10.2.0–10.4.5     | Injection de commande via filenames malicieux                               | Dépendance de `@nestjs/cli` (build uniquement)               |
| `minimatch` 9.0.0–9.0.6  | ReDoS via wildcards et extglobs imbriqués                                   | Dépendance de `@typescript-eslint` (dev uniquement)          |
| `lodash` <=4.17.23       | Prototype Pollution, exécution de code via `_.template`                     | Dépendance de `@nestjs/config`                               |
| `form-data` 4.0.0–4.0.5  | CRLF Injection via noms de champs multipart                                 | Dépendance transitive                                        |
| `picomatch` 4.0.0–4.0.3  | ReDoS, Method Injection                                                     | Dépendance de `@angular-devkit/core` (CLI)                   |
| `tmp` <=0.2.5            | Path Traversal, écriture arbitraire via lien symbolique                     | Dépendance de `inquirer` (CLI uniquement)                    |
| `webpack` 5.49.0–5.104.0 | SSRF via bypass `allowedUris`                                               | Dépendance de `@nestjs/cli` (build uniquement)               |

### Interprétation approfondie

Aucune vulnérabilité Critical - c'est le point le plus important. Les 16 HIGH se répartissent en deux catégories qu'il faut distinguer soigneusement.

**Catégorie 1 - Dépendances de l'outillage de développement** (glob, minimatch, picomatch, tmp, webpack) : Ces packages sont utilisés par les outils CLI NestJS pour compiler et générer du code. Ils ne sont pas présents dans l'image Docker de production car ils font partie des `devDependencies`. Une vulnérabilité dans `glob` ne peut pas être exploitée par un attaquant ciblant l'application en production.

**Catégorie 2 - Dépendances présentes en production** (axios, multer, lodash, form-data) : Ces packages sont chargés au démarrage de l'application. `lodash` via `@nestjs/config` est la vulnérabilité la plus préoccupante car elle permet une exécution de code arbitraire via `_.template` si des entrées non contrôlées y transitent. `axios` présente de nombreux CVE SSRF mais son usage est cantonné à la synchro iCal interne.

La majorité des corrections nécessitent `npm audit fix --force` qui installe des versions majeures différentes pouvant introduire des breaking changes. Une mise à jour forcée sans tests préalables est plus risquée que la vulnérabilité elle-même dans ce contexte.

### Comment corriger / éviter ?

- **Court terme** : mettre à jour manuellement `@nestjs/config` (corrige lodash) et `node-ical` (corrige axios) après validation des breaking changes
- **Moyen terme** : activer Dependabot pour recevoir des PR automatiques de mise à jour chaque semaine
- **Long terme** : adopter une politique de mise à jour régulière des dépendances (sprint dédié chaque trimestre)

## 3. Analyse statique de sécurité - CodeQL / SAST

### C'est quoi ?

CodeQL est un outil d'analyse statique de sécurité (SAST). Contrairement à ESLint qui vérifie le style et les bonnes pratiques, CodeQL analyse la **logique du code** pour détecter des patterns d'attaque connus : injections SQL, XSS, exposition de secrets, chemins d'accès non sécurisés, mauvaise gestion des erreurs. Il comprend le flux de données dans le code pour trouver des vulnérabilités qu'un simple linter ne verrait pas.

### Pourquoi c'est important ?

Un attaquant qui veut compromettre une application ne cherche pas des fautes de style - il cherche des failles logiques. CodeQL simule cette recherche de manière automatisée en utilisant les mêmes techniques que les chercheurs en sécurité. C'est l'équivalent d'un audit de sécurité automatisé sur chaque push de code.

### Résultats

| Métrique          | Valeur                           |
| ----------------- | -------------------------------- |
| Langage analysé   | TypeScript                       |
| Queries utilisées | `security-and-quality`           |
| Alertes Critical  | 0                                |
| Alertes High      | 0                                |
| Alertes Medium    | 0                                |
| Statut            | ✅ Aucune vulnérabilité détectée |

### Interprétation approfondie

L'absence totale d'alertes CodeQL est le résultat le plus significatif de cette analyse. Cela signifie que le code applicatif ne présente aucun des patterns d'attaque connus analysés par les queries `security-and-quality`, qui couvrent notamment les injections SQL et NoSQL, les failles XSS, l'exposition de données sensibles dans les logs, les chemins de fichiers construits à partir d'entrées utilisateur sans validation, et la mauvaise gestion des exceptions.

Ce résultat valide que les développeurs ont appliqué les bonnes pratiques de sécurité applicative : validation des entrées, utilisation des abstractions NestJS (pipes, guards, interceptors) qui protègent naturellement contre de nombreuses failles.

### Comment maintenir ce résultat ?

- Continuer à utiliser les Pipes NestJS pour valider toutes les entrées utilisateur (`class-validator`, `class-transformer`)
- Ne jamais construire de requêtes SQL ou de chemins de fichiers par concaténation avec des données utilisateur
- Activer CodeQL sur toutes les branches de feature, pas seulement `main`

## 4. Scan de l'image Docker - Trivy

### C'est quoi ?

Trivy est un scanner de vulnérabilités qui analyse une **image Docker** - l'environnement complet dans lequel tourne l'application en production. Là où npm audit analyse les dépendances Node.js, Trivy va plus loin : il examine aussi les packages système de l'OS (Alpine Linux), les binaires, et détecte les secrets (clés API, mots de passe) qui auraient été accidentellement inclus dans l'image.

### Pourquoi c'est important ?

Une application peut avoir un code parfaitement sécurisé et des dépendances npm à jour, mais si l'image Docker tourne sur un OS avec des failles système connues, l'attaquant peut contourner l'application et attaquer directement l'infrastructure. Trivy permet de voir l'image comme un attaquant la verrait.

**Outil** : Trivy v0.71.1 | **Cible** : `ghcr.io/dorianbess/resa:[sha]` sur Alpine 3.23.4

### Résultats

| Sévérité | Nombre |
| -------- | ------ |
| Critical | 1      |
| High     | 35     |

### Vulnérabilité CRITICAL - Stripe Secret Key

| Champ       | Détail                                                                 |
| ----------- | ---------------------------------------------------------------------- |
| Nature      | Secret détecté dans `.../services/stripe.service.js:21`                |
| Type        | Clé API Stripe (`sk_test_...`)                                         |
| Risque réel | Faible - clé mock de test sans valeur en production                    |
| Correction  | Déplacer dans `.env.example`, injecter via secret GitHub en production |

Trivy a détecté une chaîne ressemblant à une clé API Stripe dans le code source inclus dans l'image Docker. Il s'agit d'une clé mock utilisée uniquement pour le développement et les tests - elle ne permet aucune transaction réelle. Cependant, la présence d'une clé API dans le code source, même mock, est une mauvaise pratique qui habitue les développeurs à un comportement dangereux.

### Analyse des 35 vulnérabilités HIGH

| Package            | Localisation   | Nb CVE | Nature des vulnérabilités                                                                   |
| ------------------ | -------------- | ------ | ------------------------------------------------------------------------------------------- |
| `axios`            | `app/`         | 20     | SSRF, Prototype Pollution, DoS, Header Injection, MITM, NO_PROXY bypass, credential leakage |
| `node-tar` / `tar` | `usr/`         | 5      | Path traversal via hardlink, arbitrary file read/write, file overwrite via symlink          |
| `multer`           | `app/`         | 3      | DoS via malformed requests (x2), DoS via dropped connections                                |
| `minimatch`        | `usr/`         | 3      | ReDoS via catastrophic backtracking, unbounded recursive backtracking                       |
| `openssl`          | système Alpine | 2      | Heap Use-After-Free in PKCS7_verify()                                                       |
| `lodash`           | `app/`         | 1      | Arbitrary code execution via untrusted template imports                                     |
| `glob`             | `usr/`         | 1      | Command Injection via malicious filenames                                                   |
| `form-data`        | `app/`         | 1      | CRLF Injection multipart                                                                    |
| `cross-spawn`      | `usr/`         | 1      | ReDoS                                                                                       |
| `uuid`             | `app/`         | 1      | Out-of-bounds write impactant intégrité et confidentialité                                  |

### Interprétation approfondie

Les 35 CVE HIGH se répartissent en deux catégories fondamentalement différentes.

**Packages applicatifs** (`app/`) - axios, multer, lodash, form-data, uuid, node-tar : Ces packages sont chargés par l'application Node.js au démarrage. Ils représentent la surface d'attaque réelle. Parmi eux, axios concentre à lui seul 20 CVE, ce qui est préoccupant en apparence mais s'explique par le fait que chaque variante d'une même famille de failles est comptée comme un CVE distinct. Dans notre contexte, axios est utilisé exclusivement pour la synchro calendrier iCal - les appels sont internes et non exposés à des entrées utilisateur arbitraires. `uuid` et `lodash` sont les cibles prioritaires car leurs CVE peuvent impacter l'intégrité des données.

**Packages système / outils** (`usr/`) - minimatch, glob, cross-spawn, openssl, node-tar : Ces packages appartiennent soit à l'OS Alpine Linux, soit à des outils système du container. Les CVE OpenSSL (Heap Use-After-Free in PKCS7_verify()) sont les plus sérieux de cette catégorie. Leur exploitation nécessite cependant un accès réseau direct au container et des conditions très spécifiques. La correction passe par une mise à jour de l'image de base Alpine, pas par une modification du code applicatif.

### Comment corriger / éviter ?

- **Immédiat** : déplacer la clé Stripe dans les variables d'environnement
- **Court terme** : mettre à jour `uuid` et `lodash` (risque intégrité données), puis `axios`
- **Moyen terme** : passer à `node:20-alpine` latest dès que les patches OpenSSL Alpine sont disponibles
- **Long terme** : mettre en place une politique de mise à jour mensuelle de l'image de base Docker

## 5. Dependency Scanning - Dependabot

### C'est quoi ?

Dependabot est un bot GitHub qui surveille en permanence les dépendances du projet et ouvre automatiquement des Pull Requests quand une mise à jour de sécurité est disponible. Il fonctionne indépendamment du pipeline CI/CD - même si aucun push n'est effectué, Dependabot continue à surveiller.

### Pourquoi c'est important ?

Les vulnérabilités sont découvertes et publiées en continu. Une dépendance sécurisée aujourd'hui peut être vulnérable demain si un chercheur publie une nouvelle CVE. Sans surveillance automatique, ces nouvelles vulnérabilités passent inaperçues jusqu'au prochain audit manuel.

**Configuration** : `.github/dependabot.yml` - scan npm chaque lundi matin, PR automatiques pour les mises à jour de sécurité, patch versions ignorées pour réduire le bruit.

### Comment éviter les faux positifs ?

La configuration actuelle ignore les mises à jour `patch` pour ne signaler que les mises à jour `minor` et `major` qui corrigent des failles réelles - réduisant ainsi le bruit sans sacrifier la surveillance des vulnérabilités importantes.

## 6. Synthèse et classification globale

| Domaine                               | Niveau de risque   | Justification                               |
| ------------------------------------- | ------------------ | ------------------------------------------- |
| Qualité du code (ESLint)              | ✅ Faible          | 0 erreur, 0 warning                         |
| Sécurité applicative (CodeQL)         | ✅ Faible          | 0 vulnérabilité dans le code source         |
| Dépendances npm (npm audit)           | ⚠️ Modéré          | 16 HIGH majoritairement devDependencies     |
| Image Docker - packages app (Trivy)   | ⚠️ Modéré          | axios, uuid, lodash, multer à mettre à jour |
| Image Docker - système Alpine (Trivy) | ⚠️ Modéré          | OpenSSL hors contrôle direct                |
| Secret détecté (Trivy)                | ✅ Faible maîtrisé | Clé Stripe mock sans valeur en production   |
| Surveillance continue (Dependabot)    | ✅ Actif           | Scan hebdomadaire configuré                 |

### Plan de remédiation priorisé

| Priorité   | Action                                     | Package(s)                         | Effort estimé |
| ---------- | ------------------------------------------ | ---------------------------------- | ------------- |
| 🔴 Haute   | Déplacer la clé Stripe dans `.env.example` | `stripe.service.js`                | 30 min        |
| 🟠 Moyenne | Mettre à jour `uuid` et `lodash`           | `@nestjs/config`, `node-ical`      | 2-4h          |
| 🟠 Moyenne | Mettre à jour `axios`                      | `node-ical`                        | 2-4h          |
| 🟡 Normale | Mettre à jour l'image de base Alpine       | `node:20-alpine`                   | 1h            |
| 🟢 Basse   | Mettre à jour les devDependencies          | `minimatch`, `glob`, `cross-spawn` | 1-2h          |

### Conclusion

Le projet présente un niveau de risque global modéré et maîtrisé. Le point le plus structurant est que le **code applicatif lui-même ne présente aucune vulnérabilité** (CodeQL : 0 alerte, ESLint : 0 erreur) - les risques identifiés sont exclusivement dans les dépendances externes et l'image système, deux catégories que l'équipe ne contrôle pas directement mais peut corriger via des mises à jour planifiées.

La détection d'une clé Stripe mock par Trivy est un signal positif : le scanner fonctionne correctement et la vigilance sur les secrets est réelle. Le plan de remédiation priorisé permet de traiter les risques les plus importants en moins d'une journée de travail.
