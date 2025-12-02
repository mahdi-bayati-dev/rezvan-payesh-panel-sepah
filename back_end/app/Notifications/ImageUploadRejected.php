<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class ImageUploadRejected extends Notification
{
    use Queueable;

    /**
     * دلیل رد شدن عکس
     */
    public string $reason;

    /**
     * Create a new notification instance.
     */
    public function __construct(string $reason)
    {
        $this->reason = $reason;
    }

    /**
     * Get the notification's delivery channels.
     *
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database', 'broadcast'];
    }

    /**
     * ذخیره در دیتابیس
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'تصویر پروفایل رد شد',
            'message' => "تصویر ارسالی شما تایید نشد. دلیل: {$this->reason}",
            'reason' => $this->reason,
            'status' => 'rejected',
            'type' => 'error',
        ];
    }

    /**
     * ارسال لحظه‌ای (سوکت)
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'title' => 'عدم تایید تصویر',
            'message' => " تصویر شما به دلیل « {$this->reason} » رد شد.",
            'type' => 'error',
            'status' => 'rejected'
        ]);
    }

    public function receivesBroadcastNotificationsOn(): string
    {
        return 'App.User.' . $this->id;
    }
}