const ContestListModule = (function () {

    /* ───── 상태 ───── */
    var PAGE_SIZE = 10;
    var currentSort = "latest";
    var currentScope = null;
    var currentPage = 1;
    var totalPages = 0;
    var isLoading = false;
    var observer = null;
    var selectedId = -1;
    var itemsCache = {};

    /* ───── API 호출 ───── */
    function fetchContestList(page) {
        if (isLoading) return;
        isLoading = true;

        var params = new URLSearchParams();
        params.set("page", page);
        params.set("size", PAGE_SIZE);

        if (currentSort === "deadline") {
            params.set("sort", "deadline");
        } else if (currentSort === "popular") {
            params.set("sort", "popular");
        }

        if (currentScope === "mine") {
            params.set("mine", "true");
        } else if (currentScope === "joined") {
            params.set("participated", "true");
        }

        fetch("/contest/api/list?" + params.toString(), {
            credentials: "same-origin"
        })
        .then(function (res) { return res.json(); })
        .then(function (data) {
            totalPages = data.totalPages || 0;
            var list = data.content || [];

            list.forEach(function (item) {
                itemsCache[item.id] = item;
            });

            renderItems(list, (page - 1) * PAGE_SIZE);
            currentPage = page;
            isLoading = false;

            var loader = document.getElementById("contestLoader");
            if (currentPage >= totalPages || list.length === 0) {
                loader.style.display = "none";
                if (observer) observer.disconnect();
            } else {
                loader.style.display = "flex";
            }
        })
        .catch(function (err) {
            console.error("공모전 목록 조회 실패:", err);
            isLoading = false;
        });
    }

    /* ───── 아이템 렌더링 ───── */
    function renderItems(list, startIdx) {
        var container = document.getElementById("contestList");

        if (list.length === 0 && startIdx === 0) {
            container.innerHTML = '<div class="Contest-List-Empty" style="text-align:center;padding:60px 0;color:#aaa;">등록된 공모전이 없습니다.</div>';
            return;
        }

        list.forEach(function (item, i) {
            var div = document.createElement("div");
            div.className = "Contest-List-Item";
            div.setAttribute("data-id", item.id);

            var thumbSrc = item.coverImage || "/images/default-contest.png";
            var statusText = item.dDay || item.status || "";

            div.innerHTML =
                '<div class="Contest-Item-Index">' + (startIdx + i + 1) + '</div>' +
                '<div class="Contest-Item-Thumbnail">' +
                    '<a class="Contest-Thumbnail-Link" href="/contest/detail/' + item.id + '">' +
                        '<img class="Contest-Thumbnail-Image" alt="" src="' + thumbSrc + '" />' +
                    '</a>' +
                '</div>' +
                '<div class="Contest-Item-Info">' +
                    '<h3 class="Contest-Item-Title">' + escapeHtml(item.title) + '</h3>' +
                    '<div class="Contest-Item-Meta">' +
                        '<span class="Contest-Item-Channel">' + escapeHtml(item.organizer || "") + '</span>' +
                        '<span class="Contest-Item-Separator">\u00b7</span>' +
                        '<span class="Contest-Item-Views">\ucc38\uac00 ' + (item.entryCount || 0) + '\uac1c</span>' +
                        '<span class="Contest-Item-Separator">\u00b7</span>' +
                        '<span class="Contest-Item-Date">' + escapeHtml(statusText) + '</span>' +
                    '</div>' +
                '</div>';

            div.addEventListener("click", function (e) {
                if (e.target.closest("a")) return;
                selectItem(item.id, div);
            });

            container.appendChild(div);
        });
    }

    /* ───── HTML 이스케이프 ───── */
    function escapeHtml(str) {
        if (!str) return "";
        return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
    }

    /* ───── 리스트 초기화 ───── */
    function resetList() {
        var list = document.getElementById("contestList");
        list.innerHTML = "";
        currentPage = 1;
        selectedId = -1;
        itemsCache = {};

        var panel = document.getElementById("contestDetailPanel");
        panel.classList.remove("Contest-Detail-Panel--visible", "Contest-Detail-Panel--closing");

        fetchContestList(1);
        setupObserver();
    }

    /* ───── IntersectionObserver (무한스크롤) ───── */
    function setupObserver() {
        if (observer) observer.disconnect();

        var loader = document.getElementById("contestLoader");
        observer = new IntersectionObserver(function (entries) {
            if (entries[0].isIntersecting && !isLoading && currentPage < totalPages) {
                fetchContestList(currentPage + 1);
            }
        }, { rootMargin: "200px" });

        observer.observe(loader);
    }

    /* ───── 정렬 필터 클릭 ───── */
    function initFilters() {
        var sortBtns = document.querySelectorAll(".Contest-Filter-Btn[data-sort]");
        sortBtns.forEach(function (btn) {
            btn.addEventListener("click", function () {
                if (btn.getAttribute("data-sort") === currentSort) return;

                sortBtns.forEach(function (b) { b.classList.remove("Contest-Filter-Btn--active"); });
                btn.classList.add("Contest-Filter-Btn--active");

                currentSort = btn.getAttribute("data-sort");
                resetList();
            });
        });

        var scopeBtns = document.querySelectorAll(".Contest-Filter-Btn--toggle");
        scopeBtns.forEach(function (btn) {
            btn.addEventListener("click", function () {
                var scope = btn.getAttribute("data-scope");

                if (currentScope === scope) {
                    btn.classList.remove("Contest-Filter-Btn--selected");
                    currentScope = null;
                } else {
                    scopeBtns.forEach(function (b) { b.classList.remove("Contest-Filter-Btn--selected"); });
                    btn.classList.add("Contest-Filter-Btn--selected");
                    currentScope = scope;
                }
                resetList();
            });
        });
    }

    /* ───── 상세 패널 표시 ───── */
    function selectItem(contestId, clickedEl) {
        var panel = document.getElementById("contestDetailPanel");

        var items = document.querySelectorAll(".Contest-List-Item");
        items.forEach(function (item) { item.classList.remove("Contest-List-Item--active"); });

        if (selectedId === contestId) {
            selectedId = -1;
            panel.classList.remove("Contest-Detail-Panel--visible");
            panel.classList.add("Contest-Detail-Panel--closing");
            panel.addEventListener("animationend", function handler() {
                panel.classList.remove("Contest-Detail-Panel--closing");
                panel.removeEventListener("animationend", handler);
            });
            return;
        }

        selectedId = contestId;
        clickedEl.classList.add("Contest-List-Item--active");

        fetch("/contest/detail/" + contestId + "?ajax=true", { credentials: "same-origin" })
            .then(function () {
                var cached = itemsCache[contestId];
                if (!cached) return;
                bindDetail(cached);
            })
            .catch(function () {
                var cached = itemsCache[contestId];
                if (cached) bindDetail(cached);
            });

        var cached = itemsCache[contestId];
        if (cached) bindDetail(cached);

        panel.classList.remove("Contest-Detail-Panel--visible", "Contest-Detail-Panel--closing");
        void panel.offsetWidth;
        panel.classList.add("Contest-Detail-Panel--visible");
    }

    function bindDetail(data) {
        var thumbSrc = data.coverImage || "/images/default-contest.png";

        document.getElementById("detailBanner").src = thumbSrc;
        document.getElementById("detailAvatar").src = thumbSrc;
        document.getElementById("detailTitle").textContent = data.title || "";
        document.getElementById("detailHost").textContent = data.organizer || "";
        document.getElementById("detailEntries").textContent = (data.entryCount || 0) + "\uac1c";
        document.getElementById("detailViews").textContent = (data.viewCount || 0);
        document.getElementById("detailDesc").textContent = data.description || "";

        var statusText = data.dDay || data.status || "";
        var statusEl = document.getElementById("detailStatus");
        statusEl.textContent = statusText;
        statusEl.className = "Contest-Detail-InfoValue Contest-Detail-Status";
        if (statusText.indexOf("D-") === 0 || statusText === "D-Day") {
            statusEl.classList.add("Contest-Detail-Status--open");
        } else if (statusText === "\ub9c8\uac10") {
            statusEl.classList.add("Contest-Detail-Status--closed");
        }

        var periodText = "";
        if (data.entryEnd) {
            periodText = "~ " + data.entryEnd;
        }
        document.getElementById("detailPeriod").textContent = periodText;

        var prizeEl = document.getElementById("detailPrize");
        if (prizeEl) prizeEl.textContent = data.prizeInfo || "-";

        var announceEl = document.getElementById("detailAnnounce");
        if (announceEl) announceEl.textContent = data.resultDate || "-";

        var tagsContainer = document.getElementById("detailTags");
        tagsContainer.innerHTML = "";
        if (data.tags && data.tags.length > 0) {
            data.tags.forEach(function (tag) {
                var span = document.createElement("span");
                span.className = "Contest-Detail-Tag";
                span.textContent = "#" + (tag.tagName || tag);
                tagsContainer.appendChild(span);
            });
        }

        var applyBtn = document.querySelector(".Contest-Detail-ApplyBtn");
        if (applyBtn) {
            applyBtn.onclick = function () {
                location.href = "/contest/detail/" + data.id;
            };
        }

        /* 찜하기 버튼 */
        var bookmarkBtn = document.getElementById("bookmarkBtn");
        if (bookmarkBtn) {
            updateBookmarkBtn(bookmarkBtn, data.isBookmarked);
            bookmarkBtn.onclick = function () {
                fetch("/api/bookmarks", {
                    method: "POST",
                    credentials: "same-origin",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ targetType: "CONTEST", targetId: data.id })
                })
                .then(function (res) { return res.json(); })
                .then(function (result) {
                    data.isBookmarked = result.bookmarked;
                    updateBookmarkBtn(bookmarkBtn, result.bookmarked);
                })
                .catch(function () {
                    alert("로그인이 필요합니다.");
                });
            };
        }
    }

    function updateBookmarkBtn(btn, isBookmarked) {
        btn.textContent = isBookmarked ? "찜 해제" : "찜하기";
        if (isBookmarked) {
            btn.classList.add("Contest-Detail-BookmarkBtn--active");
        } else {
            btn.classList.remove("Contest-Detail-BookmarkBtn--active");
        }
    }

    /* ───── 초기화 ───── */
    function init() {
        initFilters();
        resetList();
    }

    return { init: init };

})();

document.addEventListener("DOMContentLoaded", ContestListModule.init);
