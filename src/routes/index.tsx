import { createBrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react";
// ✅ اصلاح مسیر:
import { Spinner } from "../components/ui/Spinner";
import { MainLayout } from "../components/layout/MainLayout";
import { ProtectedRoute } from "./ProtectedRoute/ProtectedRoute";

// --- ۱. ایمپورت‌های جدید (مسیریاب هوشمند و صفحه جزئیات کاربر) ---
const ReportsIndexPage = lazy(() => import("../features/reports/routes/ReportsIndexPage"));
const MyReportPageDetails = lazy(() => import("../features/reports/routes/myReportPageDetails"));

// صفحات Lazy (قبلی)
const DashboardPage = lazy(() => import("../features/dashboard/routes/DashboardPage"));
const LoginPage = lazy(() => import("../features/auth/routes/LoginPage"));
const RequestsPage = lazy(() => import("../features/requests/routes/requestsPage"));
const NewRequestPage = lazy(() => import("../features/requests/routes/NewRequestPage"));
const RequestDetailPage = lazy(() => import("../features/requests/routes/RequestDetailPage"));
const ExportSettingsPage = lazy(() => import("../features/requests/routes/ExportSettingsPage"));
const TableSettingsPage = lazy(() => import("../features/requests/routes/TableSettingsPage"));
const ReportsPageSkeleton = lazy(() => import("../features/reports/Skeleton/SkeletonRepotrs"));

const ActivityReportPageDetails = lazy(() => import("../features/reports/routes/reportPageDetails"));
const EmployeeReportsPage = lazy(() => import("../features/reports/routes/EmployeeReportsPage"));
const NewActivityRegistrationPage = lazy(() => import("../features/reports/routes/NewReportPage"));
const WorkPatternPage = lazy(() => import("../features/work-pattern/routes/WorkPatternPage"));
// ⚠️ نکته: قبلاً گفتم فایل Skeleton.tsx اضافه است، بهتر است از WorkPatternListSkeleton استفاده کنید
const WorkPatternPageSkeleton = lazy(() => import("../features/work-pattern/Skeleton/Skeleton"));

const NewWorkPatternPage = lazy(() => import("../features/work-pattern/routes/NewPatternSelectorPage"));
const WorkPatternsEdit = lazy(() => import('../features/work-pattern/routes/EditWeekPatternPage'))
const WorkPatternsEmployeesPage = lazy(() => import('../features/work-pattern/routes/WorkPatternEmployeesPage'))
const EditShiftSchedulePage = lazy(() => import('../features/shift-schedule/routes/EditShiftSchedulePage'))
const EditShiftScheduleFormSkeleton = lazy(() => import('../features/shift-schedule/Skeleton/EditShiftScheduleFormSkeleton'))

// ✅✅✅ ۱. ایمپورت کردن صفحه جدید "تخصیص الگو"
const AddToWorkPatternPage = lazy(() => import("../features/work-pattern/routes/AddToWorkPatternPage"));

// ✅ Work Group Imports
const WorkGroupPage = lazy(() => import("../features/work-group/routes/workGroupPage"))
const WorkGroupDetailPage = lazy(() => import("../features/work-group/routes/workGroupDetailPage"))
const NewWorkGroupDetailPage = lazy(() => import("../features/work-group/routes/NewWorkGroupPage"))
// ✅✅✅ ایمپورت صفحه تخصیص گروه کاری جدید ✅✅✅
const WorkGroupAssignmentPage = lazy(() => import("../features/work-group/routes/WorkGroupAssignmentPage"));


const OrganizationPage = lazy(() => import('../features/Organization/routes/OrganizationPage'))
const OrganizationDetailPage = lazy(() => import('../features/Organization/components/OrganizationDetailPage/OrganizationDetailPage'))
const CreateUser = lazy(() => import('../features/User/components/userCreate/CreateUserPage'))
const AssignUserPage = lazy(() => import('../features/User/components/AssignUser/AssignUserPage'))
const UserProfilePage = lazy(() => import('../features/User/components/userPage/UserProfilePage'))
const WorkCalendarPage = lazy(() => import('../features/work-calendar/routes/WorkCalendarPage'))

const AdminManagement = lazy(() => import('../features/User/components/userPage/AdminManagementPage'))

const DevicePage = lazy(() => import('../features/devices/routes/DevicePage'));
const ErrorPage = lazy(() => import("./ErrorPage"));

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
          // ... (روت‌های درخواست‌ها) ...
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

          // ... (روت‌های گزارش‌ها) ...
          {
            path: "/reports",
            element: (
              <Suspense fallback={<ReportsPageSkeleton />}>
                <ReportsIndexPage />
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
            path: "/reports/my/:reportId",
            element: (
              <Suspense fallback={<Spinner />}>
                <MyReportPageDetails />
              </Suspense>
            ),
          },
          {
            path: "/reports/employee/:employeeApiId",
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

          // --- روت‌های Work Patterns ---
          {
            path: "/work-patterns",
            element: (
              <Suspense fallback={<WorkPatternPageSkeleton />}>
                <WorkPatternPage />
              </Suspense>
            ),
          },

          {
            path: "/work-patterns/assign",
            element: (
              <Suspense fallback={<Spinner />}>
                <AddToWorkPatternPage />
              </Suspense>
            ),
          },

          {
            path: "/work-patterns/new-work-patterns",
            element: (
              <Suspense fallback={<Spinner />}>
                <NewWorkPatternPage />
              </Suspense>
            ),
          },

          {
            path: "/work-patterns/edit/:patternId",
            element: (
              <Suspense fallback={<Spinner />}>
                <WorkPatternsEdit />
              </Suspense>
            ),
          },

          {
            path: `/work-patterns/employees/:patternType/:patternId`,
            element: (
              <Suspense fallback={<Spinner />}>
                <WorkPatternsEmployeesPage />
              </Suspense>
            ),
          },

          {
            path: "/shift-schedules/edit/:patternId",
            element: (
              <Suspense fallback={<EditShiftScheduleFormSkeleton />}>
                <EditShiftSchedulePage />
              </Suspense>
            ),
          },

          // --- روت‌های Work Groups (اصلاح‌شده و جدید) ---
          {
            path: "/work-groups",
            element: (
              <Suspense fallback={<Spinner />}>
                <WorkGroupPage />
              </Suspense>
            ),
          },
          {
            path: "/work-groups/new",
            element: (
              <Suspense fallback={<Spinner />}>
                <NewWorkGroupDetailPage />
              </Suspense>
            ),
          },
          // ✅✅✅ روت جدید: مدیریت کارمندان گروه کاری ✅✅✅
          {
            path: "/work-groups/:id/assign",
            element: (
              <Suspense fallback={<Spinner />}>
                <WorkGroupAssignmentPage />
              </Suspense>
            ),
          },
          {
            path: "/work-groups/:id",
            element: (
              <Suspense fallback={<Spinner />}>
                <WorkGroupDetailPage />
              </Suspense>
            ),
          },

          // ... (سایر روت‌ها بدون تغییر) ...
          {
            path: "/organizations",
            element: (
              <Suspense fallback={<Spinner />}>
                <OrganizationPage />
              </Suspense>
            ),
          },
          {
            path: "/organizations/:id",
            element: (
              <Suspense fallback={<Spinner />}>
                <OrganizationDetailPage />
              </Suspense>
            ),
          },
          {
            path: "/organizations/:id/create-user",
            element: (
              <Suspense fallback={<Spinner />}>
                <CreateUser />
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
          {
            path: "/admin-management",
            element: (
              <Suspense fallback={<Spinner />}>
                <AdminManagement />
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