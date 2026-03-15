import Image from "next/image"
import { Star, ShieldCheck, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface HostDetailsProps {
  name: string
  image: string
  rating: number
  yearsHosting: number
  yearJoined: number
  responseTime: string
}

export function HostDetails({
  name,
  image,
  rating,
  yearsHosting,
  yearJoined,
  responseTime,
}: HostDetailsProps) {
  return (
    <div className="py-6 border-b border-border">
      <div className="flex items-start gap-4">
        <div className="relative h-16 w-16 shrink-0">
          <Image
            src={image}
            alt={name}
            fill
            className="rounded-full object-cover"
          />
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-foreground">Hosted by {name}</h2>
          <p className="text-sm text-muted-foreground">Joined in {yearJoined}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-4">
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-foreground text-foreground" />
          <span className="text-sm">{rating.toFixed(1)} rating</span>
        </div>
        <div className="flex items-center gap-1">
          <ShieldCheck className="h-4 w-4 text-foreground" />
          <span className="text-sm">{yearsHosting} years hosting</span>
        </div>
      </div>

      <div className="mt-4 p-4 bg-muted/50 rounded-lg">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{name}</span> typically responds {responseTime}
        </p>
      </div>

      <Button className="mt-4 gap-2">
        <MessageCircle className="h-4 w-4" />
        Message Host
      </Button>
    </div>
  )
}
