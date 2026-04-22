const AuctionEvent = (() => {
    let isBound = false;
    let currentAuctionId = null;

    // 토스트
    const showToast = (message, type = "info") => {
        const toast = document.getElementById("auctionToast");
        const toastMessage = document.getElementById("auctionToastMessage");
        if (!toast || !toastMessage) return;

        toastMessage.textContent = message;
        toast.className = `Auction-Toast ${type}`;  // off 제거 + type 클래스
        toast.classList.remove("off");

        setTimeout(() => {
            toast.classList.add("off");
        }, 3000);
    };

    // 확인 모달
    const showConfirm = (message, onConfirm) => {
        const backdrop = document.getElementById("bidConfirmBackdrop");
        const confirmMessage = backdrop?.querySelector(".Auction-Modal-Message");
        const confirmOk = document.getElementById("bidConfirmOk");
        const confirmCancel = document.getElementById("bidConfirmCancel");

        if (!backdrop || !confirmOk || !confirmCancel) {
            // 모달 요소 없으면 바로 실행
            onConfirm();
            return;
        }

        if (confirmMessage) confirmMessage.textContent = message;
        backdrop.classList.remove("off");

        const close = () => backdrop.classList.add("off");

        const handleOk = () => {
            close();
            onConfirm();
            confirmOk.removeEventListener("click", handleOk);
            confirmCancel.removeEventListener("click", handleCancel);
        };

        const handleCancel = () => {
            close();
            confirmOk.removeEventListener("click", handleOk);
            confirmCancel.removeEventListener("click", handleCancel);
        };

        confirmOk.addEventListener("click", handleOk);
        confirmCancel.addEventListener("click", handleCancel);
    };

    const bindEvents = () => {
        if (isBound) return;

        const elements = AuctionLayout.getElements(document);
        const { bidSubmitBtn, bidCustomInput, bidNextAmountEl, bidInfoBtn, bidInfoTooltip } = elements;

        if (!bidSubmitBtn || !bidNextAmountEl) return;

        bidInfoBtn?.addEventListener("click", (event) => {
            event.stopPropagation();
            bidInfoTooltip?.classList.toggle("on");
        });

        document.addEventListener("click", () => {
            bidInfoTooltip?.classList.remove("on");
        });

        bidCustomInput?.addEventListener("input", () => {
            bidCustomInput.value = bidCustomInput.value.replace(/[^0-9]/g, "");

            const minAmount = AuctionLayout.getMinAmount(elements);
            const inputValue = bidCustomInput.value.trim();

            if (!inputValue) {
                bidNextAmountEl.textContent = `${minAmount.toLocaleString("ko-KR")}원으로 입찰하기`;
                AuctionLayout.setInputError(elements, false);
                return;
            }

            const inputAmount = parseInt(inputValue, 10);
            if (Number.isNaN(inputAmount) || inputAmount < minAmount) {
                AuctionLayout.setInputError(elements, true);
                return;
            }

            bidNextAmountEl.textContent = `${inputAmount.toLocaleString("ko-KR")}원으로 입찰하기`;
            AuctionLayout.setInputError(elements, false);
        });

        bidSubmitBtn.addEventListener("click", () => {
            const instantCheck = document.getElementById("instantBidCheck");

            const minAmount = AuctionLayout.getMinAmount(elements);
            const inputValue = bidCustomInput?.value.trim();
            const bidAmount = inputValue ? parseInt(inputValue, 10) : minAmount;

            // 최소 금액 미만이면 토스트 후 return
            if (Number.isNaN(bidAmount) || bidAmount < minAmount) {
                AuctionLayout.setInputError(elements, true);
                bidCustomInput?.focus();
                showToast(`최소 입찰가(${minAmount.toLocaleString("ko-KR")}원) 이상으로 입찰해주세요.`, "error");
                return;
            }

            // 즉시 입찰 체크 시 확인 모달 없이 바로 입찰
            if (instantCheck?.checked) {
                AuctionLayout.executeBid(elements, currentAuctionId);
                return;
            }

            // 확인 모달 띄우기
            showConfirm(
                `${bidAmount.toLocaleString("ko-KR")}원으로 입찰하시겠습니까?`,
                () => AuctionLayout.executeBid(elements, currentAuctionId)
            );
        });

        isBound = true;
    };

    const setAuctionId = (id) => {
        currentAuctionId = id;
        isBound = false;
    };

    return {
        bindEvents: bindEvents,
        setAuctionId: setAuctionId,
        showToast: showToast
    };
})();