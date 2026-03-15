"use client"

import Image from "next/image"
import { useState } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PhotoGalleryProps {
  photos: string[]
  propertyName: string
}

export function PhotoGallery({ photos, propertyName }: PhotoGalleryProps) {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0)

  const displayPhotos = photos.slice(0, 5)

  const openModal = (index: number) => {
    setCurrentPhotoIndex(index)
    setIsModalOpen(true)
  }

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length)
  }

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length)
  }

  return (
    <>
      {/* Photo Grid */}
      <div className="grid grid-cols-4 grid-rows-2 gap-2 h-[400px] sm:h-[500px] rounded-xl overflow-hidden">
        {/* Main large photo */}
        <div
          className="col-span-2 row-span-2 relative cursor-pointer"
          onClick={() => openModal(0)}
        >
          <Image
            src={displayPhotos[0]}
            alt={`${propertyName} - Main`}
            fill
            className="object-cover hover:opacity-90 transition-opacity"
          />
        </div>

        {/* Top right photos */}
        <div
          className="relative cursor-pointer"
          onClick={() => openModal(1)}
        >
          <Image
            src={displayPhotos[1] || displayPhotos[0]}
            alt={`${propertyName} - 2`}
            fill
            className="object-cover hover:opacity-90 transition-opacity"
          />
        </div>
        <div
          className="relative cursor-pointer"
          onClick={() => openModal(2)}
        >
          <Image
            src={displayPhotos[2] || displayPhotos[0]}
            alt={`${propertyName} - 3`}
            fill
            className="object-cover hover:opacity-90 transition-opacity"
          />
        </div>

        {/* Bottom right photos */}
        <div
          className="relative cursor-pointer"
          onClick={() => openModal(3)}
        >
          <Image
            src={displayPhotos[3] || displayPhotos[0]}
            alt={`${propertyName} - 4`}
            fill
            className="object-cover hover:opacity-90 transition-opacity"
          />
        </div>
        <div
          className="relative cursor-pointer"
          onClick={() => openModal(4)}
        >
          <Image
            src={displayPhotos[4] || displayPhotos[0]}
            alt={`${propertyName} - 5`}
            fill
            className="object-cover hover:opacity-90 transition-opacity"
          />
          {/* See More Overlay */}
          {photos.length > 5 && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center hover:bg-black/50 transition-colors">
              <Button variant="secondary" size="sm">
                See all {photos.length} photos
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Photo Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/10"
            onClick={() => setIsModalOpen(false)}
          >
            <X className="h-6 w-6" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10"
            onClick={prevPhoto}
          >
            <ChevronLeft className="h-8 w-8" />
          </Button>

          <div className="relative w-full max-w-5xl h-[80vh] mx-4">
            <Image
              src={photos[currentPhotoIndex]}
              alt={`${propertyName} - ${currentPhotoIndex + 1}`}
              fill
              className="object-contain"
            />
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white hover:bg-white/10"
            onClick={nextPhoto}
          >
            <ChevronRight className="h-8 w-8" />
          </Button>

          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white">
            {currentPhotoIndex + 1} / {photos.length}
          </div>
        </div>
      )}
    </>
  )
}
