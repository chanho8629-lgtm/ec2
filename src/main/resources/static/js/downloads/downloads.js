document.addEventListener("DOMContentLoaded", function () {

    var filterBtns = document.querySelectorAll(".Downloads-Filter-Btn");
    var items = document.querySelectorAll(".Downloads-Video-Item[data-type]");
    var subtitle = document.getElementById("shelfSubtitle");

    function applyFilter(type) {
        var videoCount = 0;
        var contestCount = 0;

        items.forEach(function (item) {
            var itemType = item.getAttribute("data-type");
            if (type === "all" || itemType === type) {
                item.style.display = "";
                if (itemType === "video") videoCount++;
                if (itemType === "contest") contestCount++;
            } else {
                item.style.display = "none";
            }
        });

        // 서브타이틀 업데이트
        var parts = [];
        if (videoCount > 0) parts.push("동영상 " + videoCount + "개");
        if (contestCount > 0) parts.push("공모전 " + contestCount + "개");
        subtitle.textContent = parts.length > 0 ? parts.join(", ") : "콘텐츠 없음";
    }

    filterBtns.forEach(function (btn) {
        btn.addEventListener("click", function () {
            filterBtns.forEach(function (b) { b.classList.remove("Downloads-Filter-Btn--active"); });
            btn.classList.add("Downloads-Filter-Btn--active");
            applyFilter(btn.getAttribute("data-filter"));
        });
    });

    // 초기 상태
    applyFilter("all");

});
