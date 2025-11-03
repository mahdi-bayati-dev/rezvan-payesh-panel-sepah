<?php

namespace App\Events;

use App\Http\Resources\AttendanceLogResource;
use App\Models\AttendanceLog;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AttendanceLogCreated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public AttendanceLog $log)
    {
        $this->log = $log->load('employee.organization.parent');
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
        if (!$this->log->employee || !$this->log->employee->organization) {
            return $channels;
        }
        $organization = $this->log->employee->organization;
        $channels[] = new PrivateChannel('l3-channel.' . $organization->id);


        $currentOrg = $organization;
        $depth_counter = 0;
        while ($currentOrg && $depth_counter < 20)
        {
            $channels[] = new PrivateChannel('l2-channel.' . $currentOrg->id);
            $currentOrg = $currentOrg->parent();
            \Log::info(json_encode($currentOrg));
            $depth_counter++;
        }


        return array_unique($channels);

    }

    public function broadcastAs(): string
    {
        return 'attendance.created';
    }

    public function broadcastWith(): array
    {
        return [
            'log' => new AttendanceLogResource($this->log),
        ];
    }
}
