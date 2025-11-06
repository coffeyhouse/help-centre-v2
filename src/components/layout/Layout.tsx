/**
 * Layout - Wraps page content with BannerManager and PopupManager
 *
 * This component is used by all routes to provide consistent layout
 * and give BannerManager and PopupManager access to route parameters via useParams()
 */

import { Outlet } from 'react-router-dom';
import BannerManager from '../common/BannerManager';
import PopupManager from '../common/PopupManager';

export default function Layout() {
  return (
    <>
      {/* Incident Banners - has access to route params via useParams */}
      <BannerManager />

      {/* Page content */}
      <Outlet />

      {/* Popup Modals - has access to route params via useParams */}
      <PopupManager />
    </>
  );
}
