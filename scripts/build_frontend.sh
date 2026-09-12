#!/usr/bin/env bash
# Build the React frontend and place the assets where the API gateway expects them.
set -e
PROJECT_ROOT=$(cd "$(dirname "$0")/.." && pwd)
CDIR="$PROJECT_ROOT/services/command-center"

echo "--- Building frontend in $CDIR"
cd "$CDIR"
# install deps (if node_modules missing)
if [ ! -d node_modules ]; then
  npm ci
fi
# build the production assets
npm run build
# copy built assets to the API gateway static folder
BUILD_DIR="$CDIR/dist"
TARGET_STATIC="$PROJECT_ROOT/services/api-gateway/static"
mkdir -p "$TARGET_STATIC"
cp -r "$BUILD_DIR"/* "$TARGET_STATIC"

echo "Build complete. Assets copied to $TARGET_STATIC"
