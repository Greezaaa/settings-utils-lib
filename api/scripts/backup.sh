#!/bin/sh
# Backs up what api.su-labs.dev can't rebuild: the database and the suggestion pictures.
#
# Runs on the server, from the API folder that `npm run deploy:api` uploads (/home/ubuntu/su-labs-api):
#   sh scripts/backup.sh
# Schedule it nightly with `crontab -e`:
#   30 3 * * * cd /home/ubuntu/su-labs-api && sh scripts/backup.sh >> /home/ubuntu/su-labs-backups/backup.log 2>&1
# Then keep a copy off the server too: `npm run backup:pull` (repo root) copies the backups to backups/ here.
#
# Restore, on the server from /home/ubuntu/su-labs-api (into an empty database and volume, e.g. a new server):
#   gunzip -c ../su-labs-backups/su-labs-db-<date>.sql.gz | docker compose exec -T db psql -U su_labs -d su_labs
#   docker run --rm -v su-labs-api_uploads:/data -v /home/ubuntu/su-labs-backups:/backup alpine \
#     tar -xzf /backup/su-labs-uploads-<date>.tar.gz -C /data
set -eu

BACKUP_DIR="${BACKUP_DIR:-/home/ubuntu/su-labs-backups}"
# Days of backups kept on the server
KEEP_DAYS="${KEEP_DAYS:-14}"
STAMP="$(date +%Y-%m-%d)"

mkdir -p "$BACKUP_DIR"

# The database, as plain SQL (restorable on any PostgreSQL 17)
docker compose exec -T db pg_dump -U su_labs -d su_labs --no-owner | gzip > "$BACKUP_DIR/su-labs-db-$STAMP.sql.gz.part"
mv "$BACKUP_DIR/su-labs-db-$STAMP.sql.gz.part" "$BACKUP_DIR/su-labs-db-$STAMP.sql.gz"

# The suggestion pictures, straight from their Docker volume
docker run --rm -v su-labs-api_uploads:/data:ro -v "$BACKUP_DIR":/backup alpine \
  tar -czf "/backup/su-labs-uploads-$STAMP.tar.gz" -C /data .

# Older backups go
find "$BACKUP_DIR" -name 'su-labs-*.gz' -mtime +"$KEEP_DAYS" -delete

echo "$(date -Iseconds) backed up to $BACKUP_DIR"
