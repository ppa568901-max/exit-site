/* ============================================================
   EXIT — 인터랙션
   1) 스크롤 등장(reveal)  2) 숫자 카운터  3) 문의 폼(이메일)
   (메뉴·푸터·언어 토글은 layout.js / i18n.js 에서 처리)
   ============================================================ */

(function () {
  "use strict";

  var EMAIL = "help@exit.com";
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* 2) 숫자 카운터 */
  function animateCount(el) {
    var target = parseFloat(el.getAttribute("data-target"));
    var decimals = parseInt(el.getAttribute("data-decimals") || "0", 10);
    if (prefersReduced) { el.textContent = target.toFixed(decimals); return; }
    var duration = 1600, start = null;
    function frame(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = (target * eased).toFixed(decimals);
      if (p < 1) requestAnimationFrame(frame);
      else el.textContent = target.toFixed(decimals);
    }
    requestAnimationFrame(frame);
  }

  /* 1) + 카운터 트리거 */
  var revealEls = document.querySelectorAll(".reveal");
  var counterEls = document.querySelectorAll(".count");

  if ("IntersectionObserver" in window && !prefersReduced) {
    var revealObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-visible"); revealObs.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
    revealEls.forEach(function (el) { revealObs.observe(el); });

    var countObs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { animateCount(e.target); countObs.unobserve(e.target); }
      });
    }, { threshold: 0.6 });
    counterEls.forEach(function (el) { countObs.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("is-visible"); });
    counterEls.forEach(function (el) {
      var d = parseInt(el.getAttribute("data-decimals") || "0", 10);
      el.textContent = parseFloat(el.getAttribute("data-target")).toFixed(d);
    });
  }

  /* 3) 문의 폼 → 이메일 클라이언트 */
  var form = document.getElementById("contactForm");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var data = new FormData(form);
      var lang = (window.EXIT_currentLang && window.EXIT_currentLang() === "en") ? "en" : "ko";
      var subject = "[EXIT] " + (lang === "en" ? "Inquiry from " : "문의 - ") + (data.get("name") || "");
      var lines = [
        (lang === "en" ? "Name: " : "이름: ") + (data.get("name") || ""),
        (lang === "en" ? "Company: " : "회사: ") + (data.get("company") || "-"),
        (lang === "en" ? "Country: " : "거주 국가: ") + (data.get("country") || "-"),
        (lang === "en" ? "SNS: " : "SNS 아이디: ") + (data.get("sns") || "-"),
        (lang === "en" ? "Email: " : "이메일: ") + (data.get("email") || ""),
        (lang === "en" ? "Interest: " : "관심 서비스: ") + (data.get("interest") || ""),
        "",
        (lang === "en" ? "Message:" : "내용:"),
        (data.get("message") || "")
      ];
      window.location.href = "mailto:" + EMAIL +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(lines.join("\n"));
    });
  }
})();

/* ============================================================
   차별화된 고객관리 시스템 — 슬라이더 동작
   ============================================================ */
(function () {
  "use strict";
  var track = document.querySelector(".crm-track");
  if (!track) return;
  var slides = Array.prototype.slice.call(track.children);
  var dotsWrap = document.querySelector(".crm-dots");
  var arrows = document.querySelectorAll(".crm-arrow");
  if (!slides.length) return;

  // 점(dot) 생성
  var dots = slides.map(function (_, i) {
    var b = document.createElement("button");
    b.className = "crm-dot" + (i === 0 ? " on" : "");
    b.setAttribute("aria-label", (i + 1) + "번 카드");
    b.addEventListener("click", function () { goTo(i); });
    if (dotsWrap) dotsWrap.appendChild(b);
    return b;
  });

  function current() {
    var tr = track.getBoundingClientRect();
    var c = tr.left + tr.width / 2;
    var best = 0, bd = Infinity;
    slides.forEach(function (s, i) {
      var r = s.getBoundingClientRect();
      var d = Math.abs(r.left + r.width / 2 - c);
      if (d < bd) { bd = d; best = i; }
    });
    return best;
  }

  function goTo(i) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    var s = slides[i];
    // 트랙 내부에서 슬라이드가 중앙에 오도록 '가로 스크롤만' 이동 (페이지 세로 스크롤 안 함)
    var delta = s.getBoundingClientRect().left - track.getBoundingClientRect().left;
    var target = track.scrollLeft + delta - (track.clientWidth - s.clientWidth) / 2;
    track.scrollTo({ left: target, behavior: "smooth" });
  }

  arrows.forEach(function (a) {
    a.addEventListener("click", function () { goTo(current() + parseInt(a.dataset.dir, 10)); });
  });

  var raf;
  track.addEventListener("scroll", function () {
    if (raf) return;
    raf = requestAnimationFrame(function () {
      raf = null;
      var cur = current();
      dots.forEach(function (d, i) { d.classList.toggle("on", i === cur); });
    });
  }, { passive: true });

  // 자동 넘김 (마우스 올리면 멈춤)
  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var timer = null;
  function play() {
    if (prefersReduced) return;
    stop();
    timer = setInterval(function () {
      var cur = current();
      goTo(cur >= slides.length - 1 ? 0 : cur + 1);
    }, 3000);
  }
  function stop() { if (timer) { clearInterval(timer); timer = null; } }
  var sec = track.closest(".crm-sec");
  var inView = true;
  if (sec) {
    sec.addEventListener("pointerenter", stop);
    sec.addEventListener("pointerleave", function () { if (inView) play(); });
    sec.addEventListener("focusin", stop);
  }
  // 섹션이 화면에 보일 때만 자동 넘김 (다른 영역을 보는 중엔 멈춤)
  if (sec && "IntersectionObserver" in window) {
    new IntersectionObserver(function (entries) {
      inView = entries[0].isIntersecting;
      if (inView) play(); else stop();
    }, { threshold: 0.35 }).observe(sec);
  } else {
    play();
  }
})();

