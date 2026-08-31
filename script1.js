(() => {
  "use strict";

  const langToggle = document.getElementById("langToggle");
  const giscusHost = document.getElementById("giscus");
  const year = document.getElementById("year");
  const menu = document.querySelector(".menu-dropdown");

  let lang = localStorage.getItem("alyLang") || "en";

  function applyLanguage() {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    document.body.dir = lang === "ar" ? "rtl" : "ltr";

    document.querySelectorAll("[data-en][data-ar]").forEach((el) => {
      const value = lang === "ar" ? el.dataset.ar : el.dataset.en;
      if (value !== undefined) el.textContent = value;
    });

    langToggle.textContent = lang === "ar" ? "English" : "عربي";
    langToggle.setAttribute(
      "aria-label",
      lang === "ar" ? "Switch to English" : "التبديل إلى العربية"
    );

    document.title = lang === "ar"
      ? "علي عبدالعزيز | الموارد البشرية • التطوير المهني • القيادة • الذكاء الاصطناعي"
      : "Aly Abdelaziz | HR • Career Development • Leadership • AI";

    localStorage.setItem("alyLang", lang);
    loadGiscus();
  }

  function loadGiscus() {
    if (!giscusHost) return;

    giscusHost.innerHTML = "";

    const g = document.createElement("script");
    g.src = "https://giscus.app/client.js";
    g.setAttribute("data-repo", "alyabdelaziz465-wq/aly-abdelaziz-website");
    g.setAttribute("data-repo-id", "R_kgDOUJFy5Q");
    g.setAttribute("data-category", "General");
    g.setAttribute("data-category-id", "DIC_kwDOUJFy5c4DEjXN");
    g.setAttribute("data-mapping", "pathname");
    g.setAttribute("data-strict", "0");
    g.setAttribute("data-reactions-enabled", "1");
    g.setAttribute("data-emit-metadata", "0");
    g.setAttribute("data-input-position", "bottom");
    g.setAttribute("data-theme", "preferred_color_scheme");
    g.setAttribute("data-lang", lang === "ar" ? "ar" : "en");
    g.setAttribute("crossorigin", "anonymous");
    g.async = true;

    giscusHost.appendChild(g);
  }

  async function sharePage(title) {
    const url = window.location.href;
    const text = `${title} — Aly Abdelaziz`;

    if (navigator.share) {
      try {
        await navigator.share({ title, text, url });
      } catch (_) {}
      return;
    }

    const msg = encodeURIComponent(`${text} ${url}`);
    window.open(`https://wa.me/?text=${msg}`, "_blank", "noopener,noreferrer");
  }

  window.sharePage = sharePage;

  langToggle.addEventListener("click", () => {
    lang = lang === "en" ? "ar" : "en";
    applyLanguage();
  });

  document.querySelectorAll(".menu-panel a[href^='#']").forEach((link) => {
    link.addEventListener("click", () => {
      if (menu) menu.removeAttribute("open");
    });
  });

  if (year) year.textContent = new Date().getFullYear();

  applyLanguage();
})();
