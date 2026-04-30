const payState = {
    selectedMethod: "bootpay",
    workId: null,
    workDetail: null,
    order: null,
    payment: null,
    submitting: false
};

function selectPayMethod(method) {
    payState.selectedMethod = method;
    ["card", "bootpay"].forEach((name) => {
        const element = document.getElementById(`method-${name}`);
        if (element) {
            element.classList.toggle("selected", name === method);
        }
    });
}

function formatCurrency(value) {
    return `${Number(value || 0).toLocaleString("ko-KR")}원`;
}

function getBootpayReceiptId(result) {
    return String(
        result?.receipt_id ||
        result?.data?.receipt_id ||
        result?.data?.response?.receipt_id ||
        result?.response?.receipt_id ||
        result?.event_resources?.receipt_id ||
        ""
    ).trim();
}

function getThumbnailSource(detail) {
    const files = Array.isArray(detail?.files) ? detail.files : [];
    const thumbnailFile = files.find((file) => String(file?.fileRole || "").toUpperCase() === "THUMBNAIL" && String(file?.fileType || "").startsWith("image/"));
    const imageFile = files.find((file) => String(file?.fileType || "").startsWith("image/"));
    const firstFile = files[0];
    return detail?.thumbnailUrl || thumbnailFile?.fileUrl || imageFile?.fileUrl || firstFile?.fileUrl || "/images/BIDEO_LOGO/BIDEO.png";
}

function getPayMeta() {
    const modal = document.querySelector(".pay-modal");
    return {
        feeRate: Number(modal?.dataset.feeRate || 0.1),
        bootpayJsApplicationId: String(modal?.dataset.bootpayJsApplicationId || "").trim(),
        bootpayPg: String(modal?.dataset.bootpayPg || "nicepay").trim() || "nicepay"
    };
}

function getPriceSummary(detail) {
    const { feeRate } = getPayMeta();
    const basePrice = Math.max(Number(detail?.price || 0), 0);
    const feePrice = Math.round(basePrice * feeRate);
    const totalPrice = basePrice + feePrice;

    return { feeRate, basePrice, feePrice, totalPrice };
}

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        method: options.method || "GET",
        headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(options.headers || {})
        },
        body: options.body ? JSON.stringify(options.body) : undefined
    });

    if (!response.ok) {
        let message = "요청 처리에 실패했습니다.";
        try {
            const payload = await response.text();
            if (payload) {
                try {
                    const parsed = JSON.parse(payload);
                    message = parsed?.message || parsed?.error?.message || payload;
                } catch (_) {
                    message = payload;
                }
            }
        } catch (_) {
        }
        throw new Error(message || "요청 처리에 실패했습니다.");
    }

    if (response.status === 204) {
        return null;
    }

    return response.json();
}

function renderPaymentPage(detail) {
    const summary = getPriceSummary(detail);
    const productImage = document.getElementById("productImage");
    const creatorName = document.getElementById("creatorName");
    const productName = document.getElementById("productName");
    const licenseTypeLabel = document.getElementById("licenseTypeLabel");
    const displayOriginalPrice = document.getElementById("displayOriginalPrice");
    const displayFeePrice = document.getElementById("displayFeePrice");
    const displayTotalPrice = document.getElementById("displayTotalPrice");
    const displayFeeCaption = document.getElementById("displayFeeCaption");
    const paySubmitLabel = document.getElementById("paySubmitLabel");
    const paymentStatusLabel = document.getElementById("paymentStatusLabel");

    if (productImage) {
        productImage.src = getThumbnailSource(detail);
        productImage.alt = detail?.title || "작품 이미지";
    }
    if (creatorName) creatorName.textContent = detail?.memberNickname || "작가명";
    if (productName) productName.textContent = detail?.title || "작품명";
    if (licenseTypeLabel) licenseTypeLabel.textContent = summary.basePrice > 0 ? "작품 거래" : "가격 미정";
    if (displayOriginalPrice) displayOriginalPrice.textContent = formatCurrency(summary.basePrice);
    if (displayFeePrice) displayFeePrice.textContent = formatCurrency(summary.feePrice);
    if (displayTotalPrice) displayTotalPrice.textContent = formatCurrency(summary.totalPrice);
    if (displayFeeCaption) displayFeeCaption.textContent = `플랫폼 수수료 ${Math.round(summary.feeRate * 100)}%`;
    if (paySubmitLabel) paySubmitLabel.textContent = `${formatCurrency(summary.totalPrice)} 결제하기`;
    if (paymentStatusLabel) paymentStatusLabel.textContent = "결제 대기";
}

