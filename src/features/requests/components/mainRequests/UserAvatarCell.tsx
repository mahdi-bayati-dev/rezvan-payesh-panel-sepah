// کامپوننت نمایش کاربر
const UserAvatarCell = ({ name, phone, avatarUrl }: { name: string, phone: string, avatarUrl?: string }) => (
    <div className="flex items-center gap-2">
        <img src={avatarUrl || './img/avatars/2.png'} alt={name} className="w-8 h-8 rounded-full" />
        <div>
            <div className="font-medium">{name}</div>
            <div className="text-xs text-gray-500">{phone}</div>
        </div>
    </div>
);
export default UserAvatarCell