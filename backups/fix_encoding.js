const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\Em Qizi\\Downloads\\confe-web-main-20260221T073831Z-1-001\\confe-web-main\\reviewtest.html';
let content = fs.readFileSync(filePath, 'utf8');

// List of mojibake and their replacements
const replacements = [
    { from: 'Há»‡ thá»‘ng Ã”n táº­p Giá»¯a kÃ¬', to: 'Hệ thống Ôn tập Giữa kì' },
    { from: 'Ã”n táº­p thÃ´ng minh', to: 'Ôn tập thông minh' },
    { from: 'Há» c táº­p hiá»‡u quáº£ vá»›i Ä‘á»  cÆ°Æ¡ng tá»± chá» n vÃ  cá»™ng Ä‘á»“ng', to: 'Học tập hiệu quả với đề cương tự chọn và cộng đồng' },
    { from: 'Táº¡o Ä á»  CÆ°Æ¡ng', to: 'Tạo Đề Cương' },
    { from: 'Ä á»  cÆ°Æ¡ng cá»§a tÃ´i', to: 'Đề cương của tôi' },
    { from: 'Cá»™ng Ä‘á»“ng shared', to: 'Cộng đồng shared' },
    { from: 'Ä ang táº£i danh sÃ¡ch mÃ´n há» c...', to: 'Đang tải danh sách môn học...' },
    { from: 'Khoa há» c tá»± nhiÃªn 7', to: 'Khoa học tự nhiên 7' },
    { from: 'GÃ³p Ã½', to: 'Góp ý' },
    { from: 'ChÃ­nh xÃ¡c!', to: 'Chính xác!' },
    { from: 'Sai rá»“i!', to: 'Sai rồi!' }
];

replacements.forEach(r => {
    content = content.split(r.from).join(r.to);
});

// Write as UTF-8 (Node.js writeFileSync with utf8 doesn't add BOM by default)
fs.writeFileSync(filePath, content, 'utf8');
console.log('Successfully fixed encoding in reviewtest.html');
