// 공유 상태
const shareState = {
  selectedUsers: [],
};

// 프로필 이미지 임시 상태
let pendingProfileAvatarImage = '';
let pendingProfileAvatarMode = 'keep';

// 아바타 호버 마크업
const avatarHoverMarkup =
  '<span class="avatarHover" aria-hidden="true">' +
  '<svg viewBox="0 0 24 24" class="avatarHoverIcon">' +
  '<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h2.17a1 1 0 0 0 .8-.4l.86-1.14A1 1 0 0 1 11.13 3h1.74a1 1 0 0 1 .8.46l.86 1.14a1 1 0 0 0 .8.4h2.17A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path>' +
  '<circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8"></circle>' +
  '</svg>' +
  '</span>';

// 기본 아바타 텍스트 계산
function getDefaultAvatarText() {
  const profileNickname = document.querySelector('[data-profile-nickname]')?.textContent?.trim() || 'N';
  const compactName = profileNickname.replace(/\s+/g, '');
  const hangulOnly = compactName.replace(/[^\uac00-\ud7a3]/g, '');
  const englishOnly = compactName.replace(/[^A-Za-z]/g, '');

  if (hangulOnly) {
    return hangulOnly.slice(-2);
  }

  if (englishOnly) {
    return englishOnly.charAt(0).toUpperCase();
  }

  return compactName.charAt(0).toUpperCase() || 'N';
}

// 아바타 버튼 렌더링
function renderAvatarButton(content) {
  const avatarOpen = document.querySelector('[data-profile-avatar-open]');
  if (!avatarOpen) return;
  avatarOpen.innerHTML = content + avatarHoverMarkup;
}

// 아바타 미리보기 렌더링
function renderAvatarPreview(content) {
  const preview = document.querySelector('[data-profile-edit-preview]');
  if (!preview) return;
  preview.innerHTML = content;
}

// 기본 아바타 렌더링
function renderDefaultAvatar() {
  const defaultText = getDefaultAvatarText();
  renderAvatarButton('<span class="avatarValue" data-profile-avatar-value>' + defaultText + '</span>');
  renderAvatarPreview(defaultText);
}

// 팔로우 관리 상태
const followManageState = {
  activeTab: 'following',
  searchKeyword: '',
  lists: {
    following: [
      { id: 'nomadcoder', name: '노마드코더', handle: '@nomadcoder', bio: '프론트엔드와 서비스 제작 과정을 공유합니다.', badge: '맞팔 중' },
      { id: 'soyeon.art', name: '김소연', handle: '@soyeon.art', bio: '색감 중심의 디지털 아트와 일러스트 작업물을 업로드합니다.', badge: '최근 소식 있음' },
      { id: 'daily.scene', name: '데일리씬', handle: '@daily.scene', bio: '매일 한 장면씩 기록하는 비주얼 아카이브 채널.', badge: '' },
    ],
    followers: [
      { id: 'minsuu', name: '김민수', handle: '@minsuu', bio: '브랜딩과 영상 편집을 함께 합니다.', badge: '나를 팔로우함', isFollowing: false },
      { id: 'jieun', name: '이지은', handle: '@jieun', bio: '전시 리뷰와 작가 인터뷰를 정리합니다.', badge: '나를 팔로우함', isFollowing: true },
      { id: 'atelier.han', name: '한아뜰리에', handle: '@atelier.han', bio: '오브제 기반 작업 기록을 남깁니다.', badge: '', isFollowing: false },
    ],
    blocked: [
      { id: 'spamaccount', name: '스팸계정', handle: '@spamaccount', bio: '반복적인 홍보 메시지 전송으로 차단됨.', badge: '차단됨' },
      { id: 'noise.user', name: '노이즈유저', handle: '@noise.user', bio: '원치 않는 댓글 반복 작성.', badge: '차단됨' },
    ],
  },
};

