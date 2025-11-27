import React from 'react';
import { Helmet } from 'react-helmet-async';

const BlogPage: React.FC = () => {
  return (
    <>
      <Helmet>
        <title>Travel Blog | India Tour</title>
        <meta
          name="description"
          content="Read travel stories, tips, and safety guidance from the India Tour team."
        />
      </Helmet>
      <div className="min-h-[60vh] bg-white py-12">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Travel Blog</h1>
          <p className="text-gray-600 mb-6 text-sm sm:text-base">
            Blog content is not the focus of this project, so this page is intentionally minimal. You can use it
            later to publish articles about destinations and safe travel practices.
          </p>
        </div>
      </div>
    </>
  );
};

export default BlogPage;
