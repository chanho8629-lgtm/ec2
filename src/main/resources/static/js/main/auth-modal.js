// ─── 인증 모달 (로그인) ─────────────────────────
// SVG 상수는 modal-shared.js에서 로드 (MODAL_SVG_EYE_OPEN, MODAL_SVG_EYE_CLOSED, MODAL_GOOGLE_ICON_SVG, MODAL_NAVER_ICON_SVG, MODAL_KAKAO_ICON_SVG)  
window.addEventListener('load', () => {
  let authFoundEmail = '';
  let authPasswordResetEmail = '';
  let authPasswordResetCode = '';
  const AUTH_VERIFICATION_LIMIT_MS = 3 * 60 * 1000;
  const authVerificationState = {
    phone: { expiresAt: 0, intervalId: null },
    email: { expiresAt: 0, intervalId: null }
  };

  function getAuthVerificationConfig(type) {
    if (type === 'phone') {
      return {
        buttonId: 'authFindEmailVerificationSendButton',
        groupId: 'authFindEmailVerificationGroup',
        helperId: 'authFindEmailVerificationHelper',
        submitButtonId: 'authFindEmailVerificationSubmitButton'
      };
    }

    return {
      buttonId: 'authFindPasswordVerificationSendButton',
      groupId: 'authFindPasswordVerificationGroup',
      helperId: 'authFindPasswordVerificationHelper',
      submitButtonId: 'authFindPasswordVerificationSubmitButton'
    };
  }

  function formatAuthVerificationRemaining(ms) {
    const totalSeconds = Math.max(0, Math.ceil(ms / 1000));
    const minutes = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
    const seconds = String(totalSeconds % 60).padStart(2, '0');
    return minutes + ':' + seconds;
  }

  function clearAuthVerificationInterval(type) {
    const state = authVerificationState[type];
    if (!state || !state.intervalId) return;
    clearInterval(state.intervalId);
    state.intervalId = null;
  }

  function syncAuthVerificationUI(type) {
    const state = authVerificationState[type];
    const config = getAuthVerificationConfig(type);
    const sendButton = document.getElementById(config.buttonId);
    const codeGroup = document.getElementById(config.groupId);
    const helper = document.getElementById(config.helperId);
    const submitButton = document.getElementById(config.submitButtonId);

    if (!sendButton && !codeGroup && !helper && !submitButton) return;

    const hasRequestedCode = state.expiresAt > 0;
    const remainingMs = state.expiresAt - Date.now();
    const isActive = hasRequestedCode && remainingMs > 0;

    if (!isActive) {
      clearAuthVerificationInterval(type);
    }

    if (codeGroup) {
      codeGroup.classList.toggle('none', !hasRequestedCode);
    }

    if (submitButton) {
      submitButton.classList.toggle('none', !hasRequestedCode);
    }

    if (sendButton) {
      sendButton.textContent = hasRequestedCode ? '인증번호 재전송' : '인증번호 받기';
    }

    if (helper) {
      if (!hasRequestedCode) {
        helper.textContent = '인증번호는 발송 후 3분 안에 입력해야 합니다.';
        helper.style.color = '#5f6368';
      } else if (isActive) {
        helper.textContent = '인증번호 유효시간 ' + formatAuthVerificationRemaining(remainingMs);
        helper.style.color = '#2b48d4';
      } else {
        helper.textContent = '인증번호가 만료되었습니다. 다시 요청해 주세요.';
        helper.style.color = '#d93025';
      }
    }
  }

  function startAuthVerificationTimer(type) {
    const state = authVerificationState[type];
    if (!state) return;

    clearAuthVerificationInterval(type);
    syncAuthVerificationUI(type);

    if (state.expiresAt <= Date.now()) return;

    state.intervalId = setInterval(function() {
      syncAuthVerificationUI(type);
    }, 1000);
  }

  function activateAuthVerification(type) {
    const state = authVerificationState[type];
    if (!state) return;

    state.expiresAt = Date.now() + AUTH_VERIFICATION_LIMIT_MS;
    startAuthVerificationTimer(type);
  }

  function isAuthVerificationExpired(type) {
    const state = authVerificationState[type];
    return !state || state.expiresAt <= Date.now();
  }

  function clearAllAuthVerificationTimers() {
    clearAuthVerificationInterval('phone');
    clearAuthVerificationInterval('email');
    authVerificationState.phone.expiresAt = 0;
    authVerificationState.email.expiresAt = 0;
  }

  function buildLoginViewHTML() {
    return '' +
        '<div class="auth-modal__login-view">' +
        '<div class="auth-modal__inner">' +
        '<div class="auth-modal__content-row">' +
        '<div class="auth-modal__form-side">' +
        '<div class="auth-modal__logo">' +
        '<img src="/images/favicon.png" alt="BIDEO" width="40" height="40">' +
        '</div>' +
        '<h2 class="auth-modal__form-title">BIDEO에 오신 것을 환영합니다</h2>' +
        '<form onsubmit="handleLoginSubmit(event)">' +
        '<div class="auth-modal__form-group">' +
        '<label class="auth-modal__form-label">이메일</label>' +
        '<div class="auth-modal__input-wrapper">' +
        '<input type="text" class="auth-modal__input" id="authLoginEmail" placeholder="이메일" autocomplete="off">' +
        '</div>' +
        '</div>' +
        '<div class="auth-modal__form-group">' +
        '<label class="auth-modal__form-label">비밀번호</label>' +
        '<div class="auth-modal__input-wrapper">' +
        '<input type="password" class="auth-modal__input" placeholder="비밀번호" id="authLoginPassword" autocomplete="off">' +
        '<button type="button" class="auth-modal__password-toggle" onclick="togglePasswordVisibility(\'authLoginPassword\', \'authLoginEye\')">' +
        '<svg viewBox="0 0 24 24" id="authLoginEye">' + MODAL_SVG_EYE_OPEN + '</svg>' +
        '</button>' +
        '</div>' +
        '</div>' +
        '<div class="auth-modal__helper-links">' +
        '<a href="#" class="auth-modal__forgot-link" onclick="showAuthFindIdView()">이메일 찾기</a>' +
        '<a href="#" class="auth-modal__forgot-link" onclick="showAuthFindPasswordView()">비밀번호 찾기</a>' +
        '</div>' +
        '<button type="submit" class="auth-modal__submit-btn">로그인</button>' +
        '</form>' +
        '<div class="auth-modal__social-login auth-modal__social-login--naver" onclick="redirectToOAuthProvider(\'naver\')">' +
        '<div class="auth-modal__social-login-left">' +
        '<div class="auth-modal__social-name">Naver로 계속</div>' +
        '</div>' +
        MODAL_NAVER_ICON_SVG +
        '</div>' +
        '<div class="auth-modal__social-login auth-modal__social-login--kakao" onclick="redirectToOAuthProvider(\'kakao\')">' +
        '<div class="auth-modal__social-login-left">' +
        '<div class="auth-modal__social-name">Kakao로 계속</div>' +
        '</div>' +
        MODAL_KAKAO_ICON_SVG +
        '</div>' +
        '<div class="auth-modal__social-login auth-modal__social-login--google" onclick="redirectToOAuthProvider(\'google\')">' +
        '<div class="auth-modal__social-login-left">' +
        '<div class="auth-modal__social-name">Google로 계속</div>' +
        '</div>' +
        MODAL_GOOGLE_ICON_SVG +
        '</div>' +
        '<div class="auth-modal__divider-text" style="margin-top:14px">' +
        '아직 BIDEO를 사용하고 있지 않으신가요? <a href="#" class="auth-modal__bold-link" onclick="closeAuthModal(); showSignupModal();">가입하기</a>' +
        '</div>' +
        '<div class="auth-modal__terms-text">' +
        '계속하면 BIDEO의 <a href="#" onclick="event.preventDefault(); showLegalModal(\'terms\')">서비스 약관</a>에 동의하고 <a href="#" onclick="event.preventDefault(); showLegalModal(\'privacy\')">개인정보 보호정책</a>을 읽었음을 인정한 것으로 간주합니다.' +
        '</div>' +
        '</div>' +
        '<img class="auth-modal__qr-image" src="/images/logo.png" alt="BIDEO">' +
        '</div>' +
        '</div>' +
        '</div>' +
        '</div>';
  }

  function buildFindIdViewHTML() {
    return '' +
        '<div class="auth-modal__subview">' +
        '<div class="auth-modal__subview-inner">' +
        '<div class="auth-modal__logo">' +
        '<img src="/images/favicon.png" alt="BIDEO" width="40" height="40">' +
        '</div>' +
        '<h2 class="auth-modal__form-title">이메일 찾기</h2>' +
        '<p class="auth-modal__subcopy">가입한 전화번호로 인증하면 이메일을 확인할 수 있습니다.</p>' +
        '<form onsubmit="handleFindEmailSubmit(event)">' +
        '<div class="auth-modal__form-group">' +
        '<label class="auth-modal__form-label">전화번호</label>' +
        '<div class="auth-modal__input-wrapper">' +
        '<input type="text" class="auth-modal__input" id="authFindEmailPhoneNumber" placeholder="전화번호를 입력하세요" autocomplete="off">' +
        '</div>' +
        '</div>' +
        '<button type="button" class="auth-modal__text-btn" id="authFindEmailVerificationSendButton" onclick="sendPhoneVerificationCode()">인증번호 받기</button>' +
        '<p id="authFindEmailVerificationHelper" class="auth-modal__subcopy" style="margin:8px 0 12px; font-size:13px;">인증번호는 발송 후 3분 안에 입력해야 합니다.</p>' +
        '<div class="auth-modal__form-group none" id="authFindEmailVerificationGroup">' +
        '<label class="auth-modal__form-label">인증번호</label>' +
        '<div class="auth-modal__input-wrapper">' +
        '<input type="text" class="auth-modal__input" id="authFindEmailVerificationCode" placeholder="인증번호 6자리" inputmode="numeric" maxlength="6" autocomplete="off">' +
        '</div>' +
        '</div>' +
        '<button type="submit" class="auth-modal__submit-btn none" id="authFindEmailVerificationSubmitButton">이메일 확인</button>' +
        '</form>' +
        '<button type="button" class="auth-modal__text-btn" onclick="showAuthLoginView()">로그인으로 돌아가기</button>' +
        '</div>' +
        '</div>';
  }

  function buildFindIdResultViewHTML() {
    return '' +
        '<div class="auth-modal__subview">' +
        '<div class="auth-modal__subview-inner">' +
        '<div class="auth-modal__logo">' +
        '<img src="/images/favicon.png" alt="BIDEO" width="40" height="40">' +
        '</div>' +
        '<h2 class="auth-modal__form-title">이메일 확인 완료</h2>' +
        '<p class="auth-modal__subcopy">인증된 전화번호로 가입된 이메일은 <strong>' + escapeHtml(authFoundEmail) + '</strong> 입니다.</p>' +
        '<button type="button" class="auth-modal__submit-btn" onclick="showAuthLoginView()">로그인으로 이동</button>' +
        '</div>' +
        '</div>';
  }

  function buildFindPasswordViewHTML() {
    return '' +
        '<div class="auth-modal__subview">' +
        '<div class="auth-modal__subview-inner">' +
        '<div class="auth-modal__logo">' +
        '<img src="/images/favicon.png" alt="BIDEO" width="40" height="40">' +
        '</div>' +
        '<h2 class="auth-modal__form-title">비밀번호 찾기</h2>' +
        '<p class="auth-modal__subcopy">가입한 이메일로 인증하면 비밀번호를 재설정할 수 있습니다.</p>' +
        '<form onsubmit="handleFindPasswordSubmit(event)">' +
        '<div class="auth-modal__form-group">' +
        '<label class="auth-modal__form-label">이메일</label>' +
        '<div class="auth-modal__input-wrapper">' +
        '<input type="text" class="auth-modal__input" id="authFindPasswordEmail" placeholder="이메일을 입력하세요" autocomplete="off">' +
        '</div>' +
        '</div>' +
        '<button type="button" class="auth-modal__text-btn" id="authFindPasswordVerificationSendButton" onclick="sendEmailVerificationCode()">인증번호 받기</button>' +
        '<p id="authFindPasswordVerificationHelper" class="auth-modal__subcopy" style="margin:8px 0 12px; font-size:13px;">인증번호는 발송 후 3분 안에 입력해야 합니다.</p>' +
        '<div class="auth-modal__form-group none" id="authFindPasswordVerificationGroup">' +
        '<label class="auth-modal__form-label">인증번호</label>' +
        '<div class="auth-modal__input-wrapper">' +
        '<input type="text" class="auth-modal__input" id="authFindPasswordVerificationCode" placeholder="인증번호 6자리" inputmode="numeric" maxlength="6" autocomplete="off">' +
        '</div>' +
        '</div>' +
        '<button type="submit" class="auth-modal__submit-btn none" id="authFindPasswordVerificationSubmitButton">비밀번호 재설정</button>' +
        '</form>' +
        '<button type="button" class="auth-modal__text-btn" onclick="showAuthLoginView()">로그인으로 돌아가기</button>' +
        '</div>' +
        '</div>';
  }

  function buildResetPasswordViewHTML() {
    return '' +
        '<div class="auth-modal__subview">' +
        '<div class="auth-modal__subview-inner">' +
        '<div class="auth-modal__logo">' +
        '<img src="/images/favicon.png" alt="BIDEO" width="40" height="40">' +
        '</div>' +
        '<h2 class="auth-modal__form-title">비밀번호 변경</h2>' +
        '<p class="auth-modal__subcopy">새 비밀번호를 입력하고 변경을 완료하세요.</p>' +
        '<form onsubmit="handleResetPasswordSubmit(event)">' +
        '<div class="auth-modal__form-group">' +
        '<label class="auth-modal__form-label">새 비밀번호</label>' +
        '<div class="auth-modal__input-wrapper">' +
        '<input type="password" class="auth-modal__input" placeholder="새 비밀번호를 입력하세요" id="authResetPassword" autocomplete="off">' +
        '<button type="button" class="auth-modal__password-toggle" onclick="togglePasswordVisibility(\'authResetPassword\', \'authResetEye\')">' +
        '<svg viewBox="0 0 24 24" id="authResetEye">' + MODAL_SVG_EYE_OPEN + '</svg>' +
        '</button>' +
        '</div>' +
        '</div>' +
        '<div class="auth-modal__form-group">' +
        '<label class="auth-modal__form-label">새 비밀번호 확인</label>' +
        '<div class="auth-modal__input-wrapper">' +
        '<input type="password" class="auth-modal__input" placeholder="비밀번호를 다시 입력하세요" id="authResetPasswordConfirm" autocomplete="off">' +
        '<button type="button" class="auth-modal__password-toggle" onclick="togglePasswordVisibility(\'authResetPasswordConfirm\', \'authResetConfirmEye\')">' +
        '<svg viewBox="0 0 24 24" id="authResetConfirmEye">' + MODAL_SVG_EYE_OPEN + '</svg>' +
        '</button>' +
        '</div>' +
        '</div>' +
        '<button type="submit" class="auth-modal__submit-btn">비밀번호 변경</button>' +
        '</form>' +
        '</div>' +
        '</div>';
  }

  function buildResetPasswordCompleteViewHTML() {
    return '' +
        '<div class="auth-modal__subview">' +
        '<div class="auth-modal__subview-inner">' +
        '<div class="auth-modal__logo">' +
        '<img src="/images/favicon.png" alt="BIDEO" width="40" height="40">' +
        '</div>' +
        '<h2 class="auth-modal__form-title">비밀번호 변경 완료</h2>' +
        '<p class="auth-modal__subcopy">새 비밀번호로 다시 로그인할 수 있습니다.</p>' +
        '<button type="button" class="auth-modal__submit-btn" onclick="showAuthLoginView()">로그인으로 이동</button>' +
        '</div>' +
        '</div>';
  }

  function renderAuthModalView(viewHTML) {
    const overlay = document.getElementById('authModal');
    if (!overlay) return;

    const dialog = overlay.querySelector('.auth-modal__dialog');
    if (!dialog) return;

    dialog.innerHTML =
        '<button class="auth-modal__close-btn" aria-label="닫기">' +
        '<svg viewBox="0 0 24 24"><path d="M15.18 12l7.16-7.16a2.25 2.25 0 10-3.18-3.18L12 8.82 4.84 1.66a2.25 2.25 0 10-3.18 3.18L8.82 12l-7.16 7.16a2.25 2.25 0 103.18 3.18L12 15.18l7.16 7.16a2.25 2.25 0 103.18-3.18z" fill="#111"/></svg>' +
        '</button>' +
        viewHTML;

    dialog.querySelector('.auth-modal__close-btn').addEventListener('click', closeAuthModal);
    syncAuthVerificationUI('phone');
    syncAuthVerificationUI('email');
  }

  function showAuthLoginView() {
    renderAuthModalView(buildLoginViewHTML());
  }

  function showAuthFindIdView() {
    authFoundEmail = '';
    renderAuthModalView(buildFindIdViewHTML());
  }

  function showAuthFindIdResultView() {
    renderAuthModalView(buildFindIdResultViewHTML());
  }

  function showAuthFindPasswordView() {
    authPasswordResetEmail = '';
    authPasswordResetCode = '';
    renderAuthModalView(buildFindPasswordViewHTML());
  }

  function showAuthResetPasswordView() {
    renderAuthModalView(buildResetPasswordViewHTML());
  }

  function showAuthResetPasswordCompleteView() {
    renderAuthModalView(buildResetPasswordCompleteViewHTML());
  }

  function showAuthModal() {
    if (document.getElementById('authModal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'authModal';
    overlay.className = 'auth-modal';

    overlay.innerHTML =
        '<div class="auth-modal__backdrop"></div>' +
        '<div class="auth-modal__dialog">' +
        '<button class="auth-modal__close-btn" aria-label="닫기">' +
        '<svg viewBox="0 0 24 24"><path d="M15.18 12l7.16-7.16a2.25 2.25 0 10-3.18-3.18L12 8.82 4.84 1.66a2.25 2.25 0 10-3.18 3.18L8.82 12l-7.16 7.16a2.25 2.25 0 103.18 3.18L12 15.18l7.16 7.16a2.25 2.25 0 103.18-3.18z" fill="#111"/></svg>' +
        '</button>' +
        buildLoginViewHTML() +
        '</div>';

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    // 애니메이션
    requestAnimationFrame(function() { overlay.classList.add('auth-modal--open'); });

    // 이벤트 바인딩
    overlay.querySelector('.auth-modal__backdrop').addEventListener('click', closeAuthModal);
    overlay.querySelector('.auth-modal__close-btn').addEventListener('click', closeAuthModal);

    // ESC 닫기
    overlay._escHandler = function(e) {
      if (e.key === 'Escape') closeAuthModal();
    };
    document.addEventListener('keydown', overlay._escHandler);
  }

  function closeAuthModal() {
    const overlay = document.getElementById('authModal');
    if (!overlay) return;

    overlay.classList.remove('auth-modal--open');
    document.body.style.overflow = '';

    if (overlay._escHandler) {
      document.removeEventListener('keydown', overlay._escHandler);
    }

    clearAllAuthVerificationTimers();

    setTimeout(function() { overlay.remove(); }, 250);
  }

  async function handleLoginSubmit(event) {
    event.preventDefault();

    const emailInput = document.getElementById('authLoginEmail');
    const passwordInput = document.getElementById('authLoginPassword');
    const email = emailInput ? emailInput.value.trim() : '';
    const password = passwordInput ? passwordInput.value : '';

    if (!email || !password) {
      alert('이메일과 비밀번호를 입력하세요.');
      return;
    }

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          email: email,
          password: password
        })
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || '로그인에 실패했습니다.');
        return;
      }

      window.location.href = '/';
    } catch (error) {
      alert('로그인 중 오류가 발생했습니다.');
    }
  }

  async function sendPhoneVerificationCode() {
    const phoneInput = document.getElementById('authFindEmailPhoneNumber');
    const phoneNumber = phoneInput ? phoneInput.value.trim() : '';

    if (!phoneNumber) {
      alert('전화번호를 입력하세요.');
      return;
    }

    try {
      const response = await fetch('/api/auth/verification/phone/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ phoneNumber: phoneNumber })
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || '인증번호 전송에 실패했습니다.');
        return;
      }

      activateAuthVerification('phone');
      alert(data.message || '인증번호를 전송했습니다.');
    } catch (error) {
      alert('인증번호 전송 중 오류가 발생했습니다.');
    }
  }

  async function handleFindEmailSubmit(event) {
    event.preventDefault();

    const phoneInput = document.getElementById('authFindEmailPhoneNumber');
    const codeInput = document.getElementById('authFindEmailVerificationCode');
    const phoneNumber = phoneInput ? phoneInput.value.trim() : '';
    const verificationCode = codeInput ? codeInput.value.trim() : '';

    if (!phoneNumber || !verificationCode) {
      alert('전화번호와 인증번호를 입력하세요.');
      return;
    }

    if (!/^\d{6}$/.test(verificationCode)) {
      alert('인증번호는 6자리 숫자로 입력하세요.');
      return;
    }

    if (isAuthVerificationExpired('phone')) {
      syncAuthVerificationUI('phone');
      alert('인증번호가 만료되었습니다. 다시 요청해 주세요.');
      return;
    }

    try {
      const response = await fetch('/api/auth/verification/phone/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          phoneNumber: phoneNumber,
          verificationCode: verificationCode
        })
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || '인증 확인에 실패했습니다.');
        return;
      }

      authFoundEmail = data.email || '';
      clearAuthVerificationInterval('phone');
      showAuthFindIdResultView();
    } catch (error) {
      alert('인증 확인 중 오류가 발생했습니다.');
    }
  }

  async function sendEmailVerificationCode() {
    const emailInput = document.getElementById('authFindPasswordEmail');
    const email = emailInput ? emailInput.value.trim() : '';

    if (!email) {
      alert('이메일을 입력하세요.');
      return;
    }

    try {
      const response = await fetch('/api/auth/verification/email/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: email })
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || '인증번호 전송에 실패했습니다.');
        return;
      }

      activateAuthVerification('email');
      alert(data.message || '인증번호를 전송했습니다.');
    } catch (error) {
      alert('인증번호 전송 중 오류가 발생했습니다.');
    }
  }

  async function handleFindPasswordSubmit(event) {
    event.preventDefault();

    const emailInput = document.getElementById('authFindPasswordEmail');
    const codeInput = document.getElementById('authFindPasswordVerificationCode');
    const email = emailInput ? emailInput.value.trim() : '';
    const verificationCode = codeInput ? codeInput.value.trim() : '';

    if (!email || !verificationCode) {
      alert('이메일과 인증번호를 입력하세요.');
      return;
    }

    if (!/^\d{6}$/.test(verificationCode)) {
      alert('인증번호는 6자리 숫자로 입력하세요.');
      return;
    }

    if (isAuthVerificationExpired('email')) {
      syncAuthVerificationUI('email');
      alert('인증번호가 만료되었습니다. 다시 요청해 주세요.');
      return;
    }

    try {
      const response = await fetch('/api/auth/verification/email/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: email,
          verificationCode: verificationCode
        })
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || '인증 확인에 실패했습니다.');
        return;
      }

      authPasswordResetEmail = email;
      authPasswordResetCode = verificationCode;
      clearAuthVerificationInterval('email');
      showAuthResetPasswordView();
    } catch (error) {
      alert('인증 확인 중 오류가 발생했습니다.');
    }
  }

  async function handleResetPasswordSubmit(event) {
    event.preventDefault();

    const passwordInput = document.getElementById('authResetPassword');
    const confirmInput = document.getElementById('authResetPasswordConfirm');
    const newPassword = passwordInput ? passwordInput.value : '';
    const confirmPassword = confirmInput ? confirmInput.value : '';

    if (!authPasswordResetEmail || !authPasswordResetCode) {
      alert('이메일 인증부터 다시 진행하세요.');
      showAuthFindPasswordView();
      return;
    }

    if (!newPassword || !confirmPassword) {
      alert('새 비밀번호를 입력하세요.');
      return;
    }

    try {
      const response = await fetch('/api/auth/password/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: authPasswordResetEmail,
          verificationCode: authPasswordResetCode,
          newPassword: newPassword,
          confirmPassword: confirmPassword
        })
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || '비밀번호 변경에 실패했습니다.');
        return;
      }

      authPasswordResetEmail = '';
      authPasswordResetCode = '';
      showAuthResetPasswordCompleteView();
    } catch (error) {
      alert('비밀번호 변경 중 오류가 발생했습니다.');
    }
  }

  function escapeHtml(value) {
    return String(value || '')
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
  }

  function redirectToOAuthProvider(provider) {
    window.location.href = '/oauth2/authorization/' + provider;
  }

  function showOAuthUnavailable() {
    alert('현재 Google 로그인은 아직 연결되지 않았습니다.');
  }

  window.showAuthModal = showAuthModal;
  window.closeAuthModal = closeAuthModal;
  window.redirectToOAuthProvider = redirectToOAuthProvider;
  window.handleLoginSubmit = handleLoginSubmit;
  window.showAuthLoginView = showAuthLoginView;
  window.showAuthFindIdView = showAuthFindIdView;
  window.showAuthFindPasswordView = showAuthFindPasswordView;
  window.handleFindEmailSubmit = handleFindEmailSubmit;
  window.handleFindPasswordSubmit = handleFindPasswordSubmit;
  window.handleResetPasswordSubmit = handleResetPasswordSubmit;
  window.sendPhoneVerificationCode = sendPhoneVerificationCode;
  window.sendEmailVerificationCode = sendEmailVerificationCode;
});
