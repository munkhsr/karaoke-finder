param([string]$CatalogueRoot = (Split-Path $PSScriptRoot -Parent))
$ErrorActionPreference = 'Stop'
. ([scriptblock]::Create([IO.File]::ReadAllText((Join-Path $CatalogueRoot 'scripts/catalogue.ps1')))) -CatalogueRoot $CatalogueRoot

function Song-Key($song) {
    ($song.title.Normalize().ToLowerInvariant() -replace '[^\p{L}\p{N}]', '') + '|' +
    ($song.artist.Normalize().ToLowerInvariant() -replace '[^\p{L}\p{N}]', '')
}
function Identity($song) { @($song.code1, $song.code2, $song.title, $song.artist) -join "`t" }

$songs = @(Read-Catalogue -IncludeSource)
$selectionPath = Join-Path $CatalogueRoot 'song-selections.js'
$selectionRaw = [IO.File]::ReadAllText($selectionPath)
$selections = ConvertFrom-Json ($selectionRaw.Substring($selectionRaw.IndexOf('{')).Trim().TrimEnd(';'))
$selectedIdentities = @{}
foreach ($selection in @($selections.new) + @($selections.hit)) { $selectedIdentities[(Identity $selection)] = $true }
$duplicates = @($songs | Group-Object -Property { Song-Key $_ } | Where-Object Count -gt 1)
$removed = @{}
$changedFiles = @{}
$audit = @()
foreach ($group in $duplicates) {
    # Prefer a researched selection, then the entry with the most populated codes.
    $ordered = @($group.Group | Sort-Object @{Expression={if ($selectedIdentities.ContainsKey((Identity $_))) {1} else {0}};Descending=$true}, @{Expression={@($_.code1,$_.code2 | Where-Object {$_}).Count};Descending=$true})
    $keep = $ordered[0]
    $originalIdentities = @($group.Group | ForEach-Object { Identity $_ })
    foreach ($field in @('code1', 'code2')) {
        $codes = @($group.Group | ForEach-Object {
            $_.$field
            if ($_.alternateCodes) { $_.alternateCodes.$field }
        } | Where-Object { $_ } | Select-Object -Unique)
        if (-not $keep.$field -and $codes.Count) { $keep.$field = $codes[0] }
        $alternates = @($codes | Where-Object { $_ -ne $keep.$field })
        if ($alternates.Count) {
            if (-not $keep.alternateCodes) { Add-Member -InputObject $keep -NotePropertyName alternateCodes -NotePropertyValue @{} }
            $keep.alternateCodes[$field] = $alternates
        }
    }
    $changedFiles[$keep._source] = $true
    foreach ($drop in $ordered | Select-Object -Skip 1) {
        $removed["$($drop._source):$($drop._sourceIndex)"] = $true
        $changedFiles[$drop._source] = $true
        $audit += [pscustomobject]@{source=$drop._source;title=$drop.title;artist=$drop.artist;code1=$drop.code1;code2=$drop.code2;retainedSource=$keep._source;retainedCode1=$keep.code1;retainedCode2=$keep.code2}
    }
    foreach ($selection in @($selections.new) + @($selections.hit)) {
        if ($originalIdentities -contains (Identity $selection)) {
            foreach ($field in @('code1','code2','title','artist')) { $selection.$field = $keep.$field }
        }
    }
}

$encoding = New-Object Text.UTF8Encoding($false)
$variables = @{'song-data.js'='karaokeSongs';'song-data-extra.js'='karaokeExtraSongs';'song-data-extra-2.js'='karaokeExtraSongs2';'song-data-extra-3.js'='karaokeExtraSongs3';'song-data-extra-4.js'='karaokeExtraSongs4'}
foreach ($file in $changedFiles.Keys) {
    $rows = @($songs | Where-Object { $_._source -eq $file -and -not $removed.ContainsKey("$($_._source):$($_._sourceIndex)") } | Select-Object * -ExcludeProperty _source,_sourceIndex)
    $json = ConvertTo-Json -InputObject $rows -Depth 8 -Compress
    [IO.File]::WriteAllText((Join-Path $CatalogueRoot $file), "window.$($variables[$file]) = $json;`n", $encoding)
}
if ($duplicates.Count) {
    [IO.File]::WriteAllText($selectionPath, "// Researched 2026-10-04. See SONG-SELECTION-RESEARCH.md.`nwindow.karaokeSelections = $(ConvertTo-Json $selections -Depth 8);`n", $encoding)
    $audit | Export-Csv (Join-Path $CatalogueRoot 'song-duplicates-removed.csv') -NoTypeInformation -Encoding UTF8
}
Write-Output "Before: $($songs.Count); removed: $($removed.Count); after: $($songs.Count - $removed.Count). All codes retained."
