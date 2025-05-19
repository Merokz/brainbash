import { Button } from '@react-email/components';
import { theme } from './email-theme';

interface PrimaryButtonProps {
    href: string;
    children: ReactNode;
}

export const PrimaryButton: FC<PrimaryButtonProps> = ({ href, children }) => (
    <Button
        href={href}
        style={{
            backgroundColor: theme.colors.primary,
            color: '#fff',
            padding: '12px 20px',
            borderRadius: '5px',
            textDecoration: 'none',
            display: 'inline-block',
        }}
    >
        {children}
    </Button>
);
