const fs = require('fs');
const path = require('path');

const stickersDir = path.join(__dirname, 'stickers');
const chatHtmlPath = path.join(__dirname, 'chat.html');

console.log("Đang đọc thư mục stickers...");
try {
    const files = fs.readdirSync(stickersDir);
    const newStickers = files
        .filter(f => f.match(/\.(png|jpe?g|gif|webp)$/i))
        // Ignore VIP stickers so they aren't added as free stickers
        .filter(f => !(f.includes('Ruby') || f.includes('Dái D.y Img')))
        .map(f => `stickers/${f}`);

    console.log(`Tìm thấy ${newStickers.length} sticker trong thư mục.`);

    let chatHtml = fs.readFileSync(chatHtmlPath, 'utf8');

    // Tìm mảng STICKERS = [ ... ]
    const constRegex = /const\s+STICKERS\s*=\s*\[([\s\S]*?)\];/;
    const match = chatHtml.match(constRegex);

    if (match) {
        // Thay vì nối thêm, ta sẽ ghi đè hoàn toàn bằng mảng base + local để chống trùng lặp IBb
        const baseStickers = [
            "stickers/Ruby.png",
            "https://i.ibb.co/Gvzh84k7/D-i-D-y-Img.png"
        ];
        
        const urls = [...baseStickers, ...newStickers];
        
        console.log(`Đã load tổng cộng ${urls.length} stickers, xóa bỏ các sticker trùng lặp từ link ngoài.`);

        // Tạo lại mảng
        const formattedArray = "const STICKERS = [\n" + urls.map(u => `            "${u}"`).join(',\n') + "\n        ];";
        
        chatHtml = chatHtml.replace(constRegex, formattedArray);
        fs.writeFileSync(chatHtmlPath, chatHtml, 'utf8');
        console.log("✅ Cập nhật chat.html thành công và đã xóa trùng lặp!");
    } else {
        console.log("❌ Không tìm thấy mảng STICKERS trong chat.html");
    }
} catch (e) {
    console.error("❌ Lỗi khi quét thư mục hoặc cập nhật:", e);
}