// 뱃지 목록 데이터
const BADGES = [
  { id: 'first_video', name: '첫 영상 업로드', grade: 'bronze', img: '/images/badge/first_video_badge.png', owned: true },
  { id: 'write_contest', name: '공모전 참가', grade: 'bronze', img: '/images/badge/write_contest_badge.png', owned: true },
  { id: 'first_sell', name: '첫 판매', grade: 'bronze', img: '/images/badge/first_sell_badge.png', owned: false },
  { id: 'upload_5', name: '5회 이상 업로드', grade: 'silver', img: '/images/badge/uploaded_more_than_5_times_badge.png', owned: true },
  { id: 'first_auction', name: '첫 경매 낙찰', grade: 'silver', img: '/images/badge/first_auction_winner_badge.png', owned: false },
  { id: 'contest_award', name: '공모전 수상', grade: 'gold', img: '/images/badge/contest_award_badge.png', owned: true },
  { id: 'auction_1m', name: '낙찰가 100만원', grade: 'gold', img: '/images/badge/auction_price_of_1_million_won_badge.png', owned: false },
  { id: 'auction_10m', name: '낙찰가 1000만원', grade: 'black', img: '/images/badge/auction_price_of_10_million_won_badge.png', owned: false },
  { id: 'gallery_views', name: '조회 1000만', grade: 'black', img: '/images/badge/art_gallery_views_over_10_million.png', owned: false },
];

// 뱃지 등급 라벨
const GRADE_LABELS = {
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  black: 'Black',
};

// 선택된 대표 뱃지
let selectedBadges = ['first_video', 'contest_award'];

// 공유 칩 렌더링
function renderShareChips() {
  const chips = document.querySelector('[data-share-chips]');
  const users = document.querySelectorAll('[data-share-user]');

  if (!chips) return;

  chips.innerHTML = shareState.selectedUsers
    .map((name) => '<span class="work-share-chip">' + name + '<button type="button" data-share-remove="' + name + '">×</button></span>')
    .join('');

  users.forEach((user) => {
    const name = user.dataset.shareUser;
    user.classList.toggle('is-selected', shareState.selectedUsers.includes(name));
  });
}

// 공유 버튼 상태 동기화
function syncShareButtonState(isActive) {
  const shareButton = document.querySelector('[data-share-button]');
  if (!shareButton) return;
  shareButton.classList.toggle('is-shareBtn', isActive);
}

// 차단 버튼 상태 동기화
function syncBlackButtonState(isBlocked) {
  const blackButton = document.querySelector('[data-black-button]');
  if (!blackButton) return;
  blackButton.classList.toggle('is-blackBtn', isBlocked);
  blackButton.classList.toggle('is-blocked', isBlocked);
  blackButton.textContent = isBlocked ? '차단 해제' : '차단하기';
}

// 프로필 뱃지 렌더링
function renderProfileBadges() {
  const container = document.querySelector('[data-profile-badges]');

  if (!container) return;

  const badges = selectedBadges
    .map((badgeId) => BADGES.find((badge) => badge.id === badgeId && badge.owned))
    .filter(Boolean);

  container.innerHTML = badges
    .map((badge) => {
      return '<span class="profileBadgeChip"><img src="' + badge.img + '" alt="' + badge.name + '"><span>' + badge.name + '</span></span>';
    })
    .join('');
}

// 뱃지 관리 그리드 렌더링
function renderBadgeManageGrid() {
  const grid = document.querySelector('[data-badge-manage-grid]');

  if (!grid) return;

  let previousGrade = '';

  grid.innerHTML = BADGES.map((badge) => {
    let gradeMarkup = '';

    if (badge.grade !== previousGrade) {
      previousGrade = badge.grade;
      gradeMarkup = '<div class="badgeGradeDivider badgeGradeDivider--' + badge.grade + '"><span>' + GRADE_LABELS[badge.grade] + '</span></div>';
    }

    const classes = ['badgeManageItem'];

    if (!badge.owned) {
      classes.push('is-locked');
    }

    if (selectedBadges.includes(badge.id)) {
      classes.push('is-selected');
    }

    const stateLabel = badge.owned ? (selectedBadges.includes(badge.id) ? '대표 뱃지 선택됨' : '보유 중') : '미보유';

    return (
      gradeMarkup +
      '<button type="button" class="' + classes.join(' ') + '" data-badge-id="' + badge.id + '">' +
        '<span class="badgeManageIcon"><img src="' + badge.img + '" alt="' + badge.name + '"></span>' +
        '<span class="badgeManageName">' + badge.name + '</span>' +
        '<span class="badgeManageState">' + stateLabel + '</span>' +
      '</button>'
    );
  }).join('');
}

