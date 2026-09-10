/* ============================================================
   EXIT — 공통 레이아웃 (메뉴 + 푸터 + 별 배경)
   메뉴/푸터를 바꾸고 싶으면 이 파일만 수정하면 모든 페이지에 반영됩니다.
   각 페이지: <div id="site-header"></div>, <div id="site-footer"></div>,
   <body data-page="페이지키">
   ============================================================ */

(function () {
  "use strict";

  var EMAIL = "help@exit.com";

  /* 대메뉴 / 소메뉴 정의 */
  var MENU = [
    {
      key: "products", ko: "제품", en: "Products", href: "products.html",
      children: [
        { ko: "크립토 카지노", en: "Crypto Casino", href: "product-casino.html" },
        { ko: "예측마켓", en: "Prediction Market", href: "product-prediction.html" },
        { ko: "페이먼트", en: "Payment", href: "product-payment.html" },
        { ko: "자동화시스템", en: "Automation System", href: "product-ai.html" }
      ]
    },
    {
      key: "services", ko: "서비스", en: "Services", href: "services.html",
      children: [
        { ko: "화이트라벨", en: "White Label", href: "whitelabel.html" },
        { ko: "턴키 솔루션", en: "Turnkey Solution", href: "service-turnkey.html" },
        { ko: "iGaming", en: "iGaming", href: "casino.html" },
        { ko: "예측마켓", en: "Prediction Market", href: "connect-prediction.html" }
      ]
    },
    {
      key: "licensing", ko: "법인·라이센스", en: "Licensing", href: "licensing.html",
      children: [
        { ko: "법인·라이센스", en: "Incorporation & Licensing", href: "license-incorporation.html" }
      ]
    },
    {
      key: "payments", ko: "페이먼트", en: "Payment", href: "product-payment.html",
      children: [
        { ko: "결제 시스템", en: "Payment System", href: "product-payment.html" }
      ]
    },
    { key: "about", ko: "회사소개", en: "About", href: "about.html" },
    { key: "careers", ko: "채용", en: "Careers", href: "careers.html" }
  ];

  function attr(ko, en) { return 'data-ko="' + ko + '" data-en="' + en + '"'; }

  /* 파트너 로고 (가로 스크롤 마퀴) — 실제 로고 이미지. 파일은 images/partners/ */
  var PARTNER_DIR = "images/partners/";
  var GAME_PARTNERS = [
    ["PragmaticPlayLogo.png", "Pragmatic Play"], ["EvolutionLogo.avif", "Evolution"],
    ["netent.avif", "NetEnt"], ["Spadegaming.png", "Spadegaming"], ["relaxgaming.avif", "Relax Gaming"],
    ["GALAXIS.avif", "Galaxis"], ["Wazdan.png", "Wazdan"], ["habanero.avif", "Habanero"],
    ["betgames.png", "BetGames"], ["betsolutions.png", "BetSolutions"], ["playngo_logo_on_black.png", "Play'n GO"],
    ["playson.png", "Playson"], ["RedTiger.png", "Red Tiger"], ["Blueprint.png", "Blueprint"],
    ["BoomingGames.png", "Booming Games"], ["Evoplay.png", "Evoplay"], ["Ezugi.png", "Ezugi"],
    ["FunkyMonkeyLogo.png", "Funky Games"], ["Leander.avif", "Leander"], ["PLAYNOVA.avif", "PlayNova"],
    ["skywind_white.png", "Skywind"], ["1x2network.png", "1X2 Network"], ["eyecon.png", "Eyecon"]
  ];
  var PAY_PARTNERS = [
    ["Visa.png", "Visa"], ["mastercard.png", "Mastercard"], ["paypal.png", "PayPal"],
    ["Skrill.png", "Skrill"], ["neteller.png", "Neteller"], ["MuchBetter.png", "MuchBetter"],
    ["Neosurf.png", "Neosurf"], ["Trustly.png", "Trustly"], ["astro.png", "AstroPay"],
    ["boku.avif", "Boku"], ["brite.avif", "Brite"], ["directa24.png", "Directa24"],
    ["ecopayz.png", "ecoPayz"], ["paysafecard.png", "Paysafecard"], ["upi.png", "UPI"],
    ["INSTADEBITBUN.avif", "InstaDebit"], ["debit.avif", "iDebit"], ["bcongo.avif", "Bconngo"],
    ["empcorp.avif", "EMP"], ["Leanconvert.png", "LeanConvert"]
  ];

  function logoRow(list) {
    return list.map(function (p) {
      return '<img class="marquee-logo" src="' + PARTNER_DIR + p[0] + '" alt="' + p[1] + '" />';
    }).join("");
  }

  function buildPartners() {
    var games = logoRow(GAME_PARTNERS);
    var pays = logoRow(PAY_PARTNERS);
    return '' +
      '<section class="alt-bg partners">' +
        '<div class="container">' +
          '<div class="section-head center reveal">' +
            '<p class="section-sub partner-line" ' + attr(
              "<span class='exit-mark'>E<span class='x'>X</span>IT</span>는 업계 최고의 파트너들과 최상의 서비스를 제공합니다.",
              "<span class='exit-mark'>E<span class='x'>X</span>IT</span> works with industry-leading partners to deliver the best service."
            ) + '><span class="exit-mark">E<span class="x">X</span>IT</span>는 업계 최고의 파트너들과 최상의 서비스를 제공합니다.</p>' +
          '</div>' +
        '</div>' +
        '<div class="marquee"><div class="marquee-track">' + games + games + '</div></div>' +
        '<div class="marquee rev"><div class="marquee-track">' + pays + pays + '</div></div>' +
      '</section>';
  }

  function buildNav(active) {
    var items = MENU.map(function (m) {
      var cls = "nav-item" + (m.key === active ? " is-active" : "");
      if (m.children) {
        var sub = m.children.map(function (c) {
          return '<a href="' + c.href + '" ' + attr(c.ko, c.en) + '>' + c.ko + "</a>";
        }).join("");
        return '<div class="' + cls + '">' +
          '<button ' + attr(m.ko, m.en) + '>' + m.ko + '<span class="caret">▾</span></button>' +
          '<div class="dropdown">' + sub + "</div></div>";
      }
      return '<div class="' + cls + '"><a href="' + m.href + '" ' + attr(m.ko, m.en) + '>' + m.ko + "</a></div>";
    }).join("");

    return '' +
      '<header class="nav" id="nav">' +
        '<a href="index.html" class="brand">E<span class="x">X</span>IT</a>' +
        '<nav class="nav-links" aria-label="Main">' + items + '</nav>' +
        '<div class="nav-right">' +
          '<a href="contact.html" class="btn btn-primary btn-sm nav-contact" ' + attr("문의하기", "Contact") + '>문의하기</a>' +
          '<div class="lang-toggle" role="group" aria-label="Language">' +
            '<button data-lang="ko" class="is-active">KO</button>' +
            '<button data-lang="en">EN</button>' +
          '</div>' +
          '<button class="menu-btn" id="menuBtn" aria-label="Menu">☰</button>' +
        '</div>' +
      '</header>';
  }

  /* 궤도 로고 (메인 히어로와 동일, 움직임) */
  function buildOrbit() {
    return '' +
      '<div class="hero-orbit footer-orbit">' +
        '<svg viewBox="0 0 460 460" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
          '<defs><radialGradient id="fg1" cx="50%" cy="50%" r="50%">' +
            '<stop offset="0%" stop-color="#2fe6a8" stop-opacity="0.3"/>' +
            '<stop offset="100%" stop-color="#2fe6a8" stop-opacity="0"/>' +
          '</radialGradient></defs>' +
          '<circle cx="230" cy="230" r="215" fill="url(#fg1)"/>' +
          '<g class="spin-slow" stroke="rgba(255,255,255,0.10)" fill="none">' +
            '<circle cx="230" cy="230" r="200"/><circle cx="230" cy="230" r="152"/><circle cx="230" cy="230" r="104"/>' +
          '</g>' +
          '<g class="spin-slow"><circle cx="394" cy="160" r="6" fill="#2fe6a8"/><circle cx="305" cy="170" r="5" fill="#5cffc4"/></g>' +
          '<g class="spin-rev"><circle cx="236" cy="452" r="6" fill="#3b82f6"/><circle cx="146" cy="463" r="5" fill="#2fe6a8"/></g>' +
          '<circle cx="230" cy="230" r="86" fill="#0b1120" stroke="rgba(47,230,168,0.45)"/>' +
          '<g class="orbit-labels" font-family="ui-monospace, monospace" font-size="15" letter-spacing="1">' +
            '<text x="230" y="118" text-anchor="middle">CASINO</text>' +
            '<text x="230" y="408" text-anchor="middle">SPORTS BOOK</text>' +
            '<text x="20" y="235">PAYMENT</text>' +
            '<text x="440" y="235" text-anchor="end">WHITE LABEL</text>' +
          '</g>' +
        '</svg>' +
        '<div class="orbit-core" aria-hidden="true"><div class="orbit-word">E<span class="x">X</span>IT</div></div>' +
      '</div>';
  }

  function buildFooter() {
    function col(title, links) {
      var a = links.map(function (l) {
        return '<a href="' + l.href + '" ' + attr(l.ko, l.en) + '>' + l.ko + "</a>";
      }).join("");
      return '<div class="footer-col"><h4 ' + attr(title.ko, title.en) + '>' + title.ko + "</h4>" + a + "</div>";
    }

    return '' +
      '<footer class="footer"><div class="container">' +
        '<div class="footer-top">' +
          '<div class="footer-about">' +
            '<a href="index.html" class="brand">E<span class="x">X</span>IT</a>' +
            '<p ' + attr(
              "법인설립·라이선스부터 플랫폼·결제까지<br>합법적인 온라인 사업의 시작을 함께합니다.",
              "From incorporation and licensing to platform and payments,<br>we help you start a compliant online business."
            ) + '>법인설립·라이선스부터 플랫폼·결제까지<br>합법적인 온라인 사업의 시작을 함께합니다.</p>' +
            '<div class="footer-slogan">Everything for Online Business</div>' +
            '<form class="footer-sub" id="footerSubForm">' +
              '<input type="email" id="footerEmail" required placeholder="이메일 주소" data-ko-ph="이메일 주소" data-en-ph="Email address" />' +
              '<button type="submit" class="footer-sub-btn" ' + attr("구독", "Subscribe") + '>구독</button>' +
            '</form>' +
          '</div>' +
          '<div class="footer-cols">' +
            col({ ko: "제품", en: "Products" }, [
              { ko: "크립토 카지노", en: "Crypto Casino", href: "product-casino.html" },
              { ko: "예측마켓", en: "Prediction Market", href: "product-prediction.html" },
              { ko: "결제 페이먼트", en: "Payment", href: "product-payment.html" },
              { ko: "자동화시스템", en: "Automation System", href: "product-ai.html" }
            ]) +
            col({ ko: "서비스", en: "Services" }, [
              { ko: "화이트라벨", en: "White Label", href: "whitelabel.html" },
              { ko: "턴키 솔루션", en: "Turnkey Solution", href: "service-turnkey.html" },
              { ko: "iGaming", en: "iGaming", href: "casino.html" },
              { ko: "예측마켓", en: "Prediction Market", href: "connect-prediction.html" }
            ]) +
            col({ ko: "라이센스", en: "Licensing" }, [
              { ko: "법인설립", en: "Incorporation", href: "license-incorporation.html" },
              { ko: "라이센스", en: "License", href: "license-gaming.html" }
            ]) +
            col({ ko: "회사", en: "Company" }, [
              { ko: "회사소개", en: "About", href: "about.html" },
              { ko: "채용", en: "Careers", href: "careers.html" },
              { ko: "문의", en: "Contact", href: "contact.html" }
            ]) +
          '</div>' +
        '</div>' +
        '<div class="footer-bottom">' +
          '<span>© <span id="year">2026</span> EXIT OÜ. All rights reserved.</span>' +
          '<span class="footer-corp" ' + attr(
            "EXIT OÜ · Estonia · *** · 등록번호 *** · " + EMAIL,
            "EXIT OÜ · Estonia · *** · Reg. No. *** · " + EMAIL
          ) + '>EXIT OÜ · Estonia · *** · 등록번호 *** · ' + EMAIL + '</span>' +
        '</div>' +
      '</div></footer>';
  }

  function init() {
    /* 별 배경 캔버스 주입 (가장 뒤) */
    if (!document.getElementById("starfield")) {
      var cv = document.createElement("canvas");
      cv.id = "starfield";
      cv.setAttribute("aria-hidden", "true");
      document.body.insertBefore(cv, document.body.firstChild);
    }

    var active = document.body.getAttribute("data-page") || "";
    var header = document.getElementById("site-header");
    var footer = document.getElementById("site-footer");
    if (header) header.outerHTML = buildNav(active);
    if (footer) footer.outerHTML = buildFooter();

    /* 파트너 마퀴: 페이지에 <div id="partner-section"></div> 가 있으면 주입 */
    var ps = document.getElementById("partner-section");
    if (ps) ps.outerHTML = buildPartners();

    var nav = document.getElementById("nav");
    var menuBtn = document.getElementById("menuBtn");
    if (menuBtn && nav) menuBtn.addEventListener("click", function () { nav.classList.toggle("is-open"); });

    document.querySelectorAll(".nav-item > button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (window.innerWidth <= 1024) btn.parentElement.classList.toggle("is-open");
      });
    });

    function onScroll() { if (nav) nav.classList.toggle("is-scrolled", window.scrollY > 24); }
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    var y = document.getElementById("year");
    if (y) y.textContent = String(new Date().getFullYear());

    var subForm = document.getElementById("footerSubForm");
    if (subForm) {
      subForm.addEventListener("submit", function (e) {
        e.preventDefault();
        var email = (document.getElementById("footerEmail") || {}).value || "";
        window.location.href = "mailto:" + EMAIL +
          "?subject=" + encodeURIComponent("[EXIT] 뉴스레터 구독 신청") +
          "&body=" + encodeURIComponent("구독 이메일: " + email);
      });
    }

    document.querySelectorAll(".lang-toggle button").forEach(function (btn) {
      btn.addEventListener("click", function () {
        if (window.EXIT_setLang) window.EXIT_setLang(btn.getAttribute("data-lang"));
      });
    });

    if (window.EXIT_applyLang) window.EXIT_applyLang();

    /* 별 배경 스크립트를 동적으로 로드 (각 페이지에 따로 추가 불필요) */
    if (window.EXIT_startStarfield) {
      window.EXIT_startStarfield();
    } else {
      var sf = document.createElement("script");
      sf.src = "js/starfield.js";
      sf.onload = function () { if (window.EXIT_startStarfield) window.EXIT_startStarfield(); };
      document.body.appendChild(sf);
    }
  }

  init();
})();
