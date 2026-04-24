'use client'

import { MapPin, Menu, X } from 'lucide-react'
import { useState } from 'react'

interface HeaderProps {
  onMobileMenuToggle?: () => void
}

export function Header({ onMobileMenuToggle }: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Madiun Smart Guide</h1>
              <p className="text-xs text-gray-500 hidden sm:block">Explore Madiun with AI</p>
            </div>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={onMobileMenuToggle || (() => setIsMobileMenuOpen(!isMobileMenuOpen))}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Desktop navigation */}
          <nav className="hidden lg:flex items-center gap-6">
            <button className="text-gray-600 hover:text-primary-600 transition-colors">
              Tempat Populer
            </button>
            <button className="text-gray-600 hover:text-primary-600 transition-colors">
              Histori
            </button>
          </nav>
        </div>

        {/* Mobile navigation menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200 animate-slide-up">
            <nav className="flex flex-col gap-2">
              <button className="text-left px-4 py-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors">
                Tempat Populer
              </button>
              <button className="text-left px-4 py-2 text-gray-600 hover:text-primary-600 hover:bg-gray-50 rounded-md transition-colors">
                Histori Percakapan
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
