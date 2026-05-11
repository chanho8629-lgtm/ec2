window.addEventListener("load", function () {
  if (window.__bideoHomeInit) return;
  window.__bideoHomeInit = true;

  function attachHoverOverlay(thumb) {
    var overlay = thumb.querySelector(".shelf-card__overlay");
    if (!overlay || thumb.dataset.hoverBound === "1") {
      return;
    }
    thumb.dataset.hoverBound = "1";

    function show() { overlay.style.display = "flex"; }
    function hide() { overlay.style.display = "none"; }
    hide();

    thumb.addEventListener("mouseenter", show);
    thumb.addEventListener("mouseleave", hide);
    thumb.addEventListener("focusin", show);
    thumb.addEventListener("focusout", function (event) {
      if (event.relatedTarget && thumb.contains(event.relatedTarget)) {
        return;
      }
      hide();
    });
  }

  document.querySelectorAll(".shelf-card__thumb").forEach(attachHoverOverlay);

  var grid = document.querySelector(".shelf-grid");
  var sentinel = document.querySelector(".shelf-sentinel");
  if (!grid || !sentinel || !("IntersectionObserver" in window)) {
    return;
  }

  var loading = false;
  var ended = false;

  function escapeHtml(value) {
    if (value == null) return "";
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function buildCard(gallery) {
    var card = document.createElement("div");
    card.className = "shelf-card";

    var title = escapeHtml(gallery.title);
    var desc = escapeHtml(gallery.description);
    var cover = escapeHtml(gallery.coverImage || "");
    var workCount = (gallery.workCount != null ? gallery.workCount : 0) + "작품";
    var href = "/gallery/" + encodeURIComponent(gallery.id);

    card.innerHTML =
      '<a href="' + href + '">' +
        '<div class="shelf-card__thumb">' +
          '<div class="shelf-card__stacks">' +
            '<div class="shelf-card__stack2"></div>' +
            '<div class="shelf-card__stack1"></div>' +
          '</div>' +
          '<div class="shelf-card__thumb-inner">' +
            '<img src="' + cover + '" alt="' + title + '" />' +
          '</div>' +
          '<div class="shelf-card__badge">' +
            '<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.2 6 3 11l-.9-2.4c-.3-1.1.3-2.2 1.3-2.5l13.5-4c1.1-.3 2.2.3 2.5 1.3Z"/><path d="m6.2 5.3 3.1 3.9"/><path d="m12.4 3.4 3.1 4"/><path d="M3 11h18v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/></svg>' +
            '<span>' + escapeHtml(workCount) + '</span>' +
          '</div>' +
          '<div class="shelf-card__overlay">' +
            '<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" fill="currentColor"><path d="M5 4.623V19.38a1.5 1.5 0 002.26 1.29L22 12 7.26 3.33A1.5 1.5 0 005 4.623Z"></path></svg>' +
            '감상하기' +
          '</div>' +
        '</div>' +
        '<div class="shelf-card__meta">' +
          '<h3 class="shelf-card__title">' + title + '</h3>' +
          '<p class="shelf-card__desc">' + desc + '</p>' +
        '</div>' +
      '</a>';
    return card;
  }

  function finish() {
    ended = true;
    observer.disconnect();
    if (sentinel.parentNode) {
      sentinel.parentNode.removeChild(sentinel);
    }
  }

  function loadNext() {
    if (loading || ended) return;
    loading = true;

    var page = parseInt(grid.dataset.nextPage, 10) || 2;
    var size = parseInt(grid.dataset.pageSize, 10) || 20;
    var tag = grid.dataset.tag;

    var params = new URLSearchParams();
    params.set("page", page);
    params.set("size", size);
    if (tag) params.set("tag", tag);

    fetch("/api/galleries?" + params.toString(), {
      headers: { "Accept": "application/json" }
    })
      .then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        return res.json();
      })
      .then(function (data) {
        var content = (data && data.content) || [];
        content.forEach(function (gallery) {
          var card = buildCard(gallery);
          grid.appendChild(card);
          attachHoverOverlay(card.querySelector(".shelf-card__thumb"));
        });

        var totalPages = data && data.totalPages;
        if (content.length === 0 || (totalPages != null && page >= totalPages)) {
          finish();
        } else {
          grid.dataset.nextPage = page + 1;
        }
      })
      .catch(function () {
        // 일시적 실패 시 다음 트리거에서 재시도 가능하도록 유지
      })
      .finally(function () {
        loading = false;
      });
  }

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) loadNext();
    });
  }, { rootMargin: "300px 0px" });

  observer.observe(sentinel);
});

