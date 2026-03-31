$htmlFiles = Get-ChildItem -Path . -Filter *.html
$modifiedCount = 0

$meta = @"
    <!-- Link Preview & SEO Meta Tags -->
    <meta name="description" content="Confe - Nền tảng mạng xã hội mini dành riêng cho bạn. Kết nối và trò chuyện ngay hôm nay!">
    <meta property="og:title" content="Confe - Mạng xã hội thế hệ mới">
    <meta property="og:description" content="Cùng tham gia Confe để khám phá những tính năng kết nối thú vị!">
    <meta property="og:image" content="https://confe-web.vercel.app/assets/favicon.png">
    <meta property="og:image:width" content="512">
    <meta property="og:image:height" content="512">
    <meta property="og:url" content="https://confe-web.vercel.app/">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary">
    <meta name="twitter:title" content="Confe">
    <meta name="twitter:description" content="Mạng xã hội mini Confe">
    <meta name="twitter:image" content="https://confe-web.vercel.app/assets/favicon.png">
    <link rel="apple-touch-icon" href="assets/favicon.png">
"@

$utf8NoBom = New-Object System.Text.UTF8Encoding $false

foreach ($file in $htmlFiles) {
    if ($file.Name -eq 'google0f486cf0a693751b.html' -or $file.Name.StartsWith('404')) { continue }
    
    $content = [System.IO.File]::ReadAllText($file.FullName, $utf8NoBom)
    
    if (-not $content.Contains('property="og:image"')) {
        if ($content.Contains('</head>')) {
            $content = $content.Replace('</head>', "$meta`n</head>")
            [System.IO.File]::WriteAllText($file.FullName, $content, $utf8NoBom)
            $modifiedCount++
            Write-Host "Injected safely into: $($file.Name)"
        }
    }
}

Write-Host "Done safely. Modified files: $modifiedCount"
