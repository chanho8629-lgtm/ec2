document.addEventListener("DOMContentLoaded", function () {
  let sourceForms = Array.from(
    document.querySelectorAll("[data-yt-shell-search-form]")
  );
  let portal = document.querySelector("[data-yt-shell-search-portal]");
  let surface = document.querySelector("[data-yt-shell-search-surface]");
  let scrim = document.querySelector("[data-yt-shell-search-scrim]");
  let portalForm = document.querySelector("[data-yt-shell-search-portal-form]");
  let portalInput = document.querySelector("[data-yt-shell-search-portal-input]");
  let title = document.querySelector("[data-yt-shell-search-title]");
  let results = document.querySelector("[data-yt-shell-search-results]");

  if (
    !sourceForms.length ||
    !portal ||
    !surface ||
    !scrim ||
    !portalForm ||
    !portalInput ||
    !title ||
    !results
  ) {
    return;
  }

  let activeSource = null;
  let searchDebounce = null;
  let cachedSuggestions = null;
  let cachedTrending = null;
  let cachedRecent = null;

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  function createGalleryItem(gallery) {
    let li = document.createElement("li");
    let link = document.createElement("a");
    let thumb = document.createElement("span");
    let body = document.createElement("span");
    let titleEl = document.createElement("span");

    link.className = "yt-shell-search-result";
    link.href = "/gallery/" + gallery.id;

    thumb.className = "yt-shell-search-result__thumb";
    if (gallery.coverImageUrl) {
      let img = document.createElement("img");
      img.src = gallery.coverImageUrl;
      img.alt = escapeHtml(gallery.title);
      thumb.appendChild(img);
    } else {
      let placeholder = document.createElement("span");
      placeholder.className = "yt-shell-search-result__duration";
      placeholder.textContent = "No Image";
      thumb.appendChild(placeholder);
    }

    body.className = "yt-shell-search-result__body";
    titleEl.className = "yt-shell-search-result__title";
    titleEl.textContent = gallery.title;
    body.appendChild(titleEl);

    link.appendChild(thumb);
    link.appendChild(body);
    li.appendChild(link);
    return li;
  }

  function createKeywordItem(keyword, type) {
    let li = document.createElement("li");
    let link = document.createElement("a");
    link.className = "yt-shell-search-result";
    link.href = "#";
    link.addEventListener("click", function (e) {
      e.preventDefault();
      portalInput.value = keyword;
      renderSearchResults(keyword);
    });

    let icon = document.createElement("span");
    icon.className = "yt-shell-search-result__thumb";
    icon.style.cssText = "display:flex;align-items:center;justify-content:center;font-size:1.2rem;";
    icon.textContent = type === "recent" ? "\u{1F556}" : "\u{1F525}";

    let body = document.createElement("span");
    body.className = "yt-shell-search-result__body";
    let titleEl = document.createElement("span");
    titleEl.className = "yt-shell-search-result__title";
    titleEl.textContent = keyword;
    body.appendChild(titleEl);

    link.appendChild(icon);
    link.appendChild(body);
    li.appendChild(link);
    return li;
  }

  function renderEmpty() {
    results.innerHTML = "";
    let empty = document.createElement("div");
    empty.className = "yt-shell-search-empty";
    empty.innerHTML =
      "<strong>검색 결과가 없습니다</strong><span>다른 키워드로 다시 시도해 보세요.</span>";
    results.appendChild(empty);
  }

  function renderDefaultView() {
    results.innerHTML = "";
    title.textContent = "추천 예술관";

    let promises = [];

    if (!cachedSuggestions) {
      promises.push(
        fetch("/api/search/suggestions", { credentials: "same-origin" })
          .then(function (res) { return res.ok ? res.json() : []; })
          .then(function (data) { cachedSuggestions = data; })
          .catch(function () { cachedSuggestions = []; })
      );
    }
    if (!cachedTrending) {
      promises.push(
        fetch("/api/search/trending", { credentials: "same-origin" })
          .then(function (res) { return res.ok ? res.json() : []; })
          .then(function (data) { cachedTrending = data; })
          .catch(function () { cachedTrending = []; })
      );
    }
    if (!cachedRecent) {
      promises.push(
        fetch("/api/search/recent", { credentials: "same-origin" })
          .then(function (res) { return res.ok ? res.json() : []; })
          .then(function (data) { cachedRecent = data; })
          .catch(function () { cachedRecent = []; })
      );
    }

    Promise.all(promises).then(function () {
      results.innerHTML = "";

      if (cachedRecent && cachedRecent.length > 0) {
        let recentTitle = document.createElement("div");
        recentTitle.className = "yt-shell-search-section-title";
        recentTitle.textContent = "최근 검색";
        results.appendChild(recentTitle);
        let recentList = document.createElement("ul");
        recentList.className = "yt-shell-search-results-list";
        cachedRecent.slice(0, 5).forEach(function (item) {
          recentList.appendChild(createKeywordItem(item.keyword, "recent"));
        });
        results.appendChild(recentList);
      }

      if (cachedTrending && cachedTrending.length > 0) {
        let trendTitle = document.createElement("div");
        trendTitle.className = "yt-shell-search-section-title";
        trendTitle.textContent = "인기 검색어";
        results.appendChild(trendTitle);
        let trendList = document.createElement("ul");
        trendList.className = "yt-shell-search-results-list";
        cachedTrending.slice(0, 5).forEach(function (item) {
          trendList.appendChild(createKeywordItem(item.keyword, "trending"));
        });
        results.appendChild(trendList);
      }

      if (cachedSuggestions && cachedSuggestions.length > 0) {
        let suggestTitle = document.createElement("div");
        suggestTitle.className = "yt-shell-search-section-title";
        suggestTitle.textContent = "추천 예술관";
        results.appendChild(suggestTitle);
        let suggestList = document.createElement("ul");
        suggestList.className = "yt-shell-search-results-list";
        cachedSuggestions.forEach(function (gallery) {
          suggestList.appendChild(createGalleryItem(gallery));
        });
        results.appendChild(suggestList);
      }

      if (
        (!cachedRecent || cachedRecent.length === 0) &&
        (!cachedTrending || cachedTrending.length === 0) &&
        (!cachedSuggestions || cachedSuggestions.length === 0)
      ) {
        renderEmpty();
      }
    });
  }

  function renderSearchResults(query) {
    let normalized = (query || "").trim();
    if (!normalized) {
      renderDefaultView();
      return;
    }

    title.textContent = '"' + normalized + '" 검색 결과';
    results.innerHTML = "<div class='yt-shell-search-empty'><span>검색 중...</span></div>";

    if (searchDebounce) clearTimeout(searchDebounce);
    searchDebounce = setTimeout(function () {
      fetch("/api/galleries?keyword=" + encodeURIComponent(normalized) + "&size=10", { credentials: "same-origin" })
        .then(function (res) { return res.ok ? res.json() : { content: [] }; })
        .then(function (data) {
          let galleries = data.content || [];
          results.innerHTML = "";
          title.textContent = '"' + normalized + '" 검색 결과';

          if (!galleries.length) {
            renderEmpty();
            return;
          }

          let list = document.createElement("ul");
          list.className = "yt-shell-search-results-list";
          galleries.forEach(function (gallery) {
            list.appendChild(createGalleryItem({
              id: gallery.id,
              title: gallery.title,
              coverImageUrl: gallery.coverImage || null
            }));
          });
          results.appendChild(list);
        })
        .catch(function () {
          renderEmpty();
        });
    }, 300);
  }

  function syncSurfacePosition() {
    if (!activeSource) {
      return;
    }
    let rect = activeSource.form.getBoundingClientRect();
    surface.style.setProperty("--yt-search-top", rect.top + "px");
    surface.style.setProperty("--yt-search-left", rect.left + "px");
    surface.style.setProperty("--yt-search-width", rect.width + "px");
  }

  function openPortal(source) {
    activeSource = source;
    portalInput.value = source.input.value;
    portal.hidden = false;
    syncSurfacePosition();

    let query = (portalInput.value || "").trim();
    if (query) {
      renderSearchResults(query);
    } else {
      cachedSuggestions = null;
      cachedTrending = null;
      cachedRecent = null;
      renderDefaultView();
    }

    requestAnimationFrame(function () {
      portalInput.focus();
      portalInput.setSelectionRange(portalInput.value.length, portalInput.value.length);
    });
  }

  function closePortal() {
    if (!activeSource) {
      portal.hidden = true;
      return;
    }
    activeSource.input.value = portalInput.value;
    portal.hidden = true;
    surface.style.removeProperty("--yt-search-top");
    surface.style.removeProperty("--yt-search-left");
    surface.style.removeProperty("--yt-search-width");
    activeSource = null;
  }

  sourceForms.forEach(function (form) {
    let mode = form.getAttribute("data-yt-shell-search-form");
    let input = form.querySelector(
      '[data-yt-shell-search-input="' + mode + '"]'
    );

    if (!input) {
      return;
    }

    input.addEventListener("focus", function () {
      openPortal({ form: form, input: input, mode: mode });
    });

    input.addEventListener("input", function () {
      openPortal({ form: form, input: input, mode: mode });
    });
  });

  portalInput.addEventListener("input", function () {
    let query = (portalInput.value || "").trim();
    if (query) {
      renderSearchResults(query);
    } else {
      renderDefaultView();
    }
  });

  portalForm.addEventListener("submit", function (event) {
    if (!activeSource) {
      return;
    }
    event.preventDefault();
    let keyword = (portalInput.value || "").trim();
    if (keyword) {
      fetch("/api/search/recent", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword: keyword })
      }).catch(function () {});
    }
    let source = activeSource;
    let submitter = source.form.querySelector('[type="submit"]');
    source.input.value = portalInput.value;
    closePortal();
    if (source.form.requestSubmit) {
      source.form.requestSubmit(submitter || undefined);
      return;
    }
    source.form.submit();
  });

  scrim.addEventListener("click", function () {
    closePortal();
  });

  document.addEventListener("mousedown", function (event) {
    if (portal.hidden) {
      return;
    }
    if (surface.contains(event.target)) {
      return;
    }
    if (activeSource && activeSource.form.contains(event.target)) {
      return;
    }
    closePortal();
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") {
      closePortal();
    }
  });

  document.addEventListener("yt-shell:close-search-portal", function () {
    closePortal();
  });

  window.addEventListener("resize", function () {
    syncSurfacePosition();
  });

  window.addEventListener(
    "scroll",
    function () {
      syncSurfacePosition();
    },
    true
  );
});
