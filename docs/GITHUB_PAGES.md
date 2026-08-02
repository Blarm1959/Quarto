# GitHub Pages deployment

## One-time repository setup

1. Open the Quarto repository on GitHub.
2. Open **Settings**.
3. In **Code and automation**, select **Pages**.
4. Under **Build and deployment**, change **Source** to **GitHub Actions**.
5. Return to the repository and open **Actions**. Ensure Actions are enabled if GitHub asks.

No branch or `/docs` publishing folder should be selected. The supplied workflow publishes the website artifact itself.

## Publish a release

Use the existing local process:

```powershell
.\Update.ps1
```

After the push reaches `main`, the **Deploy Quarto to GitHub Pages** workflow validates and publishes the app. The live URL appears in the deployment summary and under **Settings > Pages**.

For a repository named `Quarto`, the normal address is:

```text
https://blarm1959.github.io/Quarto/
```

Repository names and URLs are case-sensitive in some contexts, so use the exact address shown by GitHub.

## Install on Android

1. Open the live HTTPS address in Chrome.
2. Allow the page to load completely once.
3. Use Quarto's **Install app** button, or Chrome's **Install app** menu command.
4. Start the installed app once while online so the latest offline cache is ready.

## Confirm the deployed version

The footer displays the package version and the first seven characters of the deployed Git commit. Hover over it on a computer to see the deployment time. The workflow generates `build-info.json`; it is not necessary to edit this by hand.

## Troubleshooting

- **Workflow does not start:** confirm the push went to `main`, or run it manually from the Actions tab.
- **Pages reports no site:** set **Settings > Pages > Source** to **GitHub Actions**.
- **Old installed version remains:** reopen the app while online, accept the update banner, then restart it.
- **Install option absent:** use HTTPS, wait for the service worker to finish, and ensure the browser supports PWA installation.
