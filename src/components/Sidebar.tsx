'use client'

import { useState } from 'react'
import { MessageSquare, MapPin, Clock, Star, ChevronDown, ChevronRight } from 'lucide-react'

interface Conversation {
  id: string
  title: string
  lastMessage: string
  timestamp: string
  isActive?: boolean
}

interface PopularPlace {
  id: string
  name: string
  description: string
  rating: number
}

export function Sidebar() {
  const [isPlacesExpanded, setIsPlacesExpanded] = useState(true)
  const [isHistoryExpanded, setIsHistoryExpanded] = useState(true)

  const conversations: Conversation[] = [
    {
      id: '1',
      title: 'Pusat Perbelanjaan di Madiun',
      lastMessage: 'Di mana Pahlawan Street Center?',
      timestamp: '10:30',
      isActive: true
    },
    {
      id: '2',
      title: 'Kuliner Khas Madiun',
      lastMessage: 'Apa saja makanan khasnya?',
      timestamp: 'Kemarin'
    },
    {
      id: '3',
      title: 'Transportasi Umum',
      lastMessage: 'Bagaimana cara ke alun-alun?',
      timestamp: '2 hari lalu'
    }
  ]

  const popularPlaces: PopularPlace[] = [
    {
      id: '1',
      name: 'Pahlawan Street Center',
      description: 'Pusat perbelanjaan modern',
      rating: 4.5
    },
    {
      id: '2',
      name: 'Monumen Kresek',
      description: 'Ikons sejarah kota Madiun',
      rating: 4.3
    },
    {
      id: '3',
      name: 'Alun-Alun Kota Madiun',
      description: 'Taman kota yang luas',
      rating: 4.2
    },
    {
      id: '4',
      name: 'Taman Rekreasi Wilis',
      description: 'Tempat wisata keluarga',
      rating: 4.1
    }
  ]

  return (
    <aside className="w-80 bg-white border-r border-gray-200 flex flex-col hidden lg:flex">
      {/* Popular Places Section */}
      <div className="flex-1 overflow-y-auto">
        <div className="border-b border-gray-200">
          <button
            onClick={() => setIsPlacesExpanded(!isPlacesExpanded)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary-500" />
              <h3 className="font-semibold text-gray-900">Tempat Populer</h3>
            </div>
            {isPlacesExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </button>
          
          {isPlacesExpanded && (
            <div className="animate-slide-up">
              {popularPlaces.map((place) => (
                <div key={place.id} className="sidebar-item">
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900">{place.name}</h4>
                    <p className="text-sm text-gray-500">{place.description}</p>
                    <div className="flex items-center gap-1 mt-1">
                      <Star className="w-3 h-3 text-yellow-400 fill-current" />
                      <span className="text-xs text-gray-600">{place.rating}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Conversation History Section */}
        <div>
          <button
            onClick={() => setIsHistoryExpanded(!isHistoryExpanded)}
            className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-primary-500" />
              <h3 className="font-semibold text-gray-900">Histori Percakapan</h3>
            </div>
            {isHistoryExpanded ? (
              <ChevronDown className="w-4 h-4 text-gray-500" />
            ) : (
              <ChevronRight className="w-4 h-4 text-gray-500" />
            )}
          </button>
          
          {isHistoryExpanded && (
            <div className="animate-slide-up">
              {conversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`sidebar-item ${
                    conversation.isActive ? 'sidebar-item-active' : ''
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-gray-400" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-gray-900 truncate">
                      {conversation.title}
                    </h4>
                    <p className="text-sm text-gray-500 truncate">
                      {conversation.lastMessage}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="w-3 h-3" />
                    <span>{conversation.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="p-4 border-t border-gray-200">
        <button className="w-full py-2 px-4 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors font-medium">
          Percakapan Baru
        </button>
      </div>
    </aside>
  )
}
