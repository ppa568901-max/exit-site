/* ============================================================
   EXIT — 우주 별 배경 효과 (canvas)
   배경색은 그대로 두고, 뒤에서 별들이 천천히 흐르며 반짝입니다.
   prefers-reduced-motion 사용자는 정지된 별만 표시합니다.
   ============================================================ */

(function () {
  "use strict";

  function start() {
    var canvas = document.getElementById("starfield");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    var stars = [];
    var w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      w = Math.max(window.innerWidth || 0, document.documentElement.clientWidth || 0);
      if (w < 50) w = window.outerWidth || 1280;     // 일부 환경에서 innerWidth가 비정상일 때 대비
      h = Math.max(window.innerHeight || 0, document.documentElement.clientHeight || 0);
      if (h < 50) h = window.outerHeight || 800;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + "px";
      canvas.style.height = h + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      seed();
    }

    function seed() {
      var count = Math.round((w * h) / 9000); // 밀도
      count = Math.max(60, Math.min(count, 220));
      stars = [];
      for (var i = 0; i < count; i++) {
        stars.push({
          x: Math.random() * w,
          y: Math.random() * h,
          r: Math.random() * 1.3 + 0.2,        // 크기
          vx: -(Math.random() * 0.12 + 0.02),  // 왼쪽으로 천천히 흐름
          vy: (Math.random() - 0.5) * 0.04,
          tw: Math.random() * Math.PI * 2,       // 반짝임 위상
          tws: Math.random() * 0.02 + 0.005      // 반짝임 속도
        });
      }
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      for (var i = 0; i < stars.length; i++) {
        var s = stars[i];
        if (!reduced) {
          s.x += s.vx; s.y += s.vy; s.tw += s.tws;
          if (s.x < -2) { s.x = w + 2; s.y = Math.random() * h; }
          if (s.y < -2) s.y = h + 2;
          else if (s.y > h + 2) s.y = -2;
        }
        var alpha = reduced ? 0.5 : 0.35 + Math.sin(s.tw) * 0.3;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(180, 210, 255, " + Math.max(0.06, alpha) + ")";
        ctx.fill();
      }
      if (!reduced) requestAnimationFrame(draw);
    }

    resize();
    window.addEventListener("resize", function () {
      clearTimeout(window.__sfResize);
      window.__sfResize = setTimeout(resize, 200);
    });
    window.addEventListener("load", resize);
    /* 초기 레이아웃이 늦게 잡히는 환경 대비 재측정 */
    setTimeout(resize, 400);
    draw();
  }

  window.EXIT_startStarfield = start;
})();
