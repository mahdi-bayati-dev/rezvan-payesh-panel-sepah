<?php

namespace App\Http\Controllers\Api;

use App\Events\LeaveRequestProcessed;
use App\Events\LeaveRequestSubmitted;
use App\Exports\LeaveRequestsExport;
use App\Http\Controllers\Controller;
use App\Http\Resources\LeaveRequestResource;
use App\Jobs\GenerateLeaveReportJob;
use App\Models\LeaveRequest;
use App\Models\Organization;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Maatwebsite\Excel\Facades\Excel;
use Symfony\Component\HttpFoundation\Response as ResponseAlias;

class LeaveRequestController extends Controller
{
    public function __construct()
    {
    }
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $user = $request->user();
        $query = LeaveRequest::with(['employee', 'leaveType', 'processor']);
        if ($user->cannot('viewAny', LeaveRequest::class))
        {
            $query->where('employee_id', $user->employee?->id);
        }
        else
        {
            if ($request->has('employee_id'))
            {
                $query->where('employee_id', $request->employee_id);
            }
        }
        if ($request->has('status') && in_array($request->status,
                [
                    LeaveRequest::STATUS_PENDING,
                    LeaveRequest::STATUS_APPROVED,
                    LeaveRequest::STATUS_REJECTED
                ]))
        {
            $query->where('status', $request->status);
        }
        $perPage = (int) $request->input('per_page', 20);
        if ($perPage > 100)
        {
            $perPage = 100;
        }
        $leaveRequests = $query->orderBy('start_time', 'desc')->paginate($perPage);

        return LeaveRequestResource::collection($leaveRequests);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $this->authorize('create', LeaveRequest::class);
        $user = $request->user();
        $employee = $user->employee;
        if (!$employee)
        {
            return response()->json(['message' => 'User has no associated employee profile.'], 403);
        }
        $validator = Validator::make($request->all(),
            [
                'leave_type_id' => 'required|integer|exists:leave_types,id',
                'start_time' => 'required|date|after_or_equal:now',
                'end_time' => 'required|date|after:start_time',
                'reason' => 'nullable|string|max:1000',
            ]);
        if ($validator->fails())
        {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        $validated = $validator->validated();
        $conflictingRequest = $employee->leaveRequests()
            ->whereIn('status', [LeaveRequest::STATUS_PENDING, LeaveRequest::STATUS_APPROVED])
            ->where(function ($query) use ($validated) {
                $query->where('start_time', '<', $validated['end_time'])
                      ->where('end_time', '>', $validated['start_time']);
            })
            ->exists();
        if ($conflictingRequest)
        {
            return response()->json(['message' => 'The requested leave period conflicts with an existing request.'], 409);
        }
        $leaveRequest = $employee->leaveRequests()->create([
            'leave_type_id' => $validated['leave_type_id'],
            'start_time' => Carbon::parse($validated['start_time']),
            'end_time' => Carbon::parse($validated['end_time']),
            'reason' => $validated['reason'],
            'status' => LeaveRequest::STATUS_PENDING, // وضعیت پیش‌فرض
        ]);
         $leaveRequest->load(['employee', 'leaveType']);

        return (new LeaveRequestResource($leaveRequest))
            ->response()
            ->setStatusCode(ResponseAlias::HTTP_CREATED);
    }

