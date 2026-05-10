/* ============================================================
   CONTACT.JS — Form handling
   ============================================================ */

(function () {
  'use strict';

  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');

  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Basic validation
    let valid = true;
    const required = form.querySelectorAll('[required]');

    required.forEach(field => {
      field.classList.remove('error');
      if (!field.value.trim() || (field.type === 'checkbox' && !field.checked)) {
        field.classList.add('error');
        valid = false;
      }
    });

    // Email format check
    const emailField = form.querySelector('#email');
    if (emailField && emailField.value) {
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRe.test(emailField.value.trim())) {
        emailField.classList.add('error');
        valid = false;
      }
    }

    if (!valid) {
      // Scroll to first error
      const firstError = form.querySelector('.error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        firstError.focus();
      }
      return;
    }

    // Show success state
    // (In production, replace this with a real form submission — e.g. Formspree, Netlify Forms, etc.)
    const submitArea = form.querySelector('.form-submit');
    if (submitArea) submitArea.style.display = 'none';

    // Hide all form groups
    form.querySelectorAll('.form-group, .form-consent').forEach(el => {
      el.style.opacity = '0';
      el.style.pointerEvents = 'none';
    });

    if (success) {
      success.style.display = 'block';
      setTimeout(() => {
        success.style.opacity = '0';
        success.style.transition = 'opacity 0.6s';
        requestAnimationFrame(() => {
          success.style.opacity = '1';
        });
      }, 50);
      success.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  });

  // Remove error class on input
  form.querySelectorAll('.form-input, .form-select, .form-textarea').forEach(field => {
    field.addEventListener('input', () => field.classList.remove('error'));
  });

  form.querySelectorAll('input[type="checkbox"]').forEach(cb => {
    cb.addEventListener('change', () => cb.classList.remove('error'));
  });

})();