/* ============================================================
   턴키 — 실시간 테마 모핑 (브랜드 컬러·폰트 자동 전환)
   ============================================================ */
(function () {
  "use strict";
  var wrap = document.querySelector(".tk-theme");
  if (!wrap) return;
  var THEMES = [
    ["t-neon", "NEON"], ["t-royal", "ROYAL"], ["t-ocean", "OCEAN"], ["t-rose", "ROSE"]
  ];
  var nameEl = wrap.querySelector(".tk-label-name");
  var swatches = wrap.querySelectorAll(".tk-swatch");
  var idx = 0;

  function apply(n) {
    THEMES.forEach(function (t) { wrap.classList.remove(t[0]); });
    wrap.classList.add(THEMES[n][0]);
    if (nameEl) nameEl.textContent = THEMES[n][1];
    swatches.forEach(function (s, si) { s.classList.toggle("on", si === n); });
  }

  apply(0);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  setInterval(function () { idx = (idx + 1) % THEMES.length; apply(idx); }, 2800);
})();

/* 예측마켓 라이브 멀티라인 차트 (canvas) */
(function () {
  "use strict";
  var canvases = document.querySelectorAll("canvas[data-pmchart]");
  if (!canvases.length) return;
  var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var dpr = window.devicePixelRatio || 1;
  var LO = 16, HI = 90;

  canvases.forEach(function (cv) {
    var ctx = cv.getContext("2d");
    var colors = (cv.getAttribute("data-colors") || "#2fe6a8,#5aa9ff,#e8a33a").split(",");
    var isBg = cv.hasAttribute("data-bg");
    var isMini = cv.hasAttribute("data-mini");
    var legendSel = (cv.getAttribute("data-legend") || "").split(",").filter(Boolean);
    var N = isBg ? 170 : (isMini ? 58 : 120);
    var AMP = isBg ? 6 : (isMini ? 7 : 10);
    var JP = isBg ? 0.08 : (isMini ? 0.07 : 0.15);
    var JA = isBg ? 14 : (isMini ? 14 : 27);

    var series = colors.map(function (c, i) {
      var arr = [], v = isMini ? (26 + i * 15) : (28 + i * 16);
      for (var k = 0; k < N; k++) {
        v += (Math.random() - 0.5) * AMP + (Math.random() < JP ? (Math.random() - 0.5) * JA : 0);
        v = Math.max(LO, Math.min(HI, v));
        arr.push(v);
      }
      return { color: c, data: arr };
    });

    function yOf(v, h) { var f = isMini ? 0.9 : 0.8, p = isMini ? 0.05 : 0.1; return h - ((v - LO) / (HI - LO)) * (h * f) - h * p; }

    function draw() {
      var w = cv.clientWidth, h = cv.clientHeight;
      if (!w || !h) return;
      ctx.clearRect(0, 0, w, h);
      if (!isMini) {
        ctx.strokeStyle = "rgba(255,255,255," + (isBg ? "0.05" : "0.07") + ")";
        ctx.lineWidth = 1; ctx.setLineDash([2, 6]);
        for (var g = 1; g < 5; g++) { var gy = h * g / 5; ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(w, gy); ctx.stroke(); }
        ctx.setLineDash([]);
      }
      series.forEach(function (s) {
        ctx.strokeStyle = s.color; ctx.lineWidth = isBg ? 1.8 : (isMini ? 1.5 : 2.3);
        ctx.lineJoin = "round"; ctx.lineCap = "round";
        ctx.globalAlpha = isBg ? 0.8 : 1;
        ctx.beginPath();
        for (var k = 0; k < N; k++) {
          var x = w * k / (N - 1), y = yOf(s.data[k], h);
          if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
        if (!isMini) {
          var ey = yOf(s.data[N - 1], h);
          ctx.fillStyle = s.color; ctx.beginPath(); ctx.arc(w - 2, ey, isBg ? 2.4 : 3.4, 0, Math.PI * 2); ctx.fill();
        }
        ctx.globalAlpha = 1;
      });
    }

    function resize() {
      var w = cv.clientWidth, h = cv.clientHeight;
      if (!w || !h) return;
      cv.width = Math.round(w * dpr);
      cv.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      draw();
    }

    function tick() {
      series.forEach(function (s) {
        var v = s.data[s.data.length - 1] + (Math.random() - 0.5) * AMP + (Math.random() < JP ? (Math.random() - 0.5) * JA : 0);
        v = Math.max(LO, Math.min(HI, v));
        s.data.push(v); s.data.shift();
      });
      draw();
      legendSel.forEach(function (sel, i) {
        if (!series[i]) return;
        var txt = Math.round(series[i].data[N - 1]) + "%";
        document.querySelectorAll("." + sel).forEach(function (el) { el.textContent = txt; });
      });
    }

    if (window.ResizeObserver) { new ResizeObserver(resize).observe(cv); } else { window.addEventListener("resize", resize); }
    resize();
    if (!reduced) setInterval(tick, isBg ? 1100 : (isMini ? 760 : 640));
  });
})();

/* 예측마켓 히어로 카드 캐러셀 — 위아래로 순환하며 모든 주제가 번갈아 노출 */
(function () {
  "use strict";
  var wrap = document.querySelector(".pm-hero-cards");
  if (!wrap) return;
  var cards = [].slice.call(wrap.querySelectorAll(".pm-market"));
  if (cards.length < 2) return;
  var slots = [
    { t: "translateY(16px) rotate(0deg) scale(1.04)", o: 1.0,  z: 40 },  // 앞(가운데, 똑바로)
    { t: "rotate(23deg) scale(0.95)",                 o: 0.84, z: 25 },  // 오른쪽 펼침
    { t: "translateY(-22px) rotate(0deg) scale(0.9)", o: 0.5,  z: 12 },  // 뒤(가운데 위로)
    { t: "rotate(-23deg) scale(0.95)",                o: 0.84, z: 25 }   // 왼쪽 펼침
  ];
  var n = cards.length;
  var step = 0;
  function place() {
    cards.forEach(function (card, i) {
      var sl = slots[(i + step) % n] || slots[slots.length - 1];
      card.style.transform = sl.t;
      card.style.opacity = sl.o;
      card.style.zIndex = sl.z;
    });
  }
  place();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  setInterval(function () { step = (step + 1) % n; place(); }, 3400);
})();

/* 실제 거래 화면 — 주제 4초 순환 + 인터랙티브 베팅 + 결과 테이블 */
(function () {
  "use strict";
  var trade = document.querySelector(".pm-trade");
  if (!trade) return;
  var COL = ["#ffffff", "#ff5c7a", "#5aa9ff", "#2fe6a8"];
  var TOPICS = [
    { img: "images/월드컵.jpg", selIcon: '<span class="pm-ic-emoji">🇧🇷</span>', pcts: [42, 28, 18, 12],
      cat: "스포츠 · 축구 · 월드컵", q: "2026 월드컵 우승 국가는?", sel: "브라질", labels: ["브라질", "아르헨티나", "프랑스", "스페인"],
      cat_en: "SPORTS · SOCCER · WORLD CUP", q_en: "Who will win the 2026 World Cup?", sel_en: "Brazil", labels_en: ["Brazil", "Argentina", "France", "Spain"] },
    { img: "images/Flag_of_South_Korea.svg.webp", selIcon: '<span class="pm-ic-num">1</span>', pcts: [53, 24, 15, 8],
      cat: "정치 · 지방선거 · 서울", q: "06월 03일 한국 서울시장 당선자는?", sel: "기호 1번", labels: ["기호 1번", "기호 2번", "기호 3번", "무소속"],
      cat_en: "POLITICS · LOCAL ELECTION · SEOUL", q_en: "Who will be elected Seoul Mayor on Jun 3?", sel_en: "Candidate 1", labels_en: ["Candidate 1", "Candidate 2", "Candidate 3", "Independent"] },
    { img: "images/비트코인.jpeg", selIcon: '<span class="pm-ic-up">↑</span>', pcts: [51, 49],
      cat: "크립토 · 비트코인 · 초단기", q: "5분 뒤 비트코인은 상승할까 하락할까?", sel: "상승한다", labels: ["상승", "하락"],
      cat_en: "CRYPTO · BITCOIN · SHORT-TERM", q_en: "Will Bitcoin rise or fall in 5 minutes?", sel_en: "Up", labels_en: ["Up", "Down"] },
    { img: "images/트럼프.jpeg", selIcon: '<img src="images/coins/btc.svg" alt="">', pcts: [38, 30, 22, 10],
      cat: "정치 · 미국 · 트럼프", q: "트럼프는 과연 연설에서 무엇을 얘기할까?", sel: "비트코인", labels: ["비트코인", "관세", "이민", "경제"],
      cat_en: "POLITICS · USA · TRUMP", q_en: "What will Trump talk about in his speech?", sel_en: "Bitcoin", labels_en: ["Bitcoin", "Tariffs", "Immigration", "Economy"] }
  ];
  var state = { i: 0, side: "yes", mode: "buy", qty: 0 };
  function q1(s) { return trade.querySelector(s); }
  function setText(s, t) { trade.querySelectorAll(s).forEach(function (e) { e.textContent = t; }); }
  function isEn() { return (window.EXIT_currentLang ? window.EXIT_currentLang() : "ko") === "en"; }
  function pick(t, key) { return isEn() && t[key + "_en"] != null ? t[key + "_en"] : t[key]; }

  function renderBet() {
    var t = TOPICS[state.i], yes = t.pcts[0], no = 100 - yes;
    var yb = q1(".pm-buy-yn .yes b"), nb = q1(".pm-buy-yn .no b");
    if (yb) yb.textContent = yes + "¢";
    if (nb) nb.textContent = no + "¢";
    q1(".pm-buy-yn .yes").classList.toggle("on", state.side === "yes");
    q1(".pm-buy-yn .no").classList.toggle("on", state.side === "no");
    var price = state.side === "yes" ? yes : no;
    var amt = q1(".pm-amt"); if (amt) amt.textContent = state.qty;
    var lim = q1(".pm-limit"); if (lim) lim.textContent = price + "¢";
    var cost = state.qty * price / 100, payout = state.qty;
    var c = q1(".pm-cost"); if (c) c.textContent = "$" + cost.toFixed(2);
    var p = q1(".pm-payout"); if (p) p.textContent = "$" + payout.toFixed(2);
    var cta = q1(".pm-buy-cta");
    if (cta) cta.textContent = isEn()
      ? (state.mode === "buy" ? "Buy " : "Sell ") + (state.side === "yes" ? "YES" : "NO")
      : (state.side === "yes" ? "YES" : "NO") + " " + (state.mode === "buy" ? "매수" : "매도");
  }

  function renderOutcomes(t) {
    var box = q1("[data-pmoutcomes]"); if (!box) return;
    var labels = pick(t, "labels");
    var html = "";
    for (var j = 0; j < labels.length; j++) {
      var p = t.pcts[j];
      html += '<div class="pm-oc-row"><span class="pm-oc-name"><i style="background:' + COL[j] + '"></i>' + labels[j] + '</span>' +
        '<span class="pm-oc-pct">' + p + '%</span>' +
        '<span class="pm-oc-y">' + p + '¢</span>' +
        '<span class="pm-oc-n">' + (100 - p) + '¢</span></div>';
    }
    box.innerHTML = html;
  }

  function applyTopic() {
    var t = TOPICS[state.i], labels = pick(t, "labels");
    trade.querySelectorAll("[data-pmicon]").forEach(function (e) { e.style.backgroundImage = "url('" + t.img + "')"; });
    var selic = q1("[data-pmselicon]"); if (selic) selic.innerHTML = t.selIcon;
    setText("[data-pmcat]", pick(t, "cat"));
    setText("[data-pmq]", pick(t, "q"));
    setText("[data-pmsel]", pick(t, "sel"));
    var nowEl = q1(".pm-tc-now b"); if (nowEl) nowEl.textContent = t.pcts[0] + "%";
    trade.querySelectorAll(".pm-tc-legend [data-leg]").forEach(function (sp, i) {
      if (i < labels.length) {
        sp.style.display = "";
        var em = sp.querySelector("em"); if (em) em.textContent = labels[i];
        var b = sp.querySelector("b"); if (b) b.textContent = t.pcts[i] + "%";
      } else { sp.style.display = "none"; }
    });
    renderOutcomes(t);
    state.qty = 0;
    renderBet();
  }

  // 매수 / 매도 슬라이드 토글
  var toggle = q1(".pm-buy-toggle");
  trade.querySelectorAll(".pm-tab").forEach(function (b) {
    b.addEventListener("click", function () {
      trade.querySelectorAll(".pm-tab").forEach(function (x) { x.classList.remove("on"); });
      b.classList.add("on"); state.mode = b.getAttribute("data-tab");
      if (toggle) toggle.setAttribute("data-mode", state.mode);
      renderBet();
    });
  });
  // 지정가 / 시장가 드롭다운
  var orderBtn = q1(".pm-buy-mkt"), menu = q1(".pm-buy-menu");
  if (orderBtn && menu) {
    orderBtn.addEventListener("click", function (e) { e.stopPropagation(); menu.hidden = !menu.hidden; });
    menu.querySelectorAll("[data-order]").forEach(function (b) {
      b.addEventListener("click", function () { orderBtn.innerHTML = b.textContent + ' <em>▾</em>'; menu.hidden = true; });
    });
    document.addEventListener("click", function () { menu.hidden = true; });
  }
  // YES / NO
  trade.querySelectorAll(".pm-buy-yn button").forEach(function (b) {
    b.addEventListener("click", function () { state.side = b.classList.contains("yes") ? "yes" : "no"; renderBet(); });
  });
  // 금액 칩
  trade.querySelectorAll(".pm-buy-chips span").forEach(function (s) {
    s.addEventListener("click", function () {
      var a = s.getAttribute("data-amt");
      if (a === "max") state.qty = 100; else state.qty += parseInt(a, 10) || 0;
      renderBet();
    });
  });

  applyTopic();

  // 언어 전환 시 표 내용 다시 렌더
  if (window.EXIT_setLang) {
    var origSetLang = window.EXIT_setLang;
    window.EXIT_setLang = function (l) { origSetLang(l); applyTopic(); };
  }
  document.querySelectorAll(".lang-toggle button").forEach(function (btn) {
    btn.addEventListener("click", function () { setTimeout(applyTopic, 0); });
  });

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var fade = trade.querySelectorAll(".pm-tc-title, .pm-tc-legend, .pm-tc-outcomes");
  var paused = false;
  var buy = q1(".pm-buy");
  if (buy) {
    buy.addEventListener("mouseenter", function () { paused = true; });
    buy.addEventListener("mouseleave", function () { paused = false; });
  }
  setInterval(function () {
    if (paused) return;
    state.i = (state.i + 1) % TOPICS.length;
    fade.forEach(function (e) { e.style.opacity = "0.15"; });
    setTimeout(function () { applyTopic(); fade.forEach(function (e) { e.style.opacity = "1"; }); }, 240);
  }, 4000);
})();

/* 멀티커런시 — 실시간 환율 컨버터 사이클 */
(function () {
  "use strict";
  var conv = document.querySelector(".fx-hub");
  if (!conv) return;
  var PAIRS = [
    { fs: "$", fv: "1,000", fc: "USD", ts: "₩", tv: "1,318,000", tc: "KRW", rate: "1 USD ≈ 1,318 KRW" },
    { fs: "€", fv: "500", fc: "EUR", ts: "¥", tv: "85,400", tc: "JPY", rate: "1 EUR ≈ 170.8 JPY" },
    { fs: "₿", fv: "1", fc: "BTC", ts: "$", tv: "152,400", tc: "USD", rate: "1 BTC ≈ 152,400 USD" },
    { fs: "₮", fv: "1,000", fc: "USDT", ts: "₫", tv: "25,400,000", tc: "VND", rate: "1 USDT ≈ 25,400 VND" },
    { fs: "£", fv: "800", fc: "GBP", ts: "฿", tv: "36,250", tc: "THB", rate: "1 GBP ≈ 45.3 THB" },
    { fs: "₩", fv: "5,000,000", fc: "KRW", ts: "Ξ", tv: "1.31", tc: "ETH", rate: "1 ETH ≈ 3.82M KRW" }
  ];
  var body = conv.querySelector(".mcx2-conv");
  function set(sel, v) { var e = conv.querySelector(sel); if (e) e.textContent = v; }
  function apply(p) {
    set("[data-mcx-fsym]", p.fs); set("[data-mcx-fval]", p.fv); set("[data-mcx-fcode]", p.fc);
    set("[data-mcx-tsym]", p.ts); set("[data-mcx-tval]", p.tv); set("[data-mcx-tcode]", p.tc);
    set("[data-mcx-rate]", p.rate);
  }
  var i = 0;
  apply(PAIRS[0]);
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  setInterval(function () {
    i = (i + 1) % PAIRS.length;
    if (body) body.style.opacity = "0.15";
    setTimeout(function () { apply(PAIRS[i]); if (body) body.style.opacity = "1"; }, 280);
  }, 2800);
})();

/* 예측마켓이란 — 살아있는 확률 데모 */
(function () {
  "use strict";
  var piq = document.querySelector(".piq");
  if (!piq) return;
  var num = piq.querySelector(".piq-num"), fill = piq.querySelector(".piq-fill"),
      yes = piq.querySelector(".piq-yes"), no = piq.querySelector(".piq-no"),
      cnt = piq.querySelector(".piq-cnt"), vol = piq.querySelector(".piq-vol");
  var p = 64, c = 12480, v = 142800;
  function render() {
    var r = Math.round(p);
    if (num) num.textContent = r;
    if (fill) fill.style.width = r + "%";
    if (yes) yes.textContent = r + "¢";
    if (no) no.textContent = (100 - r) + "¢";
    if (cnt) cnt.textContent = c.toLocaleString();
    if (vol) vol.textContent = "$" + v.toLocaleString();
  }
  render();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  setInterval(function () {
    p += (Math.random() - 0.5) * 5.4; p = Math.max(55, Math.min(72, p));
    c += Math.floor(Math.random() * 45);
    v += Math.floor((Math.random() - 0.32) * 7000); v = Math.max(103500, Math.min(340000, v));
    render();
  }, 700);
})();

/* 절대적 수익구조 — 결과 플립 (YES↔NO, 운영자는 항상 수수료 수익) */
(function () {
  "use strict";
  var flip = document.querySelector("[data-rev-flip]");
  if (!flip) return;
  var user = document.querySelector("[data-rev-user]");
  var STATES = [
    { t: "YES 승리", tEn: "YES wins", c: "yes", u: "YES 승 · NO 패", uEn: "YES wins · NO loses" },
    { t: "NO 승리", tEn: "NO wins", c: "no", u: "NO 승 · YES 패", uEn: "NO wins · YES loses" }
  ];
  var i = 0;
  function en() { return (window.EXIT_currentLang ? window.EXIT_currentLang() : "ko") === "en"; }
  function set() { var s = STATES[i]; flip.textContent = en() ? s.tEn : s.t; flip.className = "rev3-result " + s.c; if (user) user.textContent = en() ? s.uEn : s.u; }
  set();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  setInterval(function () { i = (i + 1) % STATES.length; set(); }, 2200);
})();

/* 자동화 콘솔 라이브 피드 (product-ai) */
(function () {
  "use strict";
  var feed = document.querySelector("[data-au-feed]");
  if (!feed) return;
  var countEl = document.querySelector("[data-au-count]");
  var TASKS = [
    { ko: "마켓 자동 생성 · “비트코인 15만$ 돌파?”", en: "Auto-created market · “BTC to $150K?”", tag: "마켓", tagEn: "MARKET", v: "NEW", c: "g" },
    { ko: "입금 감지 → 자동 크레딧", en: "Deposit detected → auto-credit", tag: "입금", tagEn: "DEPOSIT", v: "+$1,240", c: "g" },
    { ko: "출금 트리거 실행 → 자동 지급", en: "Withdrawal trigger → auto-payout", tag: "출금", tagEn: "PAYOUT", v: "−$860", c: "b" },
    { ko: "이상거래 차단 · 어뷰징 계정 격리", en: "Fraud blocked · account isolated", tag: "리스크", tagEn: "RISK", v: "BLOCK", c: "r" },
    { ko: "결과 확정 → 자동 판정·정산", en: "Outcome set → auto-settle", tag: "정산", tagEn: "SETTLE", v: "SETTLED", c: "g" },
    { ko: "리포트 자동 생성 → 어드민 전송", en: "Report auto-generated → admin", tag: "리포트", tagEn: "REPORT", v: "SENT", c: "b" },
    { ko: "AMM 호가 자동 갱신", en: "AMM quotes auto-refreshed", tag: "마켓", tagEn: "MARKET", v: "AUTO", c: "p" },
    { ko: "환전 자동 처리 · KRW→USDT", en: "Auto FX · KRW→USDT", tag: "FX", tagEn: "FX", v: "FX", c: "b" },
    { ko: "데일리 미션 리워드 자동 지급", en: "Daily reward auto-paid", tag: "리워드", tagEn: "REWARD", v: "+120P", c: "y" },
    { ko: "정산 배치 완료", en: "Settlement batch done", tag: "정산", tagEn: "SETTLE", v: "OK", c: "g" }
  ];
  function isEn() { return window.EXIT_currentLang && window.EXIT_currentLang() === "en"; }
  function fmt(n) { return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ","); }
  function p2(n) { return (n < 10 ? "0" : "") + n; }
  function now() { var d = new Date(); return p2(d.getHours()) + ":" + p2(d.getMinutes()) + ":" + p2(d.getSeconds()); }
  var idx = 0, count = 128400;
  if (countEl) countEl.textContent = fmt(count);
  function add() {
    var t = TASKS[idx % TASKS.length]; idx++;
    var el = document.createElement("div");
    el.className = "au-feed-item";
    el.innerHTML = '<span class="au-feed-time">' + now() + '</span>' +
      '<span class="au-feed-tag ' + t.c + '">' + (isEn() ? t.tagEn : t.tag) + '</span>' +
      '<span class="au-feed-t" data-ko="' + t.ko + '" data-en="' + t.en + '">' + (isEn() ? t.en : t.ko) + '</span>' +
      '<span class="au-feed-v ' + t.c + '">' + t.v + '</span>';
    feed.insertBefore(el, feed.firstChild);
    while (feed.children.length > 6) feed.removeChild(feed.lastChild);
    count += Math.floor(Math.random() * 12) + 3;
    if (countEl) countEl.textContent = fmt(count);
  }
  var latEls = document.querySelectorAll("[data-au-latency]");
  function updLat() { var v = 36 + Math.floor(Math.random() * 17); latEls.forEach(function (e) { e.textContent = v + "ms"; }); }
  updLat();
  for (var k = 0; k < 5; k++) add();
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  setInterval(add, 1900);
  setInterval(updLat, 2300);
})();

