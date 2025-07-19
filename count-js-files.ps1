# PowerShell script to count lines in all .js files in src folder and subfolders
# Usage: .\count-js-files.ps1

# Change to the src directory (adjust path as needed)
$srcPath = ".\src"

# Check if src folder exists
if (-not (Test-Path $srcPath)) {
    Write-Host "Error: src folder not found at '$srcPath'" -ForegroundColor Red
    Write-Host "Please run this script from the project root directory or adjust the path." -ForegroundColor Yellow
    exit 1
}

Write-Host "Counting lines in JavaScript files..." -ForegroundColor Green
Write-Host "=" * 80 -ForegroundColor Cyan

# Get all .js files recursively
$jsFiles = Get-ChildItem -Path $srcPath -Filter "*.js" -Recurse | Sort-Object FullName

# Initialize counters
$totalFiles = 0
$totalLines = 0
$results = @()

# Process each file
foreach ($file in $jsFiles) {
    try {
        # Count lines in the file
        $lineCount = (Get-Content $file.FullName | Measure-Object -Line).Lines
        
        # Get relative path from src folder
        $relativePath = $file.FullName.Replace((Resolve-Path $srcPath).Path, "src").Replace("\", "/")
        
        # Store result
        $results += [PSCustomObject]@{
            File = $relativePath
            Lines = $lineCount
            FullPath = $file.FullName
        }
        
        $totalFiles++
        $totalLines += $lineCount
        
    } catch {
        Write-Host "Error reading file: $($file.FullName)" -ForegroundColor Red
    }
}

# Sort results by line count (descending)
$sortedResults = $results | Sort-Object Lines -Descending

# Display results
Write-Host "`nJavaScript Files by Line Count:" -ForegroundColor Yellow
Write-Host "{0,-60} {1,10}" -f "File", "Lines" -ForegroundColor Cyan
Write-Host "-" * 70 -ForegroundColor Cyan

foreach ($result in $sortedResults) {
    # Color code based on file size
    $color = "White"
    if ($result.Lines -gt 1000) { $color = "Red" }
    elseif ($result.Lines -gt 500) { $color = "Yellow" }
    elseif ($result.Lines -gt 200) { $color = "Cyan" }
    else { $color = "Green" }
    
    Write-Host ("{0,-60} {1,10}" -f $result.File, $result.Lines) -ForegroundColor $color
}

# Display summary
Write-Host "`n" + "=" * 80 -ForegroundColor Cyan
Write-Host "SUMMARY:" -ForegroundColor Yellow
Write-Host "Total JavaScript files: $totalFiles" -ForegroundColor White
Write-Host "Total lines of code: $totalLines" -ForegroundColor White
Write-Host "Average lines per file: $([math]::Round($totalLines / $totalFiles, 1))" -ForegroundColor White

# Show files that need refactoring
Write-Host "`nFILES NEEDING REFACTORING:" -ForegroundColor Red
$largeFiles = $sortedResults | Where-Object { $_.Lines -gt 500 }
if ($largeFiles.Count -gt 0) {
    foreach ($file in $largeFiles) {
        $status = if ($file.Lines -gt 1000) { "[MASSIVE]" } elseif ($file.Lines -gt 700) { "[LARGE]" } else { "[MEDIUM]" }
        Write-Host "$status $($file.File) ($($file.Lines) lines)" -ForegroundColor $(if ($file.Lines -gt 1000) { "Red" } elseif ($file.Lines -gt 700) { "Yellow" } else { "DarkYellow" })
    }
} else {
    Write-Host "*** No files over 500 lines! Great job! ***" -ForegroundColor Green
}

Write-Host "`nDone!" -ForegroundColor Green