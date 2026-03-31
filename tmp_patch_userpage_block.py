from pathlib import Path
path = Path('src/app/userpage/page.tsx')
text = path.read_text(encoding='utf-8')
marker = '  return (\n'
if marker in text and 'bookingRecords' not in text:
    block = '''  const bookingRecords = [
    {
      id: "bk-1",
      propertyId: "property-1",
      propertyName: "Diani House",
      userName: "you",
      status: "pending",
      bookingDate: "Mar 10, 2026",
      cost: "Ksh 320",
      checkIn: "Mar 20, 2026",
      checkOut: "Mar 23, 2026",
      rating: "-",
      timeRemaining: "4 days",
    },
    {
      id: "bk-2",
      propertyId: "property-2",
      propertyName: "Naivasha Retreat",
      userName: "you",
      status: "past",
      bookingDate: "Jan 5, 2026",
      cost: "Ksh 540",
      checkIn: "Jan 12, 2026",
      checkOut: "Jan 15, 2026",
      rating: "4.8",
      timeRemaining: "Completed",
    },
    {
      id: "bk-3",
      propertyId: "property-3",
      propertyName: "Nairobi Loft",
      userName: "you",
      status: "cancelled",
      bookingDate: "Feb 2, 2026",
      cost: "Ksh 210",
      checkIn: "Feb 20, 2026",
      checkOut: "Feb 22, 2026",
      rating: "-",
      timeRemaining: "Cancelled",
    },
  ]

  const bookingFiltered = bookingRecords.filter((item) => {
    if (item.status !== bookingTab) return False
    const query = bookingSearch.trim().toLowerCase()
    if (!query) return True
    return [item.propertyName, item.userName].some((value) => value.toLowerCase().includes(query))
  })

  const bookingPageSize = 20
  const bookingStart = bookingPage * bookingPageSize
  const bookingEnd = Math.min(bookingStart + bookingPageSize, bookingFiltered.length)
  const bookingPageItems = bookingFiltered.slice(bookingStart, bookingEnd)
  const bookingRangeLabel = bookingFiltered.length == 0 ? "0-0 of 0" : (bookingStart + 1) + "-" + bookingEnd + " of " + bookingFiltered.length

  const writtenReviewRecords = writtenReviews.map((review) => ({
    id: review.id,
    propertyId: review.propertyId,
    propertyName: review.propertyName,
    reviewerName: review.reviewerName,
    reviewDate: formatDate(review.reviewDate),
    stars: String(review.stars),
    rating: review.rating,
    comment: review.comment,
    hostId: review.hostId,
    checkIn: formatDate(review.checkIn),
    checkOut: formatDate(review.checkOut),
    ratings: {
      cleanliness: review.cleanliness,
      accuracy: review.accuracy,
      communication: review.communication,
      location: review.location,
      checkin: review.checkin,
      value: review.value,
      hostRating: review.hostRating,
    },
  }))

  const pendingReviewRecords = pendingReviews.map((booking) => ({
    id: booking.id,
    propertyId: booking.propertyId,
    propertyName: booking.propertyName,
    reviewerName: "-",
    reviewDate: "-",
    stars: "-",
    rating: "Pending",
    comment: "Review not yet submitted.",
    hostId: booking.hostId,
    checkIn: formatDate(booking.checkIn),
    checkOut: formatDate(booking.checkOut),
    ratings: {
      cleanliness: 0,
      accuracy: 0,
      communication: 0,
      location: 0,
      checkin: 0,
      value: 0,
      hostRating: 0,
    },
  }))

  const reviewRecords = reviewTab === "written" ? writtenReviewRecords : pendingReviewRecords
  const reviewFiltered = reviewRecords.filter((item) => {
    const query = reviewSearch.trim().toLowerCase()
    if (!query) return True
    return [item.propertyName, item.reviewerName].some((value) => value.toLowerCase().includes(query))
  })

  const reviewPageSize = 20
  const reviewStart = reviewPage * reviewPageSize
  const reviewEnd = Math.min(reviewStart + reviewPageSize, reviewFiltered.length)
  const reviewPageItems = reviewFiltered.slice(reviewStart, reviewEnd)
  const reviewRangeLabel = reviewFiltered.length == 0 ? "0-0 of 0" : (reviewStart + 1) + "-" + reviewEnd + " of " + reviewFiltered.length

  const paymentRecords = [
    {
      id: "pay-1",
      type: "Deposit",
      typeKey: "deposits",
      date: "Mar 12, 2026",
      amount: "Ksh 100.00",
      status: "Completed",
      to: "Wallet deposit",
      username: "",
      reference: "TXN-1001",
    },
    {
      id: "pay-2",
      type: "Payment",
      typeKey: "payments",
      date: "Mar 20, 2026",
      amount: "Ksh 320.00",
      status: "Processing",
      to: "@host123",
      username: "host123",
      reference: "PAY-8832",
    },
    {
      id: "pay-3",
      type: "Withdrawal",
      typeKey: "withdrawals",
      date: "Mar 25, 2026",
      amount: "Ksh 200.00",
      status: "Completed",
      to: "MPESA 0703***867",
      username: "",
      reference: "WTH-4401",
    },
  ]

  const paymentFiltered = paymentRecords.filter((item) => {
    if (transactionTab != "all" and item.typeKey != transactionTab):
      return False
    const query = paymentSearch.trim().toLowerCase()
    if (!query) return True
    return [item.to, item.username].some((value) => value.toLowerCase().includes(query))
  })

  const paymentPageSize = 20
  const paymentStart = paymentPage * paymentPageSize
  const paymentEnd = Math.min(paymentStart + paymentPageSize, paymentFiltered.length)
  const paymentPageItems = paymentFiltered.slice(paymentStart, paymentEnd)
  const paymentRangeLabel = paymentFiltered.length == 0 ? "0-0 of 0" : (paymentStart + 1) + "-" + paymentEnd + " of " + paymentFiltered.length

'''
    # fix Python booleans to JS
    block = block.replace('True', 'true').replace('False', 'false')
    text = text.replace(marker, block + marker)
    path.write_text(text, encoding='utf-8')
print('ok')
