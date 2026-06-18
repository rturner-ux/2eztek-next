# parse-thumbtack-pst.ps1
# Extracts Thumbtack reviews from an Outlook .pst export file
# Usage: .\parse-thumbtack-pst.ps1 -PstPath "C:\Users\rturn\Desktop\thumbtack-export.pst"

param(
    [Parameter(Mandatory=$false)]
    [string]$PstPath = "$env:USERPROFILE\Desktop\thumbtack-export.pst"
)

if (-not (Test-Path $PstPath)) {
    Write-Host "PST file not found at: $PstPath"
    Write-Host "Usage: .\parse-thumbtack-pst.ps1 -PstPath `"C:\path\to\your-export.pst`""
    exit 1
}

Write-Host "Opening PST: $PstPath"
$outlook = New-Object -ComObject Outlook.Application
$namespace = $outlook.GetNamespace("MAPI")
$namespace.AddStore($PstPath)
Start-Sleep -Seconds 2

# Find the store we just added
$pstStore = $null
foreach ($store in $namespace.Stores) {
    try {
        if ($store.FilePath -and $store.FilePath -eq $PstPath) {
            $pstStore = $store
            break
        }
    } catch {}
}

if (-not $pstStore) {
    Write-Host "Could not match store by FilePath. Checking all stores for a Reviews folder..."
    foreach ($store in $namespace.Stores) {
        try {
            $root = $store.GetRootFolder()
            foreach ($f in $root.Folders) {
                if ($f.Name -eq "Reviews") {
                    Write-Host "Found Reviews folder in: $($store.DisplayName)"
                    $pstStore = $store
                    break
                }
            }
            if ($pstStore) { break }
        } catch {}
    }
}

if (-not $pstStore) {
    Write-Host "Could not find PST store. Available stores:"
    foreach ($store in $namespace.Stores) { Write-Host "  $($store.DisplayName)" }
    exit 1
}

function Find-Folder($folder, $name) {
    if ($folder.Name -eq $name) { return $folder }
    foreach ($sub in $folder.Folders) {
        $result = Find-Folder $sub $name
        if ($result) { return $result }
    }
    return $null
}

$root = $pstStore.GetRootFolder()
Write-Host "PST root: $($root.Name)"

$reviewsFolder = Find-Folder $root "Reviews"
if (-not $reviewsFolder) {
    Write-Host "No 'Reviews' folder found. Available folders:"
    foreach ($f in $root.Folders) {
        Write-Host "  $($f.Name) ($($f.Items.Count) items)"
        foreach ($sf in $f.Folders) { Write-Host "    $($sf.Name) ($($sf.Items.Count) items)" }
    }
    exit 1
}

Write-Host "Found Reviews folder with $($reviewsFolder.Items.Count) items."

function Parse-Review($item) {
    $html = ""
    try { $html = $item.HTMLBody } catch {}
    if (-not $html) {
        try { $html = $item.Body } catch {}
    }
    if (-not $html) { return $null }

    $date = ""
    try { $date = $item.ReceivedTime.ToString("MMM yyyy") } catch { $date = "Unknown" }

    # Rating from h1: "Pamela gave you a 5 star review."
    $rating = 5
    $ratingMatch = [regex]::Match($html, 'gave you a (\d+) star review')
    if ($ratingMatch.Success) { $rating = [int]$ratingMatch.Groups[1].Value }

    # Count gold star images to confirm/override rating
    $starCount = ([regex]::Matches($html, 'alt="gold star"')).Count
    if ($starCount -gt 0) { $rating = $starCount }

    # Display name: <strong>Name H.</strong> in callout (not in header)
    # The service-section strong has font-weight: 600 inline style
    $name = ""
    $nameMatch = [regex]::Match($html, '<strong[^>]*600[^>]*>([A-Z][a-z]+ [A-Z]\.)</strong>')
    if ($nameMatch.Success) {
        $name = $nameMatch.Groups[1].Value.Trim()
    } else {
        # Fallback: grab first name from h1
        $h1Match = [regex]::Match($html, '>([A-Z][a-z]+) gave you a \d+ star review')
        if ($h1Match.Success) { $name = $h1Match.Groups[1].Value }
    }

    # Service: tpe-text--black-link small tag with plain text (no child tags) = the service line
    # The name small contains <strong>, so matching [A-Za-z][^<]+ skips it
    $service = ""
    $serviceMatch = [regex]::Match($html, 'tpe-text--black-link[^>]*>([A-Za-z][^<]{4,80})</small>')
    if ($serviceMatch.Success) { $service = $serviceMatch.Groups[1].Value.Trim() }

    # Review text: the last <small> before "This customer rated you highly"
    $review = ""
    $parts = $html -split 'This customer rated'
    if ($parts.Count -ge 2) {
        $beforeRated = $parts[0]
        $smallMatches = [regex]::Matches($beforeRated, '<small[^>]*>([\s\S]*?)</small>', [System.Text.RegularExpressions.RegexOptions]::Singleline)
        if ($smallMatches.Count -gt 0) {
            $lastContent = $smallMatches[$smallMatches.Count - 1].Groups[1].Value
            # Strip all HTML tags
            $review = [regex]::Replace($lastContent, '<[^>]+>', ' ')
            # Replace HTML entities
            $review = $review -replace '&amp;', '&' -replace '&lt;', '<' -replace '&gt;', '>' -replace '&quot;', '"' -replace '&#39;', "'" -replace '&nbsp;', ' '
            # Clean whitespace
            $review = ($review -split '\s+' | Where-Object { $_ -ne '' }) -join ' '
            $review = $review.Trim()
        }
    }

    # Skip empty or metadata-only reviews
    if ($review -eq "" -or $review -like "This customer*" -or $review.Length -lt 10) { return $null }

    return [PSCustomObject]@{
        name    = $name
        rating  = $rating
        service = $service
        review  = $review
        date    = $date
        source  = "Thumbtack"
    }
}

$reviews = [System.Collections.Generic.List[object]]::new()
$seen = [System.Collections.Generic.HashSet[string]]::new()
$skipped = 0
$i = 0

function Read-FolderReviews($folder) {
    $items = $folder.Items
    $items.Sort("[ReceivedTime]", $true)
    $totalInFolder = $items.Count
    Write-Host "  Iterating $totalInFolder items in: $($folder.Name)"
    $item = $items.GetFirst()
    while ($item -ne $null) {
        $script:i++
        try {
            if ($item.Class -eq 43) {
                $parsed = Parse-Review $item
                if ($parsed -and $parsed.rating -ge 4) {
                    $key = ($parsed.name + "|" + $parsed.review.Substring(0, [Math]::Min(40, $parsed.review.Length))).ToLower()
                    if ($script:seen.Add($key)) {
                        $script:reviews.Add($parsed) | Out-Null
                        $preview = if ($parsed.review.Length -gt 70) { $parsed.review.Substring(0, 70) + "..." } else { $parsed.review }
                        Write-Host "[$($script:i)] $($parsed.name) | $($parsed.rating) stars | $preview"
                    }
                } else {
                    $script:skipped++
                }
            }
        } catch {
            $script:skipped++
        }
        $item = $items.GetNext()
    }
    foreach ($sub in $folder.Folders) {
        Write-Host "  -> Subfolder: $($sub.Name) ($($sub.Items.Count) items)"
        Read-FolderReviews $sub
    }
}

Read-FolderReviews $reviewsFolder

Write-Host ""
Write-Host "Parsed: $($reviews.Count) reviews | Skipped: $skipped"

if ($reviews.Count -gt 0) {
    $outPath = "c:\Users\rturn\2eztek-next\scripts\thumbtack-parsed.json"
    $reviews | ConvertTo-Json -Depth 5 | Out-File -FilePath $outPath -Encoding utf8
    Write-Host "Saved to: $outPath"
    Write-Host ""
    Write-Host "Next step: drop thumbtack-parsed.json into the chat and I will add the reviews to the site."
} else {
    Write-Host "No reviews parsed. Check the folder name and email format."
}

# Remove the PST from Outlook to clean up
try { $namespace.RemoveStore($pstStore.GetRootFolder()) } catch {}
Write-Host "Done."
