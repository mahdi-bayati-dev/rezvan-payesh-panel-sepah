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
const WorkPatternPage = lazy(() => import("@/features/work-pattern/routes/WorkPatternPage"));
const NewWorkPatternPage = lazy(() => import("@/features/work-pattern/routes/NewWeekPatternPage").then((mod) => ({ default: (mod as any).NewWeekPatternForm || (mod as any).default })));
const AddToWorkPattern = lazy(() => import("@/features/work-pattern/routes/AddToWorkPatternPage"))
const WorkGroupPage = lazy(() => import("@/features/work-group/routes/workGroupPage"))
const WorkGroupDetailPage = lazy(() => import("@/features/work-group/routes/workGroupDetailPage"))
const NewWorkGroupDetailPage = lazy(() => import("@/features/work-group/routes/NewWorkGroupPage"))

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
          {
            path: "/work-patterns",
            element: (
              <Suspense fallback={<Spinner />}>
                <WorkPatternPage />
              </Suspense>
            ),
          },
          {
            path: "/work-patterns/new-work-patterns",
            element: (
              <Suspense fallback={<Spinner />}>
                < NewWorkPatternPage />
              </Suspense>
            ),
          },
          {
            path: "/work-patterns/add-to-work-pattern",
            element: (
              <Suspense fallback={<Spinner />}>
                < AddToWorkPattern />
              </Suspense>
            ),
          },
          {
            path: "/work-group",
            element: (
              <Suspense fallback={<Spinner />}>
                < WorkGroupPage />
              </Suspense>
            ),
          },
          {
            path: "/work-group/:id",
            element: (
              <Suspense fallback={<Spinner />}>
                < WorkGroupDetailPage />
              </Suspense>
            ),
          },
          {
            path: "/work-group/new",
            element: (
              <Suspense fallback={<Spinner />}>
                < NewWorkGroupDetailPage />
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
