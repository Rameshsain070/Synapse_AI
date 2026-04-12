# 🗄️ Synapse AI – Database Setup

Complete guide for setting up PostgreSQL for Synapse AI.

---

## Quick Setup (Docker Compose)

The easiest way – PostgreSQL is included in `docker-compose.yml`:

```bash
docker compose up -d db
```

This creates:
- Database: `synapseai`
- User: `synapseai`
- Password: `synapseai` (change in production!)
- Port: `5432`

---

## Manual PostgreSQL Setup

### 1. Install PostgreSQL

```bash
# macOS
brew install postgresql@16

# Ubuntu/Debian
sudo apt install postgresql-16 postgresql-16-pgvector

# Windows – download from https://www.postgresql.org/download/
```

### 2. Create Database and User

```bash
# Connect as superuser
sudo -u postgres psql

# Run these SQL commands:
```

```sql
CREATE USER synapseai WITH PASSWORD 'your_secure_password';
CREATE DATABASE synapseai OWNER synapseai;
GRANT ALL PRIVILEGES ON DATABASE synapseai TO synapseai;

-- Connect to the new database
\c synapseai

-- Enable pgvector (optional, for semantic search)
CREATE EXTENSION IF NOT EXISTS vector;

-- Grant schema permissions
GRANT ALL ON SCHEMA public TO synapseai;
```

### 3. Initialize Tables

Option A – **Automatic** (recommended): Tables are created on first backend startup via SQLModel.

Option B – **Manual**:
```bash
psql -U synapseai -d synapseai -f scripts/init-db.sql
```

---

## Connection String Format

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE
```

Examples:
```
# Local
postgresql://synapseai:synapseai@localhost:5432/synapseai

# Docker Compose (from backend container)
postgresql://synapseai:synapseai@db:5432/synapseai

# Railway (auto-generated)
postgresql://postgres:xxxx@xxx.railway.app:5432/railway
```

---

## Environment Variables

Set these in your `.env` file:

```env
POSTGRES_HOST=localhost        # or 'db' in Docker Compose
POSTGRES_PORT=5432
POSTGRES_DB=synapseai
POSTGRES_USER=synapseai
POSTGRES_PASSWORD=your_secure_password
POSTGRES_POOL_SIZE=20
POSTGRES_MAX_OVERFLOW=10
```

For Railway, use the auto-generated references:
```env
POSTGRES_HOST=${{Postgres.PGHOST}}
POSTGRES_PORT=${{Postgres.PGPORT}}
POSTGRES_DB=${{Postgres.PGDATABASE}}
POSTGRES_USER=${{Postgres.PGUSER}}
POSTGRES_PASSWORD=${{Postgres.PGPASSWORD}}
```

---

## Database Schema

### Tables

| Table | Description |
|-------|-------------|
| `user` | User accounts (email, hashed password) |
| `session` | Chat sessions per user |
| `thread` | LangGraph thread tracking |
| `task` | AI-powered to-do items |
| `checkpoints` | LangGraph conversation state |
| `checkpoint_writes` | LangGraph checkpoint writes |

### Entity Relationship

```
user (1) ──── (N) session
user (1) ──── (N) task
session ──── checkpoints (via thread_id)
```

---

## pgvector Extension

pgvector enables semantic search. It's **optional** – the app works without it.

### Install pgvector

```bash
# Ubuntu/Debian
sudo apt install postgresql-16-pgvector

# Docker (already included in postgres:16 image)
# Just run: CREATE EXTENSION IF NOT EXISTS vector;
```

### Verify Installation

```sql
SELECT * FROM pg_extension WHERE extname = 'vector';
```

---

## Backup & Restore

### Backup

```bash
pg_dump -U synapseai -d synapseai -F c -f backup.dump
```

### Restore

```bash
pg_restore -U synapseai -d synapseai -c backup.dump
```

---

## Connection Pooling

The backend uses SQLAlchemy's connection pool:

| Setting | Default | Description |
|---------|---------|-------------|
| `POSTGRES_POOL_SIZE` | 20 | Number of persistent connections |
| `POSTGRES_MAX_OVERFLOW` | 10 | Extra connections allowed under load |

For production with many concurrent users, increase these values.

---

## Troubleshooting

### "connection refused"

- PostgreSQL isn't running: `sudo systemctl start postgresql`
- Wrong host: use `db` in Docker Compose, `localhost` otherwise
- Port conflict: verify with `pg_isready -p 5432`

### "authentication failed"

- Wrong password in `.env`
- User doesn't exist: create it with the SQL commands above
- pg_hba.conf doesn't allow the connection method

### "database does not exist"

```sql
CREATE DATABASE synapseai OWNER synapseai;
```

### "permission denied for schema public"

```sql
\c synapseai
GRANT ALL ON SCHEMA public TO synapseai;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO synapseai;
```
