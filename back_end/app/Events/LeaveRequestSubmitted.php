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

class LeaveRequestSubmitted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public LeaveRequest $leaveRequest)
    {
        $this->leaveRequest = $leaveRequest->load('employee.organization.parent');
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        $channels = [];
        $channels[] = new PrivateChannel('super-admin-global');
        $organization = $this->leaveRequest->employee->organization;
        if (!$organization)
        {
            return $channels;
        }

        $channels[] = new PrivateChannel('l3-channel.' . $organization->id);


        $currentOrg = $organization;
        while ($currentOrg)
        {
            $channels[] = new PrivateChannel('l2-channel.' . $currentOrg->id);
            $currentOrg = $currentOrg->parent;
        }
        return array_unique($channels);
    }

    public function broadcastAs(): string
    {
        return 'leave_request.submitted';
    }

    public function broadcastWith(): array
    {
        return ['request' => new LeaveRequestResource( $this->leaveRequest)];
    }
}
