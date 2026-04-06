$filePath = "c:\Users\Em Qizi\Downloads\confe-web-main-20260221T073831Z-1-001\confe-web-main\reviewtest.html"
$mappingPath = "c:\Users\Em Qizi\Downloads\confe-web-main-20260221T073831Z-1-001\confe-web-main\encoding_mapping.txt"

$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)
$mapping = Get-Content -Path $mappingPath -Encoding UTF8

foreach ($line in $mapping) {
    if ($line.Contains('|')) {
        $parts = $line.Split('|')
        $from = $parts[0]
        $to = $parts[1]
        if ($content.Contains($from)) {
            $content = $content.Replace($from, $to)
        }
    }
}

[System.IO.File]::WriteAllText($filePath, $content, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "Successfully applied encoding fixes using mapping file."
