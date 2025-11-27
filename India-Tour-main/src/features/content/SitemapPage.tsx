import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const SitemapPage: React.FC = () => {
  const links = [
    ['Home', '/'],
    ['Destinations', '/destinations'],
    ['Tours & Packages', '/tours'],
    ['Experiences', '/experiences'],
    ['Travel Blog', '/blog'],
    ['FAQs', '/faq'],
    ['Safety Home', '/safety'],
    ['Safety Dashboard', '/safety/dashboard'],
    ['Safety Digital ID', '/safety/digital-id'],
    ['Safety Admin', '/safety/admin'],
  ];

  return (
    <>
      <Helmet>
        <title>Sitemap | India Tour</title>
        <meta name="description" content="Sitemap of key India Tour pages." />
      </Helmet>
      <div className="min-h-[60vh] bg-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Sitemap</h1>
          <ul className="mt-4 space-y-2 text-sm text-orange-700">
            {links.map(([label, href]) => (
              <li key={href}>
                <Link to={href} className="hover:underline">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};

export default SitemapPage;
