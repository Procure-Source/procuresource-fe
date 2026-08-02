/* =========================================================================
   ProcureSource — landing page behaviour.
   No dependencies, no build step. Two things happen here: the request-access
   form (validate → submit → success state) and the FAQ accordion.
   ========================================================================= */

/* TODO: set this to the request-access endpoint once one exists.
   While it is empty, submit validates, logs the payload to the console, and
   shows the success state without sending anything anywhere. */
const FORM_ENDPOINT = '';

/* Work-email check. Delete this list (or empty it) to accept any address. */
const PERSONAL_EMAIL_DOMAINS = [
  'gmail.com', 'googlemail.com', 'yahoo.com', 'hotmail.com', 'outlook.com',
  'live.com', 'icloud.com', 'me.com', 'aol.com', 'proton.me', 'protonmail.com'
];

/* -------------------------------------------------------------------------
   Header hairline on scroll
   ------------------------------------------------------------------------- */
(function headerBorder() {
  const header = document.getElementById('site-header');
  const sentinel = document.getElementById('scroll-sentinel');
  if (!header || !sentinel) return;

  new IntersectionObserver(function (entries) {
    header.classList.toggle('is-scrolled', !entries[0].isIntersecting);
  }).observe(sentinel);
})();

/* -------------------------------------------------------------------------
   FAQ accordion
   Each trigger is a real <button>, so Enter/Space come free. Panels use the
   hidden attribute — no height animation, by design.
   ------------------------------------------------------------------------- */
(function faq() {
  const triggers = document.querySelectorAll('.faq__trigger');

  triggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      const panel = document.getElementById(trigger.getAttribute('aria-controls'));
      const isOpen = trigger.getAttribute('aria-expanded') === 'true';
      trigger.setAttribute('aria-expanded', String(!isOpen));
      if (panel) panel.hidden = isOpen;
    });
  });
})();

/* -------------------------------------------------------------------------
   Request-access form
   ------------------------------------------------------------------------- */
(function accessForm() {
  const form = document.getElementById('access-form');
  const success = document.getElementById('form-success');
  const formError = document.getElementById('form-error');
  if (!form || !success) return;

  const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const PHONE_RE = /^\+?[\d\s()-]{7,20}$/;

  /* One validator per field. Return an error string, or '' when valid.
     Error text says what to fix, not that something is wrong. */
  const validators = {
    fullName: function (value) {
      if (!value) return 'Enter your full name.';
      if (value.length < 2) return 'Enter your full name.';
      return '';
    },
    email: function (value) {
      if (!value) return 'Enter your work email address.';
      if (!EMAIL_RE.test(value)) return 'Enter a valid email address, like name@company.ae';
      const domain = value.split('@')[1].toLowerCase();
      if (PERSONAL_EMAIL_DOMAINS.indexOf(domain) !== -1) {
        return 'Use your work email address rather than a personal one.';
      }
      return '';
    },
    company: function (value) {
      if (!value) return 'Enter your company name.';
      return '';
    },
    role: function (value) {
      if (!value) return 'Enter your role, for example Procurement Manager.';
      return '';
    },
    whatsapp: function (value) {
      if (!value) return ''; // optional
      if (!PHONE_RE.test(value)) return 'Enter a valid number including country code, like +971 50 123 4567.';
      return '';
    },
    packages: function (value) {
      if (!value) return ''; // optional
      if (value.length > 140) return 'Keep this under 140 characters.';
      return '';
    }
  };

  const fieldNames = Object.keys(validators);

  function inputFor(name) { return form.elements[name]; }
  function errorFor(name) { return document.getElementById(name + '-error'); }

  function showError(name, message) {
    const input = inputFor(name);
    const slot = errorFor(name);
    if (!input || !slot) return;
    if (message) {
      slot.textContent = message;
      slot.hidden = false;
      input.setAttribute('aria-invalid', 'true');
    } else {
      slot.textContent = '';
      slot.hidden = true;
      input.removeAttribute('aria-invalid');
    }
  }

  /* Clear a field's error as soon as the person starts fixing it. */
  fieldNames.forEach(function (name) {
    const input = inputFor(name);
    if (!input) return;
    input.addEventListener('input', function () {
      if (input.getAttribute('aria-invalid') === 'true') showError(name, '');
    });
    input.addEventListener('blur', function () {
      if (input.value.trim()) showError(name, validators[name](input.value.trim()));
    });
  });

  function collect() {
    const payload = {};
    fieldNames.forEach(function (name) {
      const input = inputFor(name);
      payload[name] = input ? input.value.trim() : '';
    });
    payload.submittedAt = new Date().toISOString();
    return payload;
  }

  async function send(payload) {
    if (!FORM_ENDPOINT) {
      console.log('[ProcureSource] request-access payload', payload);
      return;
    }
    const response = await fetch(FORM_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Request failed with status ' + response.status);
  }

  form.addEventListener('submit', async function (event) {
    event.preventDefault();
    formError.hidden = true;

    let firstInvalid = null;
    fieldNames.forEach(function (name) {
      const input = inputFor(name);
      if (!input) return;
      const message = validators[name](input.value.trim());
      showError(name, message);
      if (message && !firstInvalid) firstInvalid = input;
    });

    if (firstInvalid) {
      firstInvalid.focus();
      return;
    }

    const submitButton = form.querySelector('button[type="submit"]');
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = 'Sending…';
    }

    try {
      await send(collect());
      form.hidden = true;
      success.hidden = false;
      success.focus();
    } catch (error) {
      console.error('[ProcureSource] submit failed', error);
      formError.textContent = 'That did not send. Please try again, or email hello@procuresource.ae.';
      formError.hidden = false;
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = 'Request access';
      }
    }
  });
})();
