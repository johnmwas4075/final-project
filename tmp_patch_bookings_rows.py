from pathlib import Path
path = Path('src/app/userpage/page.tsx')
text = path.read_text(encoding='utf-8')
old = '''                        <tbody>
                          {bookingTab === "pending" && (
                            <tr className="border-b border-border">
                              <td className="px-4 py-3 font-medium text-foreground">Diani House</td>
                              <td className="px-4 py-3 text-muted-foreground">Mar 10, 2026</td>
                              <td className="px-4 py-3 text-muted-foreground">$320</td>
                              <td className="px-4 py-3 text-muted-foreground">Mar 20, 2026</td>
                              <td className="px-4 py-3 text-muted-foreground">Mar 23, 2026</td>
                              <td className="px-4 py-3 text-muted-foreground">-</td>
                              <td className="px-4 py-3 text-rose-500">4 days</td>
                            </tr>
                          )}

                          {bookingTab === "past" && (
                            <tr className="border-b border-border">
                              <td className="px-4 py-3 font-medium text-foreground">Naivasha Retreat</td>
                              <td className="px-4 py-3 text-muted-foreground">Jan 5, 2026</td>
                              <td className="px-4 py-3 text-muted-foreground">$540</td>
                              <td className="px-4 py-3 text-muted-foreground">Jan 12, 2026</td>
                              <td className="px-4 py-3 text-muted-foreground">Jan 15, 2026</td>
                              <td className="px-4 py-3 text-muted-foreground">4.8</td>
                              <td className="px-4 py-3 text-muted-foreground">Completed</td>
                            </tr>
                          )}

                          {bookingTab === "cancelled" && (
                            <tr className="border-b border-border">
                              <td className="px-4 py-3 font-medium text-foreground">Nairobi Loft</td>
                              <td className="px-4 py-3 text-muted-foreground">Feb 2, 2026</td>
                              <td className="px-4 py-3 text-muted-foreground">$210</td>
                              <td className="px-4 py-3 text-muted-foreground">Feb 20, 2026</td>
                              <td className="px-4 py-3 text-muted-foreground">Feb 22, 2026</td>
                              <td className="px-4 py-3 text-muted-foreground">-</td>
                              <td className="px-4 py-3 text-muted-foreground">Cancelled</td>
                            </tr>
                          )}
                        </tbody>
'''
new = '''                        <tbody>
                          {bookingPageItems.map((item) => (
                            <tr
                              key={item.id}
                              className="border-b border-border cursor-pointer"
                              onClick={() => setSelectedBooking(item)}
                            >
                              <td className="px-4 py-3 font-medium text-foreground">{item.propertyName}</td>
                              <td className="px-4 py-3 text-muted-foreground">{item.bookingDate}</td>
                              <td className="px-4 py-3 text-muted-foreground">{item.cost}</td>
                              <td className="px-4 py-3 text-muted-foreground">{item.checkIn}</td>
                              <td className="px-4 py-3 text-muted-foreground">{item.checkOut}</td>
                              <td className="px-4 py-3 text-muted-foreground">{item.rating}</td>
                              <td className="px-4 py-3 text-muted-foreground">{item.timeRemaining}</td>
                            </tr>
                          ))}
                        </tbody>
'''
if old in text:
    text = text.replace(old, new)
    path.write_text(text, encoding='utf-8')
print('ok')
