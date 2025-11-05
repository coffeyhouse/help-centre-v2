/**
 * ScrollToTop - Utility component to scroll to top on route change
 *
 * This component listens for route changes and automatically scrolls
 * the window to the top of the page when the pathname changes.
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

export default ScrollToTop;
