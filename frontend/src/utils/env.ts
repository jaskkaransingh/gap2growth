export const ENV = {
    API_BASE_URL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
    MOCK_AUTH: import.meta.env.VITE_MOCK_AUTH !== 'false', // Default to true for hackathon scaffolding
};
