'use client'

import { useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'

export function Navigation() {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (path: string) => pathname === path

  const closeMenu = () => setMenuOpen(false)

  return (
    <nav className="sticky top-0 z-50 bg-brand-black border-b border-brand-surface">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-1 hover:opacity-80 transition-opacity"
        >
          <span className="text-lg font-bold">
            <span className="text-brand-gold hover:text-brand-gold-bright transition-colors">May</span>
            <span className="text-white">hem Sprint</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center gap-8">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors ${
              isActive('/') ? 'text-brand-gold border-b-2 border-brand-gold' : 'text-white hover:text-brand-gold-bright'
            }`}
          >
            Log Activity
          </Link>
          <Link
            href="/leaderboard"
            className={`text-sm font-medium transition-colors ${
              isActive('/leaderboard') ? 'text-brand-gold border-b-2 border-brand-gold' : 'text-white hover:text-brand-gold-bright'
            }`}
          >
            Leaderboard
          </Link>
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden p-2 text-brand-gold hover:text-brand-gold-bright transition-colors"
          aria-label="Toggle menu"
          aria-expanded={menuOpen}
        >
          {menuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden bg-brand-surface border-t border-brand-black">
          <div className="max-w-7xl mx-auto px-4 py-2 flex flex-col gap-2">
            <Link
              href="/"
              onClick={closeMenu}
              className={`block px-4 py-2 rounded text-sm font-medium transition-colors ${
                isActive('/') ? 'bg-brand-gold text-brand-black' : 'text-white hover:bg-brand-black'
              }`}
            >
              Log Activity
            </Link>
            <Link
              href="/leaderboard"
              onClick={closeMenu}
              className={`block px-4 py-2 rounded text-sm font-medium transition-colors ${
                isActive('/leaderboard') ? 'bg-brand-gold text-brand-black' : 'text-white hover:bg-brand-black'
              }`}
            >
              Leaderboard
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}
