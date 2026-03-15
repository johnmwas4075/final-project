import { PhotoGallery } from "@/components/property/photo-gallery"
import { PropertyDetails } from "@/components/property/property-details"
import { Amenities } from "@/components/property/amenities"
import { Description } from "@/components/property/description"
import { HostDetails } from "@/components/property/host-details"
import { BookingWidget } from "@/components/property/booking-widget"
import { Ratings } from "@/components/property/ratings"
import { Reviews } from "@/components/property/reviews"
import { TouristLocations } from "@/components/property/tourist-locations"

// Mock data generator
function getPropertyData(id: string) {
  const locationMatch = id.match(/^([a-z-]+)-\d+$/)
  const location = locationMatch
    ? locationMatch[1].split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ")
    : "Nairobi"

  return {
    id,
    name: `Luxury Villa with Stunning Views in ${location}`,
    location,
    photos: [
      "/images/property.jpg",
      "/images/property-2.jpg",
      "/images/property-3.jpg",
      "/images/property-4.jpg",
      "/images/property-5.jpg",
      "/images/property.jpg",
      "/images/property-2.jpg",
      "/images/property-3.jpg",
      "/images/property-4.jpg",
      "/images/property-5.jpg",
    ],
    guests: 6,
    bedrooms: 3,
    bathrooms: 2,
    pricePerNight: Math.floor(Math.random() * 200) + 100,
    rating: 4.87,
    reviewCount: 124,
    description: `Experience luxury living in this stunning villa located in the heart of ${location}. This beautifully designed property offers breathtaking views, modern amenities, and a peaceful retreat from the city bustle.

The spacious living area features floor-to-ceiling windows that flood the space with natural light. The fully equipped kitchen is perfect for preparing meals, while the outdoor patio provides an ideal setting for evening relaxation.

Each bedroom is thoughtfully designed with premium bedding and en-suite facilities. The property also includes a private pool, landscaped gardens, and secure parking.

Located just minutes away from popular attractions, restaurants, and shopping centers, this villa offers the perfect blend of convenience and tranquility. Whether you're here for business or leisure, you'll find everything you need for a memorable stay.`,
    host: {
      name: "James Mwangi",
      image: "/images/host.jpg",
      rating: 4.95,
      yearsHosting: 5,
      yearJoined: 2019,
      responseTime: "within an hour",
    },
    ratingCategories: [
      { label: "Cleanliness", score: 4.9 },
      { label: "Accuracy", score: 4.8 },
      { label: "Communication", score: 5.0 },
      { label: "Location", score: 4.7 },
      { label: "Check-in", score: 4.9 },
      { label: "Value", score: 4.6 },
    ],
    reviews: [
      {
        id: "1",
        reviewerName: "Sarah K.",
        reviewerImage: "/images/reviewer-1.jpg",
        rating: 5,
        date: "February 2024",
        comment: "Absolutely stunning property! The views were incredible and James was such a wonderful host. The villa was spotlessly clean and had everything we needed. Would definitely recommend!",
      },
      {
        id: "2",
        reviewerName: "Michael T.",
        reviewerImage: "/images/reviewer-2.jpg",
        rating: 5,
        date: "January 2024",
        comment: "Perfect location for exploring the area. The property exceeded our expectations. Modern amenities, comfortable beds, and the pool was a bonus. James responded to all our questions promptly.",
      },
      {
        id: "3",
        reviewerName: "Emily R.",
        reviewerImage: "/images/reviewer-1.jpg",
        rating: 4,
        date: "December 2023",
        comment: "Great stay overall. The property is beautiful and well-maintained. Only minor issue was the water pressure but James had it fixed quickly. Would stay again!",
      },
      {
        id: "4",
        reviewerName: "David L.",
        reviewerImage: "/images/reviewer-2.jpg",
        rating: 5,
        date: "November 2023",
        comment: "One of the best Airbnb experiences we've had. The attention to detail is impressive. From the welcome basket to the local recommendations, everything was thoughtful.",
      },
      {
        id: "5",
        reviewerName: "Anna M.",
        reviewerImage: "/images/reviewer-1.jpg",
        rating: 5,
        date: "October 2023",
        comment: "Simply amazing! We celebrated our anniversary here and it was perfect. The sunset views from the patio are unforgettable. Thank you James for making our trip special!",
      },
    ],
    touristLocations: [
      {
        id: "1",
        name: "Nairobi National Park",
        image: "/images/tourist-1.jpg",
        description: "The only national park in the world within a capital city. Home to lions, giraffes, and rhinos.",
      },
      {
        id: "2",
        name: "Giraffe Centre",
        image: "/images/tourist-2.jpg",
        description: "Get up close and personal with endangered Rothschild giraffes at this conservation center.",
      },
      {
        id: "3",
        name: "Karura Forest",
        image: "/images/tourist-3.jpg",
        description: "An urban forest with walking trails, waterfalls, and caves. Perfect for nature lovers.",
      },
      {
        id: "4",
        name: "Karen Blixen Museum",
        image: "/images/tourist-1.jpg",
        description: "Visit the former home of the famous Danish author of 'Out of Africa'.",
      },
      {
        id: "5",
        name: "Nairobi National Museum",
        image: "/images/tourist-2.jpg",
        description: "Explore Kenya's cultural and natural heritage through history and art exhibits.",
      },
    ],
  }
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const property = getPropertyData(id)

  return (
    <main className="min-h-screen bg-background">
      {/* Photo Gallery - Full Width */}
      <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6 lg:px-8">
        <PhotoGallery photos={property.photos} propertyName={property.name} />
      </div>

      {/* Content */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16">
          {/* Left Column - Details */}
          <div className="lg:col-span-2">
            <PropertyDetails
              name={property.name}
              guests={property.guests}
              bedrooms={property.bedrooms}
              bathrooms={property.bathrooms}
              rating={property.rating}
              reviewCount={property.reviewCount}
            />

            <Description description={property.description} />

            <Amenities />

            <HostDetails
              name={property.host.name}
              image={property.host.image}
              rating={property.host.rating}
              yearsHosting={property.host.yearsHosting}
              yearJoined={property.host.yearJoined}
              responseTime={property.host.responseTime}
            />

          </div>

          {/* Right Column - Booking Widget */}
          <div className="lg:col-span-1">
            <div className="lg:pt-6">
              <BookingWidget
                pricePerNight={property.pricePerNight}
                rating={property.rating}
                reviewCount={property.reviewCount}
              />
            </div>

            <div className="mt-8 space-y-6">
              <Ratings
                overallRating={property.rating}
                reviewCount={property.reviewCount}
                categories={property.ratingCategories}
              />

              <Reviews
                reviews={property.reviews}
                totalReviews={property.reviewCount}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="w-full px-4 py-10 sm:px-6 lg:px-8">
        <TouristLocations
          locations={property.touristLocations}
          countySlug={property.location.toLowerCase().replace(/\s/g, "-")}
          countyName={property.location}
        />
      </div>
    </main>
  )
}
