from pathlib import Path
path = Path('src/app/userpage/page.tsx')
text = path.read_text(encoding='utf-8')
if 'selectedBooking &&' not in text:
    modal = '''
            {selectedBooking && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-background shadow-xl">
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-foreground">Booking ??????</h3>
                    <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                      <p><span className="font-medium text-foreground">Property:</span> {selectedBooking.propertyName}</p>
                      <p><span className="font-medium text-foreground">Status:</span> {selectedBooking.status}</p>
                      <p><span className="font-medium text-foreground">Booking Date:</span> {selectedBooking.bookingDate}</p>
                      <p><span className="font-medium text-foreground">Cost:</span> {selectedBooking.cost}</p>
                      <p><span className="font-medium text-foreground">Check-in:</span> {selectedBooking.checkIn}</p>
                      <p><span className="font-medium text-foreground">Check-out:</span> {selectedBooking.checkOut}</p>
                      <p><span className="font-medium text-foreground">Rating:</span> {selectedBooking.rating}</p>
                      <p><span className="font-medium text-foreground">Time Remaining:</span> {selectedBooking.timeRemaining}</p>
                    </div>
                    <div className="mt-6 flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => setSelectedBooking(null)}>
                        Close
                      </Button>
                      <Button
                        className="bg-rose-500 text-white hover:bg-rose-600"
                        onClick={() => router.push(`/property/${selectedBooking.propertyId}`)}
                      >
                        View property
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {selectedPayment && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                <div className="w-full max-w-lg overflow-hidden rounded-2xl bg-background shadow-xl">
                  <div className="p-5">
                    <h3 className="text-lg font-semibold text-foreground">Payment Details</h3>
                    <div className="mt-3 space-y-2 text-sm text-muted-foreground">
                      <p><span className="font-medium text-foreground">Type:</span> {selectedPayment.type}</p>
                      <p><span className="font-medium text-foreground">Date:</span> {selectedPayment.date}</p>
                      <p><span className="font-medium text-foreground">Amount:</span> {selectedPayment.amount}</p>
                      <p><span className="font-medium text-foreground">To:</span> {selectedPayment.to}</p>
                      <p><span className="font-medium text-foreground">Status:</span> {selectedPayment.status}</p>
                      <p><span className="font-medium text-foreground">Reference:</span> {selectedPayment.reference}</p>
                    </div>
                    <div className="mt-6 flex justify-end gap-2">
                      <Button variant="ghost" onClick={() => setSelectedPayment(null)}>
                        Close
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            )}
'''
    text = text.replace('            {selectedRecommendation && (', modal + '            {selectedRecommendation && (', 1)
    path.write_text(text, encoding='utf-8')
print('ok')
