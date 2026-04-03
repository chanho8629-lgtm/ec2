// ─── 회원가입 모달 (signup-modal) ─────────────────────
// SVG 상수는 modal-shared.js에서 로드 (MODAL_SVG_EYE_OPEN, MODAL_SVG_EYE_CLOSED, MODAL_GOOGLE_ICON_SVG, MODAL_NAVER_ICON_SVG, MODAL_KAKAO_ICON_SVG)
window.addEventListener('load', () => {
  const signupFormState = {
    email: '',
    password: '',
    nickname: '',
    phoneNumber: '',
    birthDate: ''
  };

  function buildSignupViewHTML() {
    return '' +
        '<div class="signup-modal__content">' +
        '<div class="signup-modal__logo">' +
        '<img src="/images/favicon.png" alt="BIDEO" width="40" height="40">' +
        '</div>' +
        '<h2 class="signup-modal__title">BIDEO에 오신 것을<br>환영합니다</h2>' +
        '<p class="signup-modal__subtitle">시도해 볼 만한 새로운 아이디어 찾기</p>' +
        '<form class="signup-modal__form" onsubmit="handleSignupStep1Submit(event)">' +
        '<div class="signup-modal__form-group">' +
        '<label class="signup-modal__form-label">이메일</label>' +
        '<div class="signup-modal__input-wrapper">' +
        '<input type="text" class="signup-modal__input" id="signupEmail" placeholder="이메일" autocomplete="off">' +
        '</div>' +
        '</div>' +
        '<div class="signup-modal__form-group">' +
        '<label class="signup-modal__form-label">비밀번호</label>' +
        '<div class="signup-modal__input-wrapper">' +
        '<input type="password" class="signup-modal__input" placeholder="비밀번호를 입력하세요" id="signupPassword" autocomplete="off">' +
        '<button type="button" class="signup-modal__password-toggle" onclick="togglePasswordVisibility(\'signupPassword\', \'signupEyeIcon\')">' +
        '<svg viewBox="0 0 24 24" id="signupEyeIcon">' + MODAL_SVG_EYE_OPEN + '</svg>' +
        '</button>' +
        '</div>' +
        '<div class="signup-modal__hint-text">문자, 숫자, 기호를 8개 이상 사용하세요.</div>' +
        '</div>' +
        '<div class="signup-modal__form-group" style="position:relative">' +
        '<div class="signup-modal__label-row">' +
        '<span class="signup-modal__form-label" style="margin-bottom:0">비밀번호 팁</span>' +
        '<span class="signup-modal__info-icon" onclick="togglePasswordTip(this)">i</span>' +
        '</div>' +
        '<div class="signup-modal__tip-bubble" style="display:none">' +
        '<ul>' +
        '<li>비밀번호를 더 안전하게 만들려면 다음을 참고하세요:</li>' +
        '<li>문자, 숫자, 기호를 8개 이상 사용하세요.</li>' +
        '<li>이름이나 일반적인 단어를 포함하지 마세요.</li>' +
        '<li>다른 계정의 비밀번호를 사용하지 마세요.</li>' +
        '</ul>' +
        '</div>' +
        '</div>' +
        '<button type="submit" class="signup-modal__submit-btn">계속하기</button>' +
        '</form>' +
        '<p class="signup-modal__or-text">또는</p>' +
        '<div class="signup-modal__social-login signup-modal__social-login--naver" onclick="redirectToOAuthProvider(\'naver\')">' +
        '<div class="signup-modal__social-login-left">' +
        '<div class="signup-modal__social-name">Naver로 계속</div>' +
        '</div>' +
        MODAL_NAVER_ICON_SVG +
        '</div>' +
        '<div class="signup-modal__social-login signup-modal__social-login--kakao" onclick="redirectToOAuthProvider(\'kakao\')">' +
        '<div class="signup-modal__social-login-left">' +
        '<div class="signup-modal__social-name">Kakao로 계속</div>' +
        '</div>' +
        MODAL_KAKAO_ICON_SVG +
        '</div>' +
        '<div class="signup-modal__social-login signup-modal__social-login--google" onclick="redirectToOAuthProvider(\'google\')">' +
        '<div class="signup-modal__social-login-left">' +
        '<div class="signup-modal__social-name">Google로 계속</div>' +
        '</div>' +
        MODAL_GOOGLE_ICON_SVG +
        '</div>' +
        '<div class="signup-modal__terms-text">' +
        '계속하면 BIDEO의 <a href="#" onclick="event.preventDefault(); showLegalModal(\'terms\')">서비스 약관</a>에 동의하고 <a href="#" onclick="event.preventDefault(); showLegalModal(\'privacy\')">개인정보 보호정책</a>을 읽었음을 인정한 것으로 간주합니다.' +
        '</div>' +
        '<div class="signup-modal__login-link">' +
        '이미 회원이신가요? <a href="#" class="signup-modal__bold-link" onclick="closeSignupModal(); showAuthModal();">로그인</a>' +
        '</div>' +
        '</div>'
  }

  function buildSignupStep2ViewHTML() {
    return '' +
        '<div class="signup-modal__subview">' +
        '<div class="signup-modal__subview-inner">' +
        '<div class="signup-modal__logo">' +
        '<img src="/images/favicon.png" alt="BIDEO" width="40" height="40">' +
        '</div>' +
        '<h2 class="signup-modal__title">추가 정보 입력</h2>' +
        '<p class="signup-modal__subtitle">마지막 단계입니다</p>' +
        '<form class="signup-modal__form" onsubmit="handleSignupSubmit(event)">' +
        '<div class="signup-modal__form-group">' +
        '<label class="signup-modal__form-label">닉네임</label>' +
        '<div class="signup-modal__input-wrapper">' +
        '<input type="text" class="signup-modal__input" id="signupNickname" placeholder="닉네임을 입력하세요" autocomplete="off">' +
        '</div>' +
        '</div>' +
        '<div class="signup-modal__form-group">' +
        '<label class="signup-modal__form-label">전화번호</label>' +
        '<div class="signup-modal__input-wrapper">' +
        '<input type="text" class="signup-modal__input" id="signupPhoneNumber" placeholder="전화번호를 입력하세요" autocomplete="off">' +
        '</div>' +
        '</div>' +
        '<div class="signup-modal__form-group">' +
        '<div class="signup-modal__label-row">' +
        '<span class="signup-modal__form-label" style="margin-bottom:0">생년월일</span>' +
        '</div>' +
        '<div class="signup-modal__input-wrapper">' +
        '<input type="date" class="signup-modal__input" id="signupBirthDate">' +
        '</div>' +
        '</div>' +
        '<button type="submit" class="signup-modal__submit-btn">가입하기</button>' +
        '</form>' +
        '<button type="button" class="signup-modal__text-btn" onclick="showSignupStep1View()">돌아가기</button>' +
        '</div>' +
        '</div>';
  }

  function renderSignupView(viewHTML) {
    const overlay = document.getElementById('signupModal');
    if (!overlay) return;

    const dialog = overlay.querySelector('.signup-modal__dialog');
    if (!dialog) return;

    dialog.innerHTML =
        '<button class="signup-modal__close-btn" aria-label="닫기">' +
        '<svg viewBox="0 0 24 24"><path d="M15.18 12l7.16-7.16a2.25 2.25 0 10-3.18-3.18L12 8.82 4.84 1.66a2.25 2.25 0 10-3.18 3.18L8.82 12l-7.16 7.16a2.25 2.25 0 103.18 3.18L12 15.18l7.16 7.16a2.25 2.25 0 103.18-3.18z" fill="#111"/></svg>' +
        '</button>' +
        viewHTML;

    dialog.querySelector('.signup-modal__close-btn').addEventListener('click', closeSignupModal);
  }

  function showSignupStep2View() {
    renderSignupView(buildSignupStep2ViewHTML());
  }

  function showSignupStep1View() {
    renderSignupView(buildSignupViewHTML());
  }

  function showSignupModal() {
    if (document.getElementById('signupModal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'signupModal';
    overlay.className = 'signup-modal';

    overlay.innerHTML =
        '<div class="signup-modal__backdrop"></div>' +
        '<div class="signup-modal__dialog">' +
        '<button class="signup-modal__close-btn" aria-label="닫기">' +
        '<svg viewBox="0 0 24 24"><path d="M15.18 12l7.16-7.16a2.25 2.25 0 10-3.18-3.18L12 8.82 4.84 1.66a2.25 2.25 0 10-3.18 3.18L8.82 12l-7.16 7.16a2.25 2.25 0 103.18 3.18L12 15.18l7.16 7.16a2.25 2.25 0 103.18-3.18z" fill="#111"/></svg>' +
        '</button>' +
        buildSignupViewHTML() +
        '</div>';

    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    requestAnimationFrame(function () {
      overlay.classList.add('signup-modal--open');
    });

    overlay.querySelector('.signup-modal__backdrop').addEventListener('click', closeSignupModal);
    overlay.querySelector('.signup-modal__close-btn').addEventListener('click', closeSignupModal);

    overlay._escHandler = function (e) {
      if (e.key === 'Escape') closeSignupModal();
    };
    document.addEventListener('keydown', overlay._escHandler);
  }

  function closeSignupModal() {
    const overlay = document.getElementById('signupModal');
    if (!overlay) return;

    overlay.classList.remove('signup-modal--open');
    document.body.style.overflow = '';

    if (overlay._escHandler) {
      document.removeEventListener('keydown', overlay._escHandler);
    }

    setTimeout(function () {
      overlay.remove();
    }, 250);
  }

  function togglePasswordTip(icon) {
    const bubble = icon.closest('.signup-modal__form-group').querySelector('.signup-modal__tip-bubble');
    if (!bubble) return;
    const isOpen = bubble.style.display !== 'none';
    bubble.style.display = isOpen ? 'none' : 'block';
  }

  function handleSignupStep1Submit(event) {
    event.preventDefault();

    const email = document.getElementById('signupEmail').value.trim();
    const password = document.getElementById('signupPassword').value;

    if (!email || !password) {
      alert('이메일과 비밀번호를 입력하세요.');
      return;
    }

    signupFormState.email = email;
    signupFormState.password = password;
    showSignupStep2View();
  }

  async function handleSignupSubmit(event) {
    event.preventDefault();

    signupFormState.nickname = document.getElementById('signupNickname').value.trim();
    signupFormState.phoneNumber = document.getElementById('signupPhoneNumber').value.trim();
    signupFormState.birthDate = document.getElementById('signupBirthDate').value;

    if (!signupFormState.nickname) {
      alert('닉네임을 입력하세요.');
      return;
    }

    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(signupFormState)
      });

      const data = await response.json();
      if (!response.ok) {
        alert(data.message || '회원가입에 실패했습니다.');
        return;
      }

      alert('회원가입이 완료되었습니다. 로그인해 주세요.');
      closeSignupModal();
      showAuthModal();
    } catch (error) {
      alert('회원가입 중 오류가 발생했습니다.');
    }
  }

  window.showSignupModal = showSignupModal;
  window.closeSignupModal = closeSignupModal;
  window.handleSignupStep1Submit = handleSignupStep1Submit;
  window.handleSignupSubmit = handleSignupSubmit;
  window.showSignupStep1View = showSignupStep1View;
  window.showSignupStep2View = showSignupStep2View;
  window.togglePasswordTip = togglePasswordTip;
});
