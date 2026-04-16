import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Faltan variables de entorno VITE_SUPABASE_URL o VITE_SUPABASE_ANON_KEY');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        storageKey: 'ff_session',
    },
});

/**
 * Iniciar sesión con email y contraseña.
 * @returns {{ data, error }}
*/

export async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    return { data, error };
}

/**
 * Registrar nuevo usuario.
 * profileData: { first_name, last_name, phone }
 * El trigger de Supabase inserta automáticamente en profiles.
 * @returns {{ data, error }}
*/

export async function signUp(email, password, profileData = {}) {
    const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
            data: {
                first_name: profileData.first_name || '',
                last_name: profileData.last_name || '',
                phone: profileData.phone || '',
            },
        },
    });
    return { data, error };
}

/**
 * Cerrar sesión del usuario actual.
*/

export async function signOut() {
    const { error } = await supabase.auth.signOut();
    return { error };
}

/**
 * Obtener la sesión activa (si existe).
 * @returns {{ session, error }}
*/

export async function getSession() {
    const { data, error } = await supabase.auth.getSession();
    return { session: data?.session ?? null, error };
}

/**
 * Obtener el access_token de la sesión activa.
 * @returns {string|null}
*/

export async function getAccessToken() {
    const { session } = await getSession();
    return session?.access_token ?? null;
}