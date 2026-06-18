$outlook = New-Object -ComObject Outlook.Application
$namespace = $outlook.GetNamespace("MAPI")

function Find-Folder($folder, $name) {
    if ($folder.Name -eq $name) { return $folder }
    foreach ($sub in $folder.Folders) {
        $found = Find-Folder $sub $name
        if ($found) { return $found }
    }
    return $null
}

$reviewsFolder = $null
foreach ($store in $namespace.Stores) {
    try {
        $root = $store.GetRootFolder()
        $reviewsFolder = Find-Folder $root "Reviews"
        if ($reviewsFolder) { break }
    } catch {}
}

if (-not $reviewsFolder) {
    Write-Host "Could not find Reviews folder."
    exit
}

Write-Host "Found Reviews folder with $($reviewsFolder.Items.Count) items."

function Parse-Review($body, $date) {
    $lines = $body -split "`r?\n" | ForEach-Object { $_.Trim() } | Where-Object { $_ -ne "" }

    $name = ""
    $displayName = ""
    $rating = 0
    $service = ""
    $reviewText = ""

    for ($i = 0; $i -lt $lines.Count; $i++) {
        # "Jordan gave you a 5 star review."
        if ($lines[$i] -match "^(.+?) gave you a (\d) star review") {
            $name = $Matches[1]
            $rating = [int]$Matches[2]
        }
        # "Jordan C." - display name line
        if ($lines[$i] -match "^[A-Z][a-z]+ [A-Z]\.$") {
            $displayName = $lines[$i]
        }
        # Count gold stars for rating fallback
        if ($lines[$i] -like "*gold star*") {
            $starCount = ($lines[$i] -split "gold star").Count - 1
            if ($starCount -gt 0) { $rating = $starCount }
        }
    }

    # Service is the line before the stars block
    for ($i = 0; $i -lt $lines.Count; $i++) {
        if ($lines[$i] -like "*gold star*" -and $i -gt 0) {
            $service = $lines[$i - 1]
            # Review text is lines after the stars, before "This customer rated"
            for ($j = $i + 1; $j -lt $lines.Count; $j++) {
                if ($lines[$j] -like "This customer rated*") { break }
                if ($reviewText -ne "") { $reviewText += " " }
                $reviewText += $lines[$j]
            }
            break
        }
    }

    return [PSCustomObject]@{
        name        = if ($displayName) { $displayName } else { $name }
        rating      = $rating
        service     = $service
        review      = $reviewText.Trim()
        date        = $date
        source      = "Thumbtack"
    }
}

$reviews = [System.Collections.Generic.List[object]]::new()

function Extract-FromFolder($folder) {
    foreach ($item in $folder.Items) {
        if ($item.Class -eq 43 -and $item.Subject -like "*review*") {
            $parsed = Parse-Review $item.Body $item.ReceivedTime.ToString("MMM yyyy")
            if ($parsed.review -ne "") {
                $reviews.Add($parsed) | Out-Null
            }
        }
    }
    foreach ($sub in $folder.Folders) {
        Extract-FromFolder $sub
    }
}

Extract-FromFolder $reviewsFolder

Write-Host "Parsed $($reviews.Count) reviews."

if ($reviews.Count -gt 0) {
    $outPath = "c:\Users\rturn\2eztek-next\scripts\thumbtack-parsed.json"
    $reviews | ConvertTo-Json -Depth 5 | Out-File -FilePath $outPath -Encoding utf8
    Write-Host "Saved to: $outPath"
    Write-Host "Drop that file in the chat and Claude will add them to the site."
} else {
    Write-Host "No reviews parsed. Make sure the Reviews folder is synced in Outlook."
}