// 뱃지 선택 토글
function toggleBadgeSelection(badgeId) {
  const badge = BADGES.find((item) => item.id === badgeId);

  if (!badge || !badge.owned) return;

  const selectedIndex = selectedBadges.indexOf(badgeId);

  if (selectedIndex !== -1) {
    selectedBadges.splice(selectedIndex, 1);
    renderBadgeManageGrid();
    return;
  }

  if (selectedBadges.length >= 2) {
    alert('대표 뱃지는 최대 2개까지 선택할 수 있습니다.');
    return;
  }

  selectedBadges.push(badgeId);
  renderBadgeManageGrid();
}

// 팔로우 관리 요약 문구
function getFollowManageSummary(tab, count) {
  if (tab === 'following') {
    return '현재 ' + count + '개의 팔로잉 계정을 관리하고 있습니다.';
  }

  if (tab === 'followers') {
    return '현재 ' + count + '명의 팔로워를 확인하고 있습니다.';
  }

  return '현재 ' + count + '개의 차단 계정을 관리하고 있습니다.';
}

// 팔로우 관리 빈 상태 문구
function getFollowManageEmptyMessage(tab) {
  if (tab === 'following') {
    return '조건에 맞는 팔로잉 계정이 없습니다.';
  }

  if (tab === 'followers') {
    return '조건에 맞는 팔로워가 없습니다.';
  }

  return '조건에 맞는 차단 계정이 없습니다.';
}

// 아바타 이니셜 추출
function getInitialLetter(name) {
  return name ? name.trim().charAt(0) : '?';
}

// 팔로우 관리 액션 버튼 생성
function getFollowManageActions(tab, item) {
  if (tab === 'following') {
    return '<button type="button" class="subscribeBtn is-subscribed" data-follow-manage-action="remove-following" data-follow-manage-id="' + item.id + '">팔로잉</button>';
  }

  if (tab === 'followers') {
    const followButtonLabel = item.isFollowing ? '팔로잉 중' : '팔로우백';
    const followButtonClass = item.isFollowing ? 'subscribeBtn is-subscribed' : 'subscribeBtn';
    const normalizedLabel = item.isFollowing ? '팔로잉' : '팔로우';

    return (
      '<button type="button" class="' + followButtonClass + '" data-follow-manage-action="toggle-follow-back" data-follow-manage-id="' + item.id + '" aria-label="' + followButtonLabel + '">' + normalizedLabel + '</button>' +
      '<button type="button" class="followManageActionBtn is-danger" data-follow-manage-action="block-follower" data-follow-manage-id="' + item.id + '">차단</button>'
    );
  }

  return '<button type="button" class="followManageActionBtn" data-follow-manage-action="unblock" data-follow-manage-id="' + item.id + '">차단 해제</button>';
}

// 팔로우 관리 리스트 렌더링
function renderFollowManageList() {
  const list = document.querySelector('[data-follow-manage-list]');
  const summary = document.querySelector('[data-follow-manage-summary]');
  const searchInput = document.querySelector('[data-follow-manage-search]');

  if (!list || !summary) return;

  if (searchInput && searchInput.value !== followManageState.searchKeyword) {
    searchInput.value = followManageState.searchKeyword;
  }

  document.querySelectorAll('[data-follow-manage-tab]').forEach((tabButton) => {
    tabButton.classList.toggle('is-active', tabButton.dataset.followManageTab === followManageState.activeTab);
  });

  const items = followManageState.lists[followManageState.activeTab] || [];
  const keyword = followManageState.searchKeyword.trim().toLowerCase();
  const filteredItems = items.filter((item) => {
    if (!keyword) return true;

    return [item.name, item.handle, item.bio]
      .filter(Boolean)
      .some((value) => value.toLowerCase().includes(keyword));
  });

  summary.textContent = getFollowManageSummary(followManageState.activeTab, filteredItems.length);

  if (filteredItems.length === 0) {
    list.innerHTML = '<div class="followManageEmpty">' + getFollowManageEmptyMessage(followManageState.activeTab) + '</div>';
    return;
  }

  list.innerHTML = filteredItems
    .map((item) => {
      const badgeMarkup = item.badge ? '<span class="followManageBadge">' + item.badge + '</span>' : '';

      return (
        '<article class="followManageItem">' +
          '<div class="followManageAvatar">' + getInitialLetter(item.name) + '</div>' +
          '<div class="followManageInfo">' +
            '<div class="followManageNameRow"><strong class="followManageName">' + item.name + '</strong>' + badgeMarkup + '</div>' +
            '<p class="followManageMeta">' + item.handle + '</p>' +
            '<p class="followManageBio">' + item.bio + '</p>' +
          '</div>' +
          '<div class="followManageActions">' + getFollowManageActions(followManageState.activeTab, item) + '</div>' +
        '</article>'
      );
    })
    .join('');
}

