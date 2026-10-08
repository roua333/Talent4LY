"use strict";

// ضعي رابط نموذج التسجيل بين علامتي الاقتباس. تستخدمه جميع أزرار الانضمام.
const SITE_CONFIG = Object.freeze({
  registrationUrl: "./register.html",
});

function initializeNavigation() {
  const toggle = document.querySelector(".menu-toggle");
  const navigation = document.querySelector(".site-nav");

  if (!toggle || !navigation) return;

  const mobileViewport = window.matchMedia("(max-width: 1100px)");

  function setMenuOpen(isOpen) {
    toggle.setAttribute("aria-expanded", String(isOpen));
    toggle.setAttribute(
      "aria-label",
      isOpen ? "إغلاق القائمة" : "فتح القائمة"
    );
    navigation.classList.toggle("is-open", isOpen);
  }

  toggle.addEventListener("click", () => {
    setMenuOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  navigation.addEventListener("click", (event) => {
    const link = event.target.closest("a");
    if (!link) return;

    // Move focus off a link before hiding its mobile navigation container.
    if (mobileViewport.matches) {
      toggle.focus({ preventScroll: true });
    }

    setMenuOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (
      event.key !== "Escape" ||
      toggle.getAttribute("aria-expanded") !== "true"
    ) {
      return;
    }

    setMenuOpen(false);
    toggle.focus();
  });

  document.addEventListener("click", (event) => {
    if (
      navigation.contains(event.target) ||
      toggle.contains(event.target)
    ) {
      return;
    }

    setMenuOpen(false);
  });

  mobileViewport.addEventListener("change", () => {
    setMenuOpen(false);
  });
}

function getRegistrationUrl() {
  const value = SITE_CONFIG.registrationUrl.trim();

  if (!value) return null;

  try {
    const url = new URL(value, window.location.href);

    return ["https:", "http:"].includes(url.protocol)
      ? url.href
      : null;
  } catch {
    return null;
  }
}

function initializeRegistration() {
  const links = document.querySelectorAll("[data-registration-link]");
  const dialog = document.querySelector("#registration-dialog");
  const registrationUrl = getRegistrationUrl();

  links.forEach((link) => {
    if (registrationUrl) {
      link.href = registrationUrl;
      return;
    }

    link.setAttribute("aria-haspopup", "dialog");

    link.addEventListener("click", (event) => {
      event.preventDefault();

      // Let the navigation finish closing before the modal receives focus.
      requestAnimationFrame(() => {
        if (dialog && !dialog.open) {
          dialog.showModal();
        }
      });
    });
  });

  if (!dialog) return;

  dialog.addEventListener("click", (event) => {
    if (event.target !== dialog) return;

    const bounds = dialog.getBoundingClientRect();

    const outsideDialog =
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom;

    if (outsideDialog) {
      dialog.close();
    }
  });
}

function updateCopyrightYear() {
  const yearElement = document.querySelector("[data-current-year]");

  if (yearElement) {
    yearElement.textContent = String(new Date().getFullYear());
  }
}

function initializeSite() {
  document.documentElement.classList.add("has-js");

  initializeNavigation();
  initializeRegistration();
  updateCopyrightYear();
}

initializeSite();