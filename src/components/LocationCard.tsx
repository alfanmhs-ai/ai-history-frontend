'use client'

import { useState } from 'react'
import { MapPin, Star, Clock, ExternalLink, Navigation } from 'lucide-react'

interface LocationData {
  name: string
  description?: string
  rating?: number
  openingHours?: string
  address?: string
  category?: string
}

interface LocationCardProps {
  location: LocationData
  onMapsClick?: () => void
}

// Known locations database with their details
const knownLocations: Record<string, LocationData> = {
  'nasi pecel yu gembrot': {
    name: 'Nasi Pecel Yu Gembrot',
    description: 'Warung legendaris yang terkenal dengan nasi pecel khas Madiun',
    rating: 4.3,
    openingHours: '06:00 - 14:00',
    address: 'Jl. Pahlawan No. 45, Madiun',
    category: 'Kuliner'
  },
  'pahlawan street center': {
    name: 'Pahlawan Street Center',
    description: 'Pusat perbelanjaan modern di jantung kota Madiun',
    rating: 4.5,
    openingHours: '10:00 - 22:00',
    address: 'Jl. Pahlawan No. 123, Madiun',
    category: 'Perbelanjaan'
  },
  'monumen kresek': {
    name: 'Monumen Kresek',
    description: 'Ikon sejarah kota Madiun yang menjadi simbol perjuangan',
    rating: 4.2,
    openingHours: '24 Jam',
    address: 'Jl. Diponegoro No. 67, Madiun',
    category: 'Wisata Sejarah'
  },
  'alun-alun kota madiun': {
    name: 'Alun-Alun Kota Madiun',
    description: 'Taman kota yang luas dan menjadi pusat kegiatan masyarakat',
    rating: 4.1,
    openingHours: '24 Jam',
    address: 'Jl. Merdeka No. 1, Madiun',
    category: 'Taman Kota'
  },
  'taman rekreasi wilis': {
    name: 'Taman Rekreasi Wilis',
    description: 'Tempat wisata keluarga dengan berbagai wahana permainan',
    rating: 4.0,
    openingHours: '08:00 - 18:00',
    address: 'Jl. Wilis Raya No. 15, Madiun',
    category: 'Wisata Keluarga'
  },
  'museum madiun': {
    name: 'Museum Madiun',
    description: 'Museum yang menyimpan berbagai peninggalan sejarah dan budaya Madiun',
    rating: 3.9,
    openingHours: '08:00 - 16:00 (Senin tutup)',
    address: 'Jl. Dr. Soetomo No. 25, Madiun',
    category: 'Museum'
  },
  'kolam renang tirta': {
    name: 'Kolam Renang Tirta',
    description: 'Kolam renang umum yang populer di kalangan muda',
    rating: 3.8,
    openingHours: '07:00 - 18:00',
    address: 'Jl. Tirta No. 8, Madiun',
    category: 'Olahraga'
  },
  'pasar legi madiun': {
    name: 'Pasar Legi Madiun',
    description: 'Pasar tradisional yang beroperasi setiap malam Legi',
    rating: 4.0,
    openingHours: '18:00 - 02:00',
    address: 'Jl. Pasar No. 100, Madiun',
    category: 'Pasar Tradisional'
  }
}

export function LocationCard({ location, onMapsClick }: LocationCardProps) {
  const [imageError, setImageError] = useState(false)

  const handleMapsClick = () => {
    const query = encodeURIComponent(location.name)
    const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${query}`
    window.open(mapsUrl, '_blank')
    onMapsClick?.()
  }

  const handleDirectionsClick = () => {
    const query = encodeURIComponent(location.name)
    const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${query}`
    window.open(directionsUrl, '_blank')
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < Math.floor(rating)
            ? 'text-yellow-400 fill-current'
            : i === Math.floor(rating) && rating % 1 >= 0.5
            ? 'text-yellow-400 fill-current'
            : 'text-gray-300'
        }`}
      />
    ))
  }

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden hover:shadow-xl transition-shadow duration-300 animate-slide-up">
      {/* Image Section */}
      <div className="relative h-48 bg-gray-100">
        {!imageError ? (
          <img
            src={`https://picsum.photos/seed/${location.name.replace(/\s+/g, '-')}/400/200.jpg`}
            alt={location.name}
            className="w-full h-full object-cover"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200">
            <MapPin className="w-12 h-12 text-primary-500" />
          </div>
        )}
        
        {/* Category Badge */}
        {location.category && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
            <span className="text-xs font-medium text-gray-700">{location.category}</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 flex-1">{location.name}</h3>
          <div className="flex items-center gap-1">
            {renderStars(location.rating || 0)}
            <span className="text-sm text-gray-600 ml-1">
              {location.rating?.toFixed(1) || 'N/A'}
            </span>
          </div>
        </div>

        {/* Description */}
        {location.description && (
          <p className="text-sm text-gray-600 mb-3 leading-relaxed">
            {location.description}
          </p>
        )}

        {/* Details Grid */}
        <div className="grid grid-cols-1 gap-3 mb-4">
          {location.openingHours && (
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Jam Buka</p>
                <p className="text-sm font-medium text-gray-900">{location.openingHours}</p>
              </div>
            </div>
          )}

          {location.address && (
            <div className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
              <div className="flex-1">
                <p className="text-xs text-gray-500">Alamat</p>
                <p className="text-sm font-medium text-gray-900">{location.address}</p>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleMapsClick}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            Buka di Google Maps
          </button>
          
          <button
            onClick={handleDirectionsClick}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            <Navigation className="w-4 h-4" />
            Petunjuk
          </button>
        </div>
      </div>
    </div>
  )
}

// Function to parse AI response and extract location mentions
export function parseLocationsFromAIResponse(response: string): LocationData[] {
  const foundLocations: LocationData[] = []
  const lowercasedResponse = response.toLowerCase()
  
  // Check for known locations in the response
  Object.keys(knownLocations).forEach(locationKey => {
    if (lowercasedResponse.includes(locationKey)) {
      foundLocations.push(knownLocations[locationKey])
    }
  })
  
  return foundLocations
}

// Function to check if response contains location keywords
export function hasLocationKeywords(response: string): boolean {
  const locationKeywords = [
    'nasi pecel', 'pecel', 'yu gembrot',
    'pahlawan street center', 'pahlawan street', 'psc',
    'monumen kresek', 'kresek',
    'alun-alun', 'alun alun',
    'taman rekreasi wilis', 'taman wilis',
    'museum madiun', 'museum',
    'kolam renang tirta', 'kolam renang',
    'pasar legi', 'pasar leg',
    'wisata', 'tempat wisata', 'kuliner', 'makanan', 'restoran',
    'hotel', 'penginapan', 'motel',
    'mall', 'perbelanjaan', 'pusat perbelanjaan',
    'jalan', 'alamat', 'lokasi'
  ]
  
  const lowercasedResponse = response.toLowerCase()
  return locationKeywords.some(keyword => lowercasedResponse.includes(keyword))
}
