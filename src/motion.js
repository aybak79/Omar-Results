// Micro-interactions that need JavaScript. Styles live in styles/motion.css.

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

// Scroll progress bar under the header, and the wordmark square turning as you scroll
const progress = document.querySelector(".scroll-progress");
const mark = document.querySelector(".wordmark__mark");
if (progress || mark) {
  let queued = false;
  const update = () => {
    queued = false;
    const max = document.documentElement.scrollHeight - innerHeight;
    const ratio = max > 0 ? Math.min(scrollY / max, 1) : 0;
    if (progress) progress.style.transform = `scaleX(${ratio})`;
    if (mark && !reduceMotion) mark.style.rotate = `${scrollY * 0.25}deg`;
  };
  const queue = () => {
    if (!queued) {
      queued = true;
      requestAnimationFrame(update);
    }
  };
  addEventListener("scroll", queue, { passive: true });
  addEventListener("resize", queue);
  update();
}

// Magnetic buttons: big CTAs lean toward the cursor
if (finePointer && !reduceMotion) {
  document.querySelectorAll(".btn--lg, .btn--xl, [data-magnetic]").forEach((el) => {
    el.addEventListener("pointermove", (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      el.style.translate = `${x * 14}px ${y * 10}px`;
    });
    el.addEventListener("pointerleave", () => {
      el.style.translate = "";
    });
  });
}

// Count-up numbers ([data-count-up]) when they scroll into view
const counters = document.querySelectorAll("[data-count-up]");
if (counters.length && !reduceMotion && "IntersectionObserver" in window) {
  const countUp = (el) => {
    const target = parseInt(el.textContent, 10);
    if (!target) return;
    const start = performance.now();
    const duration = 900;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      el.textContent = Math.round(target * (1 - Math.pow(1 - t, 3)));
      if (t < 1) requestAnimationFrame(tick);
    };
    el.textContent = "0";
    requestAnimationFrame(tick);
  };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        observer.unobserve(entry.target);
        countUp(entry.target);
      }
    });
  }, { threshold: 0.6 });
  counters.forEach((el) => observer.observe(el));
}

// The "before" site's retro visitor counter keeps ticking, slowly
const visitors = document.querySelector(".dull__counter");
if (visitors && !reduceMotion) {
  let count = parseInt(visitors.textContent.replace(/\D/g, ""), 10) || 0;
  const bump = () => {
    count += 1;
    visitors.textContent = `Visitors: ${String(count).padStart(6, "0")}`;
    setTimeout(bump, 4000 + Math.random() * 5000);
  };
  setTimeout(bump, 5000);
}

// Confetti burst from an element (used when the email is copied)
export function burst(el) {
  if (reduceMotion) return;
  const r = el.getBoundingClientRect();
  const colors = ["var(--rust)", "var(--mist)", "var(--sand)", "var(--slate)"];
  const pieces = 12;
  for (let i = 0; i < pieces; i++) {
    const piece = document.createElement("span");
    piece.className = "burst";
    piece.style.left = `${r.left + r.width / 2}px`;
    piece.style.top = `${r.top + r.height / 2}px`;
    piece.style.background = colors[i % colors.length];
    document.body.append(piece);

    const angle = (Math.PI * 2 * i) / pieces + Math.random() * 0.4;
    const distance = 40 + Math.random() * 35;
    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;
    piece.animate(
      [
        { transform: "translate(-50%, -50%) scale(1)", opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(${Math.random() * 270}deg) scale(.4)`, opacity: 0 },
      ],
      { duration: 650 + Math.random() * 250, easing: "cubic-bezier(.2, .7, .3, 1)" }
    ).onfinish = () => piece.remove();
  }
}
