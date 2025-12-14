Awesome! Here’s a detailed example for your project directory structure, plus Docker and config setup to cleanly switch between mock and real DB implementations.

---

# 📂 Project Directory Structure Example

```
/project-root
│
├── backend
│   ├── src
│   │   ├── controllers
│   │   ├── services
│   │   ├── repositories
│   │   │   ├── mock           # Mock DB implementations here
│   │   │   │   ├── user.repository.ts
│   │   │   │   └── invoice.repository.ts
│   │   │   ├── real           # Real DB implementations here
│   │   │   │   ├── user.repository.ts
│   │   │   │   └── invoice.repository.ts
│   │   ├── app.module.ts      # Import chosen repository here
│   │   ├── main.ts
│   │   └── config
│   │       └── db.config.ts   # DB config, env var handling
│   ├── Dockerfile             # Backend Dockerfile
│   └── package.json
│
├── frontend
│   ├── src
│   ├── Dockerfile             # Frontend Dockerfile
│   └── package.json
│
├── docker-compose.yml         # Compose file to run backend, frontend, and DB containers
└── README.md
```

---

# 🐳 Example Dockerfiles & Compose

### backend/Dockerfile

```dockerfile
# Use Node base image
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Build if needed (e.g., TypeScript compile)
RUN npm run build

# Expose port your backend listens on
EXPOSE 3000

# Pass environment variable to choose DB type (mock or real)
ENV DB_TYPE=mock

CMD ["node", "dist/main.js"]
```

---

### frontend/Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

---

### docker-compose.yml

```yaml
version: '3.8'

services:
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
      args:
        - NODE_ENV=production
    environment:
      - DB_TYPE=real           # Change this to 'mock' for mock DB usage
      - DATABASE_URL=postgres://user:password@db:5432/mydb
    ports:
      - "3001:3000"
    depends_on:
      - db

  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"

  db:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: mydb
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

---

# 🔧 Example Backend Config to Switch DB Repos

### backend/src/config/db.config.ts

```typescript
export const getRepositoryImplementation = (dbType: string) => {
  if (dbType === 'real') {
    // Import and return real DB repositories
    return import('../repositories/real');
  } else {
    // Default to mock DB repositories
    return import('../repositories/mock');
  }
};
```

### backend/src/app.module.ts (NestJS example)

```typescript
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [],
  controllers: [],
  providers: [],
})
export class AppModule {
  static async forRoot() {
    const dbType = process.env.DB_TYPE || 'mock';
    const repositories = await getRepositoryImplementation(dbType);

    return {
      module: AppModule,
      providers: [
        // Provide your repositories here from chosen implementation
        {
          provide: 'UserRepository',
          useClass: repositories.UserRepository,
        },
        {
          provide: 'InvoiceRepository',
          useClass: repositories.InvoiceRepository,
        },
      ],
    };
  }
}
```

---

# 🔑 Key Points Summary

* **Mock DB implementations** are part of backend code, no separate container needed.
* **Real DB runs as separate container** (Postgres in example) or external service.
* Switch repo implementations **based on environment variable** (`DB_TYPE`).
* Docker Compose coordinates backend, frontend, and DB services.
* Backend Dockerfile uses `ENV` or build args for config switching.
* Keep clear folder separation in backend `/repositories/mock` vs `/repositories/real`.
* Use dependency injection or factory pattern to load correct repo implementation.

---
+++++++++++++++++++++++++++++++++++++++++++++++++++++++++
