# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

Learn more about the recommended Project Setup and IDE Support in the [Vue Docs TypeScript Guide](https://vuejs.org/guide/typescript/overview.html#project-setup).

# get start

```
npm install
```

generated gql query
```
npm run gql:gen
```

run code
```
npm run dev
```

# Deploy to Vercel

## Prerequisites
- GitHub repository pushed to remote
- Vercel account (sign up at https://vercel.com)

## Deployment Steps

### Option 1: Deploy via Vercel Dashboard (Recommended)
1. Go to https://vercel.com and sign in
2. Click "Add New Project"
3. Import your GitHub repository: `BehemothLtd/yobimori-admin-tool`
4. Configure project:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Add Environment Variables (if needed):
   - Add any required environment variables in the "Environment Variables" section
6. Click "Deploy"

### Option 2: Deploy via Vercel CLI
1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Login to Vercel:
   ```bash
   vercel login
   ```

3. Deploy from project directory:
   ```bash
   vercel
   ```

4. Follow the prompts:
   - Set up and deploy? **Y**
   - Which scope? Select your account
   - Link to existing project? **N** (for first deployment)
   - What's your project's name? `yobimori-admin-tool`
   - In which directory is your code located? `./`
   - Want to override the settings? **N**

5. For production deployment:
   ```bash
   vercel --prod
   ```

## Configuration Files
- `vercel.json`: Vercel configuration for routing and build settings
- `.vercelignore`: Files to exclude from deployment

## Automatic Deployments
Once connected, Vercel will automatically deploy:
- **Production**: Every push to `main` branch
- **Preview**: Every push to other branches and pull requests

## Environment Variables
If your app requires environment variables, add them in:
1. Vercel Dashboard → Project Settings → Environment Variables
2. Add variables for Production, Preview, and Development environments

## Post-Deployment
- Production URL will be provided after successful deployment
- Custom domain can be added in Project Settings → Domains
