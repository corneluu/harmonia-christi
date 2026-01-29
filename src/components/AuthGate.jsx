
import React, { useState, useEffect } from 'react';
import { Lock } from 'lucide-react';
import hashes from '../data/access_hashes.json';
import { logAccess } from '../utils/logger';

// Simple hashing function to match server-side (using Web Crypto API would be better but simple string match of pre-generated hash is easier if we bring a library, 
// BUT we don't want to import 'crypto' in browser.
// actually, we can't easily use "crypto" module in browser without polyfill.
// Let's use subtle crypto.

async function sha256(message) {
    const msgBuffer = new TextEncoder().encode(message);
    const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

const AuthGate = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);
    const [input, setInput] = useState('');
    const [error, setError] = useState(false);

    useEffect(() => {
        const storedAuth = localStorage.getItem('hc_auth_token');
        if (storedAuth) {
            // Validate if the stored hash is still in our valid list (optional, but good practice)
            // Validate if the stored hash is still in our valid list
            if (hashes[storedAuth]) {
                setIsAuthenticated(true);
            }
        }
        setLoading(false);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(false);

        const code = input.trim();

        // Check for lowercase "hc" explicitly
        if (code.includes('hc') || (/[a-z]/.test(code) && code.toLowerCase().startsWith('hc'))) {
            setError('lowercase_warning');
            return;
        }

        // Special redirect logic
        // HC-4579 -> Sopran
        // HC-8463 -> Alto
        // HC-7598 -> Bass
        // HC-8160 -> Tenor
        if (code === 'HC-4579') localStorage.setItem('hc_voice_pref', 'sopran');
        else if (code === 'HC-8463') localStorage.setItem('hc_voice_pref', 'alto');
        else if (code === 'HC-7598') localStorage.setItem('hc_voice_pref', 'bass');
        else if (code === 'HC-8160') localStorage.setItem('hc_voice_pref', 'tenor');
        else localStorage.removeItem('hc_voice_pref');

        // Hash the input to compare
        const hash = await sha256(code);

        if (hashes[hash]) {
            const userName = hashes[hash];
            localStorage.setItem('hc_auth_token', hash);
            setIsAuthenticated(true);
            logAccess(code, userName); // Log the successful access with Name
        } else {
            setError('invalid');
            // Shake effect or similar could go here
        }
    };

    if (loading) return null; // Or a spinner

    if (isAuthenticated) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background p-4 transition-colors duration-300">
            <div className="bg-paper p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6 border border-border">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Lock className="w-8 h-8 text-primary" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-serif font-bold text-primary">Harmonia Christi</h2>
                    <p className="text-muted">Membru Cor</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Introduceți codul de acces (ex: HC-1234)"
                            className="w-full px-4 py-3 rounded-lg border border-border bg-background focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-center text-lg uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal text-main"
                            autoFocus
                        />
                    </div>

                    {error === 'lowercase_warning' ? (
                        <p className="text-red-500 text-sm font-medium">
                            Trebuie să scrii HC cu litere mari.
                        </p>
                    ) : error && (
                        <p className="text-red-500 text-sm font-medium">
                            Cod incorect. Vă rugăm să încercați din nou.
                        </p>
                    )}

                    <button
                        type="submit"
                        className="w-full bg-primary text-white py-3 rounded-lg font-medium hover:bg-primary/90 transition-colors shadow-lg shadow-primary/30"
                    >
                        Accesează
                    </button>

                    <p className="text-xs text-muted mt-4">
                        Contactați dirijorul pentru codul de acces.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default AuthGate;
