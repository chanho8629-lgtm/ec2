// ===== 상품 목록 토글 =====
function toggleProductList() {
    const list = document.getElementById('productList');
    const arrow = document.getElementById('toggleArrow');
    const isVisible = list.style.display !== 'none';

    list.style.display = isVisible ? 'none' : 'block';
    arrow.classList.toggle('open', !isVisible);
}

// ===== 배송 방법 선택 =====
function selectDelivery(type) {
    document.getElementById('deliveryNormal').classList.remove('selected');
    document.getElementById('deliveryStorage').classList.remove('selected');

    if (type === 'normal') {
        document.getElementById('deliveryNormal').classList.add('selected');
    } else {
        document.getElementById('deliveryStorage').classList.add('selected');
    }
}

// ===== 결제 방법 선택 =====
function selectPayMethod(method) {
    const methods = ['kreampay', 'account', 'card-simple', 'normal'];
    methods.forEach(m => {
        const el = document.getElementById('method-' + m);
        if (el) el.classList.remove('selected');
    });
    const selected = document.getElementById('method-' + method);
    if (selected) selected.classList.add('selected');
}

// ===== 전액 사용 버튼 =====
document.querySelector('.point-use-all-btn').addEventListener('click', function () {
    const input = document.querySelector('.point-input');
    input.value = 0; // 보유 포인트 없음
});

// ===== 결제하기 =====
function submitPayment() {
    const selectedMethod = document.querySelector('.pay-method-option.selected');
    if (!selectedMethod) {
        alert('결제 방법을 선택해주세요.');
        return;
    }
    alert('결제가 완료되었습니다!');
}