// 팔로우 관리 항목 제거
function removeFollowManageItem(tab, itemId) {
  followManageState.lists[tab] = (followManageState.lists[tab] || []).filter((item) => item.id !== itemId);
}

// 클릭 이벤트 처리
document.addEventListener('click', async (event) => {
  const modalOpenButton = event.target.closest('[data-modal-open]');

  if (modalOpenButton) {
    modalOpen(modalOpenButton.dataset.modalOpen);
    return;
  }

  const modalCloseButton = event.target.closest('[data-modal-close]');

  if (modalCloseButton) {
    modalClose(modalCloseButton.dataset.modalClose);
    return;
  }

  const moreButton = event.target.closest('[data-more-button]');

  if (moreButton) {
    modalOpen('profile-setting-modal');
    return;
  }

  const profileEditOpen = event.target.closest('[data-profile-edit-open]');

  if (profileEditOpen) {
    modalClose('profile-setting-modal');
    modalOpen('profile-edit-modal');
    return;
  }

  const nicknameOpen = event.target.closest('[data-nickname-open]');

  if (nicknameOpen) {
    modalClose('profile-setting-modal');
    modalOpen('nickname-edit-modal');
    return;
  }

  const passwordOpen = event.target.closest('[data-password-open]');

  if (passwordOpen) {
    modalClose('profile-setting-modal');
    modalOpen('password-edit-modal');
    return;
  }

  const followManageOpen = event.target.closest('[data-follow-manage-open]');

  if (followManageOpen) {
    modalClose('profile-setting-modal');
    renderFollowManageList();
    modalOpen('follow-manage-modal');
    return;
  }

  const badgeManageOpen = event.target.closest('[data-badge-manage-open]');

  if (badgeManageOpen) {
    modalClose('profile-setting-modal');
    renderBadgeManageGrid();
    modalOpen('badge-manage-modal');
    return;
  }

  const nicknameSave = event.target.closest('[data-profile-nickname-save]');

  if (nicknameSave) {
    const nicknameInput = document.querySelector('[data-profile-nickname-input]');
    const nicknameTargets = document.querySelectorAll('[data-profile-nickname]');
    const nextNickname = nicknameInput?.value.trim();

    if (!nextNickname) {
      alert('닉네임을 입력해 주세요.');
      return;
    }

    nicknameTargets.forEach((target) => {
      target.textContent = nextNickname;
    });

    if (!document.querySelector('[data-profile-avatar-open] img')) {
      renderDefaultAvatar();
    }

    modalClose('nickname-edit-modal');
    return;
  }

  const badgeManageSave = event.target.closest('[data-badge-manage-save]');

  if (badgeManageSave) {
    renderProfileBadges();
    modalClose('badge-manage-modal');
    return;
  }

  const passwordSave = event.target.closest('[data-profile-password-save]');

  if (passwordSave) {
    const currentPassword = document.getElementById('profile-password-current');
    const nextPassword = document.getElementById('profile-password-next');
    const confirmPassword = document.getElementById('profile-password-confirm');

    if (!currentPassword?.value.trim() || !nextPassword?.value.trim() || !confirmPassword?.value.trim()) {
      alert('비밀번호를 모두 입력해 주세요.');
      return;
    }

    if (nextPassword.value !== confirmPassword.value) {
      alert('새 비밀번호가 일치하지 않습니다.');
      return;
    }

    currentPassword.value = '';
    nextPassword.value = '';
    confirmPassword.value = '';
    modalClose('password-edit-modal');
    return;
  }

  const profileAvatarOpen = event.target.closest('[data-profile-avatar-open]');

  if (profileAvatarOpen) {
    const currentImage = profileAvatarOpen.querySelector('img');
    const fileInput = document.querySelector('[data-profile-edit-file]');

    pendingProfileAvatarImage = '';
    pendingProfileAvatarMode = 'keep';

    if (fileInput) {
      fileInput.value = '';
    }

    if (currentImage) {
      renderAvatarPreview('<img src="' + currentImage.src + '" alt="프로필 이미지">');
    } else {
      renderAvatarPreview(getDefaultAvatarText());
    }

    modalOpen('profile-edit-modal');
    return;
  }

  const profileAvatarReset = event.target.closest('[data-profile-avatar-reset]');

  if (profileAvatarReset) {
    pendingProfileAvatarImage = '';
    pendingProfileAvatarMode = 'default';
    renderAvatarPreview(getDefaultAvatarText());
    return;
  }

  const profileAvatarApply = event.target.closest('[data-profile-avatar-apply]');

  if (profileAvatarApply) {
    if (pendingProfileAvatarMode === 'image' && pendingProfileAvatarImage) {
      renderAvatarButton(pendingProfileAvatarImage);
    } else if (pendingProfileAvatarMode === 'default') {
      renderDefaultAvatar();
    }

    pendingProfileAvatarImage = '';
    pendingProfileAvatarMode = 'keep';
    modalClose('profile-edit-modal');
    return;
  }

  const profileSettingItem = event.target.closest('[data-profile-setting-item]');

  if (profileSettingItem) {
    modalClose('profile-setting-modal');
    return;
  }

  const channelTab = event.target.closest('[data-channel-tab]');

  if (channelTab) {
    activateProfileTab(channelTab.dataset.channelTab || 'galleries');
    return;
  }

  const filterButton = event.target.closest('[data-video-filter]');

  if (filterButton) {
    document.querySelectorAll('[data-video-filter]').forEach((item) => {
      item.classList.remove('is-active');
    });

    filterButton.classList.add('is-active');
    return;
  }

  const shareOpen = event.target.closest('[data-share-button]');

  if (shareOpen) {
    syncShareButtonState(true);
    modalOpen('share-modal');
    return;
  }

  const blackButton = event.target.closest('[data-black-button]');

  if (blackButton) {
    if (blackButton.classList.contains('is-blocked')) {
      modalOpen('unblack-modal');
    } else {
      modalOpen('black-modal');
    }
    return;
  }

  const blackConfirm = event.target.closest('[data-black-confirm]');

  if (blackConfirm) {
    syncBlackButtonState(true);
    modalClose('black-modal');
    return;
  }

  const unblackConfirm = event.target.closest('[data-unblack-confirm]');

  if (unblackConfirm) {
    syncBlackButtonState(false);
    modalClose('unblack-modal');
    return;
  }

  const shareUser = event.target.closest('[data-share-user]');

  if (shareUser) {
    const name = shareUser.dataset.shareUser;

    if (shareState.selectedUsers.includes(name)) {
      shareState.selectedUsers = shareState.selectedUsers.filter((item) => item !== name);
    } else {
      shareState.selectedUsers.push(name);
    }

    renderShareChips();
    return;
  }

  const shareRemove = event.target.closest('[data-share-remove]');

  if (shareRemove) {
    const name = shareRemove.dataset.shareRemove;
    shareState.selectedUsers = shareState.selectedUsers.filter((item) => item !== name);
    renderShareChips();
    return;
  }

  const shareCopy = event.target.closest('[data-share-copy]');

  if (shareCopy) {
    const input = document.querySelector('[data-share-link-input]');
    if (!input) return;

    try {
      await navigator.clipboard.writeText(input.value);
    } catch (error) {
      input.select();
      document.execCommand('copy');
    }

    shareCopy.textContent = '복사됨';
    setTimeout(() => {
      shareCopy.textContent = '복사';
    }, 1500);
    return;
  }

  const shareSend = event.target.closest('[data-share-send]');

  if (shareSend) {
    const message = document.querySelector('[data-share-message]');

    if (shareState.selectedUsers.length === 0) {
      alert('받는 사람을 선택해 주세요.');
      return;
    }

    shareState.selectedUsers = [];
    renderShareChips();
    if (message) message.value = '';
    syncShareButtonState(false);
    modalClose('share-modal');
    return;
  }

  const unsubscribeConfirm = event.target.closest('[data-unsubscribe-confirm]');

  if (unsubscribeConfirm) {
    const subscribeButton = document.querySelector('[data-subscribe-button]');

    if (!subscribeButton) return;

    subscribeButton.classList.remove('is-subscribed');
    subscribeButton.textContent = subscribeButton.dataset.subscribeDefault || '팔로우';
    modalClose('unsubscribe-modal');
    return;
  }

  const subscribeButton = event.target.closest('[data-subscribe-button]');

  if (!subscribeButton) return;

  if (subscribeButton.classList.contains('is-subscribed')) {
    modalOpen('unsubscribe-modal');
    return;
  }

  subscribeButton.classList.add('is-subscribed');
  subscribeButton.textContent = subscribeButton.dataset.subscribeActive || '팔로잉';
});