    /**
     * Display the specified resource.
     */
    public function show(LeaveRequest $leaveRequest)
    {
         $this->authorize('view', $leaveRequest);
        $leaveRequest->load(['employee', 'leaveType', 'processor']);
        return new LeaveRequestResource($leaveRequest);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, LeaveRequest $leaveRequest)
    {
        $this->authorize('update', $leaveRequest);
        $validator = Validator::make($request->all(), [
            'leave_type_id' => 'required|integer|exists:leave_types,id',
            'start_time' => 'required|date|after_or_equal:now',
            'end_time' => 'required|date|after:start_time',
            'reason' => 'nullable|string|max:1000',
        ]);
        if ($validator->fails())
        {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        $leaveRequest->update($validator->validated());
        $leaveRequest->load(['employee', 'leaveType', 'processor']);

        return new LeaveRequestResource($leaveRequest);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(LeaveRequest $leaveRequest)
    {
         $this->authorize('delete', $leaveRequest);
        $leaveRequest->delete();
        return response()->json(null, ResponseAlias::HTTP_NO_CONTENT);
    }
    public function process(Request $request, LeaveRequest $leaveRequest)
    {
        $this->authorize('process', $leaveRequest);
        if (!$leaveRequest->isPending())
        {
            return response()->json(['message' => 'This request has already been processed.'], 409);
        }
        $validator = Validator::make($request->all(), [
            'status' => ['required', Rule::in([LeaveRequest::STATUS_APPROVED, LeaveRequest::STATUS_REJECTED])],
            'rejection_reason' => 'required_if:status,' . LeaveRequest::STATUS_REJECTED . '|nullable|string|max:1000',
        ]);
        if ($validator->fails())
        {
            return response()->json(['errors' => $validator->errors()], 422);
        }
        $validated = $validator->validated();

        $leaveRequest->update([
            'status' => $validated['status'],
            'rejection_reason' => $validated['status'] === LeaveRequest::STATUS_APPROVED ? null : $validated['rejection_reason'],
            'processed_by_user_id' => Auth::id(),
            'processed_at' => now(),
        ]);
        event(new LeaveRequestProcessed($leaveRequest));

        $leaveRequest->load(['employee', 'leaveType', 'processor']);
        return new LeaveRequestResource($leaveRequest);
    }

    public function export(Request $request)
    {

        $this->authorize('viewAny', LeaveRequest::class);

        $currentUser = $request->user();
        $currentUserEmployee = $currentUser->employee;

        $query = LeaveRequest::with(['employee.organization', 'employee.workGroup']);

        $adminOrg = $currentUserEmployee?->organization;

        if (!$adminOrg && ($currentUser->hasRole('org-admin-l2') || $currentUser->hasRole('org-admin-l3')))
        {
            $query->whereRaw('1 = 0');
        }
        else if ($currentUser->hasRole('org-admin-l2')) {
            $allowedOrgIds = $adminOrg->descendantsAndSelf()->pluck('id');
            $query->whereHas('employee', function ($q) use ($allowedOrgIds) {
                $q->whereIn('organization_id', $allowedOrgIds);
            });
        }
        elseif ($currentUser->hasRole('org-admin-l3')) {
            $query->whereHas('employee', function ($q) use ($adminOrg) {
                $q->where('organization_id', $adminOrg->id);
            });
        }



        if ($request->has('organization_id')) {
            $targetOrg = Organization::find($request->input('organization_id'));
            if ($targetOrg) {
                $orgIds = $targetOrg->descendantsAndSelf()->pluck('id');
                $query->whereHas('employee', function ($q) use ($orgIds) {
                    $q->whereIn('organization_id', $orgIds);
                });
            }
        }

        if ($request->input('search')) {
            $searchTerm = $request->input('search');
            $query->whereHas('employee', function ($q) use ($searchTerm) {
                $q->where('first_name', 'like', "%{$searchTerm}%")
                    ->orWhere('last_name', 'like', "%{$searchTerm}%")
                    ->orWhere('personnel_code', 'like', "%{$searchTerm}%");
            });
        }

        if ($request->input('from_date')) {
            $query->whereDate('start_date', '>=', $request->input('from_date'));
        }
        if ($request->input('to_date')) {
            $query->whereDate('end_date', '<=', $request->input('to_date'));
        }

        if ($request->input('status')) {
            $query->where('status', $request->input('status'));
        }

        $query->latest();

        $fileName = 'exit-requests-' . now()->format('Y-m-d-His') . '.xlsx';

        return Excel::download(new LeaveRequestsExport($query), $fileName);
    }
}