/* 어드민 KPI 실시간 변동 (숫자가 계속 살아 움직이게) */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var kpis = document.querySelectorAll(".pay-kpi .count");
  if (!kpis.length) return;

  function tween(el, to, d, dur) {
    var from = parseFloat(String(el.textContent).replace(/,/g, "")) || 0;
    var start = null;
    function fr(ts) {
      if (start === null) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var e = 1 - Math.pow(1 - p, 3);
      var v = from + (to - from) * e;
      el.textContent = d > 0 ? v.toFixed(d) : String(Math.round(v));
      if (p < 1) requestAnimationFrame(fr);
    }
    requestAnimationFrame(fr);
  }

  function startLive(el) {
    var d = parseInt(el.getAttribute("data-decimals") || "0", 10);
    var base = parseFloat(el.getAttribute("data-target"));
    var cur = base;
    function tick() {
      if (d === 0 && base >= 1000) {          // 거래 수 — 계속 증가
        cur += Math.floor(Math.random() * 70) + 15;
      } else if (d === 2) {                     // 총 거래액 — 소폭 상승 변동
        cur = base + Math.random() * 0.16;
      } else if (d === 1) {                     // 승인율 — 미세 변동
        cur = base - 0.5 + Math.random() * 0.9;
      } else { return; }                        // 활성 MID — 고정
      tween(el, cur, d, 850);
      setTimeout(tick, 1300 + Math.random() * 1400);
    }
    setTimeout(tick, 1400 + Math.random() * 700);
  }

  if ("IntersectionObserver" in window) {
    var obs = new IntersectionObserver(function (es) {
      es.forEach(function (e) {
        if (e.isIntersecting) { startLive(e.target); obs.unobserve(e.target); }
      });
    }, { threshold: 0.5 });
    kpis.forEach(function (el) { obs.observe(el); });
  } else {
    kpis.forEach(startLive);
  }
})();

