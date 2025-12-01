import React, { useState, useEffect } from 'react';
import { type ImageRequest } from '../types';
import { useApproveRequest, useRejectRequest } from '../hooks/useImageRequests';
import { getFullImageUrl } from '@/features/User/utils/imageHelper';

import { Modal, ModalBody } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import Textarea from '@/components/ui/Textarea';
import SelectBox from '@/components/ui/SelectBox';
import { X, User, } from 'lucide-react';

interface ImageApprovalModalProps {
    isOpen: boolean;
    onClose: () => void;
    request: ImageRequest | null;
}

const statusOptions = [
    { id: 'approved', name: 'تایید درخواست' },
    { id: 'rejected', name: 'رد درخواست (نیازمند توضیحات)' },
];

export const ImageApprovalModal: React.FC<ImageApprovalModalProps> = ({
    isOpen,
    onClose,
    request
}) => {
    const [status, setStatus] = useState<string | null>(null);
    const [description, setDescription] = useState("");

    const approveMutation = useApproveRequest();
    const rejectMutation = useRejectRequest();

    // ریست کردن فرم هنگام باز شدن مدال
    useEffect(() => {
        if (isOpen) {
            setStatus(null);
            setDescription("");
        }
    }, [isOpen]);

    const handleSubmit = () => {
        if (!request || !status) return;

        if (status === 'approved') {
            approveMutation.mutate(request.id, { onSuccess: onClose });
        } else if (status === 'rejected') {
            if (!description.trim()) return; // توضیحات برای رد کردن اجباری است
            rejectMutation.mutate({ id: request.id, reason: description }, { onSuccess: onClose });
        }
    };

    if (!request) return null;

    const imageUrl = getFullImageUrl(request.original_path);
    const fullName = `${request.employee.first_name} ${request.employee.last_name}`;
    const isLoading = approveMutation.isPending || rejectMutation.isPending;

    // بررسی اعتبار فرم برای فعال/غیرفعال کردن دکمه
    const isFormValid = status === 'approved' || (status === 'rejected' && description.trim().length > 0);

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="xl">
            {/* --- هدر مدال --- */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">تایید پروفایل</h3>
                    <span className="text-sm font-mono text-gray-400">#{request.id}</span>
                </div>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            <ModalBody >
                <div className="flex flex-col md:flex-row min-h-[450px]" dir="rtl">
                    {/* --- ستون راست: مشخصات و عکس --- */}
                    <div className="w-full md:w-3/5 p-8 bg-gray-50/80 dark:bg-black/20 flex flex-col items-center">
                        <h4 className="font-bold text-gray-800 dark:text-gray-200 mb-8 text-lg">مشخصات</h4>

                        {/* عکس پروفایل */}
                        <div className="relative mb-8 group">
                            <div className="w-56 h-56 rounded-3xl overflow-hidden shadow-2xl border-4 border-white dark:border-gray-700 bg-gray-200">
                                {imageUrl ? (
                                    <img
                                        src={imageUrl}
                                        alt={fullName}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <User className="w-16 h-16" />
                                    </div>
                                )}
                            </div>
                            {/* بج روی عکس */}
                            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold shadow-sm whitespace-nowrap">
                                {request.employee.position || "کارمند"}
                            </div>
                        </div>

                        {/* اطلاعات فردی */}
                        <div className="w-full space-y-5 px-4">
                            <div className="text-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">{fullName}</h2>
                                <p className="text-gray-500 dark:text-gray-400 font-mono text-sm mt-1">{request.employee.personnel_code}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-x-8 gap-y-4 text-sm w-full max-w-sm mx-auto">
                                <div className="text-left text-gray-500 dark:text-gray-400">نام و نام خانوادگی</div>
                                <div className="text-right font-medium text-gray-800 dark:text-gray-200">{fullName}</div>

                                <div className="col-span-2 border-b border-gray-200 dark:border-gray-700/50 border-dashed opacity-50"></div>

                                <div className="text-left text-gray-500 dark:text-gray-400">سازمان</div>
                                <div className="text-right font-medium text-gray-800 dark:text-gray-200 truncate" title={request.employee.organization?.name}>
                                    {request.employee.organization?.name || "---"}
                                </div>

                                <div className="col-span-2 border-b border-gray-200 dark:border-gray-700/50 border-dashed opacity-50"></div>

                                <div className="text-left text-gray-500 dark:text-gray-400">گروه کاری</div>
                                <div className="text-right font-medium text-gray-800 dark:text-gray-200">
                                    {request.employee.work_group?.name || "---"}
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* --- ستون چپ: فرم عملیات --- */}
                    <div className="w-full md:w-2/5  border-l border-gray-100 dark:border-gray-800 flex flex-col justify-between bg-white dark:bg-gray-900">
                        <div className="space-y-6">
                            <SelectBox
                                label="وضعیت پاسخ"
                                placeholder="انتخاب کنید"
                                options={statusOptions}
                                value={statusOptions.find(o => o.id === status) || null}
                                onChange={(opt) => setStatus(opt?.id as string)}
                            />

                            <Textarea
                                label="توضیحات"
                                placeholder={status === 'rejected' ? "دلیل رد شدن عکس را بنویسید..." : "توضیحات اختیاری..."}
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={6}
                                className="resize-none"
                            />
                        </div>

                        <div className="flex gap-3 mt-8 pt-4 border-t border-gray-50 dark:border-gray-800/50">
                            <Button
                                variant="primary"
                                className="flex-1 bg-slate-800 hover:bg-slate-700 text-white shadow-lg shadow-slate-200 dark:shadow-none"
                                onClick={handleSubmit}
                                disabled={!isFormValid || isLoading}
                            >
                                {isLoading ? 'در حال پردازش...' : 'تایید و ارسال'}
                            </Button>
                            <Button
                                variant="outline"
                                className="flex-1 border-gray-300 text-gray-600 hover:bg-gray-50"
                                onClick={onClose}
                                disabled={isLoading}
                            >
                                لغو
                            </Button>
                        </div>
                    </div>



                </div>
            </ModalBody>
        </Modal>
    );
};