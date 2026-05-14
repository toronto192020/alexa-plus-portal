# Alexa+ Portal — Deployment Guide

This repository contains three deployable components for the **Alexa Plus Portal (DLAM/MumCare)**:

| Component | File | Target |
|-----------|------|--------|
| Control portal UI | `index.html` | GitHub Pages |
| Alexa Lambda handler | `lambda_handler.js` | AWS Lambda |
| n8n automation workflow | `n8n_alexa_bridge.json` | n8n instance |

---

## 1 · GitHub Pages (portal UI)

The portal is deployed automatically on every push to `master` via the
[`deploy-pages.yml`](.github/workflows/deploy-pages.yml) workflow.

### One-time setup

1. In your repository go to **Settings → Pages** and set *Source* to **GitHub Actions**.
2. Go to **Settings → Variables → Actions** and add two repository variables:

   | Variable | Value |
   |----------|-------|
   | `N8N_WEBHOOK_URL` | `https://<your-n8n-host>/webhook/alexa-plus-trigger` |
   | `N8N_VIEW_WEBHOOK_URL` | `https://<your-n8n-host>/webhook/echo-show-view-assist` |

3. Push to `master` (or trigger the workflow manually) — the workflow substitutes the
   placeholder URLs and publishes the site.

---

## 2 · AWS Lambda (Alexa skill back-end)

### Environment variables

Set these on the Lambda function (Configuration → Environment variables):

| Key | Value |
|-----|-------|
| `N8N_WEBHOOK_URL` | `https://<your-n8n-host>/webhook/alexa-plus-trigger` |
| `N8N_VIEW_WEBHOOK_URL` | `https://<your-n8n-host>/webhook/echo-show-view-assist` |

### Packaging and upload

The [`package-lambda.yml`](.github/workflows/package-lambda.yml) workflow builds
`lambda_function.zip` on every push and stores it as a GitHub Actions artifact (30-day
retention). Download the artifact and upload it to your Lambda function, or use the
AWS CLI:

```bash
# Download the latest artifact via gh CLI, then:
aws lambda update-function-code \
  --function-name alexa-plus-handler \
  --zip-file fileb://lambda_function.zip
```

### Runtime

- **Runtime**: Node.js 18.x (or later)
- **Handler**: `lambda_handler.handler`
- **Timeout**: 10 seconds recommended

---

## 3 · n8n workflow

1. Open your n8n instance and go to **Workflows → Import from file**.
2. Import `n8n_alexa_bridge.json`.
3. Activate both webhooks:
   - `/webhook/alexa-plus-trigger` — standard action routing
   - `/webhook/echo-show-view-assist` — Echo Show view commands
4. Set the webhook base URL in your n8n instance settings so that the paths above are
   publicly reachable (the same URL you put in `N8N_WEBHOOK_URL`).

---

## Architecture overview

```
Browser (GitHub Pages)
  └─ POST /webhook/alexa-plus-trigger   ──▶  n8n Action Router
  └─ POST /webhook/echo-show-view-assist ──▶  n8n View Assist Router
                                                  └─▶ View Assist Response (JSON)

Alexa Skill (voice)
  └─ Lambda lambda_handler.js
        ├─ POST /webhook/alexa-plus-trigger   ──▶  n8n
        └─ POST /webhook/echo-show-view-assist ──▶  n8n
              └─ Returns APL.RenderDocument directive to Echo Show
```
