# Centflow

Application web de gestion de budget familial, conçue pour un usage simple et mobile-first. Suivez vos revenus et depenses mois par mois, visualisez l'evolution de vos categories et obtenez une synthese annuelle.

## Fonctionnalites

- **Vue mensuelle** — Saisissez vos revenus et depenses par categorie
- **Copie du mois precedent** — Reprenez les montants recurrents en un clic
- **Synthese annuelle** — KPIs, graphiques par mois et par categorie
- **Evolution par categorie** — Graphique des 6 derniers mois par categorie
- **PWA & Offline** — Installable sur mobile, fonctionne hors connexion
- **Pull-to-refresh** — Rafraichissement tactile natif
- **Magic Link** — Connexion sans mot de passe par email

## Stack technique

| Composant | Technologie |
|-----------|-------------|
| Framework | [Nuxt 4](https://nuxt.com) |
| UI | [Nuxt UI](https://ui.nuxt.com) + [Tailwind CSS v4](https://tailwindcss.com) |
| Base de donnees | [SQLite](https://sqlite.org) / [Turso](https://turso.tech) (LibSQL) |
| ORM | [Drizzle ORM](https://orm.drizzle.team) |
| Authentification | [Better Auth](https://better-auth.com) (magic link) |
| Emails | [Resend](https://resend.com) |
| PWA | [@vite-pwa/nuxt](https://vite-pwa-org.netlify.app/frameworks/nuxt) |
| Deploiement | [Vercel](https://vercel.com) / Docker |

## Prerequis

- [Node.js](https://nodejs.org) >= 20
- [pnpm](https://pnpm.io) >= 10

## Installation

```bash
# Cloner le repo
git clone https://github.com/FrenchPhalange/centflow.git
cd centflow

# Installer les dependances
pnpm install

# Copier la configuration
cp .env.example .env
```

## Configuration

Editez le fichier `.env` :

```bash
# Base de donnees (SQLite local par defaut)
NUXT_TURSO_DB_URL=file:./data/budget.db
NUXT_TURSO_AUTH_TOKEN=

# Meme chose pour drizzle-kit
TURSO_DATABASE_URL=file:./data/budget.db
TURSO_AUTH_TOKEN=

# Secret pour les sessions (generez une chaine aleatoire de 64 caracteres)
NUXT_BETTER_AUTH_SECRET=change-me-to-a-random-64-char-string
NUXT_BETTER_AUTH_URL=http://localhost:3000
NUXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000

# Resend (optionnel — sans cle, les magic links s'affichent dans la console)
NUXT_RESEND_API_KEY=
NUXT_RESEND_FROM=Centflow <onboarding@resend.dev>
```

> **Note** : Sans cle Resend, les magic links de connexion sont affiches dans la console du serveur. Parfait pour le developpement.

## Demarrage

```bash
# Initialiser la base de donnees et creer les comptes
pnpm db:seed

# Lancer le serveur de developpement
pnpm dev
```

L'application est accessible sur [http://localhost:3000](http://localhost:3000).

## Scripts disponibles

| Commande | Description |
|----------|-------------|
| `pnpm dev` | Serveur de developpement |
| `pnpm build` | Build de production |
| `pnpm preview` | Previsualisation du build |
| `pnpm db:seed` | Creer les tables et les comptes utilisateurs |
| `pnpm db:generate` | Generer les migrations Drizzle |
| `pnpm db:push` | Appliquer le schema a la base |
| `pnpm db:studio` | Ouvrir Drizzle Studio (interface BDD) |

## Import de donnees bancaires

Un script d'import CSV est fourni pour importer vos releves bancaires :

```bash
tsx scripts/import-csv.ts <fichier.csv> <email>
```

Le script categorise automatiquement les operations. Editez la fonction `categorize()` dans `scripts/import-csv.ts` pour adapter les regles a vos propres marchands et operations.

## Deploiement

### Vercel

1. Connectez votre repo a Vercel
2. Configurez les variables d'environnement (voir `.env.example`)
3. Utilisez [Turso](https://turso.tech) comme base de donnees en production

### Docker

```bash
docker compose up -d
```

Configurez les variables d'environnement dans un fichier `.env` ou directement dans `docker-compose.yml`.

## Structure du projet

```
├── components/       # Composants Vue (BudgetCard, BarChart, etc.)
├── composables/      # Logique reutilisable (useAuth, useBudget, etc.)
├── layouts/          # Layouts Nuxt (default, auth)
├── lib/              # Client auth (better-auth)
├── middleware/        # Auth guard global
├── pages/            # Routes (index, login, annuel, synthese)
├── public/           # Assets statiques (icones PWA, robots.txt)
├── scripts/          # Scripts utilitaires (seed, import CSV)
├── server/
│   ├── api/          # Endpoints API REST
│   ├── database/     # Schema Drizzle & connexion
│   ├── middleware/    # Protection des routes API
│   ├── plugins/      # Initialisation BDD
│   └── utils/        # Auth & session helpers
├── shared/           # Constantes partagees (categories, couleurs)
└── assets/css/       # Styles globaux (Tailwind + theme)
```

## Licence

[MIT](./LICENSE)