/* 어드민 차트 순환(카지노/스포츠북/예측마켓) + 표 실시간 */
(function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  /* --- 차트 순환 --- */
  var chart = document.querySelector(".pay-w-chart");
  if (chart) {
    var line = chart.querySelector(".pay-area-line");
    var fill = chart.querySelector(".pay-area-fill");
    var prev = chart.querySelector(".pay-area-prev");
    var dot = chart.querySelector(".pay-area-dot");
    var cat = chart.querySelector(".pay-chart-cat");
    var catDot = chart.querySelector(".pay-chart-dot");
    var cur = chart.querySelector(".pay-dash-cur");
    var svg = chart.querySelector(".pay-area");

    function toLine(a) { return "M" + a.map(function (p) { return p[0] + "," + p[1]; }).join(" L"); }
    function fillD(a) { return toLine(a) + " L300,120 L0,120 Z"; }
    function prevD(a) { return toLine(a.map(function (p) { return [p[0], Math.min(118, p[1] + 9)]; })); }

    var DATA = [
      { ko: "카지노 GGR", en: "Casino GGR", cur: "$4.82M", color: "#2fe6a8",
        pts: [[0,90],[27,78],[55,82],[82,60],[110,66],[137,46],[165,52],[192,36],[220,42],[247,24],[275,30],[300,14]] },
      { ko: "스포츠북 GGR", en: "Sportsbook GGR", cur: "$3.16M", color: "#5aa9ff",
        pts: [[0,70],[27,55],[55,72],[82,50],[110,68],[137,44],[165,60],[192,40],[220,58],[247,38],[275,52],[300,30]] },
      { ko: "예측마켓 거래액", en: "Prediction volume", cur: "$5.40M", color: "#b98cff",
        pts: [[0,108],[27,100],[55,96],[82,88],[110,82],[137,70],[165,62],[192,48],[220,40],[247,28],[275,18],[300,8]] }
    ];

    function apply(d) {
      var lang = (typeof window.EXIT_currentLang === "function") ? window.EXIT_currentLang() : "ko";
      line.setAttribute("d", toLine(d.pts));
      line.setAttribute("stroke", d.color);
      fill.setAttribute("d", fillD(d.pts));
      prev.setAttribute("d", prevD(d.pts));
      var last = d.pts[d.pts.length - 1];
      dot.setAttribute("cx", last[0]); dot.setAttribute("cy", last[1]); dot.setAttribute("fill", d.color);
      cat.lastChild.textContent = (lang === "en" ? d.en : d.ko);
      if (catDot) catDot.style.background = d.color;
      cur.textContent = d.cur;
      cur.style.color = d.color;
      // 선 다시 그리기
      line.style.transition = "none"; line.style.strokeDashoffset = "640";
      requestAnimationFrame(function () {
        line.style.transition = "stroke-dashoffset 1.4s cubic-bezier(0.16,1,0.3,1)";
        line.style.strokeDashoffset = "0";
      });
    }

    var ci = 0;
    apply(DATA[0]);
    setInterval(function () {
      ci = (ci + 1) % DATA.length;
      svg.style.opacity = "0.2";
      if (cur) cur.style.opacity = "0.2";
      if (cat) cat.style.opacity = "0.2";
      setTimeout(function () {
        apply(DATA[ci]);
        svg.style.opacity = "1";
        if (cur) cur.style.opacity = "1";
        if (cat) cat.style.opacity = "1";
      }, 240);
    }, 3800);
  }

  /* --- 결제수단 표 실시간 --- */
  var rows = document.querySelectorAll(".pay-w-table .pay-tbl-r");
  rows.forEach(function (r) {
    var cntEl = r.children[1];
    var amtEl = r.querySelector("b");
    if (!cntEl || !amtEl) return;
    var cnt = parseInt(cntEl.textContent.replace(/[^0-9]/g, ""), 10) || 0;
    var amt = parseFloat(amtEl.textContent.replace(/[^0-9.]/g, "")) || 0;
    function tick() {
      cnt += Math.floor(Math.random() * 45) + 6;
      amt = Math.max(0.02, amt + (Math.random() - 0.32) * 0.03);
      cntEl.textContent = cnt.toLocaleString();
      amtEl.textContent = "$" + amt.toFixed(2) + "M";
      setTimeout(tick, 1500 + Math.random() * 1600);
    }
    setTimeout(tick, 700 + Math.random() * 1600);
  });
})();

