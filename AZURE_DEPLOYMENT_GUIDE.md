# Azure Static Web Apps Deployment Guide

## How Deployment Works

Your workflow is configured to automatically deploy when:

### Production Deployment (Master Branch)
- **Trigger:** Push to `master` branch
- **Result:** Deploys to your production URL (e.g., `https://black-rock-0b1957e1e.2.azurestaticapps.net`)
- **When:** Every time you push to master

### Preview Deployment (Pull Requests)
- **Trigger:** Open or update a Pull Request targeting `master`
- **Result:** Creates a preview/staging environment with a unique URL
- **When:** Useful for testing changes before merging to production

## Current Workflow Configuration

Your workflow (`.github/workflows/azure-static-web-apps-*.yml`) is set up to:
1. ✅ Deploy to production on push to `master`
2. ✅ Create preview environments for PRs to `master`

## Common Scenarios

### Scenario 1: You're on a feature branch
**Message:** "Open pull requests against the linked repository..."

**Solution:**
- Option A: Create a Pull Request to `master` → Creates preview environment
- Option B: Push directly to `master` → Deploys to production

### Scenario 2: You want preview deployments for all branches
**Solution:** Uncomment the `'**'` lines in the workflow file to enable preview deployments for any branch.

### Scenario 3: Manual deployment trigger
If you want to manually trigger deployments:
1. Go to GitHub → Actions tab
2. Select the workflow
3. Click "Run workflow"

## Checking Deployment Status

1. **GitHub Actions:**
   - Go to your repository → **Actions** tab
   - See the status of recent deployments

2. **Azure Portal:**
   - Go to Azure Portal → Your Static Web App
   - Check **Deployment history** for deployment status

3. **Preview URLs:**
   - When you create a PR, Azure will comment on the PR with the preview URL
   - Check the PR comments for the preview link

## Troubleshooting

**Workflow not triggering?**
- Make sure you're pushing to the correct branch
- Check if the workflow file is in `.github/workflows/`
- Verify the branch name matches exactly (case-sensitive)

**Preview environment not created?**
- Ensure the PR is targeting `master` branch
- Check that the workflow file has `pull_request` trigger configured
- Look for Azure's comment on your PR with the preview URL

**Deployment failing?**
- Check the GitHub Actions logs for errors
- Verify all required secrets are set (EmailJS credentials, Azure token)
- Ensure build completes successfully

## Next Steps

1. **To deploy your current changes:**
   ```bash
   git push origin master
   ```

2. **To test in preview first:**
   ```bash
   git checkout -b feature-branch
   git push origin feature-branch
   # Then create a PR on GitHub
   ```

3. **To add EmailJS credentials:**
   - Go to GitHub → Settings → Secrets and variables → Actions
   - Add the three EmailJS secrets (see `QUICK_EMAIL_SETUP.md`)

