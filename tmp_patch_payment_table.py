from pathlib import Path
path = Path('src/app/userpage/page.tsx')
text = path.read_text(encoding='utf-8')
text = text.replace('<th className="px-4 py-3 font-medium">Status</th>', '<th className="px-4 py-3 font-medium">To</th>\n                          <th className="px-4 py-3 font-medium">Status</th>')
old = '''                      <tbody>
                        <tr className="border-b border-border">
                          <td className="px-4 py-3 text-muted-foreground">Deposit</td>
                          <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">Mar 12, 2026</td>
                          <td className="px-4 py-3 text-muted-foreground">Ksh 100.00</td>
                          <td className="px-4 py-3 text-muted-foreground">Completed</td>
                        </tr>
                      </tbody>
'''
new = '''                      <tbody>
                        {paymentPageItems.map((item) => (
                          <tr
                            key={item.id}
                            className="border-b border-border cursor-pointer"
                            onClick={() => setSelectedPayment(item)}
                          >
                            <td className="px-4 py-3 text-muted-foreground">{item.type}</td>
                            <td className="px-4 py-3 text-muted-foreground whitespace-nowrap">{item.date}</td>
                            <td className="px-4 py-3 text-muted-foreground">{item.amount}</td>
                            <td className="px-4 py-3 text-muted-foreground">{item.to}</td>
                            <td className="px-4 py-3 text-muted-foreground">{item.status}</td>
                          </tr>
                        ))}
                      </tbody>
'''
if old in text:
    text = text.replace(old, new)
    path.write_text(text, encoding='utf-8')
print('ok')
