# Replace all instances of old color with new PANTONE 7546 C color

# Define colors
$oldColor = "#2D5A9E"
$newColor = "#253746"
$oldHoverColor = "#1E3E6F"
$newHoverColor = "#1A2630"

# Get all TSX and TS files in src directory
$files = Get-ChildItem -Path ".\src" -Include "*.tsx","*.ts" -Recurse

Write-Host "Replacing colors in files..." -ForegroundColor Cyan
Write-Host "Old Primary: $oldColor -> New Primary: $newColor" -ForegroundColor Yellow
Write-Host "Old Hover: $oldHoverColor -> New Hover: $newHoverColor" -ForegroundColor Yellow
Write-Host ""

$totalReplacements = 0

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    
    # Replace primary color
    $content = $content -replace [regex]::Escape($oldColor), $newColor
    
    # Replace hover color
    $content = $content -replace [regex]::Escape($oldHoverColor), $newHoverColor
    
    # Count if any changes were made
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $replacements = ([regex]::Matches($originalContent, [regex]::Escape($oldColor))).Count + 
                       ([regex]::Matches($originalContent, [regex]::Escape($oldHoverColor))).Count
        $totalReplacements += $replacements
        Write-Host "[OK] Updated: $($file.Name) - $replacements replacements" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "[DONE] Total color replacements: $totalReplacements" -ForegroundColor Green
Write-Host ""
Write-Host "To preview the changes, run:" -ForegroundColor Cyan
Write-Host "  npm run dev" -ForegroundColor White
