(function () {
  "use strict";

  /* ── Helpers ─────────────────────────────────────────────── */
  var $ = function(sel, scope) { return (scope || document).querySelector(sel); };
  var $$ = function(sel, scope) { return Array.from((scope || document).querySelectorAll(sel)); };
  var reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fineHover = matchMedia("(hover: hover) and (pointer: fine)").matches;

  function escHTML(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function(c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function safe(fn, name) {
    try { fn(); } catch (e) { console.warn("[" + name + "]", e); }
  }

  /* ── EmailJS — rellena tus credenciales aquí ─────────────── */
  /* 1. Ve a https://www.emailjs.com y crea una cuenta gratuita */
  /* 2. Conecta tu Gmail como servicio                          */
  /* 3. Crea una plantilla de email                             */
  /* 4. Copia los tres IDs y pégalos abajo                      */
  var EJS_SERVICE_ID  = "service_nqaqakf";   /* ← reemplaza */
  var EJS_TEMPLATE_ID = "template_4a01wco";  /* ← reemplaza */
  var EJS_PUBLIC_KEY  = "PfKXJunC3aMUxj_K5";   /* ← reemplaza */

  /* ── 1. Navbar sticky ────────────────────────────────────── */
  function initNav() {
    var nav = $(".nav");
    if (!nav) return;
    var update = function() {
      if (window.scrollY > 60) nav.classList.add("is-scrolled");
      else nav.classList.remove("is-scrolled");
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
  }

  /* ── 2. Menú móvil hamburguesa ───────────────────────────── */
  function initMobileMenu() {
    var hamburger = $(".hamburger");
    var mobileMenu = $("#nav-mobile");
    var closeBtn   = $(".mobile-close");
    var mobileLinks = $$(".mobile-link");
    if (!hamburger || !mobileMenu) return;

    var isOpen = false;

    function openMenu() {
      isOpen = true;
      mobileMenu.setAttribute("aria-hidden", "false");
      hamburger.setAttribute("aria-expanded", "true");
      hamburger.closest(".nav").classList.add("is-open");
      document.body.style.overflow = "hidden";
    }
    function closeMenu() {
      isOpen = false;
      mobileMenu.setAttribute("aria-hidden", "true");
      hamburger.setAttribute("aria-expanded", "false");
      hamburger.closest(".nav").classList.remove("is-open");
      document.body.style.overflow = "";
    }

    hamburger.addEventListener("click", function() { isOpen ? closeMenu() : openMenu(); });
    if (closeBtn) closeBtn.addEventListener("click", closeMenu);
    mobileLinks.forEach(function(link) { link.addEventListener("click", closeMenu); });
    document.addEventListener("keydown", function(e) { if (e.key === "Escape") closeMenu(); });
  }

  /* ── 3. Scroll suave para anclas (#) ────────────────────── */
  function initSmoothAnchors() {
    document.addEventListener("click", function(e) {
      var a = e.target.closest('a[href^="#"]');
      if (!a) return;
      var id = a.getAttribute("href");
      if (!id || id === "#") return;
      var target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      var top = target.getBoundingClientRect().top + window.scrollY - 88;
      window.scrollTo({ top: top, behavior: "smooth" });
    });
  }

  /* ── 4. Reveal al scroll (IntersectionObserver) ──────────── */
  function initReveals() {
    var els = $$("[data-reveal]");
    if (!els.length) return;

    var io = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-revealed");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.01, rootMargin: "0px 0px -2% 0px" });

    els.forEach(function(el) { io.observe(el); });

    /* Red de seguridad: revela lo que siga oculto tras 6s */
    setTimeout(function() {
      $$("[data-reveal]:not(.is-revealed)").forEach(function(el) {
        if (el.getBoundingClientRect().top < window.innerHeight) {
          el.classList.add("is-revealed");
        }
      });
    }, 6000);
  }

  /* ── 5. Barra de progreso de scroll ─────────────────────── */
  function initScrollProgress() {
    var bar = $("[data-scroll-progress]");
    if (!bar) return;
    var raf = null;
    var update = function() {
      var max = document.documentElement.scrollHeight - window.innerHeight;
      bar.style.transform = "scaleX(" + (max > 0 ? window.scrollY / max : 0) + ")";
      raf = null;
    };
    window.addEventListener("scroll", function() {
      if (!raf) raf = requestAnimationFrame(update);
    }, { passive: true });
    update();
  }

  /* ── 6. Cursor personalizado (solo desktop) ─────────────── */
  function initCursor() {
    var root = $("[data-cursor-root]");
    if (!root || !fineHover) return;

    document.documentElement.classList.add("has-cursor");
    var dot = $(".cursor-dot", root);
    var firstMove = false;

    window.addEventListener("mousemove", function(e) {
      if (dot) dot.style.transform = "translate3d(" + e.clientX + "px," + e.clientY + "px,0)";
      if (!firstMove) { firstMove = true; root.classList.add("is-ready"); }
    }, { passive: true });
  }

  /* ── 7. Count-up animado ─────────────────────────────────── */
  function initCountUp() {
    $$("[data-count-to]").forEach(function(el) {
      var target   = parseFloat(el.dataset.countTo);
      var decimals = (el.dataset.countTo.split(".")[1] || "").length;

      var io = new IntersectionObserver(function(entries) {
        entries.forEach(function(entry) {
          if (!entry.isIntersecting) return;
          io.unobserve(entry.target);
          if (window.gsap) {
            var obj = { v: 0 };
            gsap.to(obj, {
              v: target, duration: 1.4, ease: "power2.out",
              onUpdate: function() { el.textContent = obj.v.toFixed(decimals); }
            });
          } else {
            el.textContent = target.toFixed(decimals);
          }
        });
      }, { threshold: 0.01, rootMargin: "0px 0px -10% 0px" });

      io.observe(el);
    });
  }

  /* ── 8. Tilt 3D en tarjetas (desktop) ───────────────────── */
  function initTilt() {
    if (!fineHover) return;

    $$(".card").forEach(function(card) {
      var MAX = 5;
      var tx = 0, ty = 0, cx = 0, cy = 0, raf = null;
      card.classList.add("has-tilt");

      card.addEventListener("mousemove", function(e) {
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left) / r.width  - 0.5;
        var py = (e.clientY - r.top)  / r.height - 0.5;
        tx = -py * MAX; ty = px * MAX;
        if (!raf) raf = requestAnimationFrame(loop);
      });

      card.addEventListener("mouseleave", function() {
        tx = 0; ty = 0;
        if (!raf) raf = requestAnimationFrame(loop);
      });

      function loop() {
        cx += (tx - cx) * 0.15;
        cy += (ty - cy) * 0.15;
        card.style.setProperty("--rx", cx.toFixed(2) + "deg");
        card.style.setProperty("--ry", cy.toFixed(2) + "deg");
        raf = (Math.abs(tx - cx) > 0.05 || Math.abs(ty - cy) > 0.05)
          ? requestAnimationFrame(loop) : null;
      }
    });
  }

  /* ── 9. Split text (requiere GSAP + ScrollTrigger) ────────── */
  function splitWords(el) {
    el.setAttribute("aria-label", el.textContent.trim().replace(/\s+/g, " "));

    var wrapWord = function(w) {
      return /^\s+$/.test(w)
        ? w
        : '<span class="split-word" aria-hidden="true">' + escHTML(w) + "</span>";
    };

    var html = Array.from(el.childNodes).map(function(node) {
      if (node.nodeType === 3) {
        return node.textContent.split(/(\s+)/).map(wrapWord).join("");
      }
      if (node.nodeName === "BR") return "<br>";
      if (node.nodeType === 1) {
        var tag = node.tagName.toLowerCase();
        return "<" + tag + ">" + node.textContent.split(/(\s+)/).map(wrapWord).join("") + "</" + tag + ">";
      }
      return "";
    }).join("");

    el.innerHTML = html;
    return el.querySelectorAll(".split-word");
  }

  function initSplitText() {
    if (!window.gsap || !window.ScrollTrigger) return;

    $$("[data-split='words']").forEach(function(el) {
      var words   = splitWords(el);
      var isHero  = !!el.closest(".hero");

      gsap.set(words, { y: 30, opacity: 0 });

      if (isHero) {
        /* Hero: animar al cargar la página, sin ScrollTrigger */
        gsap.to(words, {
          y: 0, opacity: 1,
          duration: 1.0,
          stagger: 0.055,
          ease: "expo.out",
          delay: 0.3,
        });
      } else {
        /* Resto de secciones: animar al entrar en viewport */
        gsap.to(words, {
          y: 0, opacity: 1,
          duration: 0.9,
          stagger: 0.045,
          ease: "expo.out",
          scrollTrigger: {
            trigger: el,
            start: "top 87%",
            once: true,
          },
        });
      }
    });
  }

  /* ── 10. Formulario de contacto (EmailJS) ───────────────── */
  function initContactForm() {
    /* Inicializar EmailJS si las credenciales están configuradas */
    if (window.emailjs && EJS_PUBLIC_KEY !== "YOUR_PUBLIC_KEY") {
      window.emailjs.init(EJS_PUBLIC_KEY);
    }

    var form       = $("[data-contact-form]");
    var successDiv = $("[data-contact-success]");
    if (!form || !successDiv) return;

    var submitBtn  = form.querySelector("[type='submit']");
    var successMsg = $("[data-contact-success-msg]");

    form.addEventListener("submit", function(e) {
      e.preventDefault();
      if (form.classList.contains("is-sending")) return;
      if (!form.reportValidity()) return;

      form.classList.add("is-sending");
      if (submitBtn) submitBtn.disabled = true;

      var send;

      if (window.emailjs && EJS_SERVICE_ID !== "YOUR_SERVICE_ID") {
        /* Envío real con EmailJS */
        send = window.emailjs.sendForm(EJS_SERVICE_ID, EJS_TEMPLATE_ID, form);
      } else {
        /* Modo demo: simula 1.2s de envío */
        send = new Promise(function(resolve) {
          setTimeout(resolve, 1200 + Math.random() * 400);
        });
      }

      send.then(function() {
        var nameEl = form.elements["name"];
        var firstName = nameEl ? nameEl.value.trim().split(/\s+/)[0] : "";
        if (successMsg) {
          successMsg.textContent = firstName
            ? "Hola " + firstName + ", hemos recibido tu mensaje."
            : "Hemos recibido tu mensaje.";
        }
        form.classList.add("is-sent");
        successDiv.setAttribute("aria-hidden", "false");
        successDiv.classList.add("is-visible");

      }).catch(function(err) {
        console.error("[EmailJS]", err);
        form.classList.remove("is-sending");
        if (submitBtn) submitBtn.disabled = false;
        /* Mensaje de error amigable sin alert() */
        var errEl = $(".form-error");
        if (!errEl) {
          errEl = document.createElement("p");
          errEl.className = "form-error";
          errEl.style.cssText = "color:#f87171;font-size:.875rem;margin-top:.5rem;";
          form.appendChild(errEl);
        }
        errEl.textContent = "Error al enviar. Por favor inténtalo de nuevo.";
      });
    });
  }

  /* ── Boot ───────────────────────────────────────────────── */
  function boot() {
    safe(initNav,           "initNav");
    safe(initMobileMenu,    "initMobileMenu");
    safe(initSmoothAnchors, "initSmoothAnchors");
    safe(initReveals,       "initReveals");
    safe(initScrollProgress,"initScrollProgress");
    safe(initCursor,        "initCursor");
    safe(initCountUp,       "initCountUp");
    safe(initTilt,          "initTilt");
    safe(initContactForm,   "initContactForm");

    if (window.gsap && window.ScrollTrigger) {
      try { gsap.registerPlugin(ScrollTrigger); } catch (_) {}
      safe(initSplitText, "initSplitText");
    }

    document.documentElement.classList.add("is-ready");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }

})();
