/* ============================================================
   EXIT — 한/영 전환 (i18n)
   layout.js가 메뉴/푸터를 주입한 뒤 EXIT_applyLang()을 호출합니다.
   각 요소: data-ko / data-en (텍스트), data-ko-ph / data-en-ph (placeholder)
   ============================================================ */

(function () {
  "use strict";

  var STORAGE_KEY = "exit-lang";
  var DEFAULT_LANG = "ko";

  function currentLang() {
    try { return localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG; } catch (e) { return DEFAULT_LANG; }
  }

  function applyLang(lang) {
    lang = lang || currentLang();
    document.documentElement.lang = lang;

    document.querySelectorAll("[data-" + lang + "]").forEach(function (el) {
      var value = el.getAttribute("data-" + lang);
      if (value === null) return;
      if (value.indexOf("<") !== -1) el.innerHTML = value;
      else el.textContent = value;
    });

    document.querySelectorAll("[data-" + lang + "-ph]").forEach(function (el) {
      el.setAttribute("placeholder", el.getAttribute("data-" + lang + "-ph"));
    });

    document.querySelectorAll(".lang-toggle button").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-lang") === lang);
    });
  }

  function setLang(lang) {
    try { localStorage.setItem(STORAGE_KEY, lang); } catch (e) {}
    applyLang(lang);
  }

  /* layout.js / main.js에서 호출 가능하도록 전역 노출 */
  window.EXIT_applyLang = applyLang;
  window.EXIT_setLang = setLang;
  window.EXIT_currentLang = currentLang;

  /* 페이지 본문(주입 전 정적 콘텐츠) 우선 적용 */
  applyLang(currentLang());
})();
