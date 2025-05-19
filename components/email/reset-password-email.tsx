import { Text } from '@react-email/components';
import { PrimaryButton } from './email-button';
import { Footer } from './email-footer';
import { Header } from './email-header';
import { Layout } from './email-layout';
import { theme } from './email-theme';

interface ResetPasswordEmailProps {
    email: string;
    resetLink: string;
}

export const ResetPasswordEmail: FC<ResetPasswordEmailProps> = ({
    email,
    resetLink,
}) => (
    <Layout>
        <Header />
        <Text style={{ color: theme.colors.text, textAlign: 'center' }}>
            we received a request to reset the password associated with{' '}
            <strong>{email}</strong>.
        </Text>

        <div style={{ textAlign: 'center', marginTop: '20px' }}>
            <PrimaryButton href={resetLink}>reset your password</PrimaryButton>
        </div>

        <Text style={{ color: theme.colors.muted, textAlign: 'center' }}>
            if you did not request this, you can safely ignore this email.
        </Text>
        <Footer />
    </Layout>
);

export default ResetPasswordEmail;
