<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\PendingEmployeeImage;
use App\Models\EmployeeImage;
use App\Jobs\ProcessEmployeeImages;
use App\Notifications\ImageUploadRejected;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\DB;

class ImageApprovalController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        if(!$user->hasRole(['org-admin-l2',"super_admin","org-admin-l3"]))
        {
            return response()->json(["message" => "Unauthorized"], 401);
        }
        $pendingImages = PendingEmployeeImage::with('employee.user')
            ->where('status', 'pending')
            ->latest()
            ->paginate(20);

        return response()->json($pendingImages);
    }


    public function approve($id)
    {
        $pendingImage = PendingEmployeeImage::findOrFail($id);

        DB::transaction(function () use ($pendingImage) {

            $imgRecord = EmployeeImage::create([
                'employee_id' => $pendingImage->employee_id,
                'original_path' => $pendingImage->original_path,
                'original_name' => $pendingImage->original_name,
                'mime_type' => $pendingImage->mime_type,
                'size' => $pendingImage->size,

            ]);

            $imagesToProcess = [[
                'id' => $imgRecord->id,
                'original_path' => $imgRecord->original_path
            ]];

            ProcessEmployeeImages::dispatch($pendingImage->employee, $imagesToProcess, 'update');

            $pendingImage->delete();
        });

        return response()->json(['message' => 'تصویر تایید شد و برای پردازش ارسال گردید.']);
    }

    public function reject(Request $request, $id)
    {
        $request->validate([
            'reason' => 'required|string|max:255'
        ]);

        $pendingImage = PendingEmployeeImage::findOrFail($id);

        if (Storage::disk('public')->exists($pendingImage->original_path))
        {
            Storage::disk('public')->delete($pendingImage->original_path);
        }

        $pendingImage->update([
            'status' => 'rejected',
            'rejection_reason' => $request->reason,
            'original_path' => ''
        ]);

        $user = $pendingImage->employee?->user;
        if ($user) {
            $user->notify(new ImageUploadRejected($request->reason));
        }

        return response()->json(['message' => 'تصویر رد شد.']);
    }
}