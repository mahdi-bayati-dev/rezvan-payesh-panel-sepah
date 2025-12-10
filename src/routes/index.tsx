import { createBrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react";
import { MainLayout } from "../components/layout/MainLayout";
import { ProtectedRoute } from "./ProtectedRoute/ProtectedRoute";
import { RoleBasedGuard } from "./RoleBasedGuard/RoleBasedGuard";
import { ALL_ACCESS, ADMIN_ACCESS, SUPER_ADMIN_ONLY } from "@/constants/roles";
import { Spinner, RouteSpinner } from "../components/ui/Spinner";
// --- Lazy Imports ---
// (ایمپورت‌های شما بدون تغییر باقی ماندند)
const LicensePage = lazy(() => import("@/features/license/routes/licensePage"));
const ReportsIndexPage = lazy(() => import("../features/reports/routes/ReportsIndexPage"));
const MyReportPageDetails = lazy(() => import("../features/reports/routes/myReportPageDetails"));
const DashboardPage = lazy(() => import("../features/dashboard/routes/DashboardPage"));
const LoginPage = lazy(() => import("../features/auth/routes/LoginPage"));
const RequestsPage = lazy(() => import("../features/requests/routes/requestsPage"));
const NewRequestPage = lazy(() => import("../features/requests/routes/NewRequestPage"));
const RequestDetailPage = lazy(() => import("../features/requests/routes/RequestDetailPage"));
const TableSettingsPage = lazy(() => import("../features/requests/routes/TableSettingsPage"));
const ReportsPageSkeleton = lazy(() => import("../features/reports/Skeleton/SkeletonRepotrs"));
const ActivityReportPageDetails = lazy(() => import("../features/reports/routes/reportPageDetails"));
const EmployeeReportsPage = lazy(() => import("../features/reports/routes/EmployeeReportsPage"));
const NewActivityRegistrationPage = lazy(() => import("../features/reports/routes/NewReportPage"));
const WorkPatternPage = lazy(() => import("../features/work-pattern/routes/WorkPatternPage"));
const WorkPatternPageSkeleton = lazy(() => import("../features/work-pattern/Skeleton/Skeleton"));
const NewWorkPatternPage = lazy(() => import("../features/work-pattern/routes/NewPatternSelectorPage"));
const WorkPatternsEdit = lazy(() => import('../features/work-pattern/routes/EditWeekPatternPage'))
const WorkPatternsEmployeesPage = lazy(() => import('../features/work-pattern/routes/WorkPatternEmployeesPage'))
const EditShiftSchedulePage = lazy(() => import('../features/shift-schedule/routes/EditShiftSchedulePage'))
const EditShiftScheduleFormSkeleton = lazy(() => import('../features/shift-schedule/Skeleton/EditShiftScheduleFormSkeleton'))
const AddToWorkPatternPage = lazy(() => import("../features/work-pattern/routes/AddToWorkPatternPage"));
const WorkGroupPage = lazy(() => import("../features/work-group/routes/workGroupPage"))
const WorkGroupDetailPage = lazy(() => import("../features/work-group/routes/workGroupDetailPage"))
const WorkGroupAssignmentPage = lazy(() => import("../features/work-group/routes/WorkGroupAssignmentPage"));
const OrganizationPage = lazy(() => import('../features/Organization/routes/OrganizationPage'))
const OrganizationDetailPage = lazy(() => import('../features/Organization/components/OrganizationDetailPage/OrganizationDetailPage'))
const CreateUser = lazy(() => import('../features/User/components/userCreate/CreateUserPage'))
const AssignUserPage = lazy(() => import('../features/User/components/AssignUser/AssignUserPage'))
const UserProfilePage = lazy(() => import('../features/User/components/userPage/UserProfilePage'))
const MyProfilePage = lazy(() => import('../features/User/components/myProfile/myProfilePage'))
const PendingImagesPage = lazy(() => import('../features/ConfirmPhotos/routes/PendingImagesPage'))
const WorkCalendarPage = lazy(() => import('../features/work-calendar/routes/WorkCalendarPage'))
const AdminManagement = lazy(() => import('../features/User/components/userPage/AdminManagementPage'))
const DevicePage = lazy(() => import('../features/devices/routes/DevicePage'));
const ErrorPage = lazy(() => import("./ErrorPage"));
const UnauthorizedPage = lazy(() => import("./UnauthorizedPage"));

/**
 * ✅ کامپوننت لودینگ استاندارد برای روت‌ها
 * این کامپوننت از تکرار کد جلوگیری می‌کند و مطمئن می‌شود که
 * اسپینر همیشه در مرکز صفحه (با ارتفاع مناسب) نمایش داده می‌شود.
 */


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
          // ------------------------------------------------------------
          // ۱. روت‌های عمومی (برای همه نقش‌ها)
          // ------------------------------------------------------------
          {
            element: <RoleBasedGuard allowedRoles={ALL_ACCESS} />,
            children: [
              {
                path: "/",
                // ✅ استفاده از RouteSpinner به جای Spinner خالی
                element: <Suspense fallback={<RouteSpinner />}><DashboardPage /></Suspense>,
              },
              {
                path: "my-profile",
                element: <Suspense fallback={<RouteSpinner />}><MyProfilePage /></Suspense>,
              },
              {
                path: "license",
                element: <Suspense fallback={<RouteSpinner />}><LicensePage /></Suspense>,
              },
              {
                path: "requests",
                element: <Suspense fallback={<RouteSpinner />}><RequestsPage /></Suspense>,
              },
              {
                path: "requests/new",
                element: <Suspense fallback={<RouteSpinner />}><NewRequestPage /></Suspense>,
              },
              {
                path: "requests/:requestId",
                element: <Suspense fallback={<RouteSpinner />}><RequestDetailPage /></Suspense>,
              },
              {
                path: "requests/settings-table",
                element: <Suspense fallback={<RouteSpinner />}><TableSettingsPage /></Suspense>,
              },
              {
                path: "reports",
                // ⚠️ نکته: اسکلتون‌ها تجربه کاربری بهتری دارند، پس آن‌ها را نگه داشتیم
                element: <Suspense fallback={<ReportsPageSkeleton />}><ReportsIndexPage /></Suspense>,
              },
              {
                path: "reports/:reportId",
                element: <Suspense fallback={<RouteSpinner />}><ActivityReportPageDetails /></Suspense>,
              },
              {
                path: "reports/my/:reportId",
                element: <Suspense fallback={<RouteSpinner />}><MyReportPageDetails /></Suspense>,
              },
              {
                path: "reports/employee/:employeeApiId",
                element: <Suspense fallback={<RouteSpinner />}><EmployeeReportsPage /></Suspense>,
              },
              {
                path: "reports/new",
                element: <Suspense fallback={<RouteSpinner />}><NewActivityRegistrationPage /></Suspense>,
              },
              {
                path: "work-calender",
                element: <Suspense fallback={<RouteSpinner />}><WorkCalendarPage /></Suspense>,
              },
              {
                path: "organizations/users/:userId",
                element: <Suspense fallback={<RouteSpinner />}><UserProfilePage /></Suspense>,
              }
            ]
          },

          // ------------------------------------------------------------
          // ۲. روت‌های مشترک ادمین‌ها
          // ------------------------------------------------------------
          {
            element: <RoleBasedGuard allowedRoles={ADMIN_ACCESS} />,
            children: [
              {
                path: "organizations",
                element: <Suspense fallback={<RouteSpinner />}><OrganizationPage /></Suspense>,
              },
              {
                path: "organizations/:id",
                element: <Suspense fallback={<RouteSpinner />}><OrganizationDetailPage /></Suspense>,
              },
              {
                path: "organizations/:id/create-user",
                element: <Suspense fallback={<RouteSpinner />}><CreateUser /></Suspense>,
              },
              {
                path: "organizations/:id/assign-user",
                element: <Suspense fallback={<RouteSpinner />}><AssignUserPage /></Suspense>,
              },
              {
                path: "confirm-photos/pending-images",
                element: <Suspense fallback={<RouteSpinner />}><PendingImagesPage /></Suspense>,
              },
            ]
          },

          // ------------------------------------------------------------
          // ۳. روت‌های مخصوص سوپر ادمین
          // ------------------------------------------------------------
          {
            element: <RoleBasedGuard allowedRoles={SUPER_ADMIN_ONLY} />,
            children: [
              {
                path: "work-patterns",
                // اسکلتون حفظ شد
                element: <Suspense fallback={<WorkPatternPageSkeleton />}><WorkPatternPage /></Suspense>
              },
              {
                path: "work-patterns/assign",
                element: <Suspense fallback={<RouteSpinner />}><AddToWorkPatternPage /></Suspense>
              },
              {
                path: "work-patterns/new-work-patterns",
                element: <Suspense fallback={<RouteSpinner />}><NewWorkPatternPage /></Suspense>
              },
              {
                path: "work-patterns/edit/:patternId",
                element: <Suspense fallback={<RouteSpinner />}><WorkPatternsEdit /></Suspense>
              },
              {
                path: "work-patterns/employees/:patternType/:patternId",
                element: <Suspense fallback={<RouteSpinner />}><WorkPatternsEmployeesPage /></Suspense>
              },
              {
                path: "shift-schedules/edit/:patternId",
                // اسکلتون حفظ شد
                element: <Suspense fallback={<EditShiftScheduleFormSkeleton />}><EditShiftSchedulePage /></Suspense>
              },
              {
                path: "device-management",
                element: <Suspense fallback={<RouteSpinner />}><DevicePage /></Suspense>,
              },
              {
                path: "admin-management",
                element: <Suspense fallback={<RouteSpinner />}><AdminManagement /></Suspense>,
              },
              {
                path: "work-groups",
                element: <Suspense fallback={<RouteSpinner />}><WorkGroupPage /></Suspense>,
              },

              {
                path: "work-groups/:id/assign",
                element: <Suspense fallback={<RouteSpinner />}><WorkGroupAssignmentPage /></Suspense>,
              },
              {
                path: "work-groups/:id",
                element: <Suspense fallback={<RouteSpinner />}><WorkGroupDetailPage /></Suspense>,
              },
            ]
          },

          {
            path: "unauthorized",
            element: <Suspense fallback={<RouteSpinner />}><UnauthorizedPage /></Suspense>
          }
        ],
      },
    ],
  },
  {
    path: "/login",
    // ✅ برای صفحه لاگین از حالت fullscreen استفاده می‌کنیم چون خارج از MainLayout است
    element: <Suspense fallback={<Spinner variant="dots" fullscreen text="در حال آماده‌سازی..." />}><LoginPage /></Suspense>,
  },
]);