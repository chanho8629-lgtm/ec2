function selectPayMethod(method) {
    const methods = ['card', 'bootpay'];
    methods.forEach((name) => {
        const element = document.getElementById(`method-${name}`);
        if (element) {
            element.classList.remove('selected');
        }
    });

    const selected = document.getElementById(`method-${method}`);
    if (selected) {
        selected.classList.add('selected');
    }
}

function submitPayment() {
    const selectedMethod = document.querySelector('.pay-method__option.selected');
    if (!selectedMethod) {
        alert('결제 방법을 선택해주세요.');
        return;
    }

    alert('결제 요청을 진행합니다.');
}

document.addEventListener('DOMContentLoaded', () => {
    selectPayMethod('card');
});
