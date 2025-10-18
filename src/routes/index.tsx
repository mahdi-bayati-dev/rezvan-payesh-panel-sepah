// src/routes/index.tsx

import { createBrowserRouter } from "react-router-dom";
import { Suspense, lazy } from "react";
import { Spinner } from "@/components/ui/Spinner";
import { MainLayout } from "@/components/layout/MainLayout";
import RequestsPage from "@/features/requests/routes/requestsPage";

const DashboardPage = lazy(
  () => import("@/features/dashboard/routes/DashboardPage")
);
const LoginPage = lazy(() => import("@/features/auth/routes/LoginPage"));

// تعریف ساختار مسیرها (بقیه کد بدون تغییر باقی می‌ماند)
export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
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
