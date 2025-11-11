/**
 * Typography - Custom typography components for article content
 *
 * Provides styled React components for all HTML elements:
 * - Typography.P for paragraphs
 * - Typography.H1, H2, H3, etc. for headings
 * - Typography.UL, OL, LI for lists
 * - And more...
 */

import React from 'react';

interface BaseProps {
  children: React.ReactNode;
  className?: string;
}

// Headings
const H1: React.FC<BaseProps> = ({ children, className = '' }) => (
  <h1 className={`text-3xl font-bold text-gray-900 mb-4 mt-8 first:mt-0 tracking-tight ${className}`}>
    {children}
  </h1>
);

const H2: React.FC<BaseProps> = ({ children, className = '' }) => (
  <h2 className={`text-2xl font-bold text-gray-900 mb-3 mt-6 first:mt-0 tracking-tight ${className}`}>
    {children}
  </h2>
);

const H3: React.FC<BaseProps> = ({ children, className = '' }) => (
  <h3 className={`text-xl font-bold text-gray-900 mb-2 mt-5 first:mt-0 tracking-tight ${className}`}>
    {children}
  </h3>
);

const H4: React.FC<BaseProps> = ({ children, className = '' }) => (
  <h4 className={`text-lg font-bold text-gray-900 mb-2 mt-4 first:mt-0 tracking-tight ${className}`}>
    {children}
  </h4>
);

const H5: React.FC<BaseProps> = ({ children, className = '' }) => (
  <h5 className={`text-base font-bold text-gray-900 mb-2 mt-4 first:mt-0 tracking-tight ${className}`}>
    {children}
  </h5>
);

const H6: React.FC<BaseProps> = ({ children, className = '' }) => (
  <h6 className={`text-sm font-bold text-gray-900 mb-2 mt-4 first:mt-0 tracking-tight ${className}`}>
    {children}
  </h6>
);

// Paragraph
const P: React.FC<BaseProps> = ({ children, className = '' }) => (
  <p className={`text-gray-700 leading-relaxed mb-4 ${className}`}>
    {children}
  </p>
);

// Lists
const UL: React.FC<BaseProps> = ({ children, className = '' }) => (
  <ul className={`text-gray-700 mb-4 list-disc pl-6 space-y-1 ${className}`}>
    {children}
  </ul>
);

const OL: React.FC<BaseProps> = ({ children, className = '' }) => (
  <ol className={`text-gray-700 mb-4 list-decimal pl-6 space-y-1 ${className}`}>
    {children}
  </ol>
);

const LI: React.FC<BaseProps> = ({ children, className = '' }) => (
  <li className={`text-gray-700 mb-1 ${className}`}>
    {children}
  </li>
);

// Inline elements
const Strong: React.FC<BaseProps> = ({ children, className = '' }) => (
  <strong className={`text-gray-900 font-semibold ${className}`}>
    {children}
  </strong>
);

const Em: React.FC<BaseProps> = ({ children, className = '' }) => (
  <em className={`text-gray-700 italic ${className}`}>
    {children}
  </em>
);

interface LinkProps extends BaseProps {
  href?: string;
  target?: string;
  rel?: string;
}

const A: React.FC<LinkProps> = ({ children, href, target, rel, className = '' }) => (
  <a
    href={href}
    target={target}
    rel={rel}
    className={`text-blue-600 hover:underline font-medium ${className}`}
  >
    {children}
  </a>
);

// Button styled as a link (for download buttons, action buttons, etc.)
const Button: React.FC<LinkProps> = ({ children, href, target, rel, className = '' }) => (
  <a
    href={href}
    target={target}
    rel={rel}
    className={`inline-block px-6 py-3 bg-black text-white font-medium rounded hover:bg-gray-800 transition-colors text-center ${className}`}
  >
    {children}
  </a>
);

const Code: React.FC<BaseProps> = ({ children, className = '' }) => (
  <code className={`text-sm bg-gray-100 px-1.5 py-0.5 rounded text-gray-800 font-mono ${className}`}>
    {children}
  </code>
);

// Block elements
const Blockquote: React.FC<BaseProps> = ({ children, className = '' }) => (
  <blockquote className={`border-l-4 border-gray-300 pl-4 italic text-gray-600 my-4 ${className}`}>
    {children}
  </blockquote>
);

const Pre: React.FC<BaseProps> = ({ children, className = '' }) => (
  <pre className={`bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto my-4 ${className}`}>
    {children}
  </pre>
);

const HR: React.FC<{ className?: string }> = ({ className = '' }) => (
  <hr className={`border-gray-300 my-8 ${className}`} />
);

interface ImgProps {
  src?: string;
  alt?: string;
  className?: string;
}

const Img: React.FC<ImgProps> = ({ src, alt, className = '' }) => (
  <img
    src={src}
    alt={alt}
    className={`rounded-lg shadow-md my-6 max-w-full h-auto ${className}`}
  />
);

// Table elements
const Table: React.FC<BaseProps> = ({ children, className = '' }) => (
  <div className="overflow-x-auto my-6">
    <table className={`border-collapse w-full ${className}`}>
      {children}
    </table>
  </div>
);

const Thead: React.FC<BaseProps> = ({ children, className = '' }) => (
  <thead className={`bg-gray-50 ${className}`}>
    {children}
  </thead>
);

const Tbody: React.FC<BaseProps> = ({ children, className = '' }) => (
  <tbody className={className}>
    {children}
  </tbody>
);

const Tr: React.FC<BaseProps> = ({ children, className = '' }) => (
  <tr className={`border-b border-gray-200 last:border-b-0 ${className}`}>
    {children}
  </tr>
);

const Th: React.FC<BaseProps> = ({ children, className = '' }) => (
  <th className={`border border-gray-300 px-4 py-2 text-left font-semibold text-gray-900 ${className}`}>
    {children}
  </th>
);

const Td: React.FC<BaseProps> = ({ children, className = '' }) => (
  <td className={`border border-gray-300 px-4 py-2 text-gray-700 ${className}`}>
    {children}
  </td>
);

// Div wrapper for content
const Div: React.FC<BaseProps> = ({ children, className = '' }) => (
  <div className={className}>
    {children}
  </div>
);

// Span
const Span: React.FC<BaseProps> = ({ children, className = '' }) => (
  <span className={className}>
    {children}
  </span>
);

// Content Card (for content-block-uki divs)
const ContentCard: React.FC<BaseProps> = ({ children, className = '' }) => (
  <div className={`my-8 ${className}`}>
    <div className="bg-white p-6 rounded-3xl shadow-lg">
      <div className="flex flex-col md:flex-row gap-6 items-center">
        {children}
      </div>
    </div>
  </div>
);

// Export as namespace
const Typography = {
  H1,
  H2,
  H3,
  H4,
  H5,
  H6,
  P,
  UL,
  OL,
  LI,
  Strong,
  Em,
  A,
  Button,
  Code,
  Blockquote,
  Pre,
  HR,
  Img,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Div,
  Span,
  ContentCard,
};

export default Typography;
