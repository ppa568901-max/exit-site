/* ============================================================
   EXIT — 우리의 오피스 (월드맵)
   jsVectorMap으로 오피스·라이센스 위치를 핀으로 표시합니다.
   위치를 추가/수정하려면 아래 MARKERS 배열만 고치면 됩니다. (coords = [위도, 경도])
   ============================================================ */

(function () {
  "use strict";

  var OFFICE = "#2fe6a8";   // 오피스 핀 색 (에메랄드)
  var LICENSE = "#3b82f6";  // 라이센스 핀 색 (블루)

  var MARKERS = [
    { name: "Estonia (Office)", coords: [58.6, 25.0], type: "office" },
    { name: "Thailand (Office)", coords: [13.7, 100.5], type: "office" },
    { name: "Vietnam (Office)", coords: [10.8, 106.7], type: "office" },
    { name: "Anjouan (라이센스)", coords: [-12.2, 44.4], type: "license" },
    { name: "Malta (라이센스)", coords: [35.9, 14.4], type: "license" },
    { name: "Curaçao (라이센스)", coords: [12.2, -69.0], type: "license" }
  ];

  function init() {
    var el = document.getElementById("officeMap");
    if (!el || typeof window.jsVectorMap === "undefined") return;

    var markers = MARKERS.map(function (m) {
      return {
        name: m.name,
        coords: m.coords,
        style: { initial: { fill: m.type === "office" ? OFFICE : LICENSE } }
      };
    });

    new window.jsVectorMap({
      selector: "#officeMap",
      map: "world",
      zoomButtons: false,
      zoomOnScroll: false,
      backgroundColor: "transparent",
      regionStyle: {
        initial: { fill: "#4a6aa6", stroke: "#7ba3da", strokeWidth: 0.6, fillOpacity: 1 },
        hover: { fill: "#5c7dbb" }
      },
      markers: markers,
      markerStyle: {
        initial: { r: 7, fill: OFFICE, stroke: "#0b1120", strokeWidth: 2.5 },
        hover: { r: 9 }
      },
      labels: {
        markers: { render: function (marker) { return marker.name; } }
      },
      markerLabelStyle: {
        initial: { fontFamily: "Pretendard, sans-serif", fontSize: 11, fontWeight: 600, fill: "#eef3fb" }
      }
    });

    /* jsVectorMap이 핀별 색을 지원하지 않아, 라이센스 핀을 직접 파란색으로 변경 */
    var circles = el.querySelectorAll("circle.jvm-marker");
    if (circles.length >= MARKERS.length) {
      MARKERS.forEach(function (m, i) {
        if (m.type === "license") circles[i].setAttribute("fill", LICENSE);
      });
    }
  }

  if (document.readyState === "complete") init();
  else window.addEventListener("load", init);
})();
