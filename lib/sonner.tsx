import { AlertTriangle, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

export const showToast = async (
    message: string,
    isSuccess: boolean,
): Promise<any> => {
    toast(
        <div className="flex items-center gap-3 text-white">
            <div className="shrink-0">
                {isSuccess ? (
                    <CheckCircle className="w-5 h-5" />
                ) : (
                    <AlertTriangle className="w-5 h-5" />
                )}
            </div>
            <div className="text-sm font-medium">{message}</div>
        </div>,
        {
            unstyled: true,
            classNames: {
                toast: `flex items-center px-4 py-3 rounded-md shadow-lg ${
                    isSuccess ? 'bg-[#172D53]' : 'bg-[#AE0600]'
                }`,
            },
        },
    );
};
