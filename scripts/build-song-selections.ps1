$ErrorActionPreference = 'Stop'
. (Join-Path $PSScriptRoot 'catalogue.ps1')
$catalogue = @(Read-Catalogue)
$research = Import-Csv (Join-Path $catalogueRoot 'song-selection-research.csv')
$sources = Get-Content (Join-Path $catalogueRoot 'song-selection-sources.json') -Raw -Encoding UTF8 | ConvertFrom-Json
$groups = [ordered]@{new=@();hit=@()}
foreach ($row in $research) {
    if ($row.code1) { $matches = @($catalogue | Where-Object code1 -eq $row.code1) }
    else { $matches = @($catalogue | Where-Object code2 -eq $row.code2) }
    if ($matches.Count -ne 1) { throw "Ambiguous/missing selection: $($row.group) $($row.code1)/$($row.code2)" }
    if (!$sources.PSObject.Properties[$row.source]) { throw "Missing source: $($row.source)" }
    $song = $matches[0]
    $entry = [ordered]@{code1=$song.code1;code2=$song.code2;title=$song.title;artist=$song.artist}
    if ($row.year) { $entry.year = [int]$row.year }
    $entry.source = $row.source
    $groups[$row.group] += $entry
}
foreach ($group in @('new','hit')) {
    if ($groups[$group].Count -ne 50) { throw "$group must contain exactly 50 songs" }
    $identities = @($groups[$group] | ForEach-Object { ($_.title + '|' + $_.artist).ToUpperInvariant() -replace '\s', '' })
    if (@($identities | Sort-Object -Unique).Count -ne 50) { throw "Duplicate song in $group" }
}
if (@($groups.new | Where-Object { $_.year -lt 2024 -or $_.year -gt 2026 }).Count) { throw 'Invalid release year' }
$json = ConvertTo-Json -InputObject $groups -Depth 5
[IO.File]::WriteAllText((Join-Path $catalogueRoot 'song-selections.js'), "// Researched 2026-10-04. See SONG-SELECTION-RESEARCH.md.`nwindow.karaokeSelections = $json;`n", [Text.UTF8Encoding]::new($false))
$report = [Collections.Generic.List[string]]::new()
$report.Add('# Дууны сонголтын судалгаа — 2026-10-04')
$report.Add('')
$report.Add('Сайтын одоо байгаа сангаас тус бүр 50 дуу сонгов. Шинэ дуу: эх сурвалжид 2024–2026 гэж тэмдэглэгдсэн бүтээлүүдийг оноор нь буурахаар эрэмбэлсэн; ижил он дотор каталогийн кодоор эрэмбэлэв. Энэ нь 2026 оны хамгийн сүүлийн 50 дуу гэсэн баталгаа биш. Каталогийн кодыг гарсан огноо гэж үзээгүй.')
$report.Add('')
$report.Add('Хит дуу: Монголын YouTube/Apple Music чарттай таарсан дуунууд болон олон үеийн караокед зориулсан редакцийн сонголт. Дараалал нь албан ёсны Top 50 эрэмбэ биш. Караокед дуулсан бодит давтамжийн өгөгдөл байхгүй; classic тэмдэглэгээтэй сонголтод тоон чартын баталгаа өгсөнгүй. Хоёр ангилалд нэг дуу багтаж болно, ангилал бүр дотроо давхардалгүй.')
$report.Add('')
$report.Add('Нэр, дуучин, хоёр кодыг одоо байгаа сангаас хэвээр авсан. Тэнгри цувралын товчилсон нэр болон зарим хамтрагчийн мэдээлэл каталогт дутуу байж болно. MVCHI-ийн GOOD VIBES ONLY нэрийг үйлчилгээний Good Vibes-тэй тулгасан. Шинэ upload/дахин хэвлэгдсэн огноог анхны гарсан огноотой андуурахаас зайлсхийв. Хуучин Тасархай залуу, Хэний хүүхэд вэ, Жингийн цуваа, Inner Peace, Могжоохон хүү зэрэг дуунуудыг шинэ ангилалд оруулаагүй.')
foreach ($group in @('new','hit')) {
    $report.Add('')
    $report.Add($(if ($group -eq 'new') {'## Шинэ — 50'} else {'## Хит — 50'}))
    $report.Add('')
    $report.Add('| # | Дуу | Дуучин | Код 1 | Код 2 | Он / үндэслэл |')
    $report.Add('|---|---|---|---|---|---|')
    $position = 0
    foreach ($song in $groups[$group]) {
        $position++
        $source = $sources.PSObject.Properties[$song.source].Value
        $evidence = if ($source[1]) { "[$($song.source)]($($source[1]))" } else {'Редакцийн сонголт'}
        if ($song.year) { $evidence = "$($song.year) · $evidence" }
        $report.Add("| $position | $($song.title.Replace('|','/')) | $($song.artist.Replace('|','/')) | $($song.code1) | $($song.code2) | $evidence |")
    }
}
$report.Add('')
$report.Add('## Эх сурвалж')
$report.Add('')
foreach ($property in $sources.PSObject.Properties) {
    if ($property.Value[1]) { $report.Add("- $($property.Name): [$($property.Value[0])]($($property.Value[1]))") }
}
[IO.File]::WriteAllLines((Join-Path $catalogueRoot 'SONG-SELECTION-RESEARCH.md'), $report, [Text.UTF8Encoding]::new($false))
"Validated and built: $($catalogue.Count) catalogue rows; 50 new, 50 hit; all selections resolve uniquely."
