<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PendingEmployeeImage;
use App\Models\EmployeeImage;
use App\Jobs\ProcessEmployeeImages;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class ImageApprovalController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if(!$user->hasRole('org-admin-l2',"super_admin","org-admin-l3"))
        {
            return response()->json(["message" => "Unauthorized"], 401);
        }
        $pendingImages = PendingEmployeeImage::with('employee.user')
            ->where('status', 'pending')
            ->latest()
            ->paginate(20);

        return response()->json($pendingImages);
    }

    // تایید تصویر
    public function approve($id)
    {
        $pendingImage = PendingEmployeeImage::findOrFail($id);

        // استفاده از تراکنش برای اطمینان از صحت داده‌ها
        DB::transaction(function () use ($pendingImage) {
            // 1. انتقال به جدول اصلی
            $imgRecord = EmployeeImage::create([
                'employee_id' => $pendingImage->employee_id,
                'original_path' => $pendingImage->original_path,
                'original_name' => $pendingImage->original_name,
                'mime_type' => $pendingImage->mime_type,
                'size' => $pendingImage->size,
                // webp_path هنوز null است تا جاب اجرا شود
            ]);

            // 2. آماده‌سازی داده برای جاب AI
            $imagesToProcess = [[
                'id' => $imgRecord->id,
                'original_path' => $imgRecord->original_path
            ]];

            // 3. ارسال به جاب (دقیقاً مشابه کاری که در UserController انجام می‌شد)
            // این جاب تبدیل WebP و ارسال به سرور AI را انجام می‌دهد
            ProcessEmployeeImages::dispatch($pendingImage->employee, $imagesToProcess, 'update');

            // 4. حذف از جدول پندینگ (یا تغییر وضعیت به approved و نگهداری تاریخچه)
            $pendingImage->delete();
        });

        return response()->json(['message' => 'تصویر تایید شد و برای پردازش ارسال گردید.']);
    }

    // رد تصویر
    public function reject(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string|max:255'
        ]);

        $pendingImage = PendingEmployeeImage::findOrFail($id);

        // حذف فایل فیزیکی آپلود شده (چون به درد نمی‌خورد)
        if (Storage::disk('public')->exists($pendingImage->original_path)) {
            Storage::disk('public')->delete($pendingImage->original_path);
        }

        // آپدیت وضعیت به رد شده
        $pendingImage->update([
            'status' => 'rejected',
            'rejection_reason' => $request->reason,
            'original_path' => '' // مسیر فایل پاک شده
        ]);

        // اینجا می‌توانید یک نوتیفیکیشن یا ایمیل برای کاربر ارسال کنید که عکسش رد شده

        return response()->json(['message' => 'تصویر رد شد.']);
    }
}