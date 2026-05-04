document.addEventListener("DOMContentLoaded", function () {

    var listEl = document.getElementById("downloadsList");
    var subtitleEl = document.getElementById("shelfSubtitle");
    var emptyStateEl = document.getElementById("downloadsEmptyState");
    var filterBtns = document.querySelectorAll(".Downloads-Filter-Btn");

    var allItems = [];
    var currentFilter = "all";

    /* ───── HTML escape ───── */
    function escapeHtml(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;");
    }

    /* ───── 상대 시간 포맷 ───── */
    function formatDate(dt) {
        if (!dt) return "";
        var d = new Date(dt);
        if (isNaN(d.getTime())) return "";
        var y = d.getFullYear();
        var m = String(d.getMonth() + 1).padStart(2, "0");
        var day = String(d.getDate()).padStart(2, "0");
        return y + "." + m + "." + day;
    }

    /* ───── 타입 라벨 ───── */
    function typeLabel(type) {
        switch (type) {
            case "WORK": return "작품";
            case "CONTEST": return "공모전";
            case "GALLERY": return "갤러리";
            case "AUCTION": return "경매";
            default: return type || "";
        }
    }

    /* ───── 클릭 시 이동 URL ───── */
    function buildHref(item) {
        switch (item.targetType) {
            case "CONTEST": return "/contest/list";
            case "WORK": return "/work/detail/" + item.targetId;
            case "GALLERY": return "/gallery/" + item.targetId;
            case "AUCTION": return "/auction/detail/" + item.targetId;
            default: return "#";
        }
    }

    /* ───── 카드 렌더링 ───── */
    function renderItems() {
        listEl.innerHTML = "";

        var filtered = allItems.filter(function (item) {
            if (currentFilter === "all") return true;
            return item.targetType === currentFilter;
        });

        if (filtered.length === 0) {
            subtitleEl.textContent = "콘텐츠 없음";
            emptyStateEl.style.display = "";
            return;
        }

        emptyStateEl.style.display = "none";

        var counts = {};
        filtered.forEach(function (item) {
            counts[item.targetType] = (counts[item.targetType] || 0) + 1;

            var thumb = item.thumbnail || "https://www.gstatic.com/youtube/img/useredu/downloads_empty_state.png";
            var href = buildHref(item);

            var div = document.createElement("div");
            div.className = "Downloads-Video-Item";
            div.setAttribute("data-type", item.targetType);
            div.innerHTML =
                '<div class="Downloads-Video-Card">' +
                    '<div class="Downloads-Video-Thumbnail">' +
                        '<a class="Downloads-Thumbnail-Link" href="' + href + '">' +
                            '<img class="Downloads-Thumbnail-Image" alt="" src="' + escapeHtml(thumb) + '" />' +
                        '</a>' +
                    '</div>' +
                    '<div class="Downloads-Video-Details">' +
                        '<div class="Downloads-Video-Meta">' +
                            '<h3 class="Downloads-Video-TitleWrap">' +
                                '<a class="Downloads-Video-TitleLink" href="' + href + '">' +
                                    '<span class="Downloads-Video-Title">' + escapeHtml(item.title || "(제목 없음)") + '</span>' +
                                '</a>' +
                            '</h3>' +
                            '<div class="Downloads-Video-Metadata">' +
                                '<div class="Downloads-Channel-Name">' + escapeHtml(typeLabel(item.targetType)) + '</div>' +
                                '<div class="Downloads-Meta-Line">' +
                                    '<span class="Downloads-Meta-Item">' + escapeHtml(formatDate(item.createdDatetime)) + '</span>' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>' +
                '</div>';

            listEl.appendChild(div);
        });

        var parts = [];
        if (counts.WORK) parts.push("작품 " + counts.WORK + "개");
        if (counts.CONTEST) parts.push("공모전 " + counts.CONTEST + "개");
        if (counts.GALLERY) parts.push("갤러리 " + counts.GALLERY + "개");
        if (counts.AUCTION) parts.push("경매 " + counts.AUCTION + "개");
        subtitleEl.textContent = parts.length > 0 ? parts.join(", ") : "총 " + filtered.length + "개";
    }

    /* ───── 데이터 로드 ───── */
    function loadBookmarks() {
        listEl.innerHTML = '<div style="padding:24px;text-align:center;color:#888;">불러오는 중...</div>';

        fetch("/api/bookmarks/my", { credentials: "same-origin" })
            .then(function (res) {
                if (!res.ok) throw new Error("로그인이 필요합니다");
                return res.json();
            })
            .then(function (data) {
                allItems = Array.isArray(data) ? data : [];
                renderItems();
            })
            .catch(function () {
                allItems = [];
                listEl.innerHTML = '<div style="padding:24px;text-align:center;color:#888;">로그인이 필요합니다.</div>';
                subtitleEl.textContent = "콘텐츠 없음";
                emptyStateEl.style.display = "";
            });
    }

    /* ───── 필터 버튼 ───── */
    var filterMap = { "all": "all", "video": "WORK", "contest": "CONTEST" };
    filterBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
            filterBtns.forEach(function (b) { b.classList.remove("Downloads-Filter-Btn--active"); });
            btn.classList.add("Downloads-Filter-Btn--active");
            var key = btn.getAttribute("data-filter");
            currentFilter = filterMap[key] || "all";
            renderItems();
        });
    });

    /* ───── 초기화 ───── */
    loadBookmarks();
});
