$filePath = "c:\Users\Em Qizi\Downloads\confe-web-main-20260221T073831Z-1-001\confe-web-main\reviewtest.html"
$content = [System.IO.File]::ReadAllText($filePath, [System.Text.Encoding]::UTF8)

$replacements = @(
    @{ from = 'Ã”n táº­p thÃ´ng minh'; to = 'Ôn tập thông minh' },
    @{ from = 'Há» c táº­p hiá»‡u quáº£'; to = 'Học tập hiệu quả' },
    @{ from = 'vá»›i Ä‘á»  cÆ°Æ¡ng'; to = 'với đề cương' },
    @{ from = 'tá»± chá» n'; to = 'tự chọn' },
    @{ from = 'vÃ  cá»™ng Ä‘á»“ng'; to = 'và cộng đồng' },
    @{ from = 'GÃ³p Ã½'; to = 'Góp ý' },
    @{ from = 'Táº¡o Ä á»  CÆ°Æ¡ng'; to = 'Tạo Đề Cương' },
    @{ from = 'Ä á»  cÆ°Æ¡ng cá»§a tÃ´i'; to = 'Đề cương của tôi' },
    @{ from = 'Cá»™ng Ä‘á»“ng shared'; to = 'Cộng đồng shared' },
    @{ from = 'Ä ang táº£i danh sÃ¡ch mÃ´n há» c...'; to = 'Đang tải danh sách môn học...' },
    @{ from = 'Khoa há» c tá»± nhiÃªn 7'; to = 'Khoa học tự nhiên 7' },
    @{ from = 'Cháº¿ Ä á»™ Solo BO3'; to = 'Chế độ Solo BO3' },
    @{ from = 'Ã”n CÃ¢u Sai'; to = 'Ôn Câu Sai' },
    @{ from = 'Luyá»‡n TrÃ­ Nhá»›'; to = 'Luyện Trí Nhớ' },
    @{ from = 'TrÃ² ChÆ¡i GhÃ©p Tháº»'; to = 'Trò Chơi Ghép Thẻ' },
    @{ from = 'Cá»­a HÃ ng Tháº»'; to = 'Cửa Hàng Thẻ' },
    @{ from = 'TÃ i sáº£n hiá»‡n táº¡i'; to = 'Tài sản hiện tại' },
    @{ from = 'Ä iá»ƒm Uy tÃ­n'; to = 'Điểm Uy tín' },
    @{ from = 'Kho Ä‘á»“'; to = 'Kho đồ' },
    @{ from = 'ThÃ¡ch Ä‘áº¥u BO3'; to = 'Thách đấu BO3' },
    @{ from = 'Thi Ä‘áº¥u tráº¯c nghiá»‡m'; to = 'Thi đấu trắc nghiệm' },
    @{ from = 'Nháº­n pháº§n thÆ°á»Ÿng'; to = 'Nhận phần thưởng' },
    @{ from = 'cá»±c ká»³ háº¥p dáº«n'; to = 'cực kỳ hấp dẫn' },
    @{ from = 'Táº¡o PhÃ²ng Má»›i'; to = 'Tạo Phòng Mới' },
    @{ from = 'Nháº­p mÃ£ phÃ²ng...'; to = 'Nhập mã phòng...' },
    @{ from = 'VÃ o PhÃ²ng ThÃ¡ch Ä áº¥u'; to = 'Vào Phòng Thách Đấu' },
    @{ from = 'MÃ£ phÃ²ng cá»§a cáº­u'; to = 'Mã phòng của cậu' },
    @{ from = 'CÃ¢u há» i'; to = 'Câu hỏi' },
    @{ from = 'Há»‡ thá»‘ng Ã”n táº­p Giá»¯a kÃ¬'; to = 'Hệ thống Ôn tập Giữa kì' },
    @{ from = 'Nháº¥n Ä‘á»ƒ chá» n áº£nh'; to = 'Nhấn để chọn ảnh' },
    @{ from = 'CÃ³ thá»ƒ chá» n nhiá» u áº£nh cÃ¹ng lÃºc'; to = 'Có thể chọn nhiều ảnh cùng lúc' },
    @{ from = 'Há»§y'; to = 'Hủy' },
    @{ from = 'Gá»­i gÃ³p Ã½'; to = 'Gửi góp ý' },
    @{ from = 'nhÃ©!'; to = 'nhé!' },
    @{ from = 'Quay vá»  Trang chá»§'; to = 'Quay về Trang chủ' },
    @{ from = 'TÃ­nh nÄƒng nÃ y hiá»‡n Ä‘ang Ä‘Æ°á»£c nÃ¢ng cáº¥p'; to = 'Tính năng này hiện đang được nâng cấp' },
    @{ from = 'Ä‘á»ƒ mang láº¡i tráº£i nghiá»‡m tá»‘t nháº¥t cho báº¡n'; to = 'để mang lại trải nghiệm tốt nhất cho bạn' },
    @{ from = 'Vui lÃ²ng quay láº¡i sau Ã­t phÃºt'; to = 'Vui lòng quay lại sau ít phút' },
    @{ from = 'CÃ¢u'; to = 'Câu' },
    @{ from = 'Tá»± luáº­n'; to = 'Tự luận' },
    @{ from = 'Nháº­p Ä‘Ã¡p Ã¡n...'; to = 'Nhập đáp án...' },
    @{ from = 'ChÃ­nh xÃ¡c!'; to = 'Chính xác!' },
    @{ from = 'ChÆ°a Ä‘Ãºng rá»“i!'; to = 'Chưa đúng rồi!' },
    @{ from = 'âœ… Tuyá»‡t vá» i!'; to = '✅ Tuyệt vời!' },
    @{ from = 'Báº¡n Ä‘Ã£ tráº£ lá» i Ä‘Ãºng'; to = 'Bạn đã trả lời đúng' },
    @{ from = 'â Œ Sai rá»“i!'; to = '❌ Sai rồi!' },
    @{ from = 'Báº¡n Ä‘Ã£ hoÃ n thÃ nh'; to = 'Bạn đã hoàn thành' },
    @{ from = 'Ä ang chá»  Ä‘á»‘i thá»§...'; to = 'Đang chờ đối thủ...' }
)

foreach ($r in $replacements) {
    if ($content.Contains($r.from)) {
        $content = $content.Replace($r.from, $r.to)
    }
}

[System.IO.File]::WriteAllText($filePath, $content, (New-Object System.Text.UTF8Encoding($false)))
Write-Host "Successfully applied all encoding fixes to reviewtest.html"
