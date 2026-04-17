import { getAccessToken, signOut } from './auth.js';

const API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
    throw new Error('Falta la variable de entorno VITE_API_URL');
}

/**
 * Fetch wrapper que agrega el JWT de Supabase en cada request al backend.
 *
 * @param {string} path    - Ruta relativa, ej: '/api/auth/me'
 * @param {RequestInit} options - Opciones estándar de fetch
 * @returns {Promise<any>} - JSON parseado de la respuesta
*/

export async function apiFetch(path, options = {}) {
    const token = await getAccessToken();
    console.log("TOKEN:", token);

    const headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
    });

    // Sesión expirada o token inválido → cerrar sesión y redirigir
    if (response.status === 401) {
        await signOut();
        window.location.href = '/login';
        return null;
    }

    // Respuestas sin body (204 No Content)
    if (response.status === 204) {
        return null;
    }

    const data = await response.json();

    if (!response.ok) {
        const message = data?.error || `Error ${response.status}`;
        throw new Error(message);
    }

    return data;
}

/**
 * GET /api/auth/me — obtiene el perfil del usuario logueado (con rol).
*/

export async function getMe() {
    return apiFetch('/api/auth/me');
}