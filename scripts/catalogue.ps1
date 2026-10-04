param([string]$CatalogueRoot = (Split-Path $PSScriptRoot -Parent))
$ErrorActionPreference = 'Stop'
function Read-Catalogue {
    param([switch]$IncludeSource)
    $entries = @()
    foreach ($file in @('song-data.js', 'song-data-extra.js', 'song-data-extra-2.js', 'song-data-extra-3.js', 'song-data-extra-4.js')) {
        $raw = [IO.File]::ReadAllText((Join-Path $catalogueRoot $file))
        if ($file -eq 'song-data-extra-2.js' -and $raw.Contains('const rows =')) {
            $defaultArtist = [regex]::Match($raw, 'const t = "([^"]+)"').Groups[1].Value
            $json = [regex]::Match($raw, '(?s)const rows = (\[.*?\]);').Groups[1].Value
            $fileEntries = @(foreach ($row in (ConvertFrom-Json $json)) {
                [pscustomobject]@{code1='';code2=$row[1];title=$row[0];artist=$(if ($row.Count -gt 2) {$row[2]} else {$defaultArtist})}
            })
        } else {
        $json = $raw.Substring($raw.IndexOf('[')).Trim().TrimEnd(';')
        $json = $json -replace '(?m)(\{|,)\s*(code1|code2|title|artist)\s*:', '$1"$2":'
            $fileEntries = @(ConvertFrom-Json $json | ForEach-Object { $_ })
        }
        if ($IncludeSource) {
            for ($index = 0; $index -lt $fileEntries.Count; $index++) {
                $fileEntries[$index] | Add-Member -NotePropertyName _source -NotePropertyValue $file
                $fileEntries[$index] | Add-Member -NotePropertyName _sourceIndex -NotePropertyValue $index
            }
        }
        $entries += $fileEntries
    }
    $entries
}
