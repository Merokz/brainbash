import { Text } from '@react-email/components';
import { theme } from './email-theme';

export const Footer: FC = () => (
    <div
        style={{
            marginTop: '30px',
            borderTop: `1px solid ${theme.colors.border}`,
            paddingTop: '10px',
        }}
    >
        <Text
            style={{
                fontSize: '12px',
                color: theme.colors.muted,
                textAlign: 'center',
            }}
        >
            © {new Date().getFullYear()} {theme.brand.name}. all rights
            reserved.
        </Text>
        <Text
            style={{
                fontSize: '12px',
                color: theme.colors.muted,
                textAlign: 'center',
            }}
        >
            <a
                href={theme.brand.url}
                style={{ color: theme.colors.primary, textDecoration: 'none' }}
            >
                visit {theme.brand.name}
            </a>
        </Text>
    </div>
);
