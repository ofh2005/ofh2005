# Nia Al Oud — CRM & Pilotage Commercial

CRM interne pour Nia Al Oud Distribution : catalogue éditable, simulateur de
commande (marge Retail vs Franchise), génération de proforma imprimable, et
tableau de bord pipeline. Next.js (App Router) + Supabase (Postgres + Auth).

## Stack

- **Frontend** : Next.js 16 / React 19
- **Base de données** : Supabase (Postgres managé, Auth email/mot de passe)
- **Hébergement** : Vercel

## Mise en route locale

1. Copier `.env.example` en `.env.local` et renseigner les clés Supabase
   (*Project Settings → API* dans le tableau de bord Supabase) :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (uniquement pour le script de seed, jamais exposée au client)

2. Créer le schéma dans l'éditeur SQL de Supabase : exécuter le contenu de
   [`supabase/schema.sql`](./supabase/schema.sql). Ça crée les tables
   (`settings`, `machines`, `oils`, `clients`, `client_machine_items`,
   `client_oil_items`), active la RLS, et seed le catalogue machines/huiles
   de référence.

3. Créer le compte utilisateur unique dans *Authentication → Users → Add user*
   (email + mot de passe) — c'est le seul compte de connexion à l'app.

4. Installer les dépendances et lancer le serveur de dev :
   ```bash
   npm install
   npm run dev
   ```

5. (Optionnel) Importer une sauvegarde JSON existante (clients + réglages) :
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
     npm run seed -- /chemin/vers/backup.json
   ```
   ⚠️ Ce script **remplace tous les clients existants** en base par ceux du
   fichier. Ne jamais committer un fichier de sauvegarde dans le dépôt — il
   contient des données clients réelles (noms, téléphones).

## Déploiement sur Vercel

1. Importer ce dépôt GitHub dans Vercel (*Add New → Project*).
2. Renseigner les variables d'environnement `NEXT_PUBLIC_SUPABASE_URL` et
   `NEXT_PUBLIC_SUPABASE_ANON_KEY` dans les réglages du projet Vercel.
3. Déployer.

## Sauvegarde

Le bouton **⬇️ Exporter** (onglet Clients) télécharge un JSON complet
(clients, catalogue, réglages) — filet de sécurité indépendant de la base de
données, à garder au chaud (Drive, WhatsApp à soi-même, etc.).

## Structure du projet

```
src/
  app/            routes Next.js (page.tsx = app principale, login/)
  components/     Dashboard + onglets (Clients, Catalogue, Pipeline) + Proforma
  lib/
    calc.ts       logique métier (marges, poids, transport) — calculs identiques à l'outil d'origine
    db.ts         mapping Supabase <-> types applicatifs + CRUD
    supabase/     clients Supabase (browser, server, proxy/session)
supabase/schema.sql   schéma SQL + seed catalogue
scripts/seed.ts       import ponctuel d'une sauvegarde JSON
```
