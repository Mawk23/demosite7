#!/bin/sh
# Wait for MongoDB to be ready, with retries
HOST="${1:-localhost}"
PORT="${2:-27017}"
MAX_RETRIES="${3:-30}"
RETRY_INTERVAL="${4:-2}"

echo "Waiting for MongoDB at $HOST:$PORT..."
RETRIES=0

while [ $RETRIES -lt $MAX_RETRIES ]; do
  if command -v mongo >/dev/null 2>&1; then
    if mongo --host "$HOST" --port "$PORT" --eval "db.adminCommand('ping')" >/dev/null 2>&1; then
      echo "MongoDB is ready!"
      exit 0
    fi
  else
    # fallback: use nc (netcat) if mongo client not available
    if nc -z "$HOST" "$PORT" 2>/dev/null; then
      echo "MongoDB is ready!"
      exit 0
    fi
  fi
  RETRIES=$((RETRIES + 1))
  echo "Attempt $RETRIES/$MAX_RETRIES: MongoDB not ready yet. Retrying in ${RETRY_INTERVAL}s..."
  sleep "$RETRY_INTERVAL"
done

echo "MongoDB failed to start within expected time. Proceeding anyway..."
exit 0
