import { createBrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { MainLayout } from "@/components/layout/MainLayout";
import { ProtectedRoute } from "@/routes/ProtectedRoute/ProtectedRoute";

// صفحات Lazy
const DashboardPage = lazy(() => import("@/features/dashboard/routes/DashboardPage"));
const LoginPage = lazy(() => import("@/features/auth/routes/LoginPage"));
const RequestsPage = lazy(() => import("@/features/requests/routes/requestsPage"));
const NewRequestPage = lazy(() => import("@/features/requests/routes/NewRequestPage"));
const RequestDetailPage = lazy(() => import("@/features/requests/routes/RequestDetailPage"));
const ExportSettingsPage = lazy(() => import("@/features/requests/routes/ExportSettingsPage"));
const TableSettingsPage = lazy(() => import("@/features/requests/routes/TableSettingsPage"));
const ActivityReportPage = lazy(() => import("@/features/reports/routes/reportPage"));
const ActivityReportPageDetails = lazy(() => import("@/features/reports/routes/reportPageDetails"));
const EmployeeReportsPage = lazy(() => import("@/features/reports/routes/EmployeeReportsPage"));
const NewActivityRegistrationPage = lazy(() => import("@/features/reports/routes/NewReportPage"));
const ErrorPage = lazy(() => import("@/routes/ErrorPage"));

export const router = createBrowserRouter([
  {
    element: <ProtectedRoute />,
    errorElement: <ErrorPage />,
    children: [
      {
        path: "/",
        element: <MainLayout />,
        errorElement: <ErrorPage />,
        children: [
          {
            path: "/",
            element: (
              <Suspense fallback={<Spinner />}>
                <DashboardPage />
              </Suspense>
            ),
          },
          {
            path: "/requests",
            element: (
              <Suspense fallback={<Spinner />}>
                <RequestsPage />
              </Suspense>
            ),
          },
          {
            path: "/requests/new",
            element: (
              <Suspense fallback={<Spinner />}>
                <NewRequestPage />
              </Suspense>
            ),
          },
          {
            path: "/requests/:requestId",
            element: (
              <Suspense fallback={<Spinner />}>
                <RequestDetailPage />
              </Suspense>
            ),
          },
          {
            path: "/requests/settings-table",
            element: (
              <Suspense fallback={<Spinner />}>
                <TableSettingsPage />
              </Suspense>
            ),
          },
          {
            path: "/requests/export-settings",
            element: (
              <Suspense fallback={<Spinner />}>
                <ExportSettingsPage />
              </Suspense>
            ),
          },
          {
            path: "/reports",
            element: (
              <Suspense fallback={<Spinner />}>
                <ActivityReportPage />
              </Suspense>
            ),
          },
          {
            path: "/reports/:reportId",
            element: (
              <Suspense fallback={<Spinner />}>
                <ActivityReportPageDetails />
              </Suspense>
            ),
          },
          {
            path: "/reports/employee/:employeeId",
            element: (
              <Suspense fallback={<Spinner />}>
                <EmployeeReportsPage />
              </Suspense>
            ),
          },
          {
            path: "/reports/new",
            element: (
              <Suspense fallback={<Spinner />}>
                <NewActivityRegistrationPage />
              </Suspense>
            ),
          },
        ],
      },
    ],
  },
  {
    path: "/login",
    element: (
      <Suspense fallback={<Spinner />}>
        <LoginPage />
      </Suspense>
    ),
  },
]);
