import React from 'react';
import { Link } from 'react-router-dom';

const KasaGlowLogo: React.FC<{ className?: string }> = ({ className }) => (
  <img
    src="/images/smalllogo.jpg"
    alt="KasaGlow Cleaning Services Logo"
    className={className}
  />
);

const Footer: React.FC = () => {
  const links = {
    Company: [
        {name: 'About', to: '/about'},
        {name: 'Services', to: '/services'},
        {name: 'Locations', to: '/locations'},
        {name: 'Process', to: '/', scrollTo: 'process'}
    ],
    Support: [
        {name: 'Contact', to: '/contact'},
        {name: 'FAQs', to: '/faq'}
    ],
    Legal: [
        {name: 'Privacy Policy', to: '/privacy'},
        {name: 'Terms of Service', to: '/terms'}
    ],
  };

  return (
    <footer className="bg-gray-800 text-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <Link to="/"><KasaGlowLogo className="h-auto w-48 mb-4" /></Link>
            <p className="text-gray-400">Your trusted partner for a spotless space.</p>
          </div>
          
          <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-3 gap-8">
            {Object.entries(links).map(([title, items]) => (
              <div key={title}>
                <h3 className="font-bold tracking-wider uppercase">{title}</h3>
                <ul className="mt-4 space-y-2">
                  {items.map(item => (
                    <li key={item.name}>
                      <Link
                        to={item.to}
                        onClick={() => {
                          if ('scrollTo' in item && item.scrollTo) {
                            setTimeout(() => {
                              const element = document.getElementById(item.scrollTo);
                              if (element) element.scrollIntoView({ behavior: 'smooth' });
                            }, 100);
                          }
                        }}
                        className="text-gray-400 hover:text-white transition-colors"
                      >
                        {item.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">&copy; {new Date().getFullYear()} KasaGlowClean Services. All Rights Reserved.</p>
          {/* Social media links can be added here */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
