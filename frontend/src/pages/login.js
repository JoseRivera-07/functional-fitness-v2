import { signIn } from '../auth.js';
import { getMe } from '../api.js';

// ─── HTML ────────────────────────────────────────────────────────────────────

export function loginPage() {
  return /* html */ `
    <div class="auth-page">
      <div class="auth-card card-dark">

        <div class="auth-logo">
          <span class="material-symbols-outlined auth-logo__icon">fitness_center</span>
          <span class="auth-logo__text">FUNCTIONAL FITNESS</span>
        </div>

        <h1 class="auth-title">Bienvenida de vuelta</h1>
        <p class="auth-subtitle">Inicia sesión para ver tu membresía</p>

        <form id="login-form" class="auth-form" novalidate>

          <div class="field-group">
            <label class="field-label" for="login-email">Correo electrónico</label>
            <input
              id="login-email"
              type="email"
              class="input-field"
              placeholder="hola@ejemplo.com"
              autocomplete="email"
              required
            />
            <span class="field-error" id="login-email-error"></span>
          </div>

          <div class="field-group">
            <label class="field-label" for="login-password">Contraseña</label>
            <div class="input-wrapper">
              <input
                id="login-password"
                type="password"
                class="input-field"
                placeholder="Mínimo 8 caracteres"
                autocomplete="current-password"
                required
              />
              <button
                type="button"
                class="input-toggle-pwd"
                aria-label="Mostrar contraseña"
                data-target="login-password"
              >
                <span class="material-symbols-outlined">visibility</span>
              </button>
            </div>
            <span class="field-error" id="login-password-error"></span>
          </div>

          <span class="field-error field-error--global" id="login-global-error"></span>

          <button type="submit" id="login-submit" class="btn-primary auth-btn">
            <span id="login-btn-text">Iniciar sesión</span>
            <span id="login-spinner" class="spinner" hidden></span>
          </button>

        </form>

        <p class="auth-footer">
          ¿No tienes cuenta?
          <a href="/register" data-link class="auth-link">Regístrate</a>
        </p>

      </div>
    </div>
  `;
}

// ─── CSS (inyectado una sola vez) ────────────────────────────────────────────

const AUTH_STYLES_ID = 'auth-styles';

function injectAuthStyles() {
  if (document.getElementById(AUTH_STYLES_ID)) return;
  const style = document.createElement('style');
  style.id = AUTH_STYLES_ID;
  style.textContent = /* css */ `
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem 1rem;
      background-color: var(--dark-bg);
    }

    .auth-card {
      width: 100%;
      max-width: 420px;
      padding: 2.5rem 2rem;
      border-radius: 32px;
      display: flex;
      flex-direction: column;
      gap: 0;
    }

    .auth-logo {
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 2rem;
    }

    .auth-logo__icon {
      color: var(--dark-logo-color);
      font-size: 22px;
    }

    .auth-logo__text {
      font-family: var(--font-heading);
      font-weight: 700;
      font-size: 1rem;
      letter-spacing: 0.12em;
      color: var(--dark-logo-color);
      text-transform: uppercase;
    }

    .auth-title {
      font-family: var(--font-heading);
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--dark-text);
      margin: 0 0 0.35rem;
      letter-spacing: -0.02em;
    }

    .auth-subtitle {
      font-size: 0.9rem;
      color: var(--dark-text-muted);
      margin: 0 0 2rem;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: 1.2rem;
    }

    .field-group {
      display: flex;
      flex-direction: column;
      gap: 6px;
    }

    .field-label {
      font-size: 0.85rem;
      font-weight: 600;
      color: var(--dark-text-muted);
      letter-spacing: 0.02em;
    }

    .input-wrapper {
      position: relative;
    }

    .input-wrapper .input-field {
      padding-right: 3rem;
    }

    .input-toggle-pwd {
      position: absolute;
      right: 0.75rem;
      top: 50%;
      transform: translateY(-50%);
      background: none;
      border: none;
      padding: 0;
      color: var(--dark-text-muted);
      cursor: pointer;
      display: flex;
      align-items: center;
    }

    .input-toggle-pwd .material-symbols-outlined {
      font-size: 20px;
    }

    .field-error {
      font-size: 0.8rem;
      color: var(--neon-red);
      min-height: 1.1rem;
      display: block;
    }

    .field-error--global {
      text-align: center;
      margin-top: -0.5rem;
    }

    .input-field.input--error {
      border-color: var(--neon-red) !important;
      box-shadow: 0 0 0 3px rgba(255, 59, 48, 0.15);
    }

    .auth-btn {
      width: 100%;
      margin-top: 0.5rem;
      min-height: 50px;
      font-size: 1rem;
      gap: 10px;
    }

    .spinner {
      width: 18px;
      height: 18px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
      display: inline-block;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .auth-footer {
      margin-top: 1.5rem;
      text-align: center;
      font-size: 0.88rem;
      color: var(--dark-text-muted);
    }

    .auth-link {
      color: var(--dark-logo-color);
      font-weight: 600;
      text-decoration: none;
      transition: opacity 0.15s;
    }

    .auth-link:hover { opacity: 0.8; }
  `;
  document.head.appendChild(style);
}

