from pathlib import Path
path = Path('src/components/property/photo-gallery.tsx')
text = path.read_text(encoding='utf-8')
old = '''      {/* Photo Grid */}
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
'''
new = '''      {/* Photo Grid - Mobile */}
      <div className="grid grid-cols-2 grid-rows-3 gap-2 h-[360px] sm:h-[420px] rounded-xl overflow-hidden md:hidden">
        {/* Main photo */}
        <div
          className="col-span-2 relative cursor-pointer"
          onClick={() => openModal(0)}
        >
          <Image
            src={displayPhotos[0]}
            alt={`${propertyName} - Main`}
            fill
            className="object-cover hover:opacity-90 transition-opacity"
          />
        </div>

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
          {photos.length > 5 && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 hover:bg-black/50 transition-colors">
              <Button variant="secondary" size="sm">
                See all {photos.length} photos
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Photo Grid - Desktop */}
      <div className="hidden md:grid grid-cols-4 grid-rows-2 gap-2 h-[400px] sm:h-[500px] rounded-xl overflow-hidden">
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
'''
if old in text:
    text = text.replace(old, new)
    path.write_text(text, encoding='utf-8')
print('ok')
