let selectedPayMethod = "bootpay";
let paymentContext = {
    paymentId: null,
    payment: null,
    workId: null,
    auctionId: null,
    work: null,
    auction: null,
    cards: []
};

function requestJson(url, options) {
    return fetch(url, Object.assign({
        credentials: "same-origin",
        headers: {
            "Content-Type": "application/json"
        }
    }, options || {})).then(async (response) => {
        if (!response.ok) {
            const text = await response.text();
            throw new Error(text || "요청 처리 중 오류가 발생했습니다.");
        }

        if (response.status === 204) {
            return null;
        }

        const contentType = response.headers.get("content-type") || "";
        return contentType.includes("application/json") ? response.json() : null;
    });
}

function formatCurrency(value) {
    return `${new Intl.NumberFormat("ko-KR").format(Number(value) || 0)}원`;
}

function resolveWorkId() {
    const params = new URLSearchParams(window.location.search);
    const value = Number(params.get("workId"));
    return Number.isFinite(value) && value > 0 ? value : null;
}

function resolveAuctionId() {
    const params = new URLSearchParams(window.location.search);
    const value = Number(params.get("auctionId"));
    return Number.isFinite(value) && value > 0 ? value : null;
}

function resolvePaymentId() {
    const params = new URLSearchParams(window.location.search);
    const value = Number(params.get("paymentId"));
    return Number.isFinite(value) && value > 0 ? value : null;
}

function selectPayMethod(method) {
    selectedPayMethod = method;
    ["bootpay"].forEach((name) => {
        const element = document.getElementById(`method-${name}`);
        if (element) {
            element.classList.toggle("selected", name === method);
        }
    });
}

function getThumbnailUrl(work) {
    if (!work) {
        return "/images/BIDEO_LOGO/BIDEO.png";
    }

    const files = Array.isArray(work.files) ? work.files : [];
    const imageFile = files.find((file) => String(file?.fileType || "").startsWith("image/"));
    return imageFile?.fileUrl || "/images/BIDEO_LOGO/BIDEO.png";
}

function syncPaymentSummaryFromPayment() {
    const payment = paymentContext.payment;
    if (!payment) {
        return false;
    }

    const originalPrice = Number(payment.originalAmount) || 0;
    const feePrice = Number(payment.totalFee) || 0;
    const totalPrice = Number(payment.totalPrice) || 0;

    document.getElementById("productImage").src = payment.workThumbnail || "/images/BIDEO_LOGO/BIDEO.png";
    document.getElementById("creatorName").textContent = payment.sellerNickname || "판매자";
    document.getElementById("productName").textContent = payment.workTitle || "낙찰 작품";
    document.getElementById("licenseTypeLabel").textContent = payment.auctionId
        ? "경매 낙찰"
        : (payment.licenseType || "라이선스 미정");
    document.getElementById("displayOriginalPrice").textContent = formatCurrency(originalPrice);
    document.getElementById("displayFeePrice").textContent = formatCurrency(feePrice);
    document.getElementById("displayTotalPrice").textContent = formatCurrency(totalPrice);
    document.getElementById("paySubmitLabel").textContent = `${formatCurrency(totalPrice)} 결제하기`;

    const hasRegisteredCard = Array.isArray(paymentContext.cards) && paymentContext.cards.length > 0;
    document.getElementById("paymentStatusText").textContent = hasRegisteredCard
        ? "대표 카드가 있으면 부트페이 간편결제로 바로 승인 요청합니다."
        : "대시보드에서 카드를 먼저 등록해야 간편결제를 진행할 수 있습니다.";

    const submitButton = document.getElementById("paySubmitButton");
    if (submitButton) {
        submitButton.disabled = !hasRegisteredCard;
    }

    return true;
}

function syncPaymentSummary() {
    const work = paymentContext.work;
    const auction = paymentContext.auction;
    if (!work && !auction) {
        return syncPaymentSummaryFromPayment();
    }

    const originalPrice = paymentContext.auctionId
        ? Number(auction?.finalPrice || auction?.currentPrice || 0)
        : Number(work?.price) || 0;
    const feePrice = Math.floor(originalPrice * 0.1);
    const totalPrice = originalPrice + feePrice;

    document.getElementById("productImage").src = paymentContext.auctionId
        ? (auction?.workThumbnail || "/images/BIDEO_LOGO/BIDEO.png")
        : getThumbnailUrl(work);
    document.getElementById("creatorName").textContent = paymentContext.auctionId
        ? (auction?.sellerNickname || "판매자")
        : (work?.memberNickname || "작가명");
    document.getElementById("productName").textContent = paymentContext.auctionId
        ? (auction?.workTitle || "낙찰 작품")
        : (work?.title || "작품명");
    document.getElementById("licenseTypeLabel").textContent = paymentContext.auctionId
        ? "경매 낙찰"
        : (work?.licenseType || "라이선스 미정");
    document.getElementById("displayOriginalPrice").textContent = formatCurrency(originalPrice);
    document.getElementById("displayFeePrice").textContent = formatCurrency(feePrice);
    document.getElementById("displayTotalPrice").textContent = formatCurrency(totalPrice);
    document.getElementById("paySubmitLabel").textContent = `${formatCurrency(totalPrice)} 결제하기`;

    const hasRegisteredCard = Array.isArray(paymentContext.cards) && paymentContext.cards.length > 0;
    document.getElementById("paymentStatusText").textContent = hasRegisteredCard
        ? "대표 카드가 있으면 부트페이 간편결제로 바로 승인 요청합니다."
        : "대시보드에서 카드를 먼저 등록해야 간편결제를 진행할 수 있습니다.";

    const submitButton = document.getElementById("paySubmitButton");
    if (submitButton) {
        submitButton.disabled = !hasRegisteredCard;
    }
}