/* --- 자동화 허브: 실시간 숫자 카운트업 (깜빡임 없이 부드럽게) --- */
(function () {
  function fmt(v, type, suf) {
    var s;
    if (type === "money" || type === "money2") s = "$" + v.toFixed(2) + "M";
    else if (type === "kmoney") s = "$" + Math.round(v).toLocaleString() + "K";
    else if (type === "num") s = Math.round(v).toLocaleString();
    else if (type === "int") s = "+" + Math.round(v).toLocaleString();
    else s = String(Math.max(0, Math.round(v)));
    return s + (suf || "");
  }
  document.querySelectorAll("[data-tick]").forEach(function (el) {
    var type = el.getAttribute("data-tick");
    var suf = el.getAttribute("data-suf") || "";
    if ((window.EXIT_currentLang ? window.EXIT_currentLang() : "ko") === "en") suf = el.getAttribute("data-suf-en") || suf;
    var cur = parseFloat(el.getAttribute("data-base")) || 0;
    var target = cur;
    var mono = type === "int" || type === "num" || type === "kmoney"; // 계속 올라감
    function pick() {
      if (mono) target = cur + Math.random() * 7 + 1;
      else if (type === "money" || type === "money2") {
        target = cur + (Math.random() - 0.32) * 0.06 * Math.max(1, cur);
        if (target < 0.05) target = 0.05;
      } else {
        target = Math.max(0, Math.round(2 + (Math.random() - 0.5) * 6)); // cnt 완만 변동
      }
      setTimeout(pick, 2600 + Math.random() * 2400);
    }
    // 목표값으로 부드럽게 수렴 → 숫자가 굴러 올라가는 느낌 (setInterval: 백그라운드에서도 동작)
    setInterval(function () {
      cur += (target - cur) * 0.09;
      if (Math.abs(target - cur) < 0.001) cur = target;
      el.textContent = fmt(cur, type, suf);
    }, 55);
    setTimeout(pick, 600 + Math.random() * 1600);
  });
})();

