# NEXUS ERP — System Architecture Blueprint

## Architectural Highlights

- **Monorepo Architecture**: Shared configuration, strict boundaries between `/client` and `/server`.
- **Stateless JWT Authentication**: Tokens contain `id`, `email`, `role`, and `name`. 24-hour expiry without refresh token overhead.
- **Server-Side RBAC**: Authorization middleware (`rbac(['ADMIN', 'SALES'])`) is enforced on Express routes. Frontend role checks are cosmetic.
- **Database Consistency**: Prisma ORM with CUID primary keys. Financial fields (`unitPrice`, `lineTotal`, `totalAmount`) utilize PostgreSQL `Decimal` types.
- **Tailwind v4 Styling**: CSS-first design tokens (`@theme`, `@custom-variant`), anti-FOUC initialization script, and semantic surface/content tokens.
