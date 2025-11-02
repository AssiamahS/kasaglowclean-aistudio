import React, { useState, useEffect } from 'react';
import { PhoneIcon, MenuIcon, XIcon } from './IconComponents';

const KasaGlowLogo: React.FC<{ className?: string }> = ({ className }) => (
  <img
    src="/images/smalllogo.jpg"
    alt="KasaGlow Cleaning Services Logo"
    className={className}
  />
);

const NAV_ITEMS = [
  { name: 'Services', href: '#/services' },
  { name: 'About', href: '#/about' },
  { name: 'Locations', href: '#/locations'},
  { name: 'Process', href: '#/#process' }, // Anchor link on home
  { name: 'Admin', href: '#/admin' },
];

const NavLinks: React.FC<{ className?: string, onLinkClick?: () => void }> = ({ className, onLinkClick }) => (
  <nav className={className}>
    {NAV_ITEMS.map((item) => (
      <a key={item.name} href={item.href} onClick={onLinkClick} className="block sm:inline-block text-lg sm:text-base font-semibold text-neutral hover:text-primary transition-colors py-2 sm:py-0 sm:px-4">{item.name}</a>
    ))}
  </nav>
);

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const closeMenu = () => setIsMenuOpen(false);

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled || isMenuOpen ? 'bg-white shadow-md' : 'bg-transparent'}`}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between py-3">
          <a href="#/" className="flex-shrink-0">
            <KasaGlowLogo className="h-auto w-48 sm:w-56" />
          </a>

          <div className="hidden lg:flex items-center space-x-2">
            <NavLinks />
          </div>

          <div className="hidden lg:flex items-center space-x-4">
            <a href="tel:9084175388" className="flex items-center gap-2 font-semibold text-neutral hover:text-primary transition-colors">
              <PhoneIcon className="h-5 w-5" />
              (908) 417-5388
            </a>
            <a href="#/contact" className="px-5 py-3 bg-primary text-primary-content font-bold rounded-lg shadow-md hover:bg-primary-focus transition-colors">
              Get a Free Estimate
            </a>
          </div>

          <div className="lg:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Open menu">
              <MenuIcon className="h-8 w-8 text-neutral" />
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={`lg:hidden fixed inset-0 bg-white z-50 transform ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'} transition-transform duration-300 ease-in-out`}>
        <div className="flex justify-between items-center py-3 px-4 border-b">
           <a href="#/" onClick={closeMenu}>
             <KasaGlowLogo className="h-auto w-48" />
           </a>
          <button onClick={closeMenu} aria-label="Close menu">
            <XIcon className="h-8 w-8 text-neutral" />
          </button>
        </div>
        <div className="p-8 space-y-4">
            <NavLinks className="flex flex-col space-y-4" onLinkClick={closeMenu} />
            <a 
              href="#/contact" 
              onClick={closeMenu} 
              className="w-full mt-6 block text-center px-6 py-4 bg-primary text-primary-content font-bold rounded-lg shadow-md hover:bg-primary-focus transition-colors"
            >
              Get a Free Estimate
            </a>
        </div>
      </div>
    </header>
  );
};

export default Header;
