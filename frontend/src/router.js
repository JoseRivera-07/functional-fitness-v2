// ─────────────────────────────────────────────
//  frontend/src/router.js
//  Functional Fitness — SPA Router (History API)
// ─────────────────────────────────────────────

import { getSession, supabase, signOut } from './auth.js';
import { apiFetch } from './api.js';

// ── Pages (lazy-like imports — each returns { render, init }) ──────────────
import * as LoginPage from './pages/login.js';
import * as RegisterPage from './pages/register.js';
import * as DashboardPage from './pages/dashboard.js';
import * as AdminPage from './pages/admin/index.js';
import * as UserDetailPage from './pages/admin/userDetail.js';

   
// ── Route map ─────────────────────────────────────────────────────────────
//    path          component       protected  adminOnly
const ROUTES = [
    {
        path: '/',
        component: null,          // handled as redirect in matchRoute()
        protected: false,
        adminOnly: false,
    },
    {
        path: '/login',
        component: {
            render: LoginPage.loginPage,
            init: LoginPage.loginPageInit,
        },
        protected: false,
        adminOnly: false,
    },
    {
        path: '/register',
        component: {
            render: RegisterPage.registerPage,
            init: RegisterPage.initRegisterPage,
        },
        protected: false,
        adminOnly: false,
    },
    {
        path: '/dashboard',
        component: DashboardPage,
        protected: true,
        adminOnly: false,
    },
    {
        path: '/admin',
        component: AdminPage,
        protected: true,
        adminOnly: true,
    },
    {
        // Dynamic segment: /admin/:id
        path: '/admin/:id',
        component: UserDetailPage,
        protected: true,
        adminOnly: true,
    },
];

// ── Internal state ─────────────────────────────────────────────────────────
let _currentUser = null;   // { session, role } | null

// ── Loader helpers ─────────────────────────────────────────────────────────
function showLoader() {
    const app = document.getElementById('app');
    app.innerHTML = `
    <div class="router-loader" aria-live="polite" aria-label="Cargando…">
      <span class="router-loader__spinner" aria-hidden="true"></span>
      <p class="router-loader__text">Cargando…</p>
    </div>
  `;
}

function hideLoader() {
    // The next render() call will replace #app content, so nothing explicit needed.
    // This function exists for symmetry / future use.
}

// ── getCurrentUser ─────────────────────────────────────────────────────────
//  Reads the active Supabase session, then hits /api/auth/me for the role.
//  Caches the result in _currentUser for the lifetime of the page.
export async function getCurrentUser() {
    if (_currentUser !== null) return _currentUser;

    const session = await getSession();            // from auth.js
    if (!session) {
        _currentUser = null;
        return null;
    }

    try {
        // /api/auth/me returns { id, email, role, first_name, last_name, phone }
        const me = await apiFetch('api/auth/me');            // from api.js (adds Bearer token)
        _currentUser = { session, ...me };
        return _currentUser;
    } catch {
        // Backend unreachable or token invalid — treat as logged-out
        _currentUser = null;
        return null;
    }
}

// ── Route matching ─────────────────────────────────────────────────────────
//  Returns { route, params } or null
function matchRoute(pathname) {
    for (const route of ROUTES) {
        if (route.path === '/') continue;            // handled separately

        // Build a regex from the path pattern (supports :param segments)
        const paramNames = [];
        const regexStr = route.path
            .replace(/:([^/]+)/g, (_, name) => {
                paramNames.push(name);
                return '([^/]+)';
            })
            .replace(/\//g, '\\/');

        const regex = new RegExp(`^${regexStr}$`);
        const match = pathname.match(regex);

        if (match) {
            const params = {};
            paramNames.forEach((name, i) => {
                params[name] = decodeURIComponent(match[i + 1]);
            });
            return { route, params };
        }
    }
    return null;
}

// ── Render ─────────────────────────────────────────────────────────────────
async function render(pathname) {
    const app = document.getElementById('app');

    // ── Root redirect ──────────────────────────────────────────────────────
    if (pathname === '/') {
        const user = await getCurrentUser();
        const target = user
            ? (user.role === 'admin' ? '/admin' : '/dashboard')
            : '/login';
        return navigate(target, true); // replace so '/' doesn't stay in history
    }

    // ── Match route ────────────────────────────────────────────────────────
    const matched = matchRoute(pathname);

    if (!matched) {
        app.innerHTML = `
      <div class="not-found">
        <h1>404 — Página no encontrada</h1>
        <a href="/dashboard" data-link>Volver al inicio</a>
      </div>
    `;
        return;
    }

    const { route, params } = matched;

    // ── Auth guard ─────────────────────────────────────────────────────────
    if (route.protected) {
        const user = await getCurrentUser();

        if (!user) {
            return navigate('/login', true);
        }

        if (route.adminOnly && user.role !== 'admin') {
            return navigate('/dashboard', true);
        }
    }

    // ── Redirect already-logged-in users away from public routes ──────────
    if (!route.protected && (pathname === '/login' || pathname === '/register')) {
        const user = await getCurrentUser();
        if (user) {
            const target = user.role === 'admin' ? '/admin' : '/dashboard';
            return navigate(target, true);
        }
    }

    // ── Mount page ─────────────────────────────────────────────────────────
    const page = route.component;
    if (!page) return;

    // Each page module exports:
    //   render(params?) → HTML string
    //   init(params?)   → void  (attaches event listeners)
    app.innerHTML = await page.render(params);

    if (typeof page.init === 'function') {
        await page.init(params);
    }
}

// ── navigate ───────────────────────────────────────────────────────────────
//  Public API used by pages and components.
export function navigate(path, replace = false) {
    if (replace) {
        history.replaceState({ path }, '', path);
    } else {
        history.pushState({ path }, '', path);
    }
    return render(path);
}

// ── logout helper ──────────────────────────────────────────────────────────
//  Clears cached user + Supabase session, then redirects to /login.
export async function logout() {
    _currentUser = null;
    await signOut()
    navigate('/login', true);
}

// ── initRouter ─────────────────────────────────────────────────────────────
export async function initRouter() {
    // 1. Show loader immediately so the user sees feedback during session check
    showLoader();

    // 2. Pre-fetch current user once (caches in _currentUser)
    await getCurrentUser();

    // 3. Render the initial route
    await render(window.location.pathname);

    // 4. Handle browser back / forward buttons
    window.addEventListener('popstate', () => {
        render(window.location.pathname);
    });

    // 5. Intercept all <a data-link> clicks → client-side navigation
    document.addEventListener('click', (e) => {
        const anchor = e.target.closest('a[data-link]');
        if (!anchor) return;

        e.preventDefault();
        const href = anchor.getAttribute('href');
        if (href && href !== window.location.pathname) {
            navigate(href);
        }
    });
}