export const theme = {
    brand: {
        name: 'BrainBash',
        url: 'example.com',
        logo: 'https://i.imgur.com/zBjVDup.png',
    },
    colors: {
        primary: '#4F46E5',
        background: 'hsl(222.2, 84%, 4.9%)', // <- UPDATED
        text: '#ffffff', // <- Use white text on dark bg
        muted: '#cbd5e1', // <- Light gray for secondary text
        border: '#334155', // <- Subtle border
    },
    styles: {
        container: {
            padding: '20px',
            backgroundColor: '#1e293b', // Optional: slightly lighter content card
            borderRadius: '8px',
            border: '1px solid #334155',
            width: '100%',
            maxWidth: '600px',
            margin: '0 auto',
        },
    },
};
