$files = Get-ChildItem -Recurse -Include *.html, *.js -Exclude node_modules, .git
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    if ($content -match 'authDomain: "confe-web\.vercel\.app"') {
        $newContent = $content -replace 'authDomain: "confe-web\.vercel\.app"', 'authDomain: "confe-web.firebaseapp.com"'
        Set-Content $file.FullName $newContent -NoNewline
        Write-Output "Reverted: $($file.FullName)"
    }
}
