import { createBrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { MainLayout } from "@/components/layout/MainLayout";


// --- ۱. همه‌ی صفحات را به صورت lazy وارد کنید ---
const DashboardPage = lazy(
  () => import("@/features/dashboard/routes/DashboardPage")
);
const LoginPage = lazy(() => import("@/features/auth/routes/LoginPage"));

// ✅ RequestsPage هم باید به صورت lazy وارد شود
const RequestsPage = lazy(
  () => import("@/features/requests/routes/requestsPage")
);
const NewRequestPage= lazy(
  ()=>import("@/features/requests/routes/NewRequestPage")
)

// تعریف ساختار مسیرها (بقیه کد شما از قبل درست بود)
export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: (
          // ۲. هر صفحه lazy به Suspense نیاز دارد (که شما درست قرار دادید)
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
      // ... (می‌توانید روت صفحه درخواست جدید را هم اینجا اضافه کنید)
      {
        path: "/requests/new",
        element: (
          <Suspense fallback={<Spinner />}>
            <NewRequestPage /> 
          </Suspense>
        ),
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