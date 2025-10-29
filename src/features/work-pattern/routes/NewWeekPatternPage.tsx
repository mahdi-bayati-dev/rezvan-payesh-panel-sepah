// کامنت: ایمپورت از فایل index.ts انجام می‌شود
import { NewWeekPatternForm } from "@/features/work-pattern/components/newWorkPattern/NewWeekPatternForm"
import { useNavigate } from "react-router-dom";
function NewWeekPattern() {
    const navigate = useNavigate()
    return (
        // کامنت: می‌توانید پراپ onSuccess را هم اینجا مدیریت کنید
        <NewWeekPatternForm
            onSuccess={() => {
                navigate('/work-patterns')
            }}
            onCancel={() => {
                navigate('/work-patterns')
            }}
        />
    )
}

export default NewWeekPattern
