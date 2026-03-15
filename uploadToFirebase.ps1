[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12
[console]::OutputEncoding = [System.Text.Encoding]::UTF8

$apiKey = "AIzaSyBPEMno1uZFg4uVXZjz-PbBR37gH6-3t5Y"
$projectId = "confe-web"
$email = "betrumbaodeptraivippro@gmail.com"
$password = "Dung100713"

Write-Host "1. Dang dang nhap vao Firebase Auth bang tai khoan Admin..." -ForegroundColor Cyan

$authUrl = "https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=$apiKey"
$authBody = @{
    email = $email
    password = $password
    returnSecureToken = $true
} | ConvertTo-Json

try {
    $authResponse = Invoke-RestMethod -Uri $authUrl -Method Post -Body $authBody -ContentType "application/json"
    $idToken = $authResponse.idToken

    Write-Host "=> Dang nhap thanh cong, da lay duoc phien lam viec Admin!" -ForegroundColor Green
} catch {
    Write-Host "Loi dang nhap: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $errResp = $reader.ReadToEnd()
        Write-Host "Chi tiet tu server: $errResp" -ForegroundColor Red
    }
    exit
}

Write-Host "2. Dang tai du lieu mon LSDL len Firestore..." -ForegroundColor Cyan

$firestoreUrl = "https://firestore.googleapis.com/v1/projects/$projectId/databases/(default)/documents/subjects/lsdl_7"

