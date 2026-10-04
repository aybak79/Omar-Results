(function () {
  "use strict";

  // Header shrinks slightly once the page scrolls
  var header = document.querySelector(".site-header");
  if (header) {
    var onScroll = function () {
      header.classList.toggle("is-scrolled", window.scrollY > 12);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
  }

  // Reveal blocks as they scroll into view
  var revealables = document.querySelectorAll("[data-reveal]");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-in");
          observer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.12 });
    revealables.forEach(function (el) { observer.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add("is-in"); });
  }

  // FAQ accordion: one open at a time. Answers stay visible if JS never runs.
  var accordion = document.querySelector("[data-accordion]");
  if (accordion) {
    var buttons = Array.prototype.slice.call(accordion.querySelectorAll(".faq__q"));

    var setOpen = function (btn, open) {
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.closest(".faq__item").classList.toggle("is-open", open);
    };

    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        var willOpen = btn.getAttribute("aria-expanded") !== "true";
        buttons.forEach(function (other) {
          if (other !== btn) setOpen(other, false);
        });
        setOpen(btn, willOpen);
      });
    });
  }

  // Copy email to clipboard
  var copyBtn = document.querySelector("[data-copy]");
  var status = document.querySelector("[data-copy-status]");
  if (copyBtn) {
    var resetTimer;
    var fallbackCopy = function (text) {
      var field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "absolute";
      field.style.left = "-9999px";
      document.body.appendChild(field);
      field.select();
      var ok = false;
      try { ok = document.execCommand("copy"); } catch (e) { ok = false; }
      document.body.removeChild(field);
      return ok ? Promise.resolve() : Promise.reject();
    };

    copyBtn.addEventListener("click", function () {
      var text = copyBtn.getAttribute("data-copy");
      var attempt = navigator.clipboard && window.isSecureContext
        ? navigator.clipboard.writeText(text).catch(function () { return fallbackCopy(text); })
        : fallbackCopy(text);

      attempt.then(function () {
        copyBtn.textContent = "Copied!";
        copyBtn.classList.add("is-copied");
        if (status) status.textContent = "Email address copied to clipboard";
        clearTimeout(resetTimer);
        resetTimer = setTimeout(function () {
          copyBtn.textContent = "Copy";
          copyBtn.classList.remove("is-copied");
          if (status) status.textContent = "";
        }, 2000);
      }).catch(function () {
        if (status) status.textContent = "Copy failed. Select the address to copy it.";
      });
    });
  }

  // Footer year
  var year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
