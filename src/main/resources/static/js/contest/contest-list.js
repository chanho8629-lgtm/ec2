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
                    '<a class="Contest-Thumbnail-Link" href="#" data-contest-id="' + item.id + '">' +
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

        fetch("/contest/api/detail/" + contestId, { credentials: "same-origin" })
            .then(function (res) { return res.json(); })
            .then(function (data) {
                bindDetail(data);
            })
            .catch(function () {
                var cached = itemsCache[contestId];
                if (cached) bindDetail(cached);
            });

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
                openEntryModal(data.id);
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

    /* ───── 참가 신청 모달 ───── */
    var currentContestId = null;
    var selectedWorkId = null;

    function openEntryModal(contestId) {
        currentContestId = contestId;
        selectedWorkId = null;
        var overlay = document.getElementById("entryModalOverlay");
        var body = document.getElementById("entryModalBody");
        var submitBtn = document.getElementById("entryModalSubmitBtn");

        body.innerHTML = '<div class="Entry-Modal-Empty">불러오는 중...</div>';
        submitBtn.disabled = true;
        overlay.classList.add("Entry-Modal-Overlay--visible");

        fetch("/contest/api/my-works", { credentials: "same-origin" })
            .then(function (res) {
                if (!res.ok) throw new Error("로그인이 필요합니다");
                return res.json();
            })
            .then(function (works) {
                renderEntryWorks(works);
            })
            .catch(function () {
                body.innerHTML = '<div class="Entry-Modal-Empty">로그인이 필요합니다.</div>';
            });
    }

    function renderEntryWorks(works) {
        var body = document.getElementById("entryModalBody");
        body.innerHTML = "";

        if (!works || works.length === 0) {
            body.innerHTML = '<div class="Entry-Modal-Empty">출품 가능한 작품이 없습니다.</div>';
            return;
        }

        works.forEach(function (work) {
            var card = document.createElement("div");
            card.className = "Entry-Work-Card";
            card.setAttribute("data-work-id", work.id);

            var thumbSrc = work.thumbnailUrl || "/images/default-contest.png";
            card.innerHTML =
                '<img class="Entry-Work-Thumb" alt="" src="' + thumbSrc + '" />' +
                '<div class="Entry-Work-Title">' + escapeHtml(work.title) + '</div>';

            card.addEventListener("click", function () {
                document.querySelectorAll(".Entry-Work-Card").forEach(function (el) {
                    el.classList.remove("Entry-Work-Card--selected");
                });
                card.classList.add("Entry-Work-Card--selected");
                selectedWorkId = work.id;
                document.getElementById("entryModalSubmitBtn").disabled = false;
            });

            body.appendChild(card);
        });
    }

    function closeEntryModal() {
        document.getElementById("entryModalOverlay").classList.remove("Entry-Modal-Overlay--visible");
        currentContestId = null;
        selectedWorkId = null;
    }

    function submitEntry() {
        if (!currentContestId || !selectedWorkId) return;

        fetch("/contest/api/" + currentContestId + "/entry", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ workId: selectedWorkId })
        })
        .then(function (res) {
            if (!res.ok) {
                return res.text().then(function (text) {
                    var msg = text;
                    try {
                        var json = JSON.parse(text);
                        msg = json.message || json.error || text;
                    } catch (e) {}
                    throw new Error(msg || ("HTTP " + res.status));
                });
            }
            return res.json();
        })
        .then(function () {
            alert("출품이 완료되었습니다.");
            closeEntryModal();
        })
        .catch(function (err) {
            console.error("출품 오류:", err);
            alert("출품 중 오류: " + (err.message || "알 수 없는 오류"));
        });
    }

    function initEntryModal() {
        document.getElementById("entryModalCloseBtn").addEventListener("click", closeEntryModal);
        document.getElementById("entryModalCancelBtn").addEventListener("click", closeEntryModal);
        document.getElementById("entryModalSubmitBtn").addEventListener("click", submitEntry);
        document.getElementById("entryModalOverlay").addEventListener("click", function (e) {
            if (e.target.id === "entryModalOverlay") closeEntryModal();
        });
    }

    /* ───── 초기화 ───── */
    function init() {
        initFilters();
        initEntryModal();
        applyInitialScopeFromUrl();
        resetList();
    }

    function applyInitialScopeFromUrl() {
        var params = new URLSearchParams(window.location.search);
        var scope = params.get("scope");
        if (scope !== "joined" && scope !== "mine") return;
        var btn = document.querySelector('.Contest-Filter-Btn--toggle[data-scope="' + scope + '"]');
        if (!btn) return;
        document.querySelectorAll(".Contest-Filter-Btn--toggle").forEach(function (b) {
            b.classList.remove("Contest-Filter-Btn--selected");
        });
        btn.classList.add("Contest-Filter-Btn--selected");
        currentScope = scope;
    }

    return { init: init };

})();

document.addEventListener("DOMContentLoaded", ContestListModule.init);