// 입력 이벤트 처리
document.addEventListener('input', (event) => {
  const followManageSearch = event.target.closest('[data-follow-manage-search]');

  if (followManageSearch) {
    followManageState.searchKeyword = followManageSearch.value;
    renderFollowManageList();
    return;
  }

  const search = event.target.closest('[data-share-search]');

  if (search) {
    const keyword = search.value.trim().toLowerCase();

    document.querySelectorAll('[data-share-user]').forEach((user) => {
      const text = user.textContent.toLowerCase();
      user.style.display = keyword === '' || text.includes(keyword) ? '' : 'none';
    });
  }
});

// 파일 변경 이벤트 처리
document.addEventListener('change', (event) => {
  const fileInput = event.target.closest('[data-profile-edit-file]');

  if (!fileInput || !fileInput.files || !fileInput.files[0]) return;

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = ({ target }) => {
    if (!target) return;

    const imageTag = '<img src="' + target.result + '" alt="프로필 이미지">';
    pendingProfileAvatarImage = imageTag;
    pendingProfileAvatarMode = 'image';

    renderAvatarPreview(imageTag);
  };

  reader.readAsDataURL(file);
});

// 뱃지 / 팔로우 관리 클릭 이벤트
document.addEventListener('click', (event) => {
  const badgeItem = event.target.closest('[data-badge-id]');

  if (badgeItem) {
    toggleBadgeSelection(badgeItem.dataset.badgeId);
    return;
  }

  const followManageTab = event.target.closest('[data-follow-manage-tab]');

  if (followManageTab) {
    followManageState.activeTab = followManageTab.dataset.followManageTab;
    followManageState.searchKeyword = '';
    renderFollowManageList();
    return;
  }

  const followManageAction = event.target.closest('[data-follow-manage-action]');

  if (!followManageAction) return;

  const action = followManageAction.dataset.followManageAction;
  const itemId = followManageAction.dataset.followManageId;

  if (!action || !itemId) return;

  if (action === 'remove-following') {
    removeFollowManageItem('following', itemId);
    renderFollowManageList();
    return;
  }

  if (action === 'toggle-follow-back') {
    followManageState.lists.followers = followManageState.lists.followers.map((item) => {
      if (item.id !== itemId) return item;

      return {
        ...item,
        isFollowing: !item.isFollowing,
      };
    });
    renderFollowManageList();
    return;
  }

  if (action === 'block-follower') {
    const target = followManageState.lists.followers.find((item) => item.id === itemId);
    removeFollowManageItem('followers', itemId);

    if (target) {
      followManageState.lists.blocked = [
        {
          id: target.id,
          name: target.name,
          handle: target.handle,
          bio: target.bio,
          badge: '차단됨',
        },
        ...followManageState.lists.blocked,
      ];
    }

    renderFollowManageList();
    return;
  }

  if (action === 'unblock') {
    removeFollowManageItem('blocked', itemId);
    renderFollowManageList();
  }
});

