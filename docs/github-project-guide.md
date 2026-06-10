# Guide — Créer le GitHub Project pour Résa

## 1. Créer le Project

1. Aller sur ton repo GitHub → onglet **Projects** → **New project**
2. Choisir le template **Board** (Kanban)
3. Nommer le projet : `Résa — Backlog EC02`

## 2. Configurer les colonnes

Renommer les colonnes par défaut :

| Colonne | Description |
|---|---|
| 📋 **Backlog** | User Stories non encore planifiées |
| 🗓️ **Sprint J1** | US planifiées pour le Jour 1 |
| 🗓️ **Sprint J2** | US planifiées pour le Jour 2 |
| 🔄 **En cours** | US en cours de développement |
| 👀 **En revue** | PR ouverte, en attente de review |
| ✅ **Terminé** | US mergée et déployée |

## 3. Ajouter les champs personnalisés

Dans **Settings du Project** → **Custom fields** → **New field** :

| Champ | Type | Valeurs |
|---|---|---|
| **Priorité** | Single select | Must / Should / Could / Won't |
| **Points** | Number | — |
| **Assigné** | Text ou Person | — |
| **Epic** | Single select | Logements / Réservation / Administration / iCal / Infrastructure |

## 4. Créer les Issues (User Stories)

Pour chaque User Story, créer une Issue GitHub avec :

**Titre** : `[US-001] En tant qu'hébergeur, je veux créer un logement`

**Body** (template à copier) :
```markdown
## User Story
En tant qu'**hébergeur**, je veux **créer un logement avec ses informations**
afin de **le proposer à la réservation**.

## Critères d'acceptance
- [ ] L'hébergeur peut saisir : nom, description, capacité, adresse, ville
- [ ] Le logement est rattaché au tenant de l'hébergeur connecté
- [ ] Un logement inactif n'apparaît pas dans le widget
- [ ] Retourne 400 si les champs obligatoires sont manquants

## Définition of Done
- [ ] Code mergé sur `main` via PR
- [ ] Tests unitaires passants (couverture ≥ 80%)
- [ ] README mis à jour si nécessaire
- [ ] Demo validée par le Chef de projet
```

**Labels à créer** : `must`, `should`, `could`, `bug`, `documentation`

## 5. Lier les Issues au Project

- Ouvrir une Issue → panneau latéral → **Projects** → sélectionner `Résa — Backlog EC02`
- Remplir les champs : Priorité, Points, Sprint, Epic

## 6. Automatisations utiles

Dans **Settings du Project** → **Workflows** :

| Déclencheur | Action |
|---|---|
| Issue ouverte | → Colonne **Backlog** |
| PR ouverte liée à une Issue | → Colonne **En revue** |
| PR mergée | → Colonne **Terminé** |

Pour lier une PR à une Issue, ajouter dans le corps de la PR :
```
Closes #12
```
