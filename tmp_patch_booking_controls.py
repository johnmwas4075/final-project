from pathlib import Path
path = Path('src/app/userpage/page.tsx')
text = path.read_text(encoding='utf-8')
needle = '                  <div className="mt-4 rounded-lg border border-border bg-card">\n'
insert = '''                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Input
                      value={bookingSearch}
                      onChange={(event) => { setBookingSearch(event.target.value); setBookingPage(0) }}
                      placeholder="Search properties or users"
                      className="w-full max-w-xs"
                    />
                    <Select value={bookingTab} onValueChange={(value) => { setBookingTab(value as "pending" | "past" | "cancelled"); setBookingPage(0) }}>
                      <SelectTrigger className="w-full max-w-[200px]">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="past">Past</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="ml-auto text-xs text-muted-foreground">{bookingRangeLabel}</div>
                  </div>\n\n'''
if needle in text and 'bookingRangeLabel' in text and 'Search properties' not in text:
    text = text.replace(needle, insert + needle)
    path.write_text(text, encoding='utf-8')
print('ok')
