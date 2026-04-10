function selectPayMethod(method) {
    const methods = ["card", "bootpay"];
    methods.forEach((name) => {
        const element = document.getElementById(`method-${name}`);
        if (element) {
            element.classList.remove("selected");
        }
    });

    const selected = document.getElementById(`method-${method}`);
    if (selected) {
        selected.classList.add("selected");
    }
}

function formatCurrency(value) {
    return `${Number(value || 0).toLocaleString("ko-KR")}원`;
}

function getThumbnailSource(detail) {
    const files = Array.isArray(detail?.files) ? detail.files : [];
    const isThumbnailFile = (file) => String(file?.fileRole || "").toUpperCase() === "THUMBNAIL";
    const thumbnailFile = files.find((file) => isThumbnailFile(file) && String(file?.fileType || "").startsWith("image/"));
    const imageFile = files.find((file) => String(file?.fileType || "").startsWith("image/"));
    const firstFile = files[0];

    return detail?.thumbnailUrl || thumbnailFile?.fileUrl || imageFile?.fileUrl || firstFile?.fileUrl || "/images/BIDEO_LOGO/BIDEO.png";
}

async function loadWorkForPayment() {
    const params = new URLSearchParams(window.location.search);
    const workId = params.get("workId");

    if (!workId) {
        return;
    }

    const response = await fetch(`/api/works/${workId}`, {
        headers: {
            Accept: "application/json"
        }
    });

    if (!response.ok) {
        throw new Error("작품 정보를 불러오지 못했습니다.");
    }

    const detail = await response.json();
    const feeRate = Number(document.querySelector(".pay-modal")?.dataset.feeRate || 0.1);
    const basePrice = Math.max(Number(detail?.price || 0), 0);
    const feePrice = Math.round(basePrice * feeRate);
    const totalPrice = basePrice + feePrice;

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

    if (creatorName) {
        creatorName.textContent = detail?.memberNickname || "작가명";
    }

    if (productName) {
        productName.textContent = detail?.title || "작품명";
    }

    if (licenseTypeLabel) {
        licenseTypeLabel.textContent = basePrice > 0 ? "작품 거래" : "가격 미정";
    }

    if (displayOriginalPrice) {
        displayOriginalPrice.textContent = formatCurrency(basePrice);
    }

    if (displayFeePrice) {
        displayFeePrice.textContent = formatCurrency(feePrice);
    }

    if (displayTotalPrice) {
        displayTotalPrice.textContent = formatCurrency(totalPrice);
    }

    if (displayFeeCaption) {
        displayFeeCaption.textContent = `플랫폼 수수료 ${Math.round(feeRate * 100)}%`;
    }

    if (paySubmitLabel) {
        paySubmitLabel.textContent = `${formatCurrency(totalPrice)} 결제하기`;
    }

    if (paymentStatusLabel) {
        paymentStatusLabel.textContent = "결제 대기";
    }
}

function submitPayment() {
    const selectedMethod = document.querySelector(".pay-method__option.selected");
    if (!selectedMethod) {
        alert("결제 방법을 선택해주세요.");
        return;
    }

    alert("결제 요청을 진행합니다.");
}

document.addEventListener("DOMContentLoaded", async () => {
    selectPayMethod("card");

    try {
        await loadWorkForPayment();
    } catch (error) {
        alert(error.message || "결제 작품 정보를 불러오지 못했습니다.");
    }
});
