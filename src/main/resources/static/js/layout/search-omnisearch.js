document.addEventListener("DOMContentLoaded", function () {
  var sourceForms = Array.from(
    document.querySelectorAll("[data-yt-shell-search-form]")
  );
  var portal = document.querySelector("[data-yt-shell-search-portal]");
  var surface = document.querySelector("[data-yt-shell-search-surface]");
  var scrim = document.querySelector("[data-yt-shell-search-scrim]");
  var portalForm = document.querySelector("[data-yt-shell-search-portal-form]");
  var portalInput = document.querySelector("[data-yt-shell-search-portal-input]");
  var title = document.querySelector("[data-yt-shell-search-title]");
  var results = document.querySelector("[data-yt-shell-search-results]");

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

  var searchDataset = [
    {
      title: "1-X 1.5배 클리어영상(얼불춤)",
      description: "싱크가 살짝 안맞는데 고칠수 있는방법 댓글로 적어주세요..",
      date: "2020. 8. 29.",
      duration: "1:01",
      href: "/video/N3SQwDcvZi0/edit",
      thumbnail:
        "https://i9.ytimg.com/vi_webp/N3SQwDcvZi0/mqdefault.webp?v=5f4a1fd8&sqp=CNi7tM4G&rs=AOn4CLCjNPRqOhcUMzN_VSjHibveGo8nHA",
      meta: ["업로드 날짜", "최근 조회"]
    },
    {
      title: "재밌는 브롤스타즈",
      description: "(☆구독과 좋아요 알림설정 눌러주세요☆)",
      date: "2019. 9. 7.",
      duration: "2:47",
      href: "/video/sa9eSvv0Sm4/edit",
      thumbnail:
        "https://i9.ytimg.com/vi_webp/sa9eSvv0Sm4/mqdefault.webp?sqp=CNi7tM4G&rs=AOn4CLDkekDWH5-O7Pfu3e0KvSX6dvFGpw",
      meta: ["업로드 날짜", "게임"]
    },
    {
      title: "죄송합니다 ㅠㅠ 간단하게 클래식 도전하기!!(CLASH ROYALE)(샤이 유튜브)",
      description: "원래는 목요일에 올리려고 했으나 개인사정때문에 오늘 올립니다 ㅠㅠ 죄송합니다!",
      date: "2017. 6. 4.",
      duration: "18:02",
      href: "/video/T9f7UjeHXkU/edit",
      thumbnail:
        "https://i9.ytimg.com/vi_webp/T9f7UjeHXkU/mqdefault.webp?sqp=CNi7tM4G&rs=AOn4CLAVfqglEkTfxC9YIydXNAC-y1nsmw",
      meta: ["업로드 날짜", "클래시 로얄"]
    },
    {
      title: "유튜브 활동 예정(샤이 유튜브)",
      description: "저희의 모든 활동들을 이곳에서 보여드리겠습니다!!",
      date: "2017. 5. 30.",
      duration: "0:50",
      href: "/video/wgZLkNYoaY8/edit",
      thumbnail:
        "https://i9.ytimg.com/vi/wgZLkNYoaY8/mqdefault.jpg?sqp=CNi7tM4G-oaymwEmCMACELQB8quKqQMa8AEB-AHABoAC4AOKAgwIABABGH8gKigYMA8=&rs=AOn4CLCh2H74Uhovjc-OnnLqYhRrDT8Zjg",
      meta: ["업로드 날짜", "공지"]
    }
  ];

  var activeSource = null;

  function normalize(value) {
    return (value || "").trim().toLowerCase();
  }

  function createResultItem(item) {
    var li = document.createElement("li");
    var link = document.createElement("a");
    var thumb = document.createElement("span");
    var img = document.createElement("img");
    var duration = document.createElement("span");
    var body = document.createElement("span");
    var titleEl = document.createElement("span");
    var description = document.createElement("span");
    var meta = document.createElement("span");
    var date = document.createElement("span");

    link.className = "yt-shell-search-result";
    link.href = item.href;

    thumb.className = "yt-shell-search-result__thumb";
    img.src = item.thumbnail;
    img.alt = "동영상 미리보기";
    duration.className = "yt-shell-search-result__duration";
    duration.textContent = item.duration;
    thumb.appendChild(img);
    thumb.appendChild(duration);

    body.className = "yt-shell-search-result__body";
    titleEl.className = "yt-shell-search-result__title";
    titleEl.textContent = item.title;
    description.className = "yt-shell-search-result__description";
    description.textContent = item.description;
    meta.className = "yt-shell-search-result__meta";
    item.meta.forEach(function (entry) {
      var chip = document.createElement("span");
      chip.className = "yt-shell-search-result__chip";
      chip.textContent = entry;
      meta.appendChild(chip);
    });
    body.appendChild(titleEl);
    body.appendChild(description);
    body.appendChild(meta);

    date.className = "yt-shell-search-result__date";
    date.textContent = item.date;

    link.appendChild(thumb);
    link.appendChild(body);
    link.appendChild(date);
    li.appendChild(link);
    return li;
  }

  function renderResults() {
    var query = normalize(portalInput.value);
    var list = document.createElement("ul");
    var filtered = query
      ? searchDataset.filter(function (item) {
          var haystack = normalize(
            item.title + " " + item.description + " " + item.meta.join(" ")
          );
          return haystack.indexOf(query) !== -1;
        })
      : searchDataset.slice();

    title.textContent = query ? '"' + portalInput.value + '" 검색 결과' : "내 최근 동영상";
    results.innerHTML = "";

    if (!filtered.length) {
      var empty = document.createElement("div");
      empty.className = "yt-shell-search-empty";
      empty.innerHTML =
        "<strong>검색 결과가 없습니다</strong><span>다른 키워드로 다시 시도해 보세요.</span>";
      results.appendChild(empty);
      return;
    }

    list.className = "yt-shell-search-results-list";
    filtered.forEach(function (item) {
      list.appendChild(createResultItem(item));
    });
    results.appendChild(list);
  }

  function syncSurfacePosition() {
    if (!activeSource) {
      return;
    }
    var rect = activeSource.form.getBoundingClientRect();
    surface.style.setProperty("--yt-search-top", rect.top + "px");
    surface.style.setProperty("--yt-search-left", rect.left + "px");
    surface.style.setProperty("--yt-search-width", rect.width + "px");
  }

  function openPortal(source) {
    activeSource = source;
    portalInput.value = source.input.value;
    portal.hidden = false;
    syncSurfacePosition();
    renderResults();
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
    var mode = form.getAttribute("data-yt-shell-search-form");
    var input = form.querySelector(
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
    renderResults();
  });

  portalForm.addEventListener("submit", function (event) {
    if (!activeSource) {
      return;
    }
    event.preventDefault();
    var source = activeSource;
    var submitter = source.form.querySelector('[type="submit"]');
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
