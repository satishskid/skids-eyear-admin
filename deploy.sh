#!/bin/bash

# SKIDS EYEAR Mobile PWA - Deployment Script
# Version: 1.0.0
# Date: October 17, 2025

set -e  # Exit on error

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   SKIDS EYEAR Mobile PWA Deployment   ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Check prerequisites
echo -e "${YELLOW}📋 Step 1: Checking prerequisites...${NC}"

if [ ! -d "mobile-pwa" ]; then
    echo -e "${RED}❌ Error: mobile-pwa directory not found${NC}"
    exit 1
fi

cd mobile-pwa

if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Error: package.json not found${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Prerequisites check passed${NC}"
echo ""

# Step 2: Install dependencies
echo -e "${YELLOW}📦 Step 2: Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Step 3: Run production build
echo -e "${YELLOW}🏗️  Step 3: Building for production...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo ""

# Step 4: Display build stats
echo -e "${YELLOW}📊 Step 4: Build statistics...${NC}"
echo ""
ls -lh dist/ | grep -E "\.(html|js|css)$" || true
echo ""

TOTAL_SIZE=$(du -sh dist/ | cut -f1)
echo -e "${GREEN}📦 Total build size: ${TOTAL_SIZE}${NC}"
echo ""

# Step 5: Test build locally (optional)
echo -e "${YELLOW}🧪 Step 5: Would you like to test the build locally?${NC}"
echo -e "   This will start a preview server at http://localhost:4173"
read -p "   Test locally? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}🚀 Starting preview server...${NC}"
    echo -e "${GREEN}   Press Ctrl+C when done testing${NC}"
    npm run preview
fi

echo ""
echo -e "${YELLOW}╔════════════════════════════════════════╗${NC}"
echo -e "${YELLOW}║       Deployment Options               ║${NC}"
echo -e "${YELLOW}╚════════════════════════════════════════╝${NC}"
echo ""
echo -e "${GREEN}✅ Build complete and ready to deploy!${NC}"
echo ""
echo -e "${BLUE}Choose your deployment method:${NC}"
echo ""
echo -e "  ${GREEN}1. Netlify (Recommended - Free)${NC}"
echo -e "     • Drag & drop: https://app.netlify.com/drop"
echo -e "     • Or upload the 'dist' folder"
echo ""
echo -e "  ${GREEN}2. Netlify CLI${NC}"
echo -e "     $ npm install -g netlify-cli"
echo -e "     $ netlify login"
echo -e "     $ netlify deploy --prod"
echo ""
echo -e "  ${GREEN}3. Vercel${NC}"
echo -e "     $ npm install -g vercel"
echo -e "     $ vercel --prod"
echo ""
echo -e "  ${GREEN}4. GitHub Pages${NC}"
echo -e "     $ npm install --save-dev gh-pages"
echo -e "     $ npm run deploy  # (after adding deploy script)"
echo ""
echo -e "  ${GREEN}5. Self-Hosted${NC}"
echo -e "     • Upload 'dist' folder to your web server"
echo -e "     • Configure Nginx/Apache (see DEPLOYMENT_READY.md)"
echo ""
echo -e "${BLUE}📁 Build location:${NC} $(pwd)/dist"
echo ""
echo -e "${YELLOW}📚 For detailed instructions, see: DEPLOYMENT_READY.md${NC}"
echo ""
echo -e "${GREEN}🎉 Happy deploying!${NC}"
echo ""
