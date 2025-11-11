<?php
namespace App\Events;

use App\Http\Resources\LeaveRequestResource;
use App\Models\LeaveRequest;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LeaveRequestProcessed implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public LeaveRequest $leaveRequest)
    {
        $this->leaveRequest = $leaveRequest->loadMissing(['employee.user', 'leaveType', 'processor']);
    }

    public function broadcastOn()
    {
       $employee = $this->leaveRequest->employee;

        if (!$employee || !$employee->user_id)
        {
            return [];
        }

        return [
            new PrivateChannel('user.' . $employee->user_id),
        ];

    }

    public function broadcastAs(): string
    {
        return 'leave_request.processed';
    }

    public function broadcastWith(): array
    {
        return ['request' => new LeaveRequestResource($this->leaveRequest)];
    }
}