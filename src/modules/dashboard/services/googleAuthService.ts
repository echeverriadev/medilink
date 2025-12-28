const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
const SCOPES = 'https://www.googleapis.com/auth/calendar.events';

export const initiateGoogleLogin = () => {
    if (!GOOGLE_CLIENT_ID) {
        console.error('Google Client ID not configured');
        return;
    }

    const redirectUri = window.location.origin + '/dashboard';
    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${GOOGLE_CLIENT_ID}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=token&` +
        `scope=${encodeURIComponent(SCOPES)}&` +
        `prompt=consent`;

    window.location.href = authUrl;
};

export const handleGoogleRedirect = () => {
    const hash = window.location.hash;
    if (hash) {
        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        const expiresIn = params.get('expires_in');

        if (accessToken) {
            localStorage.setItem('google_access_token', accessToken);
            localStorage.setItem('google_token_expiry', (Date.now() + Number(expiresIn) * 1000).toString());
            // Clear hash from URL
            window.history.replaceState({}, document.title, window.location.pathname);
            return true;
        }
    }
    return false;
};

export const getGoogleAccessToken = () => {
    const token = localStorage.getItem('google_access_token');
    const expiry = localStorage.getItem('google_token_expiry');

    if (token && expiry && Date.now() < Number(expiry)) {
        return token;
    }

    // Token expired or not found
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_token_expiry');
    return null;
};

export const isGoogleConnected = () => {
    return !!getGoogleAccessToken();
};

export const disconnectGoogle = () => {
    localStorage.removeItem('google_access_token');
    localStorage.removeItem('google_token_expiry');
};
