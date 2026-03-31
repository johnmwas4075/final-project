from pathlib import Path
path = Path('src/app/userpage/page.tsx')
text = path.read_text(encoding='utf-8')
needle = '''                    Withdrawals
                  </Button>
                </div>

                <div className="mt-4 rounded-lg border border-border bg-card">
'''
insert = '''                    Withdrawals
                  </Button>
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-3">
                  <Input
                    value={paymentSearch}
                    onChange={(event) => { setPaymentSearch(event.target.value); setPaymentPage(0) }}
                    placeholder="Search username"
                    className="w-full max-w-xs"
                  />
                  <Select value={transactionTab} onValueChange={(value) => { setTransactionTab(value as "all" | "payments" | "deposits" | "withdrawals"); setPaymentPage(0) }}>
                    <SelectTrigger className="w-full max-w-[200px]">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="payments">Payments</SelectItem>
                      <SelectItem value="deposits">Deposits</SelectItem>
                      <SelectItem value="withdrawals">Withdrawals</SelectItem>
                    </SelectContent>
                  </Select>
                  <div className="ml-auto text-xs text-muted-foreground">{paymentRangeLabel}</div>
                </div>

                <div className="mt-4 rounded-lg border border-border bg-card">
'''
if needle in text and 'paymentRangeLabel' in text:
    text = text.replace(needle, insert)
    path.write_text(text, encoding='utf-8')
print('ok')
