/* Omar Results: shared page behavior. No dependencies. */
(function () {
  'use strict';

  // Footer year
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });

  // Mobile menu
  var toggle = document.querySelector('.nav-toggle');
  var menu = document.getElementById('nav-menu');

  if (toggle && menu) {
    var setOpen = function (open) {
      toggle.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
    };

    toggle.addEventListener('click', function () {
      setOpen(toggle.getAttribute('aria-expanded') !== 'true');
    });

    // Close after picking a link so the target section is visible
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) setOpen(false);
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        setOpen(false);
        toggle.focus();
      }
    });
  }

  // Contact form: AJAX submit to Formspree, then go to the thank-you page
  var form = document.getElementById('contact-form');

  if (form) {
    var errorBox = document.getElementById('form-error');
    var submitBtn = form.querySelector('button[type="submit"]');
    var submitLabel = submitBtn.textContent;

    var showError = function (message) {
      errorBox.textContent = message;
      errorBox.hidden = false;
    };

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      errorBox.hidden = true;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { Accept: 'application/json' }
      })
        .then(function (res) {
          if (res.ok) {
            window.location.href = 'thank-you/';
            return;
          }
          return res.json().catch(function () { return {}; }).then(function (data) {
            var detail = data.errors && data.errors.length
              ? data.errors.map(function (err) { return err.message; }).join(' ')
              : '';
            throw { detail: detail };
          });
        })
        .catch(function (err) {
          // Only Formspree's own messages are shown; network errors get the generic line
          var detail = err && err.detail ? err.detail.replace(/[.!?]?$/, '. ') : '';
          showError('Hmm, that didn\'t send. ' + detail + 'Please try again in a moment.');
          submitBtn.disabled = false;
          submitBtn.textContent = submitLabel;
        });
    });
  }
})();
