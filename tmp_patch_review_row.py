from pathlib import Path
path = Path('src/app/userpage/page.tsx')
text = path.read_text(encoding='utf-8')
old = '<tr key={review.id} className="border-b border-border">'
new = '<tr\n                                key={review.id}\n                                className="border-b border-border cursor-pointer"\n                                onClick={() =>\n                                  openReviewModal({\n                                    property: review.propertyName,\n                                    propertyId: review.propertyId,\n                                    hostId: review.hostId,\n                                    reviewerName: review.reviewerName,\n                                    date: review.reviewDate,\n                                    stars: review.stars,\n                                    rating: review.rating,\n                                    comment: review.comment,\n                                    checkIn: review.checkIn,\n                                    checkOut: review.checkOut,\n                                    ratings: review.ratings,\n                                  })\n                                }\n                              >'
if old in text:
    text = text.replace(old, new)
    path.write_text(text, encoding='utf-8')
print('ok')
