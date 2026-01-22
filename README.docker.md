# PostgreSQL Docker Setup

## Quick Start

### 1. Start PostgreSQL Container

```bash
docker-compose up -d
```

This will:
- Start a PostgreSQL 16 container
- Create a database named `workflow_db`
- Set up user `workflow_user` with password `workflow_password`
- Expose PostgreSQL on port `5432`
- Persist data in a Docker volume

### 2. Verify Container is Running

```bash
docker-compose ps
```

### 3. Run Prisma Migrations

```bash
npx prisma migrate dev
```

Or if you want to reset the database:

```bash
npx prisma migrate reset
```

### 4. Generate Prisma Client

```bash
npx prisma generate
```

## Useful Commands

### Stop the container
```bash
docker-compose down
```

### Stop and remove volumes (deletes all data)
```bash
docker-compose down -v
```

### View logs
```bash
docker-compose logs -f postgres
```

### Access PostgreSQL CLI
```bash
docker-compose exec postgres psql -U workflow_user -d workflow_db
```

### Restart the container
```bash
docker-compose restart
```

## Connection Details

- **Host**: localhost
- **Port**: 5432
- **Database**: workflow_db
- **User**: workflow_user
- **Password**: workflow_password
- **Connection URL**: `postgresql://workflow_user:workflow_password@localhost:5432/workflow_db`

## Troubleshooting

### Port 5432 already in use
If you have PostgreSQL already running locally, either:
1. Stop your local PostgreSQL service
2. Change the port mapping in `docker-compose.yml` (e.g., `"5433:5432"`)

### Container won't start
Check logs:
```bash
docker-compose logs postgres
```

### Reset everything
```bash
docker-compose down -v
docker-compose up -d
npx prisma migrate reset
```
