const ContestListModule = (function () {

    /* ───── 상태 ───── */
    var PAGE_SIZE = 10;
    var currentSort = "latest";
    var currentScope = null;
    var currentPage = 1;
    var totalPages = 0;
    var isLoading = false;
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
            credentials: "same-origin",
            redirect: "manual",
            headers: { "Accept": "application/json" }
        })
        .then(function (res) {
            if (res.type === "opaqueredirect" || res.status === 401 || res.status === 302) {
                throw new Error("인증이 만료되었습니다. 다시 로그인해 주세요.");
            }
            if (!res.ok) throw new Error("HTTP " + res.status);
            return res.json();
        })
        .then(function (data) {
            totalPages = data.totalPages || 0;
            var list = data.content || [];

            list.forEach(function (item) {
                itemsCache[item.id] = item;
            });

            var container = document.getElementById("contestList");
            container.innerHTML = "";
            renderItems(list, (page - 1) * PAGE_SIZE);
            currentPage = page;
            isLoading = false;

            renderPagination();

            window.scrollTo({ top: 0, behavior: "smooth" });
        })
        .catch(function (err) {
            console.error("공모전 목록 조회 실패:", err);
            isLoading = false;
            var nav = document.getElementById("contestPagination");
            if (nav) {
                nav.innerHTML = '<span class="Contest-Pagination-Ellipsis" style="color:#d32f2f;">'
                    + (err.message || "공모전을 불러오지 못했습니다.")
                    + '</span>';
            }
        });
    }

    /* ───── 페이지네이션 렌더링 ───── */
    function renderPagination() {
        var nav = document.getElementById("contestPagination");
        if (!nav) return;
        nav.innerHTML = "";

        if (totalPages <= 1) return;

        var WINDOW = 5; // 한 번에 보여줄 페이지 번호 수
        var half = Math.floor(WINDOW / 2);
        var start = Math.max(1, currentPage - half);
        var end = Math.min(totalPages, start + WINDOW - 1);
        if (end - start + 1 < WINDOW) {
            start = Math.max(1, end - WINDOW + 1);
        }

        nav.appendChild(createPageBtn("‹", currentPage - 1, currentPage <= 1, false));

        if (start > 1) {
            nav.appendChild(createPageBtn("1", 1, false, currentPage === 1));
            if (start > 2) nav.appendChild(createEllipsis());
        }

        for (var p = start; p <= end; p++) {
            nav.appendChild(createPageBtn(String(p), p, false, p === currentPage));
        }

        if (end < totalPages) {
            if (end < totalPages - 1) nav.appendChild(createEllipsis());
            nav.appendChild(createPageBtn(String(totalPages), totalPages, false, currentPage === totalPages));
        }

        nav.appendChild(createPageBtn("›", currentPage + 1, currentPage >= totalPages, false));
    }

    function createPageBtn(label, page, disabled, active) {
        var btn = document.createElement("button");
        btn.type = "button";
        btn.className = "Contest-Pagination-Btn" + (active ? " Contest-Pagination-Btn--active" : "");
        btn.textContent = label;
        if (disabled || active) btn.disabled = true;
        if (!disabled && !active) {
            btn.addEventListener("click", function () { goToPage(page); });
        }
        return btn;
    }

    function createEllipsis() {
        var span = document.createElement("span");
        span.className = "Contest-Pagination-Ellipsis";
        span.textContent = "…";
        return span;
    }

    function goToPage(page) {
        if (page < 1 || page > totalPages || page === currentPage || isLoading) return;
        fetchContestList(page);
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

        /* 공유 버튼 */
        var shareBtn = document.querySelector(".Contest-Detail-ShareBtn");
        if (shareBtn) {
            shareBtn.onclick = function () {
                openShareModal(data.id);
            };
        }

        /* 신고 버튼 */
        var reportBtn = document.querySelector(".Contest-Detail-ReportBtn");
        if (reportBtn) {
            reportBtn.onclick = function () {
                openReportModal();
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

    /* ───── 공유 모달 ───── */
    var shareState = {
        contestId: null,
        receiverMap: new Map(),
        selectedKeys: [],
        searchTimer: null
    };

    function openShareModal(contestId) {
        var overlay = document.getElementById("contestShareModal");
        var input = document.getElementById("contestShareLinkInput");
        if (!overlay || !input) return;

        shareState.contestId = contestId;
        shareState.selectedKeys = [];
        shareState.receiverMap = new Map();

        var shareUrl = window.location.origin + "/contest/list?id=" + encodeURIComponent(contestId);
        input.value = shareUrl;

        renderShareChips();
        searchShareReceivers("");

        overlay.hidden = false;
        overlay.setAttribute("aria-hidden", "false");
    }

    function closeShareModal() {
        var overlay = document.getElementById("contestShareModal");
        if (!overlay) return;
        overlay.hidden = true;
        overlay.setAttribute("aria-hidden", "true");
        var msg = document.getElementById("contestShareMessage");
        if (msg) msg.value = "";
        var search = document.getElementById("contestShareSearch");
        if (search) search.value = "";
        shareState.contestId = null;
        shareState.selectedKeys = [];
        shareState.receiverMap = new Map();
    }

    function copyShareLink() {
        var input = document.getElementById("contestShareLinkInput");
        if (!input || !input.value) return;
        var url = input.value;

        var done = function () {
            var btn = document.getElementById("contestShareLinkCopy");
            if (!btn) return;
            var original = btn.textContent;
            btn.textContent = "복사됨";
            setTimeout(function () { btn.textContent = original; }, 1500);
        };

        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(url).then(done).catch(function () {
                input.select();
                document.execCommand("copy");
                done();
            });
        } else {
            input.select();
            document.execCommand("copy");
            done();
        }
    }

    function searchShareReceivers(keyword) {
        if (!shareState.contestId) return;
        var list = document.getElementById("contestShareList");
        if (!list) return;

        fetch("/contest/api/" + shareState.contestId + "/share/receivers?keyword=" + encodeURIComponent(keyword || ""), {
            credentials: "same-origin",
            headers: { "Accept": "application/json" }
        })
        .then(function (res) {
            if (!res.ok) throw new Error("HTTP " + res.status);
            return res.json();
        })
        .then(function (users) {
            (users || []).forEach(function (user) {
                shareState.receiverMap.set(user.nickname, user);
            });

            if (!users || users.length === 0) {
                list.innerHTML = '<div class="work-share-empty"><div class="work-share-empty__title">검색 결과가 없습니다</div></div>';
                return;
            }

            list.innerHTML = users.map(function (user) {
                var key = user.nickname;
                var nickname = user.nickname || "user";
                var avatarHtml = user.profileImage
                    ? '<span class="work-share-user__avatar"><img src="' + escapeHtml(user.profileImage) + '" alt="' + escapeHtml(nickname) + ' 프로필 이미지" onerror="this.onerror=null;this.remove();"></span>'
                    : '<span class="work-share-user__avatar">' + escapeHtml((nickname.charAt(0) || "?").toUpperCase()) + '</span>';
                var isSelected = shareState.selectedKeys.indexOf(key) >= 0;
                return '<button type="button" class="work-share-user' + (isSelected ? ' is-selected' : '') + '" data-share-user="' + escapeHtml(key) + '">' +
                       avatarHtml +
                       '<span class="work-share-user__meta">' +
                         '<strong>' + escapeHtml(nickname) + '</strong>' +
                         '<small>' + escapeHtml(user.creatorVerified ? '크리에이터 인증' : '일반 회원') + '</small>' +
                       '</span>' +
                       '</button>';
            }).join("");

            list.querySelectorAll("[data-share-user]").forEach(function (btn) {
                btn.addEventListener("click", function () {
                    toggleReceiver(btn.getAttribute("data-share-user"));
                });
            });
        })
        .catch(function () {
            list.innerHTML = '<div class="work-share-empty"><div class="work-share-empty__title">불러오지 못했습니다</div><p class="work-share-empty__copy">로그인 상태를 확인해 주세요.</p></div>';
        });
    }

    function toggleReceiver(key) {
        var idx = shareState.selectedKeys.indexOf(key);
        if (idx >= 0) {
            shareState.selectedKeys.splice(idx, 1);
        } else {
            shareState.selectedKeys.push(key);
        }
        renderShareChips();
        var search = document.getElementById("contestShareSearch");
        searchShareReceivers(search ? search.value : "");
    }

    function renderShareChips() {
        var chipsEl = document.getElementById("contestShareChips");
        if (!chipsEl) return;
        chipsEl.innerHTML = shareState.selectedKeys.map(function (key) {
            return '<span class="work-share-chip">' +
                   '<span class="work-share-chip__text">' + escapeHtml(key) + '</span>' +
                   '<button type="button" class="work-share-chip__remove" data-share-chip-remove="' + escapeHtml(key) + '" aria-label="삭제">×</button>' +
                   '</span>';
        }).join("");
        chipsEl.querySelectorAll("[data-share-chip-remove]").forEach(function (btn) {
            btn.addEventListener("click", function () {
                toggleReceiver(btn.getAttribute("data-share-chip-remove"));
            });
        });
    }

    function sendShareMessage() {
        if (!shareState.contestId) return;
        if (shareState.selectedKeys.length === 0) {
            alert("받는 사람을 선택해 주세요.");
            return;
        }
        var receiverIds = shareState.selectedKeys
            .map(function (key) {
                var u = shareState.receiverMap.get(key);
                return u ? u.id : null;
            })
            .filter(function (v) { return v != null; });

        var msgEl = document.getElementById("contestShareMessage");
        var linkEl = document.getElementById("contestShareLinkInput");

        fetch("/contest/api/" + shareState.contestId + "/share", {
            method: "POST",
            credentials: "same-origin",
            headers: { "Content-Type": "application/json", "Accept": "application/json" },
            body: JSON.stringify({
                receiverIds: receiverIds,
                message: msgEl ? msgEl.value : "",
                shareUrl: linkEl ? linkEl.value : ""
            })
        })
        .then(function (res) {
            return res.json().then(function (body) { return { ok: res.ok, body: body }; });
        })
        .then(function (result) {
            if (!result.ok || !result.body.success) {
                throw new Error(result.body.message || "공유에 실패했습니다.");
            }
            alert("공유 메시지를 전송했습니다.");
            closeShareModal();
        })
        .catch(function (err) {
            alert(err.message || "공유 중 오류가 발생했습니다.");
        });
    }

    function initShareModal() {
        var closeBtn = document.getElementById("contestShareModalClose");
        var copyBtn = document.getElementById("contestShareLinkCopy");
        var sendBtn = document.getElementById("contestShareSend");
        var overlay = document.getElementById("contestShareModal");
        var search = document.getElementById("contestShareSearch");

        if (closeBtn) closeBtn.addEventListener("click", closeShareModal);
        if (copyBtn) copyBtn.addEventListener("click", copyShareLink);
        if (sendBtn) sendBtn.addEventListener("click", sendShareMessage);
        if (overlay) overlay.addEventListener("click", function (e) {
            if (e.target === overlay) closeShareModal();
        });
        if (search) {
            search.addEventListener("input", function () {
                clearTimeout(shareState.searchTimer);
                var keyword = search.value;
                shareState.searchTimer = setTimeout(function () {
                    searchShareReceivers(keyword);
                }, 200);
            });
        }
    }

    /* ───── 신고 모달 (작품 상세 workdetail.js 와 동일 동작) ───── */
    function syncReportNextButton() {
        var nextBtn = document.querySelector('[data-role="report-next-button"]');
        if (!nextBtn) return;
        var inputs = document.querySelectorAll('input[name="report-form-reason-select-page"]');
        var hasSelection = Array.prototype.some.call(inputs, function (i) { return i.checked; });
        nextBtn.disabled = !hasSelection;
        nextBtn.setAttribute("aria-disabled", hasSelection ? "false" : "true");
        nextBtn.style.background = hasSelection ? "#0f0f0f" : "#e5e7eb";
        nextBtn.style.color = hasSelection ? "#ffffff" : "#9ca3af";
        nextBtn.style.cursor = hasSelection ? "pointer" : "default";
    }

    function openReportModal() {
        var backdrop = document.querySelector('[data-role="report-modal-backdrop"]');
        var confirmation = document.querySelector('[data-role="report-confirmation-backdrop"]');
        var step = document.querySelector('[data-role="report-step-reasons"]');
        if (!backdrop) return;
        var inputs = document.querySelectorAll('input[name="report-form-reason-select-page"]');
        Array.prototype.forEach.call(inputs, function (i) { i.checked = false; });
        if (step) step.hidden = false;
        syncReportNextButton();
        backdrop.hidden = false;
        if (confirmation) confirmation.hidden = true;
    }

    function closeReportModal() {
        var backdrop = document.querySelector('[data-role="report-modal-backdrop"]');
        if (backdrop) backdrop.hidden = true;
    }

    function openReportConfirmation() {
        var confirmation = document.querySelector('[data-role="report-confirmation-backdrop"]');
        if (confirmation) confirmation.hidden = false;
    }

    function closeReportConfirmation() {
        var confirmation = document.querySelector('[data-role="report-confirmation-backdrop"]');
        if (confirmation) confirmation.hidden = true;
    }

    function initReportModal() {
        var backdrop = document.querySelector('[data-role="report-modal-backdrop"]');
        var close = document.querySelector('[data-role="report-modal-close"]');
        var next = document.querySelector('[data-role="report-next-button"]');
        var confirmation = document.querySelector('[data-role="report-confirmation-backdrop"]');
        var confirmClose = document.querySelector('[data-role="report-confirmation-close"]');
        var confirmBtn = document.querySelector('[data-role="report-confirm-button"]');
        var inputs = document.querySelectorAll('input[name="report-form-reason-select-page"]');

        if (close) close.addEventListener("click", closeReportModal);
        if (backdrop) {
            backdrop.addEventListener("click", function (e) {
                if (e.target === backdrop) closeReportModal();
            });
        }
        if (confirmation) {
            confirmation.addEventListener("click", function (e) {
                if (e.target === confirmation) closeReportConfirmation();
            });
        }
        if (confirmClose) confirmClose.addEventListener("click", closeReportConfirmation);
        if (confirmBtn) confirmBtn.addEventListener("click", closeReportConfirmation);
        Array.prototype.forEach.call(inputs, function (input) {
            input.addEventListener("change", syncReportNextButton);
        });
        if (next) {
            next.addEventListener("click", function () {
                if (!next.disabled) {
                    closeReportModal();
                    openReportConfirmation();
                }
            });
        }
        document.addEventListener("keydown", function (e) {
            if (e.key !== "Escape") return;
            if (backdrop && !backdrop.hidden) closeReportModal();
            if (confirmation && !confirmation.hidden) closeReportConfirmation();
        });
    }

    /* ───── 초기화 ───── */
    function init() {
        initFilters();
        initEntryModal();
        initShareModal();
        initReportModal();
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

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", ContestListModule.init);
} else {
    ContestListModule.init();
}
