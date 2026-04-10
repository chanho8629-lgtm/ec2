const AuctionLayout = (() => {
    let countdownTimerId = null;

    const getElements = (root = document) => ({
        bidSubmitBtn: root.getElementById("bidSubmitBtn"),
        bidCustomInput: root.getElementById("bidCustomInput"),
        bidNextAmountEl: root.getElementById("bidNextAmount"),
        bidInfoBtn: root.getElementById("bidInfoBtn"),
        bidInfoTooltip: root.getElementById("bidInfoTooltip")
    });

    const getMinAmount = (elements) =>
        parseInt(elements.bidNextAmountEl?.dataset.amount || "0", 10);

    const setInputError = (elements, isError) => {
        const bidInputWrapper = elements.bidCustomInput?.closest(".Auction-Bid-InputWrapper");
        bidInputWrapper?.classList.toggle("is-error", isError);
    };

    const executeBid = (elements, auctionId) => {
        const minAmount = getMinAmount(elements);
        const inputValue = elements.bidCustomInput?.value.trim();
        const bidAmount = inputValue ? parseInt(inputValue, 10) : minAmount;

        if (Number.isNaN(bidAmount) || bidAmount < minAmount) {
            setInputError(elements, true);
            elements.bidCustomInput?.focus();
            return;
        }

        setInputError(elements, false);
        if (elements.bidCustomInput) {
            elements.bidCustomInput.value = "";
        }
        if (elements.bidNextAmountEl) {
            elements.bidNextAmountEl.textContent = `${minAmount.toLocaleString("ko-KR")}원으로 입찰하기`;
        }

        AuctionSocket.sendBid(auctionId, bidAmount);
    };

    const init = (auction, root = document) => {
        const deadlineEl = root.getElementById("auctionDeadlineDate");
        if (deadlineEl) {
            deadlineEl.textContent = formatDeadline(auction.closingAt);
        }

        const bidHistoryCount = root.getElementById("bidHistoryCount");
        if (bidHistoryCount) {
            bidHistoryCount.textContent = `${(auction.bidCount ?? 0).toLocaleString()}건`;
        }

        const bidHistoryList = root.getElementById("bidHistoryList");
        const bidHistoryEmpty = root.getElementById("bidHistoryEmpty");
        if (bidHistoryList) {
            bidHistoryList.querySelectorAll(".Auction-Bid-Item").forEach(el => el.remove());

            if (Array.isArray(auction.bids) && auction.bids.length > 0) {
                if (bidHistoryEmpty) bidHistoryEmpty.hidden = true;   // ← 입찰 있으면 empty 숨김
                auction.bids
                    .filter(bid => bid && bid.memberNickname && bid.bidPrice)
                    .reverse()
                    .forEach(bid => AuctionSocket.appendBidItem(bid));
            } else {
                if (bidHistoryEmpty) bidHistoryEmpty.hidden = false;  // ← 입찰 없으면 empty 표시
            }
        }

        const currentHighestPrice = root.getElementById("currentHighestPrice");
        if (currentHighestPrice) {
            currentHighestPrice.textContent = `${(auction.currentPrice ?? 0).toLocaleString()}원`;
        }

        const minNextBid = Math.round((auction.currentPrice ?? 0) * 1.1);
        const bidNextAmount = root.getElementById("bidNextAmount");
        if (bidNextAmount) {
            bidNextAmount.textContent = `${minNextBid.toLocaleString()}원으로 입찰하기`;
            bidNextAmount.dataset.amount = minNextBid;
        }

        startCountdown(auction.closingAt, root);
    };


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

    return {
        init: init,
        getElements: getElements,
        getMinAmount: getMinAmount,
        setInputError: setInputError,
        executeBid: executeBid,
    };
})();
