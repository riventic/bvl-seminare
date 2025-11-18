# GitHub Actions Workflow - Build and Deploy

This workflow automatically builds all changed applets and the landing page, then deploys them to GitHub Pages.

## Features

### Smart Builds
- **Detects changes**: Only builds applets that have been modified
- **Template changes**: Rebuilds all applets when template or configuration changes
- **Landing page**: Rebuilds when landing page source changes
- **Incremental deployment**: Preserves previously built applets that didn't change

### Parallel Execution
- Builds up to 5 applets simultaneously for faster CI/CD
- Each applet builds independently in its own job

### Path Filtering
- Only triggers when relevant files change:
  - `applets/**` - Any applet source code
  - `landing-page/**` - Landing page source
  - `template/**` - Template configuration
  - `applets.json` - Applet metadata
  - `.github/workflows/**` - Workflow files

## How It Works

### 1. Detect Changes Job
Analyzes git diff to determine which applets need rebuilding:
- Compares current commit with previous commit
- Creates a matrix of changed applets
- Flags if landing page or template changed

### 2. Build Landing Page Job
Builds the React landing page application:
- Installs dependencies with npm ci
- Runs production build with Vite
- Uploads build artifact

### 3. Build Applets Job (Matrix)
Builds changed applets in parallel:
- Each applet runs in separate job
- Type checks with TypeScript
- Builds with Vite using correct base path
- Uploads individual build artifacts

### 4. Deploy Job
Combines all builds and deploys to GitHub Pages:
- Downloads previous GitHub Pages deployment
- Overlays new builds on top of previous deployment
- Deploys complete site to GitHub Pages

## Deployment Structure

```
gh-pages branch:
├── index.html              # Landing page
├── assets/                 # Landing page assets
├── applets.json            # Applet metadata
└── applets/
    ├── 00_zeitreihenprognose/
    │   ├── index.html
    │   └── assets/
    ├── 01/
    │   ├── index.html
    │   └── assets/
    └── ...
```

## URLs

- **Landing page**: `https://<username>.github.io/bvl-seminare/`
- **Applet 00**: `https://<username>.github.io/bvl-seminare/applets/00_zeitreihenprognose/`
- **Applet 01**: `https://<username>.github.io/bvl-seminare/applets/01/`
- etc.

## First-Time Setup

### 1. Enable GitHub Pages
1. Go to repository Settings → Pages
2. Source: "GitHub Actions"
3. Save

### 2. Initial Deployment
Run workflow manually to build all applets:
1. Go to Actions tab
2. Select "Build and Deploy to GitHub Pages"
3. Click "Run workflow" → "Run workflow"

This builds all 10 applets and the landing page.

### 3. Verify Deployment
- Check Actions tab for workflow completion
- Visit your GitHub Pages URL
- Verify all applets are accessible

## Usage

### Automatic Builds
Push changes to master branch:
```bash
# Example: Update applet 01
cd applets/01
# Make changes...
git add .
git commit -m "Update applet 01"
git push
```

Workflow automatically:
1. Detects applet 01 changed
2. Builds only applet 01
3. Deploys updated applet 01 while keeping others unchanged

### Manual Trigger
Build everything manually:
1. GitHub → Actions tab
2. Select workflow
3. "Run workflow" button
4. Select branch (master)
5. Click "Run workflow"

### Template Changes
When you modify template or applets.json:
```bash
git add template/ applets.json
git commit -m "Update template configuration"
git push
```

Workflow automatically rebuilds ALL applets.

## Workflow Triggers

### Automatic (Push to Master)
- Changes to `applets/**`
- Changes to `landing-page/**`
- Changes to `template/**`
- Changes to `applets.json`
- Changes to workflow files

### Manual
- Via GitHub Actions UI ("workflow_dispatch")

## Build Environment

- **Node.js**: v20 (LTS)
- **Package Manager**: npm with `npm ci`
- **Build Tool**: Vite 7.2.2
- **TypeScript**: 5.9.3
- **Base Path**: `/bvl-seminare/` (configurable via `VITE_BASE_PATH`)

## Troubleshooting

### Workflow doesn't trigger
- Check if changes are in monitored paths
- Verify push is to `master` branch
- Check workflow file syntax (YAML)

### Build fails
- Check Actions tab for error logs
- Verify package.json dependencies
- Test build locally: `npm ci && npm run build`

### Applet not updating on GitHub Pages
- Verify build job succeeded
- Check deploy job logs
- Clear browser cache
- GitHub Pages can take 1-2 minutes to update

### Missing applets on site
- Run manual workflow_dispatch to rebuild all
- Check if applet directories match expected structure
- Verify applets.json has correct paths

## Performance

### Build Times (Approximate)
- **Landing page**: ~30-60 seconds
- **Single applet**: ~45-90 seconds
- **Full build (10 applets)**: ~2-3 minutes (parallel)

### Optimization
- Parallel builds (max 5 concurrent)
- npm ci for faster dependency installation
- Artifact caching between jobs
- Incremental deployments

## Advanced Configuration

### Change Base Path
Edit in:
1. `landing-page/vite.config.ts`: `base: '/your-path/'`
2. Workflow: `VITE_BASE_PATH: /your-path/applets/${{ matrix.applet }}/`
3. Landing page `App.tsx`: Update fetch and navigation URLs

### Add More Applets
1. Create new applet directory: `applets/10/`
2. Add to `applets.json`
3. Update workflow matrix: Add `"10"` to applets array in detect-changes job

### Change Node Version
Edit workflow:
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: '22'  # Change version here
```

## Monitoring

### View Workflow Status
- GitHub → Actions tab
- See running/completed workflows
- Click workflow for detailed logs

### Deployment Status
- Settings → Pages shows deployment status
- Actions → Deploy jobs show deployment URLs

## Security

### Permissions
Workflow requires:
- `contents: read` - Read repository
- `pages: write` - Deploy to Pages
- `id-token: write` - OIDC token for Pages deployment

### Secrets
No secrets required for public repositories.
