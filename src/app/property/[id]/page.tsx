import { PhotoGallery } from "@/components/property/photo-gallery"
import { PropertyDetails } from "@/components/property/property-details"
import { Amenities } from "@/components/property/amenities"
import { Description } from "@/components/property/description"
import { HostDetails } from "@/components/property/host-details"
import { BookingWidget } from "@/components/property/booking-widget"
import { Ratings } from "@/components/property/ratings"
import { Reviews } from "@/components/property/reviews"
import { TouristLocations } from "@/components/property/tourist-locations"
import { getPrisma } from "@/lib/prisma"

const getLocationLabel = (county?: string | null, constituency?: string | null, ward?: string | null) => {
  return [county, constituency, ward].filter(Boolean).join(", ") || "Nairobi"
}

async function getPropertyData(id: string) {
  const prisma = getPrisma()
  if (!prisma) return null

  const property = await prisma.property.findUnique({
    where: { id },
    select: {
      id: true,
      propertyName: true,
      description: true,
      price: true,
      minNights: true,
      guests: true,
      rooms: true,
      bathrooms: true,
      photos: true,
      amenities: true,
      countyName: true,
      constituencyName: true,
      wardName: true,
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          username: true,
        },
      },
    },
  })

  if (!property) return null

  const amenities = Array.isArray(property.amenities) ? property.amenities : []

  return {
    id: property.id,
    name: property.propertyName,
    location: getLocationLabel(property.countyName, property.constituencyName, property.wardName),
    photos: property.photos.length > 0 ? property.photos : ["/images/property.jpg"],
    guests: property.guests ?? 1,
    bedrooms: property.rooms ?? 1,
    bathrooms: property.bathrooms ?? 1,
    pricePerNight: property.price ?? 0,
    rating: 0,
    reviewCount: 0,
    description: property.description,
    hostId: property.user?.id ?? "",
    host: {
      name:
        property.user?.username ||
        `${property.user?.firstName ?? "Host"} ${property.user?.lastName ?? ""}`.trim(),
      username: property.user?.username ?? "host",
      image: "/images/host.jpg",
      rating: 0,
      yearsHosting: 0,
      yearJoined: new Date().getFullYear(),
      responseTime: "within an hour",
    },
    ratingCategories: [
      { label: "Cleanliness", score: 0 },
      { label: "Accuracy", score: 0 },
      { label: "Communication", score: 0 },
      { label: "Location", score: 0 },
      { label: "Check-in", score: 0 },
      { label: "Value", score: 0 },
    ],
    amenities,
    reviews: [],
    touristLocations: [],
  }
}

export default async function PropertyPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const property = await getPropertyData(id)

  if (!property) {
    return (
      <main className="min-h-screen bg-background">
        <div className="mx-auto max-w-3xl px-4 py-12 text-center">
          <h1 className="text-2xl font-semibold text-foreground">Property not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We couldn't find this listing. Please check the link and try again.
          </p>
        </div>
      </main>
    )
  }

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
              hostUsername={property.host.username}
              guests={property.guests}
              bedrooms={property.bedrooms}
              bathrooms={property.bathrooms}
              rating={property.rating}
              reviewCount={property.reviewCount}
            />

            <Description description={property.description} />

            <Amenities amenities={property.amenities} />

            <HostDetails
              name={property.host.name}
              image={property.host.image}
              rating={property.host.rating}
              yearsHosting={property.host.yearsHosting}
              yearJoined={property.host.yearJoined}
              responseTime={property.host.responseTime}
              hostId={property.hostId}
              propertyName={property.name}
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
