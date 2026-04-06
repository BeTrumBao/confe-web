
import re

with open(r'c:\Users\Em Qizi\Downloads\confe-web-main-20260221T073831Z-1-001\confe-web-main\admin.html', 'r', encoding='utf-8') as f:
    content = f.read()

opens = len(re.findall('<div', content))
closes = len(re.findall('</div>', content))

print(f"Open: {opens}, Close: {closes}")

# Also check for nesting by counting stack depth
stack = []
for match in re.finditer(r'<(/?div)(\s|>)', content):
    tag = match.group(1)
    if tag == 'div':
        stack.append(match.start())
    else:
        if stack:
            stack.pop()
        else:
            print(f"Extra closing div at position {match.start()}")

if stack:
    print(f"Unclosed divs at positions: {stack}")
