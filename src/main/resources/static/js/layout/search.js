document.addEventListener("DOMContentLoaded", function () {
  let sourceForms = Array.from(
    document.querySelectorAll("[data-bd-search-form]")
  );
  let portal = document.querySelector("[data-bd-search-portal]");
  let surface = document.querySelector("[data-bd-search-surface]");
  let scrim = document.querySelector("[data-bd-search-scrim]");
  let portalForm = document.querySelector("[data-bd-search-portal-form]");
  let portalInput = document.querySelector("[data-bd-search-portal-input]");
  let title = document.querySelector("[data-bd-search-title]");
  let results = document.querySelector("[data-bd-search-results]");

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

  function buildSearchResultsUrl(keyword) {
    return "/results?search_query=" + encodeURIComponent((keyword || "").trim());
  }

  function submitSearch(keyword) {
    let normalized = (keyword || "").trim();
    if (!normalized) {
      return;
    }

    fetch("/api/search/recent", {
      method: "POST",
      credentials: "same-origin",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ keyword: normalized })
    }).catch(function () {});

    window.location.href = buildSearchResultsUrl(normalized);
  }

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

    link.className = "bd-search-result";
    link.href = "/gallery/" + gallery.id;

    thumb.className = "bd-search-result__thumb";
    if (gallery.coverImageUrl) {
      let img = document.createElement("img");
      img.src = gallery.coverImageUrl;
      img.alt = escapeHtml(gallery.title);
      thumb.appendChild(img);
    } else {
      let placeholder = document.createElement("span");
      placeholder.className = "bd-search-result__duration";
      placeholder.textContent = "No Image";
      thumb.appendChild(placeholder);
    }

    body.className = "bd-search-result__body";
    titleEl.className = "bd-search-result__title";
    titleEl.textContent = gallery.title;
    body.appendChild(titleEl);

    link.appendChild(thumb);
    link.appendChild(body);
    li.appendChild(link);
    return li;
  }

  function createProfileItem(profile) {
    let li = document.createElement("li");
    let link = document.createElement("a");
    let thumb = document.createElement("span");
    let body = document.createElement("span");
    let titleEl = document.createElement("span");
    let metaEl = document.createElement("span");

    link.className = "bd-search-result";
    link.href = "/profile/" + encodeURIComponent(profile.nickname || "");

    thumb.className = "bd-search-result__thumb";
    if (profile.profileImage) {
      let img = document.createElement("img");
      img.src = profile.profileImage;
      img.alt = profile.nickname || "";
      img.onerror = function () {
        this.onerror = null;
        this.src = "/images/default-profile.svg";
      };
      thumb.appendChild(img);
    } else {
      let placeholder = document.createElement("span");
      placeholder.className = "bd-search-result__duration";
      placeholder.textContent = "PF";
      thumb.appendChild(placeholder);
    }

    body.className = "bd-search-result__body";
    titleEl.className = "bd-search-result__title";
    titleEl.textContent = profile.nickname || "프로필";
    metaEl.className = "bd-search-result__meta";
    metaEl.textContent = "프로필";
    body.appendChild(titleEl);
    body.appendChild(metaEl);

    link.appendChild(thumb);
    link.appendChild(body);
    li.appendChild(link);
    return li;
  }

  function createWorkItem(work) {
    let li = document.createElement("li");
    let link = document.createElement("a");
    let thumb = document.createElement("span");
    let body = document.createElement("span");
    let titleEl = document.createElement("span");
    let metaEl = document.createElement("span");

    link.className = "bd-search-result";
    link.href = "/work/detail/" + work.id;

    thumb.className = "bd-search-result__thumb";
    if (work.thumbnailUrl) {
      let img = document.createElement("img");
      img.src = work.thumbnailUrl;
      img.alt = work.title || "";
      img.onerror = function () {
        this.onerror = null;
        this.src = "/images/logo.png";
      };
      thumb.appendChild(img);
    } else {
      let placeholder = document.createElement("span");
      placeholder.className = "bd-search-result__duration";
      placeholder.textContent = "WORK";
      thumb.appendChild(placeholder);
    }

    body.className = "bd-search-result__body";
    titleEl.className = "bd-search-result__title";
    titleEl.textContent = work.title || "작품";
    metaEl.className = "bd-search-result__meta";
    metaEl.textContent = work.memberNickname || "작가";
    body.appendChild(titleEl);
    body.appendChild(metaEl);

    link.appendChild(thumb);
    link.appendChild(body);
    li.appendChild(link);
    return li;
  }

  function createKeywordItem(keyword, type) {
    let li = document.createElement("li");
    let link = document.createElement("a");
    link.className = "bd-search-result";
    link.href = buildSearchResultsUrl(keyword);
    link.addEventListener("click", function (e) {
      e.preventDefault();
      submitSearch(keyword);
    });

    let icon = document.createElement("span");
    icon.className = "bd-search-result__thumb";
    icon.style.cssText = "display:flex;align-items:center;justify-content:center;font-size:1.2rem;";
    icon.textContent = type === "recent" ? "\u{1F556}" : "\u{1F525}";

    let body = document.createElement("span");
    body.className = "bd-search-result__body";
    let titleEl = document.createElement("span");
    titleEl.className = "bd-search-result__title";
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
    empty.className = "bd-search-empty";
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
        recentTitle.className = "bd-search-section-title";
        recentTitle.textContent = "최근 검색";
        results.appendChild(recentTitle);
        let recentList = document.createElement("ul");
        recentList.className = "bd-search-results-list";
        cachedRecent.slice(0, 5).forEach(function (item) {
          recentList.appendChild(createKeywordItem(item.keyword, "recent"));
        });
        results.appendChild(recentList);
      }

      if (cachedTrending && cachedTrending.length > 0) {
        let trendTitle = document.createElement("div");
        trendTitle.className = "bd-search-section-title";
        trendTitle.textContent = "인기 검색어";
        results.appendChild(trendTitle);
        let trendList = document.createElement("ul");
        trendList.className = "bd-search-results-list";
        cachedTrending.slice(0, 5).forEach(function (item) {
          trendList.appendChild(createKeywordItem(item.keyword, "trending"));
        });
        results.appendChild(trendList);
      }

      if (cachedSuggestions && cachedSuggestions.length > 0) {
        let suggestTitle = document.createElement("div");
        suggestTitle.className = "bd-search-section-title";
        suggestTitle.textContent = "추천 예술관";
        results.appendChild(suggestTitle);
        let suggestList = document.createElement("ul");
        suggestList.className = "bd-search-results-list";
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
    results.innerHTML = "<div class='bd-search-empty'><span>검색 중...</span></div>";

    if (searchDebounce) clearTimeout(searchDebounce);
    searchDebounce = setTimeout(function () {
      fetch("/api/search/1?keyword=" + encodeURIComponent(normalized) + "&type=all&sort=latest", { credentials: "same-origin" })
        .then(function (res) { return res.ok ? res.json() : { profiles: [], galleries: [], works: [] }; })
        .then(function (data) {
          let profiles = Array.isArray(data.profiles) ? data.profiles.slice(0, 2) : [];
          let galleries = Array.isArray(data.galleries) ? data.galleries.slice(0, 3) : [];
          let works = Array.isArray(data.works) ? data.works.slice(0, 3) : [];
          results.innerHTML = "";
          title.textContent = '"' + normalized + '" 검색 결과';

          if (!profiles.length && !galleries.length && !works.length) {
            renderEmpty();
            return;
          }

          let list = document.createElement("ul");
          list.className = "bd-search-results-list";
          profiles.forEach(function (profile) {
            list.appendChild(createProfileItem(profile));
          });
          galleries.forEach(function (gallery) {
            list.appendChild(createGalleryItem({
              id: gallery.id,
              title: gallery.title,
              coverImageUrl: gallery.coverImage || null
            }));
          });
          works.forEach(function (work) {
            list.appendChild(createWorkItem(work));
          });
          results.appendChild(list);

          let submitLink = document.createElement("a");
          submitLink.className = "bd-search-result";
          submitLink.href = buildSearchResultsUrl(normalized);
          submitLink.innerHTML =
            '<span class="bd-search-result__thumb" style="display:flex;align-items:center;justify-content:center;font-size:1rem;">&#128269;</span>' +
            '<span class="bd-search-result__body"><span class="bd-search-result__title">"' + escapeHtml(normalized) + '" 전체 검색 결과 보기</span></span>';
          submitLink.addEventListener("click", function (event) {
            event.preventDefault();
            submitSearch(normalized);
          });
          let submitItem = document.createElement("div");
          submitItem.appendChild(submitLink);
          results.appendChild(submitItem);
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
    surface.style.setProperty("--bd-search-top", rect.top + "px");
    surface.style.setProperty("--bd-search-left", rect.left + "px");
    surface.style.setProperty("--bd-search-width", rect.width + "px");
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
    surface.style.removeProperty("--bd-search-top");
    surface.style.removeProperty("--bd-search-left");
    surface.style.removeProperty("--bd-search-width");
    activeSource = null;
  }

  sourceForms.forEach(function (form) {
    let mode = form.getAttribute("data-bd-search-form");
    let input = form.querySelector(
      '[data-bd-search-input="' + mode + '"]'
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
    if (activeSource) {
      activeSource.input.value = portalInput.value;
    }
    closePortal();
    submitSearch(keyword);
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

  document.addEventListener("bd-shell:close-search-portal", function () {
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