// ─── Validación ───────────────────────────────────────────────────────────────

function showError(inputId, errorId, message) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (input) input.classList.add('input--error');
  if (error) error.textContent = message;
}

function clearError(inputId, errorId) {
  const input = document.getElementById(inputId);
  const error = document.getElementById(errorId);
  if (input) input.classList.remove('input--error');
  if (error) error.textContent = '';
}

function validateLoginForm(email, password) {
  let valid = true;

  clearError('login-email', 'login-email-error');
  clearError('login-password', 'login-password-error');
  document.getElementById('login-global-error').textContent = '';

  if (!email) {
    showError('login-email', 'login-email-error', 'El correo es obligatorio.');
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    showError('login-email', 'login-email-error', 'Ingresa un correo válido.');
    valid = false;
  }

  if (!password) {
    showError('login-password', 'login-password-error', 'La contraseña es obligatoria.');
    valid = false;
  }

  return valid;
}

// ─── Lógica del formulario ───────────────────────────────────────────────────

function setLoading(loading) {
  const btn = document.getElementById('login-submit');
  const text = document.getElementById('login-btn-text');
  const spinner = document.getElementById('login-spinner');

  if (btn) btn.disabled = loading;
  if (text) text.textContent = loading ? 'Ingresando...' : 'Iniciar sesión';
  if (spinner) spinner.hidden = !loading;
}

async function handleLoginSubmit(e) {
  e.preventDefault();

  const email = document.getElementById('login-email')?.value.trim();
  const password = document.getElementById('login-password')?.value;

  if (!validateLoginForm(email, password)) return;

  setLoading(true);

  try {
    const { data, error } = await signIn(email, password);

    if (error) {
      const globalError = document.getElementById('login-global-error');
      // Traducir errores comunes de Supabase
      const msg =
        error.message?.includes('Invalid login')
          ? 'Correo o contraseña incorrectos.'
          : error.message?.includes('Email not confirmed')
            ? 'Debes confirmar tu correo antes de ingresar.'
            : 'Ocurrió un error. Intenta nuevamente.';
      if (globalError) globalError.textContent = msg;
      return;
    }

    // Obtener rol desde el backend
    const profile = await getMe();
    const role = profile?.role;

    if (role === 'admin') {
      window.location.href = '/admin';
    } else {
      window.location.href = '/dashboard';
    }
  } catch (err) {
    const globalError = document.getElementById('login-global-error');
    if (globalError) globalError.textContent = 'Error de conexión. Intenta más tarde.';
    console.error('Login error:', err);
  } finally {
    setLoading(false);
  }
}

// ─── Inicialización ───────────────────────────────────────────────────────────

export function initLoginPage() {
  // Asegurar tema oscuro en esta página
  document.body.className = 'theme-dark';

  injectAuthStyles();

  const form = document.getElementById('login-form');
  if (form) form.addEventListener('submit', handleLoginSubmit);

  // Limpiar error inline al escribir
  ['login-email', 'login-password'].forEach((id) => {
    const input = document.getElementById(id);
    if (input) {
      input.addEventListener('input', () => {
        input.classList.remove('input--error');
        const errorEl = document.getElementById(`${id}-error`);
        if (errorEl) errorEl.textContent = '';
        document.getElementById('login-global-error').textContent = '';
      });
    }
  });

  // Toggle mostrar/ocultar contraseña
  document.querySelectorAll('.input-toggle-pwd').forEach((btn) => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.target);
      if (!target) return;
      const isPassword = target.type === 'password';
      target.type = isPassword ? 'text' : 'password';
      const icon = btn.querySelector('.material-symbols-outlined');
      if (icon) icon.textContent = isPassword ? 'visibility_off' : 'visibility';
    });
  });
}