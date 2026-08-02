# ==========================================
# Blarm Auto Developer
# Quarto Updater v0.1
# ==========================================

$ProjectFolder = "D:\Git\Repos\Blarm1959\Quarto"
$Downloads = "$env:USERPROFILE\Downloads"
$Port = 8004

Write-Host ""
Write-Host "============================================="
Write-Host "      Blarm Auto Developer"
Write-Host "============================================="
Write-Host ""

# ------------------------------------------------------------
# Find latest Quarto ZIP
# ------------------------------------------------------------

$Zip = Get-ChildItem $Downloads -Filter "Quarto-*.zip" |
       Sort-Object LastWriteTime -Descending |
       Select-Object -First 1

if ($Zip -eq $null)
{
    Write-Host "No Quarto ZIP found in Downloads."
    pause
    exit
}

Write-Host "ZIP Found:"
Write-Host $Zip.Name
Write-Host ""

# ------------------------------------------------------------
# Read release.json
# ------------------------------------------------------------

$temp = Join-Path $env:TEMP "QuartoRelease"

if (Test-Path $temp)
{
    Remove-Item $temp -Recurse -Force
}

Expand-Archive $Zip.FullName -DestinationPath $temp

$releaseFile = Get-ChildItem $temp -Recurse -Filter release.json |
               Select-Object -First 1

if ($releaseFile -eq $null)
{
    Write-Host "release.json not found."
    pause
    exit
}

$release = Get-Content $releaseFile.FullName | ConvertFrom-Json

Write-Host "Project : $($release.project)"
Write-Host "Version : $($release.version)"
Write-Host ""

# ------------------------------------------------------------
# Check if server already running
# ------------------------------------------------------------

$Running = $false

try
{
    Invoke-WebRequest "http://127.0.0.1:$Port" `
        -UseBasicParsing `
        -TimeoutSec 2 | Out-Null

    $Running = $true
}
catch
{
}

# ------------------------------------------------------------
# npm install if required
# ------------------------------------------------------------

Set-Location $ProjectFolder

if ($release.packageChanges)
{
    Write-Host ""
    Write-Host "Running npm install..."
    npm install
}

# ------------------------------------------------------------
# Start server if not already running
# ------------------------------------------------------------

if (-not $Running)
{
    Write-Host ""
    Write-Host "Starting Quarto..."

    Start-Process powershell `
        "-NoExit -Command cd '$ProjectFolder'; npm start"

    Start-Sleep 4
}
else
{
    Write-Host ""
    Write-Host "Quarto already running."
    Write-Host "Press CTRL+F5 in Chrome."
}

# ------------------------------------------------------------
# Git
# ------------------------------------------------------------

Write-Host ""
Write-Host "Updating Git..."

git add .

git commit -m $release.commit

git push

git tag $release.version

git push origin $release.version

Write-Host ""
Write-Host "============================================="
Write-Host "Finished"
Write-Host "============================================="
Write-Host ""