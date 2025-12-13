<?php

namespace App\Events;

use App\Models\User;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Support\Facades\Log;

class UserImportCompleted implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    /**
     * Create a new event instance.
     */
    public function __construct(
        public int $adminId,
        public string $message = 'عملیات ایمپورت کاربران با موفقیت به پایان رسید.',
        public string $status = 'success'
    )
    {
    }

    /**
     * Get the channels the event should broadcast on.
     */
    public function broadcastOn(): array
    {
        Log::info("Broadcasting import completion to channel: App.User." . $this->adminId);

        return [
            new PrivateChannel('App.User.' . $this->adminId),
        ];
    }

    /**
     * نام رویداد که در فرانت‌اند شنیده می‌شود
     */
    public function broadcastAs(): string
    {
        return 'user.import.completed';
    }

    /**
     * دیتایی که به فرانت‌اند ارسال می‌شود
     */
    public function broadcastWith(): array
    {
        return [
            'message' => $this->message,
            'status'  => $this->status,
            'timestamp' => now()->toIso8601String(),
        ];
    }
}