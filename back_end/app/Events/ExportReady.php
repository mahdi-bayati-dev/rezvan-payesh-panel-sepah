<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class ExportReady
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(public User $user, public string $downloadUrl, public string $reportName)
    {
        //
    }

    /**
     * Get the channels the event should broadcast on.
     *
     * @return array<int, Channel>
     */
    public function broadcastOn(): array
    {
        Log::info("chanel ".'App.User.' . $this->user->id);
        return [
            new PrivateChannel('App.User.' . $this->user->id),
        ];
    }
    public function broadcastAs(): string
    {
        return 'export.ready';
    }

    public function broadcastWith(): array
    {
        return [
            'report_name' => $this->reportName,
            'download_url' => $this->downloadUrl,
        ];
    }
}
