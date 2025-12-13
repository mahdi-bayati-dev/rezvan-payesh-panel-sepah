<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\BroadcastMessage;
use Illuminate\Notifications\Notification;

class ImageUploadPending extends Notification
{
    use Queueable;

    /**
     * تعداد عکس‌های آپلود شده
     */

    /**
     * Create a new notification instance.
     */
    public function __construct(public int $count = 1)
    {

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
     * Get the array representation of the notification.
     * ذخیره در دیتابیس برای نمایش در لیست اعلان‌ها
     *
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        return [
            'title' => 'تصویر پروفایل در انتظار تایید',
            'message' => $this->count > 1
                ? "تعداد {$this->count} تصویر جدید با موفقیت آپلود شد و پس از تایید مدیریت نمایش داده می‌شود."
                : "تصویر جدید شما با موفقیت آپلود شد و پس از تایید مدیریت نمایش داده می‌شود.",
            'status' => 'pending',
            'type' => 'info',
        ];
    }

    /**
     * تنظیمات برادکست برای ارسال لحظه‌ای (Toast) به کاربر
     */
    public function toBroadcast(object $notifiable): BroadcastMessage
    {
        return new BroadcastMessage([
            'title' => 'وضعیت آپلود تصویر',
            'message' => 'تصاویر شما جهت بررسی برای مدیریت ارسال شد.',
            'type' => 'info',
            'count' => $this->count,
        ]);
    }

    public function receivesBroadcastNotificationsOn(): string
    {
        return 'App.User.' . $this->id;
    }
}