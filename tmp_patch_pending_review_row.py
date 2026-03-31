from pathlib import Path
path = Path('src/app/userpage/page.tsx')
text = path.read_text(encoding='utf-8')
old = '<tr key={booking.id} className="border-b border-border">'
new = '<tr\n                                key={booking.id}\n                                className="border-b border-border cursor-pointer"\n                                onClick={() =>\n                                  openReviewModal({\n                                    property: booking.propertyName,\n                                    propertyId: booking.propertyId,\n                                    hostId: booking.hostId,\n                                    reviewerName: booking.reviewerName,\n                                    date: booking.reviewDate,\n                                    stars: booking.stars,\n                                    rating: booking.rating,\n                                    comment: booking.comment,\n                                    checkIn: booking.checkIn,\n                                    checkOut: booking.checkOut,\n                                    ratings: booking.ratings,\n                                  })\n                                }\n                              >'
if old in text:
    text = text.replace(old, new)
    path.write_text(text, encoding='utf-8')
print('ok')
