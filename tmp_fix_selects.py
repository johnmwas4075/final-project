from pathlib import Path
path = Path('src/app/userpage/page.tsx')
text = path.read_text(encoding='utf-8')
needle = 'Select value={reviewTab} onValueChange={(value) => { setReviewTab(value as "written" | "pending"); setReviewPage(0) }}>'
if needle in text:
    text = text.replace(needle, 'Select value={bookingTab} onValueChange={(value) => { setBookingTab(value as "pending" | "past" | "cancelled"); setBookingPage(0) }}>', 1)
    path.write_text(text, encoding='utf-8')
print('ok')
