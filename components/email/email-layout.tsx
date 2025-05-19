import { Body, Container, Head, Html } from '@react-email/components';
import { theme } from './email-theme';

interface LayoutProps {
    children: ReactNode;
}

export const Layout: FC<LayoutProps> = ({ children }) => (
    <Html>
        <Head />
        <Body
            style={{
                backgroundColor: theme.colors.background,
                padding: '20px',
            }}
        >
            <Container style={theme.styles.container}>{children}</Container>
        </Body>
    </Html>
);
