import { signUp } from '../auth.js';

// ─── HTML ────────────────────────────────────────────────────────────────────

export function registerPage() {
    return /* html */ `
    <div class="auth-page">
        <div class="auth-card card-dark">

            <div class="auth-logo">
                <span class="material-symbols-outlined auth-logo__icon">fitness_center</span>
                <span class="auth-logo__text">FUNCTIONAL FITNESS</span>
            </div>

            <h1 class="auth-title">Crear cuenta</h1>
            <p class="auth-subtitle">Llena los campos para registrarte</p>

            <form id="register-form" class="auth-form" novalidate>

                <div class="auth-row">
                    <div class="field-group">
                    <label class="field-label" for="reg-first-name">Nombre</label>
                    <input
                        id="reg-first-name"
                        type="text"
                        class="input-field"
                        placeholder="Tu nombre"
                        autocomplete="given-name"
                        required
                    />
                    <span class="field-error" id="reg-first-name-error"></span>
                    </div>

                    <div class="field-group">
                    <label class="field-label" for="reg-last-name">Apellido</label>
                    <input
                        id="reg-last-name"
                        type="text"
                        class="input-field"
                        placeholder="Tu apellido"
                        autocomplete="family-name"
                        required
                    />
                    <span class="field-error" id="reg-last-name-error"></span>
                    </div>
                </div>

                <div class="field-group">
                    <label class="field-label" for="reg-email">Correo electrónico</label>
                    <input
                        id="reg-email"
                        type="email"
                        class="input-field"
                        placeholder="hola@ejemplo.com"
                        autocomplete="email"
                        required
                    />
                    <span class="field-error" id="reg-email-error"></span>
                </div>

                <div class="field-group">
                    <label class="field-label" for="reg-phone">
                        WhatsApp
                        <span class="field-hint">donde recibirás notificaciones</span>
                    </label>
                    <input
                        id="reg-phone"
                        type="tel"
                        class="input-field"
                        placeholder="+57 300 123 4567"
                        autocomplete="tel"
                        required
                    />
                    <span class="field-error" id="reg-phone-error"></span>
                </div>

                <div class="field-group">
                    <label class="field-label" for="reg-password">Contraseña</label>
                    <div class="input-wrapper">
                        <input
                            id="reg-password"
                            type="password"
                            class="input-field"
                            placeholder="Mínimo 8 caracteres"
                            autocomplete="new-password"
                            required
                        />
                        <button
                            type="button"
                            class="input-toggle-pwd"
                            aria-label="Mostrar contraseña"
                            data-target="reg-password"
                        >
                            <span class="material-symbols-outlined">visibility</span>
                        </button>
                    </div>

                    <div class="password-strength" id="password-strength" hidden>
                        <div class="strength-bar">
                            <div class="strength-fill" id="strength-fill"></div>
                        </div>
                        <span class="strength-label" id="strength-label"></span>
                    </div>

                    <span class="field-error" id="reg-password-error"></span>

                </div>

                <span class="field-error field-error--global" id="reg-global-error"></span>

                <button type="submit" id="reg-submit" class="btn-primary auth-btn">
                    <span id="reg-btn-text">Crear cuenta</span>
                    <span id="reg-spinner" class="spinner" hidden></span>
                </button>

            </form>

            <p class="auth-footer">
            ¿Ya tienes cuenta?
            <a href="/login" data-link class="auth-link">Inicia sesión</a>
            </p>

        </div>
    </div>
  `;
}

// ─── Estilos adicionales de registro ─────────────────────────────────────────

const REG_STYLES_ID = 'register-styles';