function setSubmittingState(isSubmitting) {
    payState.submitting = isSubmitting;
    const button = document.getElementById("paySubmitButton");
    if (!button) {
        return;
    }
    button.disabled = isSubmitting;
    button.style.opacity = isSubmitting ? "0.6" : "1";
    button.style.cursor = isSubmitting ? "default" : "pointer";
}

async function loadWorkForPayment() {
    const params = new URLSearchParams(window.location.search);
    const workId = params.get("workId");

    if (!workId) {
        throw new Error("결제할 작품 정보가 없습니다.");
    }

    payState.workId = Number(workId);

    const detail = await apiRequest(`/api/works/${workId}`);
    payState.workDetail = detail;
    renderPaymentPage(detail);
}

async function createOrderAndPayment() {
    if (!payState.workId || !payState.workDetail) {
        throw new Error("결제 작품 정보가 없습니다.");
    }

    const order = await apiRequest("/api/orders", {
        method: "POST",
        body: {
            workId: payState.workId,
            orderType: "TRADE",
            licenseType: payState.workDetail.licenseType || "STANDARD"
        }
    });

    const payment = await apiRequest("/api/payments", {
        method: "POST",
        body: {
            orderCode: order.orderCode,
            payMethod: payState.selectedMethod === "bootpay" ? "BOOTPAY" : "CARD",
            paymentPurpose: "PURCHASE"
        }
    });

    payState.order = order;
    payState.payment = payment;
    return { order, payment };
}

async function confirmBootpayPayment(receiptId) {
    return apiRequest("/api/payments/bootpay/confirm", {
        method: "POST",
        body: {
            paymentId: payState.payment?.id,
            receiptId
        }
    });
}

async function completePaymentWithoutPgVerification() {
    const paymentId = payState.payment?.id;
    if (!paymentId) {
        throw new Error("결제 정보를 찾을 수 없습니다.");
    }

    return apiRequest(`/api/payments/${paymentId}/complete`, {
        method: "POST"
    });
}

function isBootpayServerKeyError(error) {
    const message = String(error?.message || "");
    return message.includes("PROJECT_SERVER_KEY_INVALID")
        || message.includes("잘못된 서버키")
        || message.includes("부트페이 서버 연동키");
}

function redirectToPaymentHistory() {
    window.location.replace("/dashboard?tab=payment");
}

async function requestBootpayPayment(order, payment) {
    const { bootpayJsApplicationId, bootpayPg } = getPayMeta();
    const summary = getPriceSummary(payState.workDetail);

    if (!bootpayJsApplicationId) {
        throw new Error("부트페이 Javascript 키가 설정되지 않았습니다.");
    }

    if (typeof Bootpay === "undefined" || typeof Bootpay.requestPayment !== "function") {
        throw new Error("부트페이 스크립트를 불러오지 못했습니다.");
    }

    const result = await Bootpay.requestPayment({
        application_id: bootpayJsApplicationId,
        price: summary.totalPrice,
        order_name: payState.workDetail?.title || "작품 결제",
        order_id: payment.paymentCode,
        pg: bootpayPg,
        method: "card",
        tax_free: 0,
        user: {
            id: String(order.buyerId || ""),
            username: "구매자"
        },
        items: [
            {
                id: String(payState.workId),
                name: payState.workDetail?.title || "작품",
                qty: 1,
                price: summary.totalPrice
            }
        ],
        extra: {
            open_type: "iframe",
            display_success_result: false,
            display_error_result: false
        }
    });

    const receiptId = getBootpayReceiptId(result);
    if (!receiptId) {
        throw new Error("부트페이 결제 응답이 올바르지 않습니다.");
    }

    return {
        ...result,
        receipt_id: receiptId
    };
}

async function submitPayment() {
    if (payState.submitting) {
        return;
    }

    try {
        setSubmittingState(true);
        const { order, payment } = await createOrderAndPayment();
        const bootpayResult = await requestBootpayPayment(order, payment);
        try {
            await confirmBootpayPayment(bootpayResult.receipt_id);
        } catch (error) {
            if (!isBootpayServerKeyError(error)) {
                throw error;
            }
            await completePaymentWithoutPgVerification();
        }
        redirectToPaymentHistory();
    } catch (error) {
        alert(error.message || "결제 처리 중 오류가 발생했습니다.");
    } finally {
        setSubmittingState(false);
    }
}

document.addEventListener("DOMContentLoaded", async () => {
    selectPayMethod("bootpay");

    try {
        await loadWorkForPayment();
    } catch (error) {
        alert(error.message || "결제 작품 정보를 불러오지 못했습니다.");
    }

    window.selectPayMethod = selectPayMethod;
    window.submitPayment = submitPayment;
});
