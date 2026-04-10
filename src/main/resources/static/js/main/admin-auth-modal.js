// ─── 관리자 인증 모달 ─────────────────────────
// 기존 auth-modal.js를 수정하지 않고 독립 파일로 관리
// 공통 스타일: modal-shared.css, auth-modal.css 클래스 재사용
window.addEventListener('load', function () {

  function buildAdminLoginViewHTML() {
    return '' +
        '<div class="auth-modal__subview">' +
        '<div class="auth-modal__subview-inner">' +
        '<div class="auth-modal__logo">' +
        '<img src="/images/favicon.png" alt="BIDEO" width="40" height="40">' +
        '</div>' +
        '<div class="admin-auth-modal__badge">관리자 전용</div>' +
        '<h2 class="auth-modal__form-title">관리자 로그인</h2>' +
        '<form onsubmit="handleAdminLoginSubmit(event)">' +
        '<div class="auth-modal__form-group">' +
        '<label class="auth-modal__form-label">이메일</label>' +
        '<div class="auth-modal__input-wrapper">' +
        '<input type="text" class="auth-modal__input" id="adminLoginEmail" placeholder="관리자 이메일" autocomplete="off">' +
        '</div>' +
        '</div>' +
        '<div class="auth-modal__form-group">' +
        '<label class="auth-modal__form-label">비밀번호</label>' +
        '<div class="auth-modal__input-wrapper">' +
        '<input type="password" class="auth-modal__input" placeholder="비밀번호" id="adminLoginPassword" autocomplete="off">' +
        '<button type="button" class="auth-modal__password-toggle" onclick="togglePasswordVisibility(\'adminLoginPassword\', \'adminLoginEye\')">' +
        '<svg viewBox="0 0 24 24" id="adminLoginEye">' + MODAL_SVG_EYE_OPEN + '</svg>' +
        '</button>' +
        '</div>' +
        '</div>' +
        '<button type="submit" class="auth-modal__submit-btn admin-auth-modal__submit-btn">관리자 로그인</button>' +
        '</form>' +
        '<button type="button" class="auth-modal__text-btn" onclick="closeAdminAuthModal(); showAuthModal();">일반 로그인으로 돌아가기</button>' +
        '</div>' +
        '</div>';
  }

  function showAdminAuthModal() {
    if (document.getElementById('adminAuthModal')) return;

    // 일반 로그인 모달이 열려있으면 닫기
    if (typeof closeAuthModal === 'function') {
      closeAuthModal();
    }

    var overlay = document.createElement('div');
    overlay.id = 'adminAuthModal';
    overlay.className = 'auth-modal';

    overlay.innerHTML =
        '<div class="auth-modal__backdrop"></div>' +
        '<div class="auth-modal__dialog" style="max-width:480px">' +
        '<button class="auth-modal__close-btn" aria-label="닫기">' +
        '<svg viewBox="0 0 24 24"><path d="M15.18 12l7.16-7.16a2.25 2.25 0 10-3.18-3.18L12 8.82 4.84 1.66a2.25 2.25 0 10-3.18 3.18L8.82 12l-7.16 7.16a2.25 2.25 0 103.18 3.18L12 15.18l7.16 7.16a2.25 2.25 0 103.18-3.18z" fill="#111"/></svg>' +
        '</button>' +
        buildAdminLoginViewHTML() +
        '</div>';

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(function () { overlay.classList.add('auth-modal--open'); });

    overlay.querySelector('.auth-modal__backdrop').addEventListener('click', closeAdminAuthModal);
    overlay.querySelector('.auth-modal__close-btn').addEventListener('click', closeAdminAuthModal);

    overlay._escHandler = function (e) {
      if (e.key === 'Escape') closeAdminAuthModal();
    };
    document.addEventListener('keydown', overlay._escHandler);
  }

  function closeAdminAuthModal() {
    var overlay = document.getElementById('adminAuthModal');
    if (!overlay) return;

    overlay.classList.remove('auth-modal--open');
    document.body.style.overflow = '';

    if (overlay._escHandler) {
      document.removeEventListener('keydown', overlay._escHandler);
    }

    setTimeout(function () { overlay.remove(); }, 250);
  }

  async function handleAdminLoginSubmit(event) {
    event.preventDefault();

    var emailInput = document.getElementById('adminLoginEmail');
    var passwordInput = document.getElementById('adminLoginPassword');
    var email = emailInput ? emailInput.value.trim() : '';
    var password = passwordInput ? passwordInput.value : '';

    if (!email || !password) {
      alert('이메일과 비밀번호를 입력하세요.');
      return;
    }

    try {
      var response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: email, password: password })
      });

      var data = await response.json();
      if (!response.ok) {
        alert(data.message || '로그인에 실패했습니다.');
        return;
      }

      window.location.href = '/admin';
    } catch (error) {
      alert('로그인 중 오류가 발생했습니다.');
    }
  }

  window.showAdminAuthModal = showAdminAuthModal;
  window.closeAdminAuthModal = closeAdminAuthModal;
  window.handleAdminLoginSubmit = handleAdminLoginSubmit;
});