function injectRegisterStyles() {
    if (document.getElementById(REG_STYLES_ID)) return;
    const style = document.createElement('style');
    style.id = REG_STYLES_ID;
    style.textContent = /* css */ `
    .auth-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    @media (max-width: 380px) {
      .auth-row { grid-template-columns: 1fr; }
    }

    .field-hint {
      font-size: 0.75rem;
      color: var(--dark-text-muted);
      font-weight: 400;
      margin-left: 6px;
    }

    .password-strength {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-top: 4px;
    }

    .strength-bar {
      flex: 1;
      height: 3px;
      background: rgba(255,255,255,0.08);
      border-radius: 99px;
      overflow: hidden;
    }

    .strength-fill {
      height: 100%;
      border-radius: 99px;
      transition: width 0.3s ease, background-color 0.3s ease;
      width: 0%;
    }

    .strength-label {
      font-size: 0.75rem;
      min-width: 60px;
      text-align: right;
      color: var(--dark-text-muted);
    }
  `;
    document.head.appendChild(style);
}

// ─── Validación ───────────────────────────────────────────────────────────────

const PHONE_REGEX = /^\+57\d{10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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

function validateRegisterForm({ firstName, lastName, email, phone, password }) {
    let valid = true;

    const fields = [
        ['reg-first-name', 'reg-first-name-error'],
        ['reg-last-name', 'reg-last-name-error'],
        ['reg-email', 'reg-email-error'],
        ['reg-phone', 'reg-phone-error'],
        ['reg-password', 'reg-password-error'],
    ];
    fields.forEach(([id, errId]) => clearError(id, errId));
    document.getElementById('reg-global-error').textContent = '';

    if (!firstName || firstName.trim().length < 2) {
        showError('reg-first-name', 'reg-first-name-error', 'Ingresa tu nombre.');
        valid = false;
    }

    if (!lastName || lastName.trim().length < 2) {
        showError('reg-last-name', 'reg-last-name-error', 'Ingresa tu apellido.');
        valid = false;
    }

    if (!email) {
        showError('reg-email', 'reg-email-error', 'El correo es obligatorio.');
        valid = false;
    } else if (!EMAIL_REGEX.test(email)) {
        showError('reg-email', 'reg-email-error', 'Ingresa un correo válido.');
        valid = false;
    }

    // Normalizar teléfono: quitar espacios y guiones antes de validar
    const normalizedPhone = phone.replace(/[\s\-()]/g, '');
    if (!phone) {
        showError('reg-phone', 'reg-phone-error', 'El teléfono es obligatorio.');
        valid = false;
    } else if (!PHONE_REGEX.test(normalizedPhone)) {
        showError('reg-phone', 'reg-phone-error', 'Formato requerido: +57XXXXXXXXXX (10 dígitos).');
        valid = false;
    }

    if (!password) {
        showError('reg-password', 'reg-password-error', 'La contraseña es obligatoria.');
        valid = false;
    } else if (password.length < 8) {
        showError('reg-password', 'reg-password-error', 'Mínimo 8 caracteres.');
        valid = false;
    }

    return { valid, normalizedPhone };
}

// ─── Indicador de fortaleza de contraseña ────────────────────────────────────

function getPasswordStrength(password) {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return { score: 20, label: 'Débil', color: 'var(--neon-red)' };
    if (score <= 2) return { score: 40, label: 'Regular', color: 'var(--neon-yellow)' };
    if (score <= 3) return { score: 60, label: 'Buena', color: '#60d394' };
    if (score <= 4) return { score: 80, label: 'Fuerte', color: 'var(--neon-green)' };
    return { score: 100, label: 'Excelente', color: 'var(--neon-green)' };
}

function updateStrengthIndicator(password) {
    const container = document.getElementById('password-strength');
    const fill = document.getElementById('strength-fill');
    const label = document.getElementById('strength-label');
    if (!container || !fill || !label) return;

    if (!password) {
        container.hidden = true;
        return;
    }

    container.hidden = false;
    const { score, label: text, color } = getPasswordStrength(password);
    fill.style.width = `${score}%`;
    fill.style.backgroundColor = color;
    label.textContent = text;
    label.style.color = color;
}

// ─── Estado de carga ─────────────────────────────────────────────────────────

function setLoading(loading) {
    const btn = document.getElementById('reg-submit');
    const text = document.getElementById('reg-btn-text');
    const spinner = document.getElementById('reg-spinner');

    if (btn) btn.disabled = loading;
    if (text) text.textContent = loading ? 'Creando cuenta...' : 'Crear cuenta';
    if (spinner) spinner.hidden = !loading;
}

// ─── Submit ───────────────────────────────────────────────────────────────────

async function handleRegisterSubmit(e) {
    e.preventDefault();

    const firstName = document.getElementById('reg-first-name')?.value.trim();
    const lastName = document.getElementById('reg-last-name')?.value.trim();
    const email = document.getElementById('reg-email')?.value.trim();
    const phone = document.getElementById('reg-phone')?.value.trim();
    const password = document.getElementById('reg-password')?.value;

    const { valid, normalizedPhone } = validateRegisterForm({
        firstName,
        lastName,
        email,
        phone: phone || '',
        password,
    });

    if (!valid) return;

    setLoading(true);

    try {
        const { data, error } = await signUp(email, password, {
            first_name: firstName,
            last_name: lastName,
            phone: normalizedPhone,
        });

        if (error) {
            const globalError = document.getElementById('reg-global-error');
            const msg =
                error.message?.includes('already registered')
                    ? 'Este correo ya tiene una cuenta. Intenta iniciar sesión.'
                    : error.message?.includes('Password should be')
                        ? 'La contraseña no cumple los requisitos de seguridad.'
                        : 'Ocurrió un error al crear la cuenta. Intenta nuevamente.';
            if (globalError) globalError.textContent = msg;
            return;
        }

        // Supabase puede requerir confirmación de email según configuración.
        // Si hay sesión activa → redirigir. Si no → informar al usuario.
        if (data?.session) {
            window.location.href = '/dashboard';
        } else {
            // Email confirmation habilitado en Supabase
            const globalError = document.getElementById('reg-global-error');
            if (globalError) {
                globalError.style.color = 'var(--neon-green)';
                globalError.textContent =
                    '¡Cuenta creada! Revisa tu correo para confirmar tu cuenta.';
            }
        }
    } catch (err) {
        const globalError = document.getElementById('reg-global-error');
        if (globalError) globalError.textContent = 'Error de conexión. Intenta más tarde.';
        console.error('Register error:', err);
    } finally {
        setLoading(false);
    }
}

// ─── Inicialización ───────────────────────────────────────────────────────────

export function initRegisterPage() {
    document.body.className = 'theme-dark';

    injectRegisterStyles();

    const form = document.getElementById('register-form');
    if (form) form.addEventListener('submit', handleRegisterSubmit);

    // Limpiar errores inline al escribir
    const fieldMap = {
        'reg-first-name': 'reg-first-name-error',
        'reg-last-name': 'reg-last-name-error',
        'reg-email': 'reg-email-error',
        'reg-phone': 'reg-phone-error',
        'reg-password': 'reg-password-error',
    };

    Object.entries(fieldMap).forEach(([id, errorId]) => {
        const input = document.getElementById(id);
        if (!input) return;
        input.addEventListener('input', () => {
            clearError(id, errorId);
            document.getElementById('reg-global-error').textContent = '';
        });
    });

    // Indicador de fortaleza de contraseña
    const passwordInput = document.getElementById('reg-password');
    if (passwordInput) {
        passwordInput.addEventListener('input', () => {
            updateStrengthIndicator(passwordInput.value);
        });
    }

    // Autoformatear teléfono: agregar +57 si el usuario no lo pone
    const phoneInput = document.getElementById('reg-phone');
    if (phoneInput) {
        phoneInput.addEventListener('blur', () => {
            const val = phoneInput.value.trim();
            if (val && !val.startsWith('+')) {
                phoneInput.value = '+57' + val.replace(/\D/g, '');
            }
        });
    }

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