async function createOrderForPayment() {
    if (paymentContext.paymentId) {
        return null;
    }

    return requestJson("/api/orders", {
        method: "POST",
        body: JSON.stringify({
            workId: paymentContext.workId,
            auctionId: paymentContext.auctionId,
            orderType: paymentContext.auctionId ? "AUCTION" : "DIRECT",
            licenseType: paymentContext.work?.licenseType || null
        })
    });
}

async function requestEasyPayment(order) {
    if (paymentContext.paymentId) {
        return requestJson(`/api/payments/${paymentContext.paymentId}/easy`, {
            method: "POST"
        });
    }

    return requestJson("/api/payments/easy", {
        method: "POST",
        body: JSON.stringify({
            orderCode: order.orderCode,
            cardId: null,
            payMethod: selectedPayMethod === "bootpay" ? "BOOTPAY_BILLING" : "CARD",
            paymentPurpose: "PURCHASE"
        })
    });
}

async function submitPayment() {
    if (!paymentContext.paymentId && !paymentContext.workId && !paymentContext.auctionId) {
        window.alert("결제할 정보를 찾을 수 없습니다.");
        return;
    }

    if (!Array.isArray(paymentContext.cards) || paymentContext.cards.length === 0) {
        window.alert("등록된 카드가 없습니다. 대시보드에서 카드를 먼저 등록해 주세요.");
        return;
    }

    const submitButton = document.getElementById("paySubmitButton");
    const statusLabel = document.getElementById("paymentStateLabel");

    try {
        if (submitButton) {
            submitButton.disabled = true;
        }
        if (statusLabel) {
            statusLabel.textContent = "결제 요청 중";
        }

        const order = await createOrderForPayment();
        await requestEasyPayment(order);

        if (statusLabel) {
            statusLabel.textContent = "결제 완료";
        }
        window.alert("등록 카드 간편결제가 완료되었습니다.");
        window.location.href = "/dashboard?tab=payment";
    } catch (error) {
        if (statusLabel) {
            statusLabel.textContent = "결제 대기";
        }
        window.alert(error.message || "간편결제 처리에 실패했습니다.");
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
        }
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    paymentContext.paymentId = resolvePaymentId();
    paymentContext.workId = resolveWorkId();
    paymentContext.auctionId = resolveAuctionId();
    selectPayMethod("bootpay");

    if (!paymentContext.paymentId && !paymentContext.workId && !paymentContext.auctionId) {
        window.alert("결제 정보가 없어 결제 화면을 열 수 없습니다.");
        return;
    }

    try {
        if (!paymentContext.paymentId && paymentContext.auctionId) {
            try {
                paymentContext.payment = await requestJson(`/api/payments/pending/auction/${paymentContext.auctionId}`);
                paymentContext.paymentId = paymentContext.payment?.id || null;
                paymentContext.workId = paymentContext.payment?.workId || paymentContext.workId;
                syncPaymentSummaryFromPayment();
            } catch (pendingError) {
            }
        }

        if (paymentContext.paymentId) {
            paymentContext.payment = await requestJson(`/api/payments/${paymentContext.paymentId}`);
            paymentContext.workId = paymentContext.payment?.workId || null;
            paymentContext.auctionId = paymentContext.payment?.auctionId || null;
            syncPaymentSummaryFromPayment();
        }

        try {
            paymentContext.cards = await requestJson("/api/cards");
            paymentContext.cards = Array.isArray(paymentContext.cards) ? paymentContext.cards : [];
        } catch (cardError) {
            paymentContext.cards = [];
        }

        if (paymentContext.paymentId) {
            syncPaymentSummaryFromPayment();
        }

        if (paymentContext.auctionId || paymentContext.workId) {
            try {
                const detail = await (paymentContext.auctionId
                    ? requestJson(`/api/auction/id/${paymentContext.auctionId}`)
                    : requestJson(`/api/works/${paymentContext.workId}`));

                if (paymentContext.auctionId) {
                    paymentContext.auction = detail;
                    paymentContext.workId = detail?.workId || paymentContext.workId;
                } else {
                    paymentContext.work = detail;
                }
                syncPaymentSummary();
            } catch (detailError) {
                if (!paymentContext.paymentId) {
                    throw detailError;
                }
            }
        }
    } catch (error) {
        window.alert(error.message || "결제 정보를 불러오지 못했습니다.");
    }
});
