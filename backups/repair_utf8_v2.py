import os

file_path = r"c:\Users\Em Qizi\Downloads\confe-web-main-20260221T073831Z-1-001\confe-web-main\reviewtest.html"

# Granular Mappings for Vietnamese Mojibake
restoration_map = {
    "Đ‘ỏ  ": "Đề ",
    "Đ‘ỏ ": "Đề",
    "cÃ¢u": "câu",
    "hỏ i": "hỏi",
    "nhả­p": "nhập",
    "hỏ c": "học",
    "mỏ›i": "mới",
    "mỏ¾i": "mới",
    "chỏ  ": "chờ ",
    "chỏ ": "chờ",
    "duyỏ‡t": "duyệt",
    "luyỏ‡n": "luyện",
    "kiả¿n": "kiến",
    "thỏ©c": "thức",
    "ả¥t": "ất",
    "ả©n": "ẩn",
    "dÃ¹ng": "dùng",
    "NgÆ°ỏ i": "Người",
    "Đ‘Ã£": "Đã",
    "Đ‘Æ°ỏ£c": "được",
    "ả¡i": "ại",
    "ỏ—i": "ỗi",
    "dỏ¯": "dữ",
    "liỏ‡u": "liệu",
    "ả£p": "ợp",
    "ả¥p": "ấp",
    "ỏ‹": "ị",
    "nÃ y": "này",
    "nÃ o": "nào",
    "MÃ´n": "Môn",
    "ả¥t cả£": "tất cả",
    "Trả¯c": "Trắc",
    "nghiỏ‡m": "nghiệm",
    "thả£": "thả",
    "Đ ang": "Đang",
    "hả¡ng": "hạng",
    "nhả¥t": "nhất",
    "trang!": "trang!",
    "kả¿t nỏ‘i": "kết nối",
    "Đ‘Æ°ỏ£c": "được",
    "Tuyỏ‡t vỏ i": "Tuyệt vời",
    "gÃ³p Ã½": "góp ý",
    "bả¡n!": "bạn!",
    "trả£ lỏ i": "trả lời",
    "Đ Ãºng": "Đúng",
    "rỏ“i": "rồi",
    "ả¥t cả£": "tất cả",
    "hiỏ‡n": "hiện",
    "bả£o trÃ¬": "bảo trì",
    "TÃ­nh nĐƒng": "Tính năng",
    "ả§n": "ần",
    "Bả¯c": "Bắc",
    "Mỏ¹": "Mỹ",
    "thả» ": "thẻ",
    "xả·": "xảy",
    "Đ ang": "Đang",
    "Đ ": "Đ", # Fix the space after Đ often seen
}

def restore_utf8_v2():
    if not os.path.exists(file_path):
        print(f"Error: {file_path} not found.")
        return

    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Sort keys by length descending
    sorted_keys = sorted(restoration_map.keys(), key=len, reverse=True)
    
    for key in sorted_keys:
        content = content.replace(key, restoration_map[key])

    # Final cleanup for orphaned spaces or double replacements
    content = content.replace("Đ ang", "Đang")
    content = content.replace("Đ  ang", "Đang")

    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

if __name__ == "__main__":
    restore_utf8_v2()
    print("UTF-8 Restoration V2 completed.")
