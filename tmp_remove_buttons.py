from pathlib import Path
import re
path = Path('src/app/userpage/page.tsx')
text = path.read_text(encoding='utf-8')

# Remove bookings buttons block
text = re.sub(r"\n\s*<div className=\"flex flex-wrap gap-2\">[\s\S]*?</div>\n\s*<div className=\"mt-4 flex flex-wrap items-center gap-3\">", "\n\n                <div className=\"mt-4 flex flex-wrap items-center gap-3\">", text, count=1)

# Remove reviews buttons block
text = re.sub(r"\n\s*<div className=\"flex flex-wrap gap-2\">[\s\S]*?</div>\n\s*<div className=\"mt-4 flex flex-wrap items-center gap-3\">", "\n\n                  <div className=\"mt-4 flex flex-wrap items-center gap-3\">", text, count=1)

# Remove payments buttons block
text = re.sub(r"\n\s*<div className=\"mt-6 flex flex-wrap gap-2\">[\s\S]*?</div>\n\s*<div className=\"mt-4 flex flex-wrap items-center gap-3\">", "\n\n                <div className=\"mt-4 flex flex-wrap items-center gap-3\">", text, count=1)

path.write_text(text, encoding='utf-8')
print('ok')
