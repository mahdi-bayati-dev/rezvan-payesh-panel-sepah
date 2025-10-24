// src/routes/ErrorPage.tsx (یا هر مسیر دلخواه دیگر)

import { useRouteError, isRouteErrorResponse, Link } from 'react-router-dom';

const ErrorPage = () => {
    // این هوک، خطای رخ داده را به شما می‌دهد
    const error = useRouteError();
    let errorMessage: string;
    let errorStatus: number | undefined;

    // بررسی اینکه آیا خطا مربوط به روتینگ است (مثل 404)
    if (isRouteErrorResponse(error)) {
        errorMessage = error.statusText || 'خطایی رخ داده است';
        errorStatus = error.status;
    } else if (error instanceof Error) {
        errorMessage = error.message;
    } else {
        errorMessage = 'یک خطای ناشناخته رخ داده است';
    }

    return (
        <div
            id="error-page"
            className="flex flex-col items-center justify-center h-screen gap-4"
        >
            <h1 className="text-4xl font-bold">خطا!</h1>
            {errorStatus && (
                <p className="text-2xl font-medium text-destructiveL">
                    {errorStatus === 404 ? 'صفحه مورد نظر یافت نشد (404)' : `خطای ${errorStatus}`}
                </p>
            )}
            <p className="text-lg text-muted-foregroundL">{errorMessage}</p>
            <Link to="/" className="text-primaryL hover:underline">
                بازگشت به صفحه اصلی
            </Link>
        </div>
    );
};

export default  ErrorPage