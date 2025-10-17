#!/bin/bash

# SKIDS EYEAR - Netlify Deployment Script
# This script deploys the mobile PWA to Netlify using the CLI

set -e  # Exit on error

echo "🚀 SKIDS EYEAR - Netlify Deployment"
echo "===================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null
then
    echo -e "${YELLOW}⚠️  Netlify CLI not found. Installing...${NC}"
    npm install -g netlify-cli
    echo -e "${GREEN}✅ Netlify CLI installed${NC}"
fi

# Navigate to mobile-pwa directory
cd mobile-pwa

echo -e "${BLUE}📦 Installing dependencies...${NC}"
npm ci

echo ""
echo -e "${BLUE}🔨 Building application...${NC}"
npm run build

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build successful${NC}"
else
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi

echo ""
echo -e "${BLUE}📊 Build statistics:${NC}"
du -sh dist/
ls -lh dist/

echo ""
echo -e "${YELLOW}🌐 Deploying to Netlify...${NC}"
echo ""
echo "Choose deployment type:"
echo "1) Production (live site)"
echo "2) Preview (draft deployment)"
read -p "Enter choice (1 or 2): " choice

case $choice in
    1)
        echo -e "${BLUE}Deploying to production...${NC}"
        netlify deploy --prod --dir=dist
        ;;
    2)
        echo -e "${BLUE}Creating preview deployment...${NC}"
        netlify deploy --dir=dist
        ;;
    *)
        echo -e "${RED}Invalid choice. Exiting.${NC}"
        exit 1
        ;;
esac

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo ""
    echo -e "${GREEN}🎉 Your SKIDS EYEAR Mobile PWA is now live!${NC}"
    echo ""
    echo -e "${BLUE}Next steps:${NC}"
    echo "  • Test the deployed site"
    echo "  • Verify PWA installation"
    echo "  • Check mobile responsiveness"
    echo "  • Test camera/microphone permissions"
    echo "  • Verify offline functionality"
else
    echo ""
    echo -e "${RED}❌ Deployment failed${NC}"
    echo "Please check the error messages above"
    exit 1
fi