/* --- 자동화 허브: 실시간 입출금 승인내역 피드 --- */
(function () {
  var rows = document.querySelectorAll("[data-feed]");
  if (!rows.length) return;
  var IDS = ["user_8842", "kim***92", "crypto_king", "player_337", "whale_01", "neo***77",
             "vip_3388", "anon_552", "moon_boy", "lucky_7", "hodl_88", "sat0shi", "win***21", "ace_902"];
  var CUR = [
    ["BTC", 0.002, 0.09, 4], ["ETH", 0.05, 2.4, 3], ["USDT", 120, 4800, 0],
    ["KRW", 250000, 4200000, 0], ["USD", 90, 3800, 0], ["EUR", 80, 3400, 0], ["SOL", 1.2, 40, 2]
  ];
  var BLUE = "56,189,248", RED = "240,90,90"; // 입금=파랑, 출금=빨강
  function tx() {
    var id = IDS[Math.floor(Math.random() * IDS.length)];
    var c = CUR[Math.floor(Math.random() * CUR.length)];
    var amt = c[1] + Math.random() * (c[2] - c[1]);
    var s = c[3] ? amt.toFixed(c[3]) : Math.round(amt).toLocaleString();
    var dep = Math.random() > 0.42;
    return { id: id, amt: (dep ? "+" : "-") + s + " " + c[0], col: dep ? BLUE : RED };
  }
  var data = [];
  rows.forEach(function () { data.push(tx()); });
  function render() {
    rows.forEach(function (g, i) {
      var t = data[i];
      var idEl = g.querySelector("[data-feed-id]");
      var amtEl = g.querySelector("[data-feed-amt]");
      var dotEl = g.querySelector("[data-feed-dot]");
      if (idEl) idEl.textContent = t.id;
      if (amtEl) { amtEl.textContent = t.amt; amtEl.setAttribute("fill", "rgb(" + t.col + ")"); }
      if (dotEl) dotEl.setAttribute("fill", "rgb(" + t.col + ")");
    });
  }
  render();
  function push() {
    data.unshift(tx());
    data.pop();
    render();
    var top = rows[0];
    if (top) { top.style.transition = "none"; top.style.opacity = "0.15";
      setTimeout(function () { top.style.transition = "opacity .4s ease"; top.style.opacity = "1"; }, 30); }
    setTimeout(push, 2200 + Math.random() * 2200);
  }
  setTimeout(push, 2000);
})();
