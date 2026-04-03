const AuctionLayout = (() => {
    let countdownTimerId = null;

    function startCountdown(closingAt, root = document) {
        const cdDay = root.getElementById("cdDay");
        const cdHour = root.getElementById("cdHour");
        const cdMin = root.getElementById("cdMin");
        const cdSec = root.getElementById("cdSec");
        const auctionDeadlineDate = root.getElementById("auctionDeadlineDate");

        const endTime = new Date(closingAt);
        if (Number.isNaN(endTime.getTime()) || !cdDay || !cdHour || !cdMin || !cdSec || !auctionDeadlineDate) {
            return;
        }

        if (countdownTimerId) {
            window.clearInterval(countdownTimerId);
        }

        function update() {
            const diff = endTime.getTime() - Date.now();

            if (diff <= 0) {
                cdDay.textContent = "00";
                cdHour.textContent = "00";
                cdMin.textContent = "00";
                cdSec.textContent = "00";
                auctionDeadlineDate.textContent = "경매가 종료되었습니다.";
                window.clearInterval(countdownTimerId);
                countdownTimerId = null;
                return;
            }

            const d = Math.floor(diff / 86400000);
            const h = Math.floor((diff % 86400000) / 3600000);
            const m = Math.floor((diff % 3600000) / 60000);
            const s = Math.floor((diff % 60000) / 1000);

            cdDay.textContent = String(d).padStart(2, "0");
            cdHour.textContent = String(h).padStart(2, "0");
            cdMin.textContent = String(m).padStart(2, "0");
            cdSec.textContent = String(s).padStart(2, "0");
        }

        update();
        countdownTimerId = window.setInterval(update, 1000);
    }

    function formatDeadline(value) {
        if (!value) {
            return "";
        }

        const date = new Date(value);
        if (Number.isNaN(date.getTime())) {
            return "";
        }

        return `마감 ${date.toLocaleString("ko-KR", {
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit",
            hour12: true
        })}`;
    }

    function init(root = document) {
        const auctionDeadlineDate = root.getElementById("auctionDeadlineDate");
        const mockClosingAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

        if (auctionDeadlineDate) {
            auctionDeadlineDate.textContent = formatDeadline(mockClosingAt);
        }

        startCountdown(mockClosingAt, root);
    }

    return {
        startCountdown,
        init
    };
})();
