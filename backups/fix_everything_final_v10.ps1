$filePath = "c:\Users\Em Qizi\Downloads\confe-web-main-20260221T073831Z-1-001\confe-web-main\reviewtest.html"
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

# These are surgical replacements, targeting exact strings to avoid over-replacement
$finalFixes = @(
    # --- Structural Fixes (CSS & Fonts) ---
    @{ from = '20.48,100.700,0.1,-50.200'; to = '20..48,100..700,0..1,-50..200' },
    @{ from = '-primary:'; to = '--primary:' },
    @{ from = '-primary-bg:'; to = '--primary-bg:' },
    @{ from = '-bg-body:'; to = '--bg-body:' },
    @{ from = '-card-glass:'; to = '--card-glass:' },
    @{ from = '-card-border:'; to = '--card-border:' },
    @{ from = '-text-main:'; to = '--text-main:' },
    @{ from = '-text-secondary:'; to = '--text-secondary:' },
    @{ from = 'var(-primary)'; to = 'var(--primary)' },
    @{ from = 'var(-bg-body)'; to = 'var(--bg-body)' },
    @{ from = 'var(-text-main)'; to = 'var(--text-main)' },
    @{ from = 'var(-card-border)'; to = 'var(--card-border)' },
    @{ from = 'var(-card-glass)'; to = 'var(--card-glass)' },
    @{ from = 'var(-text-secondary)'; to = 'var(--text-secondary)' },
    @{ from = '/* - Dashboard'; to = '/* --- Dashboard' },
    @{ from = 'Styles - */'; to = 'Styles --- */' },
    @{ from = '<!- '; to = '<!-- ' },
    @{ from = ' ->'; to = ' -->' },

    # --- Vietnamese Precision Fixes ---
    @{ from = 'Quay vỏ '; to = 'Quay về' },
    @{ from = 'Trang chỏ§'; to = 'Trang chủ' },
    @{ from = 'Đ‘ỏ '; to = 'đề' },
    @{ from = 'môn hỏ c'; to = 'môn học' },
    @{ from = 'hỏ c tự nhiên'; to = 'học tự nhiên' },
    @{ from = 'Nhấn để chỏ n'; to = 'Nhấn để chọn' },
    @{ from = 'Hỏ c tập'; to = 'Học tập' },
    @{ from = 'Tả¡o'; to = 'Tạo' },
    @{ from = 'CÆ°Æ¡ng'; to = 'Cương' },
    @{ from = 'Đ ỏ '; to = 'Đề' },
    @{ from = 'Chả¿ Đ ỏ™'; to = 'Chế độ' },
    @{ from = 'Đ iỏƒm'; to = 'Điểm' },
    @{ from = 'Bả£o Vỏ‡'; to = 'Bảo Vệ' },
    @{ from = 'Phòng Mỏ›i'; to = 'Phòng Mới' },
    @{ from = 'Đ ả¥u'; to = 'Đấu' },
    @{ from = 'bả±ng'; to = 'bằng' },
    @{ from = 'chỏ n'; to = 'chọn' },
    @{ from = 'nhiỏ u'; to = 'nhiều' },
    @{ from = 'Có thể chỏ n'; to = 'Có thể chọn' },
    @{ from = 'cÃ¹ng lÃºc'; to = 'cùng lúc' },
    @{ from = 'tải lÃªn'; to = 'tải lên' },
    @{ from = 'tỏ± chỏ n'; to = 'tự chọn' },
    @{ from = 'hiỏ‡u quả'; to = 'hiệu quả' },
    @{ from = 'vỏ›i'; to = 'với' }
)

foreach ($f in $finalFixes) {
    if ($content.Contains($f.from)) {
        $content = $content.Replace($f.from, $f.to)
    }
}

[System.IO.File]::WriteAllText($filePath, $content, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "All structural and encoding fixes applied successfully to reviewtest.html"
