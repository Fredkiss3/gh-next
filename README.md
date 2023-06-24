# A clone of github issues management app in Next.JS


# Stack

- [Next App Router](https://nextjs.org/docs/app)
- [drizzle](https://orm.drizzle.team/) + Sqlite (locally) & cloudfare D1 in production 
- [cloudfare](https://cloudfare.com) for the hosting
- [tailwindCSS](tailwindcss.com/) for the styling


# Requirements

- Node >= v16.6.2
- [PNPM](https://pnpm.io/installation) >= v6.22.2


## 🚀 How to work on the project ?

1. First you have to clone the repository
    
    ```bash
    git clone https://github.com/Fredkiss3/gh-next.git
    ```    

2. **Then, Install the dependencies :**

    ```bash
    pnpm install
    ```    

3. **Launch the docker-compose server to start a mongodb server :**

    ```bash
    docker-compose up -d
    ```
4. Rename the `.env.example` located in `packages/express/src/config` to `.env.local` And change the file to your needs, 
   by default you have :

    ```dotenv
   # server
   PORT = 3031

   ```

5. **And launch the project :**

    ```bash
    pnpm run dev 
    ```

    The app will show at [http://localhost:3000](http://localhost:3000).

6. **Open the source code and start rocking ! 😎**


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
    ├── .prettierrc
    ├── pnpm-lock.yaml
    └── tsconfig.json

2. **`src/app/`**: this folder contains the source code to our app :
   
    1. **`(actions)`** : this folder contains all the logic of our app.
   
    2. **`(components)`** : this folder contains all the components of our app.
   
    3. **`(models)`** : this folder contains all the DB models of our app.
   
    4. **`(routes)`** : this folder contains all the routes & pages of our app.
    
3. **`.prettierrc`**: this file contains the configuration for prettier to enable autoformatting.

6. **`pnpm-lock.yaml`**: this file contains the dependencies lock for the repo.

7. **`tsconfig.json`**: this file contains the configuration for typescript, that are used by the all the underlying packages
