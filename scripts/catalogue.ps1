$ErrorActionPreference = 'Stop'
$catalogueRoot = Split-Path $PSScriptRoot -Parent
function Read-Catalogue {
    $entries = @()
    foreach ($file in @('song-data.js', 'song-data-extra.js', 'song-data-extra-3.js', 'song-data-extra-4.js')) {
        $raw = [IO.File]::ReadAllText((Join-Path $catalogueRoot $file))
        $json = $raw.Substring($raw.IndexOf('[')).Trim().TrimEnd(';')
        $json = $json -replace '(?m)(\{|,)\s*(code1|code2|title|artist)\s*:', '$1"$2":'
        $entries += ConvertFrom-Json $json
    }
    $raw = [IO.File]::ReadAllText((Join-Path $catalogueRoot 'song-data-extra-2.js'))
    $defaultArtist = [regex]::Match($raw, 'const t = "([^"]+)"').Groups[1].Value
    $json = [regex]::Match($raw, '(?s)const rows = (\[.*?\]);').Groups[1].Value
    foreach ($row in (ConvertFrom-Json $json)) {
        $entries += [pscustomobject]@{code1='';code2=$row[1];title=$row[0];artist=$(if ($row.Count -gt 2) {$row[2]} else {$defaultArtist})}
    }
    $entries
}