// 모달 바깥 클릭 처리
document.addEventListener('click', (event) => {
  const modal = event.target.closest('.modal');
  if (!modal || event.target !== modal) return;

  if (modal.id === 'share-modal') {
    syncShareButtonState(false);
  }
});

// ESC 키 처리
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    syncShareButtonState(false);
  }
});

// 초기 렌더링
renderShareChips();
syncBlackButtonState(document.querySelector('[data-black-button]')?.classList.contains('is-blocked') || false);
renderFollowManageList();
renderProfileBadges();

// 기본 아바타 초기화
if (document.querySelector('[data-profile-avatar-open]') && !document.querySelector('[data-profile-avatar-open] img')) {
  renderDefaultAvatar();
}

function activateProfileTab(tabName) {
  const resolvedTab = tabName === 'works' ? 'works' : 'galleries';

  document.querySelectorAll('[data-channel-tab]').forEach((item) => {
    item.classList.toggle('is-active', item.dataset.channelTab === resolvedTab);
  });

  document.querySelectorAll('[data-profile-panel]').forEach((panel) => {
    panel.hidden = panel.dataset.profilePanel !== resolvedTab;
  });
}

const initialProfileTab = new URLSearchParams(window.location.search).get('tab');
activateProfileTab(initialProfileTab);
