import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DemoAuthProvider } from '@/hooks/useDemoAuth';
import { ListingWizardProvider } from '@/hooks/useListingWizard';
import { ProtectedRoute } from '@/components/layout/ProtectedRoute';
import AccessPage from '@/pages/auth/AccessPage';
import HostHomePage from '@/pages/host/HostHomePage';
import ListingsPage from '@/pages/host/ListingsPage';
import ListingDetailPage from '@/pages/host/ListingDetailPage';
import ListingTypePage from '@/pages/host/listing-wizard/ListingTypePage';
import GeneralInfoPage from '@/pages/host/listing-wizard/GeneralInfoPage';
import LocationPage from '@/pages/host/listing-wizard/LocationPage';
import AmenitiesPage from '@/pages/host/listing-wizard/AmenitiesPage';
import FeaturesPage from '@/pages/host/listing-wizard/FeaturesPage';
import PricingPage from '@/pages/host/listing-wizard/PricingPage';
import PhotosPage from '@/pages/host/listing-wizard/PhotosPage';
import RoomTypeWizardPage from '@/pages/host/RoomTypeWizardPage';
import RoomTypeDetailPage from '@/pages/host/RoomTypeDetailPage';

export default function AppRouter() {
  return (
    <BrowserRouter>
      <DemoAuthProvider>
        <ListingWizardProvider>
          <Routes>
          <Route path="/" element={<Navigate to="/host" replace />} />
          <Route path="/acceso" element={<AccessPage />} />
          <Route
            path="/host"
            element={
              <ProtectedRoute>
                <HostHomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/host/listings"
            element={
              <ProtectedRoute>
                <ListingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/host/listings/:listingId"
            element={<ProtectedRoute><ListingDetailPage /></ProtectedRoute>}
          />
          <Route
            path="/host/listings/new/step-1"
            element={<ProtectedRoute><ListingTypePage /></ProtectedRoute>}
          />
          <Route
            path="/host/listings/:listingId/rooms/new"
            element={<ProtectedRoute><RoomTypeWizardPage /></ProtectedRoute>}
          />
          <Route
            path="/host/listings/:listingId/rooms/:roomId"
            element={<ProtectedRoute><RoomTypeDetailPage /></ProtectedRoute>}
          />
          <Route
            path="/host/listings/new/step-2"
            element={<ProtectedRoute><GeneralInfoPage /></ProtectedRoute>}
          />
          <Route
            path="/host/listings/new/step-3"
            element={<ProtectedRoute><LocationPage /></ProtectedRoute>}
          />
          <Route
            path="/host/listings/new/step-4"
            element={<ProtectedRoute><AmenitiesPage /></ProtectedRoute>}
          />
          <Route
            path="/host/listings/new/step-5"
            element={<ProtectedRoute><FeaturesPage /></ProtectedRoute>}
          />
          <Route
            path="/host/listings/new/step-6"
            element={<ProtectedRoute><PricingPage /></ProtectedRoute>}
          />
          <Route
            path="/host/listings/new/step-7"
            element={<ProtectedRoute><PhotosPage /></ProtectedRoute>}
          />
          <Route path="*" element={<Navigate to="/host" replace />} />
          </Routes>
        </ListingWizardProvider>
      </DemoAuthProvider>
    </BrowserRouter>
  );
}
