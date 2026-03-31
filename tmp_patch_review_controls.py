from pathlib import Path
path = Path('src/app/userpage/page.tsx')
text = path.read_text(encoding='utf-8')
needle = '''                      Pending Reviews
                    </Button>
                  </div>

                  <div className="mt-4 rounded-lg border border-border bg-card">
'''
insert = '''                      Pending Reviews
                    </Button>
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-3">
                    <Input
                      value={reviewSearch}
                      onChange={(event) => { setReviewSearch(event.target.value); setReviewPage(0) }}
                      placeholder="Search properties or users"
                      className="w-full max-w-xs"
                    />
                    <Select value={reviewTab} onValueChange={(value) => { setReviewTab(value as "written" | "pending"); setReviewPage(0) }}>
                      <SelectTrigger className="w-full max-w-[200px]">
                        <SelectValue placeholder="Category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="written">Written</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="ml-auto text-xs text-muted-foreground">{reviewRangeLabel}</div>
                  </div>

                  <div className="mt-4 rounded-lg border border-border bg-card">
'''
if needle in text and 'reviewRangeLabel' in text and 'Search properties or users' in insert:
    text = text.replace(needle, insert)
    path.write_text(text, encoding='utf-8')
print('ok')
