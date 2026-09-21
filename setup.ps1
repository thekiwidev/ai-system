# thekiwidev AI system — one-line bootstrap for Windows PowerShell 5.1+ / PowerShell 7.
#   irm https://raw.githubusercontent.com/thekiwidev/ai-system/main/setup.ps1 | iex
#   & ([scriptblock]::Create((irm https://raw.githubusercontent.com/thekiwidev/ai-system/main/setup.ps1))) -Owner jane -Home .jane -Yes
# Clones into $HOME\.<name> (default .thekiwidev), then runs bin\setup.js. Symlinks need Developer Mode (Settings → For developers) or an elevated terminal.
param([string]$Owner, [string]$Home = ".thekiwidev", [switch]$Yes, [string]$Repo = "https://github.com/thekiwidev/ai-system.git")
$ErrorActionPreference = "Stop"
if (-not (Get-Command git -ErrorAction SilentlyContinue)) { throw "setup: git is required" }
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw "setup: Node.js 18+ is required (https://nodejs.org)" }
if (-not $Home.StartsWith(".")) { $Home = ".$Home" }
$Dest = Join-Path $env:USERPROFILE $Home
if (Test-Path $Dest) { throw "setup: $Dest already exists - run: node $Dest\bin\setup.js" }
git clone --depth 1 $Repo $Dest
$argsList = @()
if ($Owner) { $argsList += @("--owner", $Owner) }
$argsList += @("--home", $Home)
if ($Yes) { $argsList += "--yes" }
& node (Join-Path $Dest "bin\setup.js") @argsList
