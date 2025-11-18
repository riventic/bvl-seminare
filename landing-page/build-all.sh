#!/bin/bash

# BVL Seminare - Build All Applets and Landing Page
# This script builds the landing page and all applets into a single unified distribution
# Usage:
#   ./build-all.sh           - Build landing page and all applets
#   ./build-all.sh --landing-only  - Build only landing page, copy existing applet builds
#   ./build-all.sh --install - Run npm install in all directories before building

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Parse arguments
LANDING_ONLY=false
RUN_INSTALL=false
for arg in "$@"; do
  if [[ "$arg" == "--landing-only" ]]; then
    LANDING_ONLY=true
  elif [[ "$arg" == "--install" ]]; then
    RUN_INSTALL=true
  fi
done

# Get the landing-page directory (where this script is located)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ "$LANDING_ONLY" = true ]; then
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}  BVL Seminare - Build Landing Page${NC}"
  echo -e "${BLUE}========================================${NC}"
else
  echo -e "${BLUE}========================================${NC}"
  echo -e "${BLUE}  BVL Seminare - Build All Projects${NC}"
  echo -e "${BLUE}========================================${NC}"
fi
echo ""

# Clean dist directory
echo -e "${YELLOW}[1/6] Cleaning output directory...${NC}"
cd "$SCRIPT_DIR"
rm -rf dist
echo -e "  ${GREEN}✓${NC} Cleaned landing-page/dist"

# Build Landing Page
echo ""
echo -e "${YELLOW}[2/6] Building Landing Page...${NC}"
cd "$SCRIPT_DIR"
if [ "$RUN_INSTALL" = true ]; then
  echo -e "  ${BLUE}→${NC} Installing dependencies..."
  npm install
fi
echo -e "  ${BLUE}→${NC} Building landing page application..."
npm run build
echo -e "  ${GREEN}✓${NC} Landing page built successfully"

# Create applets directory in dist
mkdir -p dist/applets

# Copy applets.json to dist
echo ""
echo -e "${YELLOW}[3/6] Copying applets.json...${NC}"
cp "$ROOT_DIR/applets.json" dist/applets.json
echo -e "  ${GREEN}✓${NC} Copied applets.json"

# Define applets
APPLETS=(
  "00_zeitreihenprognose"
  "02_multi-produkt-prognose"
  "03_tourenplanung"
  "04_hybrid-flowshop"
)

if [ "$LANDING_ONLY" = true ]; then
  # Copy existing applet builds
  echo ""
  echo -e "${YELLOW}[4/4] Copying existing applet builds...${NC}"
  for applet in "${APPLETS[@]}"; do
    if [ -d "$ROOT_DIR/applets/$applet/dist" ]; then
      echo -e "  ${BLUE}→${NC} Copying $applet..."
      mkdir -p "$SCRIPT_DIR/dist/applets/$applet"
      cp -r "$ROOT_DIR/applets/$applet/dist/"* "$SCRIPT_DIR/dist/applets/$applet/"
      echo -e "  ${GREEN}✓${NC} $applet copied"
    else
      echo -e "  ${RED}✗${NC} $applet dist not found (skipping)"
    fi
  done
else
  # Build each applet
  APPLET_NUM=4
  for applet in "${APPLETS[@]}"; do
    echo ""
    echo -e "${YELLOW}[$APPLET_NUM/6] Building applet: $applet...${NC}"

    cd "$ROOT_DIR/applets/$applet"

    if [ "$RUN_INSTALL" = true ]; then
      echo -e "  ${BLUE}→${NC} Installing dependencies..."
      npm install
    fi
    echo -e "  ${BLUE}→${NC} Building application..."
    VITE_BASE_PATH="/applets/$applet/" npm run build

    echo -e "  ${GREEN}✓${NC} $applet built successfully"

    # Copy applet to landing-page/dist/applets
    echo -e "  ${BLUE}→${NC} Copying to dist/applets/$applet..."
    mkdir -p "$SCRIPT_DIR/dist/applets/$applet"
    cp -r dist/* "$SCRIPT_DIR/dist/applets/$applet/"

    APPLET_NUM=$((APPLET_NUM + 1))
  done
fi

# Summary
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Build Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "Output directory: ${BLUE}$SCRIPT_DIR/dist${NC}"
echo ""
echo "Directory structure:"
echo "  landing-page/dist/"
echo "  ├── index.html              (Landing page)"
echo "  ├── assets/                 (Landing page assets)"
echo "  ├── applets.json            (Applet metadata)"
echo "  └── applets/"
for applet in "${APPLETS[@]}"; do
  echo "      ├── $applet/"
done
echo ""
echo -e "To test locally, run: ${YELLOW}npx serve dist -p 8080${NC}"
echo -e "Then visit: ${BLUE}http://localhost:8080/${NC}"
echo ""