$subjectPayload = @"
{
    "fields": {
        "name": { "stringValue": "Lịch sử và Địa lí" },
        "icon": { "stringValue": "history_edu" },
        "color": { "stringValue": "linear-gradient(135deg, #f59e0b, #d97706)" },
        "description": { "stringValue": "Ôn tập kiến thức Lịch sử và Địa lí (Dữ liệu từ tập ghi chép)" },
        "questions": {
            "arrayValue": {
                "values": [
                    { "mapValue": { "fields": { "type": { "stringValue": "mc" }, "topic": { "stringValue": "ls_tran" }, "q": { "stringValue": "Nhà Trần được thành lập vào năm nào?" }, "o": { "arrayValue": { "values": [{ "stringValue": "1010" }, { "stringValue": "1225" }, { "stringValue": "1226" }, { "stringValue": "1400" }] } }, "a": { "integerValue": 2 }, "e": { "stringValue": "Nhà Trần thành lập năm 1226 sau khi Lý Chiêu Hoàng nhường ngôi cho Trần Cảnh." } } } },
                    { "mapValue": { "fields": { "type": { "stringValue": "mc" }, "topic": { "stringValue": "ls_tran" }, "q": { "stringValue": "Quân đội thời Trần được xây dựng theo chủ trương nào?" }, "o": { "arrayValue": { "values": [{ "stringValue": "Quân đội càng đông càng tốt" }, { "stringValue": "Quân đội cốt tinh nhuệ, không cốt đông" }, { "stringValue": "Chỉ tuyển quân ở kinh thành" }, { "stringValue": "Sử dụng lính đánh thuê" }] } }, "a": { "integerValue": 1 }, "e": { "stringValue": "Thời Trần coi trọng chất lượng hơn số lượng: 'Quân cốt tinh nhuệ, không cốt đông'." } } } },
                    { "mapValue": { "fields": { "type": { "stringValue": "mc" }, "topic": { "stringValue": "ls_tran" }, "q": { "stringValue": "Tên bộ luật chính thức của thời Trần là gì?" }, "o": { "arrayValue": { "values": [{ "stringValue": "Hình thư" }, { "stringValue": "Quốc triều hình luật" }, { "stringValue": "Luật Hồng Đức" }, { "stringValue": "Luật Gia Long" }] } }, "a": { "integerValue": 1 }, "e": { "stringValue": "Quốc triều hình luật là bộ luật quan trọng ban hành dưới thời Trần." } } } },
                    { "mapValue": { "fields": { "type": { "stringValue": "mc" }, "topic": { "stringValue": "ls_tran" }, "q": { "stringValue": "Vì sao các vua Trần thường nhường ngôi sớm cho con?" }, "o": { "arrayValue": { "values": [{ "stringValue": "Để đi chơi" }, { "stringValue": "Để làm Thái thượng hoàng và tránh tranh chấp ngôi báu" }, { "stringValue": "Vì sức khỏe yếu" }, { "stringValue": "Để tập trung đánh giặc" }] } }, "a": { "integerValue": 1 }, "e": { "stringValue": "Các vua Trần nhường ngôi sớm để đào tạo thái tử và giữ vững ổn định hậu cung." } } } },
                    { "mapValue": { "fields": { "type": { "stringValue": "mc" }, "topic": { "stringValue": "ls_tran" }, "q": { "stringValue": "Thương cảng nào nổi tiếng nhất thời Trần nằm ở Quảng Ninh?" }, "o": { "arrayValue": { "values": [{ "stringValue": "Hội An" }, { "stringValue": "Phố Hiến" }, { "stringValue": "Vân Đồn" }, { "stringValue": "Lạch Trường" }] } }, "a": { "integerValue": 2 }, "e": { "stringValue": "Vân Đồn (Quảng Ninh) là thương cảng quốc tế sầm uất nhất thời bấy giờ." } } } },
                    { "mapValue": { "fields": { "type": { "stringValue": "mc" }, "topic": { "stringValue": "ls_tran" }, "q": { "stringValue": "Những tôn giáo nào được tôn trọng và phát triển thời Trần?" }, "o": { "arrayValue": { "values": [{ "stringValue": "Chỉ có Phật giáo" }, { "stringValue": "Chỉ có Nho giáo" }, { "stringValue": "Nho giáo, Đạo giáo và Phật giáo" }, { "stringValue": "Thiên chúa giáo" }] } }, "a": { "integerValue": 2 }, "e": { "stringValue": "Thời Trần thực hiện chính sách 'Tam giáo đồng nguyên' (Nho, Đạo, Phật cùng phát triển)." } } } },
                    { "mapValue": { "fields": { "type": { "stringValue": "mc" }, "topic": { "stringValue": "ls_tran" }, "q": { "stringValue": "Ai là người sáng lập ra Thiền phái Trúc Lâm?" }, "o": { "arrayValue": { "values": [{ "stringValue": "Trần Thái Tông" }, { "stringValue": "Trần Thánh Tông" }, { "stringValue": "Trần Nhân Tông" }, { "stringValue": "Trần Hưng Đạo" }] } }, "a": { "integerValue": 2 }, "e": { "stringValue": "Vua Trần Nhân Tông sau khi đi tu đã sáng lập ra Thiền phái Trúc Lâm Yên Tử." } } } },
                    { "mapValue": { "fields": { "type": { "stringValue": "mc" }, "topic": { "stringValue": "ls_tran" }, "q": { "stringValue": "Tầng lớp nào trong xã hội thời Trần phát triển ngày càng nhiều do khai hoang?" }, "o": { "arrayValue": { "values": [{ "stringValue": "Nô tì" }, { "stringValue": "Thợ thủ công" }, { "stringValue": "Địa chủ" }, { "stringValue": "Thương nhân" }] } }, "a": { "integerValue": 2 }, "e": { "stringValue": "Chính sách khuyến khích khai hoang đã làm gia tăng số lượng tầng lớp địa chủ." } } } },
                    { "mapValue": { "fields": { "type": { "stringValue": "mc" }, "topic": { "stringValue": "dia_bacmy" }, "q": { "stringValue": "Khí hậu nào chiếm diện tích LỚN NHẤT ở Bắc Mỹ?" }, "o": { "arrayValue": { "values": [{ "stringValue": "Khí hậu nhiệt đới" }, { "stringValue": "Khí hậu ôn đới" }, { "stringValue": "Khí hậu hàn đới" }, { "stringValue": "Khí hậu hoang mạc" }] } }, "a": { "integerValue": 1 }, "e": { "stringValue": "Khí hậu ôn đới chiếm phần lớn diện tích lục địa Bắc Mỹ." } } } },
                    { "mapValue": { "fields": { "type": { "stringValue": "mc" }, "topic": { "stringValue": "dia_bacmy" }, "q": { "stringValue": "Nguồn cung cấp nước chính cho sông ngòi ở Bắc Mỹ là gì?" }, "o": { "arrayValue": { "values": [{ "stringValue": "Nước mưa" }, { "stringValue": "Nước ngầm" }, { "stringValue": "Hồ lớn và băng tuyết tan" }, { "stringValue": "Nước biển" }] } }, "a": { "integerValue": 2 }, "e": { "stringValue": "Sông ngòi Bắc Mỹ được cung cấp nước từ các hồ lớn và sự tan chảy của băng tuyết." } } } },
                    { "mapValue": { "fields": { "type": { "stringValue": "mc" }, "topic": { "stringValue": "dia_bacmy" }, "q": { "stringValue": "Hệ thống sông hồ lớn nhất ở Bắc Mỹ là?" }, "o": { "arrayValue": { "values": [{ "stringValue": "Sông A-ma-zôn" }, { "stringValue": "Sông Nin" }, { "stringValue": "Sông Mi-xi-xi-pi" }, { "stringValue": "Sông Công-gô" }] } }, "a": { "integerValue": 2 }, "e": { "stringValue": "Mi-xi-xi-pi là hệ thống sông lớn nhất và quan trọng nhất ở Bắc Mỹ." } } } },
                    { "mapValue": { "fields": { "type": { "stringValue": "mc" }, "topic": { "stringValue": "dia_bacmy" }, "q": { "stringValue": "Người nhập cư vào Bắc Mỹ chủ yếu đến từ châu lục nào?" }, "o": { "arrayValue": { "values": [{ "stringValue": "Châu Phi" }, { "stringValue": "Châu Âu, Châu Á, Trung và Nam Mỹ" }, { "stringValue": "Châu Đại Dương" }, { "stringValue": "Châu Nam Cực" }] } }, "a": { "integerValue": 1 }, "e": { "stringValue": "Dân cư Bắc Mỹ rất đa dạng, đến từ nhiều châu lục khác nhau." } } } },
                    { "mapValue": { "fields": { "type": { "stringValue": "mc" }, "topic": { "stringValue": "dia_bacmy" }, "q": { "stringValue": "Đặc điểm nổi bật của đô thị hóa ở Bắc Mỹ là?" }, "o": { "arrayValue": { "values": [{ "stringValue": "Tỉ lệ đô thị hóa thấp" }, { "stringValue": "Đô thị tập trung ở miền Trung" }, { "stringValue": "Tỉ lệ đô thị hóa cao, xuất hiện các dải siêu đô thị" }, { "stringValue": "Dân cư rời bỏ thành thị" }] } }, "a": { "integerValue": 2 }, "e": { "stringValue": "Bắc Mỹ có trình độ đô thị hóa rất cao với các dải siêu đô thị sầm uất." } } } },
                    { "mapValue": { "fields": { "type": { "stringValue": "mc" }, "topic": { "stringValue": "dia_bacmy" }, "q": { "stringValue": "Trung tâm kinh tế nào có quy mô trên 1000 tỷ USD ở Bắc Mỹ?" }, "o": { "arrayValue": { "values": [{ "stringValue": "Oa-sinh-tơn" }, { "stringValue": "Niu-oóc và Lốt-an-giơ-lét" }, { "stringValue": "Si-ca-gô" }, { "stringValue": "Tô-rôn-tô" }] } }, "a": { "integerValue": 1 }, "e": { "stringValue": "New York và Los Angeles là hai trung tâm kinh tế cực lớn của thế giới." } } } },
                    { "mapValue": { "fields": { "type": { "stringValue": "mc" }, "topic": { "stringValue": "ls_ly" }, "q": { "stringValue": "Chủ trương của Lý Thường Kiệt trong cuộc kháng chiến chống Tống là?" }, "o": { "arrayValue": { "values": [{ "stringValue": "Chờ giặc đến rồi đánh" }, { "stringValue": "Tiên phát chế nhân (Tấn công trước để phòng vệ)" }, { "stringValue": "Đầu hàng để cầu hòa" }, { "stringValue": "Bỏ kinh đô chạy ra biển" }] } }, "a": { "integerValue": 1 }, "e": { "stringValue": "Tiên phát chế nhân: 'Ngồi yên đợi giặc không bằng đem quân đánh trước để chặn mũi nhọn của giặc'." } } } },
                    { "mapValue": { "fields": { "type": { "stringValue": "tf" }, "topic": { "stringValue": "ls_ly" }, "q": { "stringValue": "Đúng hay Sai: Việc nhà Lý đem quân sang đánh các căn cứ của nhà Tống là hành động xâm lược." }, "o": { "arrayValue": { "values": [{ "stringValue": "Đúng" }, { "stringValue": "Sai" }] } }, "a": { "integerValue": 1 }, "e": { "stringValue": "SAI. Đó là hành động tự vệ chính đáng để làm suy yếu âm mưu xâm lược của nhà Tống." } } } },
                    { "mapValue": { "fields": { "type": { "stringValue": "arrange" }, "topic": { "stringValue": "dia_bacmy" }, "q": { "stringValue": "Sắp xếp tên các chủng tộc dân cư ở Bắc Mỹ:" }, "words": { "arrayValue": { "values": [{ "stringValue": "Người" }, { "stringValue": "Ơ-rô-pê-ô-it," }, { "stringValue": "Môn-gô-lô-it," }, { "stringValue": "Nê-grô-it" }] } }, "a": { "stringValue": "Người Môn-gô-lô-it, Ơ-rô-pê-ô-it, Nê-grô-it" }, "e": { "stringValue": "Ba chủng tộc chính cấu thành nên dân cư Bắc Mỹ." } } } },
                    { "mapValue": { "fields": { "type": { "stringValue": "arrange" }, "topic": { "stringValue": "ls_ly" }, "q": { "stringValue": "Sắp xếp nét độc đáo trong cách đánh giặc của Lý Thường Kiệt:" }, "words": { "arrayValue": { "values": [{ "stringValue": "Tấn công" }, { "stringValue": "bất ngờ," }, { "stringValue": "đánh vào" }, { "stringValue": "tâm lý" }, { "stringValue": "địch" }] } }, "a": { "stringValue": "Tấn công bất ngờ, đánh vào tâm lý địch" }, "e": { "stringValue": "Sử dụng bài thơ 'Nam quốc sơn hà' để uy hiếp tinh thần quân Tống." } } } }
                ]
            }
        }
    }
}
"@

$firestoreHeaders = @{
    "Authorization" = "Bearer $idToken"
    "Content-Type"  = "application/json"
}

try {
    $bytes = [System.Text.Encoding]::UTF8.GetBytes($subjectPayload)
    $dbResponse = Invoke-RestMethod -Uri $firestoreUrl -Method Patch -Headers $firestoreHeaders -Body $bytes -ContentType "application/json"
    Write-Host "=> Hoan tat tung du lieu mon Lich su Dia li thanh cong!" -ForegroundColor Green
    Write-Host "--------------------------------------------------------"
    Write-Host "XONG! Ban co the mo trang Review tren web de tan huong." -ForegroundColor Magenta
} catch {
    Write-Host "Loi khi ghi du lieu vao Firestore: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.ErrorDetails) {
        Write-Host "Chi tiet loi: $($_.ErrorDetails.Message)" -ForegroundColor Red
    }
}
