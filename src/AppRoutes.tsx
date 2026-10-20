// Route table (tech design §5, facility admin console).
import type { ReactElement } from 'react';
import { Route, Routes } from 'react-router-dom';
import { RequireAuth } from './auth/RequireAuth';
import { AppLayout } from './layout/AppLayout';
import { AcceptInvitePage } from './pages/AcceptInvitePage';
import { AuditPage } from './pages/AuditPage';
import { LoginPage } from './pages/LoginPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { OverviewPage } from './pages/OverviewPage';
import { FacilitiesListPage } from './pages/facilities/FacilitiesListPage';
import { FacilityDetailPage } from './pages/facilities/FacilityDetailPage';
import { NewFacilityPage } from './pages/facilities/NewFacilityPage';
import { NewResidentPage } from './pages/residents/NewResidentPage';
import { ResidentDetailPage } from './pages/residents/ResidentDetailPage';
import { ResidentImportPage } from './pages/residents/ResidentImportPage';
import { ResidentsListPage } from './pages/residents/ResidentsListPage';
import { NewStaffPage } from './pages/staff/NewStaffPage';
import { StaffDetailPage } from './pages/staff/StaffDetailPage';
import { StaffImportPage } from './pages/staff/StaffImportPage';
import { StaffListPage } from './pages/staff/StaffListPage';

export function AppRoutes(): ReactElement {
	return (
		<Routes>
			<Route path="/login" element={<LoginPage />} />
			<Route path="/accept-invite" element={<AcceptInvitePage />} />
			<Route element={<RequireAuth />}>
				<Route element={<AppLayout />}>
					<Route index element={<OverviewPage />} />
					<Route path="facilities" element={<FacilitiesListPage />} />
					<Route path="facilities/new" element={<NewFacilityPage />} />
					<Route path="facilities/:facilityId" element={<FacilityDetailPage />} />
					<Route path="staff" element={<StaffListPage />} />
					<Route path="staff/new" element={<NewStaffPage />} />
					<Route path="staff/import" element={<StaffImportPage />} />
					<Route path="staff/:staffId" element={<StaffDetailPage />} />
					<Route path="residents" element={<ResidentsListPage />} />
					<Route path="residents/new" element={<NewResidentPage />} />
					<Route path="residents/import" element={<ResidentImportPage />} />
					<Route path="residents/:residentId" element={<ResidentDetailPage />} />
					<Route path="audit" element={<AuditPage />} />
					<Route path="*" element={<NotFoundPage />} />
				</Route>
			</Route>
		</Routes>
	);
}
