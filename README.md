# A clone of github issues management app in Next.JS

## ⚠️ THIS PROJECT IS IN ACTIVE DEVELOPMENT !!

## Roadmap

- [x] Login/Logout 
- [ ] HomePage (README content)
- [ ] Responsive Layout 
- [ ] See Profile informations
- [ ] Issues List page
   - [ ] Search & filter issues by author, label, assignee, closed/open, title, mentions, etc. (Inspiration: https://github.com/openstatusHQ/openstatus, https://docs.github.com/en/issues/tracking-your-work-with-issues/filtering-and-searching-issues-and-pull-requests)
- [ ] New issue page
   - [ ] Issue CRUD (by the author only)
   - [ ] Comments CRUD
   - [ ] Mentions 
   - [ ] Issue Popovers (for previewing issues)
   - [ ] Linking between issues
   - [ ] Assign & self assign issues
- [ ] Labels CRUD (can only add or update labels, no deleting)
- [ ] Notifications page
   - [ ] Notifications badge
   - [ ] Notifications for issues subscriptions 
   - [ ] Notifications for mentions
   - [ ] Notifications for issue statuses
   - [ ] Filter notifications by status, title, closed, etc.
   - [ ] Mark as done, unsubscribe



# Stack

- [Next App Router](https://nextjs.org/docs/app)
- [drizzle](https://orm.drizzle.team/) + [turso](https://turso.tech/)
- [cloudfare](https://cloudfare.com) for the hosting
- [tailwindCSS](https://tailwindcss.com/) for the styling

- [upstash](https://upstash.com/) for replacing a local instance of [cloudfare KV](https://developers.cloudflare.com/workers/runtime-apis/kv), used for sessions and caching of data

# Requirements

- Node >= v16.6.2
- [PNPM](https://pnpm.io/installation) >= v6.22.2
- A [turso](https://turso.tech/) database
- A [upstash](https://upstash.com/) redis cluster (when developping locally)

## 🚀 How to work on the project ?

1. First you have to clone the repository

   ```bash
   git clone https://github.com/Fredkiss3/gh-next.git
   ```

2. **Then, Install the dependencies :**

   ```bash
   pnpm install
   ```

3. Rename `.env.example` to `.env.local` And change the file to your needs,

4. **And launch the project :**

   ```bash
   pnpm run dev
   ```

   The app will show at [http://localhost:3000](http://localhost:3000).

5. **Open the source code and start rocking ! 😎**

## 🧐 Project structure

A quick look at the top-level files and directories you will see in this project.

    .
    ├── src/
    │    ├── app/
    │    │   ├── (actions)
    │    │   ├── (components)
    │    │   ├── (models)
    │    │   └── (routes)
    │    └──lib/
    │        ├── db/schema
    │        └── hooks
    ├── .prettierrc
    ├── pnpm-lock.yaml
    └── tsconfig.json

2. **`src/app/`**: this folder contains the source code to our app :

   1. **`(actions)`** : this folder contains all the logic of our app.

   2. **`(components)`** : this folder contains all the components of our app.

   3. **`(models)`** : this folder contains all the DB models of our app.

   4. **`(routes)`** : this folder contains all the routes & pages of our app.

3. **`src/lib/`**: this folder contains utils & helpers used throughout our app :

   1. **`db/schema`** : this folder contains all the drizzle sqlite schema for our DB.

   2. **`hooks`** : this folder contains all the react custom hooks used in the app.

4. **`.prettierrc`**: this file contains the configuration for prettier to enable autoformatting.

5. **`pnpm-lock.yaml`**: this file contains the dependencies lock for the repo.

6. **`tsconfig.json`**: this file contains the configuration for typescript, that are used by the all the underlying packages
