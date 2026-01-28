
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
            if (hashes.includes(storedAuth)) {
                setIsAuthenticated(true);
            }
        }
        setLoading(false);
    }, []);

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(false);

        const code = input.trim();
        // Hash the input to compare
        const hash = await sha256(code);

        if (hashes.includes(hash)) {
            localStorage.setItem('hc_auth_token', hash);
            setIsAuthenticated(true);
            logAccess(code); // Log the successful access
        } else {
            setError(true);
            // Shake effect or similar could go here
        }
    };

    if (loading) return null; // Or a spinner

    if (isAuthenticated) {
        return <>{children}</>;
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-paper p-4">
            <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center space-y-6 border border-slate-100">
                <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                    <Lock className="w-8 h-8 text-primary" />
                </div>

                <div className="space-y-2">
                    <h2 className="text-2xl font-serif font-bold text-primary">Harmonia Christi</h2>
                    <p className="text-slate-500">Membru Cor</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            placeholder="Introduceți codul de acces (ex: HC-1234)"
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-center text-lg uppercase tracking-widest placeholder:normal-case placeholder:tracking-normal"
                            autoFocus
                        />
                    </div>

                    {error && (
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

                    <p className="text-xs text-slate-400 mt-4">
                        Contactați dirijorul pentru codul de acces.
                    </p>
                </form>
            </div>
        </div>
    );
};

export default AuthGate;
