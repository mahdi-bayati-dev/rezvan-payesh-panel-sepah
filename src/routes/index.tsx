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
const ReportsPageSkeleton = lazy(() => import("@/features/reports/Skeleton/SkeletonRepotrs"));

const ActivityReportPageDetails = lazy(() => import("@/features/reports/routes/reportPageDetails"));
const EmployeeReportsPage = lazy(() => import("@/features/reports/routes/EmployeeReportsPage"));
const NewActivityRegistrationPage = lazy(() => import("@/features/reports/routes/NewReportPage"));
const WorkPatternPage = lazy(() => import("@/features/work-pattern/routes/WorkPatternPage"));
const WorkPatternPageSkeleton = lazy(() => import("@/features/work-pattern/Skeleton/Skeleton"));

const NewWorkPatternPage = lazy(() => import("@/features/work-pattern/routes/NewPatternSelectorPage"));
const AddToWorkPattern = lazy(() => import("@/features/work-pattern/routes/AddToWorkPatternPage"))
const WorkPatternsEdit = lazy(() => import('@/features/work-pattern/routes/EditWeekPatternPage'))
const WorkPatternsEmployeesPage = lazy(() => import('@/features/work-pattern/routes/WorkPatternEmployeesPage'))
const EditShiftSchedulePage = lazy(() => import('@/features/shift-schedule/routes/EditShiftSchedulePage'))

const WorkGroupPage = lazy(() => import("@/features/work-group/routes/workGroupPage"))
const WorkGroupDetailPage = lazy(() => import("@/features/work-group/routes/workGroupDetailPage"))
const NewWorkGroupDetailPage = lazy(() => import("@/features/work-group/routes/NewWorkGroupPage"))
const OrganizationPage = lazy(() => import('@/features/Organization/routes/OrganizationPage'))
const OrganizationDetailPage = lazy(() => import('@/features/Organization/components/OrganizationDetailPage/OrganizationDetailPage'))
const CreateUser = lazy(() => import('@/features/User/components/userCreate/CreateUserPage'))
const AssignUserPage = lazy(() => import('@/features/User/components/AssignUser/AssignUserPage'))
const UserProfilePage = lazy(() => import('@/features/User/components/userPage/UserProfilePage'))
const WorkCalendarPage = lazy(() => import('@/features/work-calendar/routes/WorkCalendarPage'))

const DevicePage = lazy(() => import('@/features/devices/routes/DevicePage'));
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
              <Suspense fallback={<ReportsPageSkeleton />}>
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
          // --- روت‌های الگوی کاری هفتگی (Work Patterns) ---
          {
            path: "/work-patterns",
            element: (
              <Suspense fallback={<WorkPatternPageSkeleton />}>
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
          // ✅ روت ویرایش الگوی ثابت
          {
            path: "/work-patterns/edit/:patternId",
            element: (
              <Suspense fallback={<Spinner />}>
                < WorkPatternsEdit />
              </Suspense>
            ),
          },
          {
            path: `/work-patterns/employees/:patternId`,
            element: (
              <Suspense fallback={<Spinner />}>
                < WorkPatternsEmployeesPage />
              </Suspense>
            ),
          },

          // ✅✅ روت ویرایش برنامه شیفتی چرخشی (Shift Schedules) ✅✅
          {
            path: "/shift-schedules/edit/:patternId",
            element: (
              <Suspense fallback={<Spinner />}>
                < EditShiftSchedulePage />
              </Suspense>
            ),
          },

          // --- روت‌های گروه‌های کاری ---
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
          {
            path: "/organizations",
            element: (
              <Suspense fallback={<Spinner />}>
                < OrganizationPage />
              </Suspense>
            ),
          },
          {
            path: "/organizations/:id",
            element: (
              <Suspense fallback={<Spinner />}>
                < OrganizationDetailPage />
              </Suspense>
            ),
          },
          {
            path: "/organizations/:id/create-user",
            element: (
              <Suspense fallback={<Spinner />}>
                < CreateUser />
              </Suspense>
            ),
          },
          {
            path: "/organizations/:id/assign-user",
            element: (
              <Suspense fallback={<Spinner />}>
                <AssignUserPage />
              </Suspense>
            ),
          },
          {
            path: "/organizations/users/:userId",
            element: (
              <Suspense fallback={<Spinner />}>
                <UserProfilePage />
              </Suspense>
            ),
          },
          {
            path: "/work-calender",
            element: (
              <Suspense fallback={<Spinner />}>
                <WorkCalendarPage />
              </Suspense>
            ),
          },
          {
            path: "/device-management",
            element: (
              <Suspense fallback={<Spinner />}>
                <DevicePage />
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
