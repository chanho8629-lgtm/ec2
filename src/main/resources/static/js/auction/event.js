const AuctionEvent = (() => {
    let isBound = false;

    function getElements(root = document) {
        return {
            bidSubmitBtn: root.getElementById("bidSubmitBtn"),
            bidCustomInput: root.getElementById("bidCustomInput"),
            bidNextAmountEl: root.getElementById("bidNextAmount"),
            bidInfoBtn: root.getElementById("bidInfoBtn"),
            bidInfoTooltip: root.getElementById("bidInfoTooltip")
        };
    }

    function getMinAmount(elements) {
        return parseInt(elements.bidNextAmountEl?.dataset.amount || "0", 10);
    }

    function setInputError(elements, isError) {
        const bidInputWrapper = elements.bidCustomInput?.closest(".Auction-Bid-InputWrapper");
        bidInputWrapper?.classList.toggle("is-error", isError);
    }

    function executeBid(elements) {
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
    }

    function init(root = document) {
        const elements = getElements(root);
        const { bidSubmitBtn, bidCustomInput, bidNextAmountEl, bidInfoBtn, bidInfoTooltip } = elements;

        if (!bidSubmitBtn || !bidNextAmountEl) {
            return;
        }

        if (!isBound) {
            bidInfoBtn?.addEventListener("click", (event) => {
                event.stopPropagation();
                bidInfoTooltip?.classList.toggle("on");
            });

            document.addEventListener("click", () => {
                bidInfoTooltip?.classList.remove("on");
            });

            bidCustomInput?.addEventListener("input", () => {
                bidCustomInput.value = bidCustomInput.value.replace(/[^0-9]/g, "");

                const minAmount = getMinAmount(elements);
                const inputValue = bidCustomInput.value.trim();

                if (!inputValue) {
                    bidNextAmountEl.textContent = `${minAmount.toLocaleString("ko-KR")}원으로 입찰하기`;
                    setInputError(elements, false);
                    return;
                }

                const inputAmount = parseInt(inputValue, 10);
                if (Number.isNaN(inputAmount) || inputAmount < minAmount) {
                    setInputError(elements, true);
                    return;
                }

                bidNextAmountEl.textContent = `${inputAmount.toLocaleString("ko-KR")}원으로 입찰하기`;
                setInputError(elements, false);
            });

            bidSubmitBtn.addEventListener("click", () => {
                executeBid(elements);
            });

            isBound = true;
        }

        AuctionLayout.init(root);
    }

    if (document.readyState === "complete") {
        init(document);
    } else {
        window.addEventListener("load", () => init(document), { once: true });
    }

    return { init };
})();
