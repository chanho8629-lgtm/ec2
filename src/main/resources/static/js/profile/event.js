// 공유 대상 상태
const shareState = {
  selectedUsers: [],
  receiverMap: new Map(),
};

// 프로필 화면 상태
const profilePageState = {
  followManageLoaded: false,
  badgeManageLoaded: false,
  profileNickname: getProfileNicknameFromPage(),
};

// 현재 프로필 닉네임 조회
function resolveProfileNickname() {
  const nickname = getProfileNicknameFromPage();
  if (nickname) {
    profilePageState.profileNickname = nickname;
  }
  return profilePageState.profileNickname;
}

// JSON 요청 처리
async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    credentials: 'same-origin',
    ...options,
  });

  if (!response.ok) {
    let message = '요청 처리 중 오류가 발생했습니다.';

    try {
      const errorBody = await response.json();
      message = errorBody.message || message;
    } catch (error) {
      try {
        const text = await response.text();
        if (text) message = text;
      } catch (ignore) {
      }
    }

    throw new Error(message);
  }

  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return null;
  }

  return response.json();
}

// FormData 요청 처리
async function requestFormData(url, formData, options = {}) {
  const response = await fetch(url, {
    method: 'POST',
    body: formData,
    credentials: 'same-origin',
    ...options,
  });

  if (!response.ok) {
    let message = '요청 처리 중 오류가 발생했습니다.';

    try {
      const errorBody = await response.json();
      message = errorBody.message || message;
    } catch (error) {
      try {
        const text = await response.text();
        if (text) message = text;
      } catch (ignore) {
      }
    }

    throw new Error(message);
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    return null;
  }

  return response.json();
}

function showSuccessMessage(message) {
  alert(message);
}

// 현재 프로필 경로 조회
function getProfileNicknameFromPage() {
  const nicknameNode = document.querySelector('[data-profile-nickname]');
  if (nicknameNode?.textContent?.trim()) {
    return nicknameNode.textContent.trim();
  }

  const pathSegments = window.location.pathname.split('/').filter(Boolean);
  if (pathSegments[0] === 'profile' && pathSegments[1]) {
    return decodeURIComponent(pathSegments[1]);
  }

  return '';
}

// 내 프로필 여부 조회
function isMyProfilePage() {
  return window.location.pathname === '/profile';
}

// 닉네임 입력값 검증
function validateNicknameInput(nickname) {
  if (!nickname) {
    return '닉네임을 입력해 주세요.';
  }
  if (nickname.length < 2 || nickname.length > 20) {
    return '닉네임은 2자 이상 20자 이하로 입력해 주세요.';
  }
  return '';
}

// 비밀번호 입력값 검증
function validatePasswordInput(currentPassword, nextPassword, confirmPassword) {
  if (!currentPassword || !nextPassword || !confirmPassword) {
    return '비밀번호를 모두 입력해 주세요.';
  }
  if (nextPassword.length < 8 || nextPassword.length > 20) {
    return '새 비밀번호는 8자 이상 20자 이하로 입력해 주세요.';
  }
  if (!/[A-Za-z]/.test(nextPassword) || !/\d/.test(nextPassword) || !/[!@#$%^&*()_\-+=\[{\]};:'",<.>/?\\|`~]/.test(nextPassword)) {
    return '새 비밀번호는 영문, 숫자, 특수문자를 모두 포함해야 합니다.';
  }
  if (nextPassword !== confirmPassword) {
    return '새 비밀번호가 일치하지 않습니다.';
  }
  if (currentPassword === nextPassword) {
    return '현재 비밀번호와 다른 비밀번호를 입력해 주세요.';
  }
  return '';
}

// HTML 이스케이프 처리
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

// 프로필 아바타 마크업 생성
function getAvatarMarkup(profileImage, nickname) {
  if (profileImage) {
    return '<img src="' + escapeHtml(profileImage) + '" alt="' + escapeHtml(nickname || '프로필') + ' 프로필 이미지">';
  }

  const source = (nickname || 'N').trim();
  const first = source ? source.charAt(0) : 'N';
  return '<span class="work-share-user__avatar">' + escapeHtml(first) + '</span>';
}

// 팔로우 버튼 상태 변경
function setSubscribeButtonState(isFollowing) {
  const subscribeButton = document.querySelector('[data-subscribe-button]');
  if (!subscribeButton) return;

  subscribeButton.classList.toggle('is-subscribed', isFollowing);
  subscribeButton.textContent = isFollowing
    ? (subscribeButton.dataset.subscribeActive || '팔로잉')
    : (subscribeButton.dataset.subscribeDefault || '팔로우');
}

// 공유 링크 정리
function resolveShareUrl() {
  const input = document.querySelector('[data-share-link-input]');
  if (!window.BideoShare) {
    return input ? input.value : window.location.href;
  }

  return window.BideoShare.normalizeInputUrl(input, window.location.href);
}

// 프로필 카운트 갱신
function applyProfileCounters(profile) {
  const channelText = document.querySelector('.channelText span:last-child');
  if (channelText && profile) {
    channelText.textContent = ' · 팔로워 ' + (profile.followerCount ?? 0) + '명 · 팔로잉 ' + (profile.followingCount ?? 0) + '명 · 작품 ' + (profile.workCount ?? 0) + '개';
  }
}

// 팔로우 관리 목록 조회
async function fetchFollowManageList(tab) {
  if (tab === 'following') {
    return requestJson('/api/profile/me/followings?page=0');
  }
  if (tab === 'followers') {
    return requestJson('/api/profile/me/followers?page=0');
  }

  const response = await requestJson('/api/profile/me/blocks?page=0');
  return response?.content || [];
}

// 팔로우 관리 데이터 로드
async function loadFollowManageData(tab = followManageState.activeTab) {
  const list = await fetchFollowManageList(tab);
  followManageState.lists[tab] = Array.isArray(list) ? list : [];
  profilePageState.followManageLoaded = true;
  renderFollowManageList();
}

// 뱃지 관리 데이터 로드
async function loadBadgeManageData() {
  const response = await requestJson('/api/profile/me/badges');
  const ownedBadges = response?.ownedBadges || [];

  BADGES.length = 0;
  ownedBadges.forEach((badge) => {
    BADGES.push({
      id: String(badge.badgeId),
      badgeId: badge.badgeId,
      name: badge.badgeName,
      grade: 'bronze',
      img: '/images/badge/' + badge.imageFile,
      owned: true,
      isDisplayed: !!badge.isDisplayed,
    });
  });

  selectedBadges = (response?.displayedBadgeIds || []).map(String);
  profilePageState.badgeManageLoaded = true;
  renderBadgeManageGrid();
}

// 공유 대상 검색
async function searchShareUsers(keyword) {
  const profileNickname = resolveProfileNickname();
  if (!profileNickname) return;

  const users = await requestJson('/api/profile/' + encodeURIComponent(profileNickname) + '/share/receivers?keyword=' + encodeURIComponent(keyword || ''));
  const list = document.querySelector('[data-share-list]');
  if (!list) return;

  shareState.receiverMap = new Map();
  users.forEach((user) => {
    shareState.receiverMap.set(user.nickname, user);
  });

  if (users.length === 0) {
    list.innerHTML = '<div class="followManageEmpty">검색 결과가 없습니다.</div>';
    return;
  }

  list.innerHTML = users.map((user) => {
    return (
      '<button type="button" class="work-share-user" data-share-user="' + escapeHtml(user.nickname) + '">' +
        getAvatarMarkup(user.profileImage, user.nickname) +
        '<span class="work-share-user__meta">' +
          '<strong>' + escapeHtml(user.nickname) + '</strong>' +
          '<small>' + escapeHtml(user.creatorVerified ? '크리에이터 인증' : '일반 회원') + '</small>' +
        '</span>' +
      '</button>'
    );
  }).join('');

  renderShareChips();
}

// 프로필 이미지 임시 상태
let pendingProfileAvatarImage = '';
let pendingProfileAvatarMode = 'keep';
let pendingProfileBannerImage = '';
let pendingProfileBannerMode = 'keep';

// 아바타 호버 마크업
const avatarHoverMarkup =
  '<span class="avatarHover" aria-hidden="true">' +
  '<svg viewBox="0 0 24 24" class="avatarHoverIcon">' +
  '<path d="M4 7.5A2.5 2.5 0 0 1 6.5 5h2.17a1 1 0 0 0 .8-.4l.86-1.14A1 1 0 0 1 11.13 3h1.74a1 1 0 0 1 .8.46l.86 1.14a1 1 0 0 0 .8.4h2.17A2.5 2.5 0 0 1 20 7.5v9A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5z" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.8"></path>' +
  '<circle cx="12" cy="12" r="3.2" fill="none" stroke="currentColor" stroke-width="1.8"></circle>' +
  '</svg>' +
  '</span>';

// 기본 아바타 텍스트 조회
function getDefaultAvatarText() {
  const profileNickname = document.querySelector('[data-profile-nickname]')?.textContent?.trim()
    || document.querySelector('[data-profile-name]')?.textContent?.trim()
    || 'N';
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

function renderBannerPreview(imageUrl) {
  const preview = document.querySelector('[data-profile-banner-preview]');
  if (!preview) return;

  if (imageUrl) {
    preview.style.backgroundImage = 'linear-gradient(180deg, rgba(16, 24, 40, 0.16), rgba(16, 24, 40, 0.48)), url("' + imageUrl.replace(/"/g, '\\"') + '")';
  } else {
    preview.style.backgroundImage = '';
  }
}

function renderBannerBackground(imageUrl) {
  const banner = document.querySelector('.banner');
  if (!banner) return;

  if (imageUrl) {
    banner.style.backgroundImage = 'linear-gradient(180deg, rgba(16, 24, 40, 0.16), rgba(16, 24, 40, 0.48)), url("' + imageUrl.replace(/"/g, '\\"') + '")';
    banner.classList.add('has-image');
    banner.classList.remove('is-hidden');
  } else {
    banner.style.backgroundImage = '';
    banner.classList.remove('has-image');
    banner.classList.add('is-hidden');
  }
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
    following: [],
    followers: [],
    blocked: [],
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
let selectedBadges = [];

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

// 공유 버튼 상태 변경
function syncShareButtonState(isActive) {
  const shareButton = document.querySelector('[data-share-button]');
  if (!shareButton) return;
  shareButton.classList.toggle('is-shareBtn', isActive);
}

// 차단 버튼 상태 변경
function syncBlackButtonState(isBlocked) {
  const blackButton = document.querySelector('[data-black-button]');
  if (!blackButton) return;
  blackButton.classList.toggle('is-blackBtn', isBlocked);
  blackButton.classList.toggle('is-blocked', isBlocked);
  blackButton.textContent = isBlocked ? '차단 해제' : '차단하기';
}

// 프로필 뱃지 렌더링
function renderProfileBadges(force = false) {
  const container = document.querySelector('[data-profile-badges]');

  if (!container) return;
  if (!force && container.querySelector('[data-server-badge="true"]')) return;

  const badges = selectedBadges
    .map((badgeId) => BADGES.find((badge) => badge.id === badgeId && badge.owned))
    .filter(Boolean);

  container.innerHTML = badges
    .map((badge) => {
      return '<span class="profileBadgeChip"><img src="' + badge.img + '" alt="' + badge.name + '"><span>' + badge.name + '</span></span>';
    })
    .join('');
}

// 뱃지 그리드 렌더링
function renderBadgeManageGrid() {
  const grid = document.querySelector('[data-badge-manage-grid]');

  if (!grid) return;

  if (BADGES.length === 0) {
    grid.innerHTML = '<div class="followManageEmpty">보유한 뱃지가 없습니다.</div>';
    return;
  }

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

// 뱃지 선택 변경
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

// 팔로우 관리 요약 조회
function getFollowManageSummary(tab, count) {
  if (tab === 'following') {
    return '현재 ' + count + '개의 팔로잉 계정을 관리하고 있습니다.';
  }

  if (tab === 'followers') {
    return '현재 ' + count + '명의 팔로워를 확인하고 있습니다.';
  }

  return '현재 ' + count + '개의 차단 계정을 관리하고 있습니다.';
}

// 팔로우 관리 빈 문구 조회
function getFollowManageEmptyMessage(tab) {
  if (tab === 'following') {
    return '조건에 맞는 팔로잉 계정이 없습니다.';
  }

  if (tab === 'followers') {
    return '조건에 맞는 팔로워가 없습니다.';
  }

  return '조건에 맞는 차단 계정이 없습니다.';
}

// 이니셜 조회
function getInitialLetter(name) {
  return name ? name.trim().charAt(0) : '?';
}

// 팔로우 관리 액션 생성
function getFollowManageActions(tab, item) {
  if (tab === 'following') {
    return '<button type="button" class="subscribeBtn is-subscribed" data-follow-manage-action="remove-following" data-follow-manage-id="' + escapeHtml(item.nickname) + '">팔로잉</button>';
  }

  if (tab === 'followers') {
    const followButtonLabel = item.isFollowing ? '팔로잉 중' : '팔로우백';
    const followButtonClass = item.isFollowing ? 'subscribeBtn is-subscribed' : 'subscribeBtn';
    const normalizedLabel = item.isFollowing ? '팔로잉' : '팔로우';

    return (
      '<button type="button" class="' + followButtonClass + '" data-follow-manage-action="toggle-follow-back" data-follow-manage-id="' + escapeHtml(item.nickname) + '" aria-label="' + followButtonLabel + '">' + normalizedLabel + '</button>' +
      '<button type="button" class="followManageActionBtn is-danger" data-follow-manage-action="block-follower" data-follow-manage-id="' + escapeHtml(item.nickname) + '">차단</button>'
    );
  }

  return '<button type="button" class="followManageActionBtn" data-follow-manage-action="unblock" data-follow-manage-id="' + escapeHtml(item.blockedId) + '" data-follow-manage-nickname="' + escapeHtml(item.nickname) + '">차단 해제</button>';
}

// 팔로우 관리 목록 렌더링
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

    return [item.nickname, item.name, item.handle, item.bio]
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
      const nickname = item.nickname || item.name || '-';
      const handle = item.handle || ('@' + nickname);
      const bio = item.bio || '';
      const badgeMarkup = item.badge ? '<span class="followManageBadge">' + item.badge + '</span>' : '';
      const avatarMarkup = item.profileImage
        ? '<img src="' + escapeHtml(item.profileImage) + '" alt="' + escapeHtml(nickname) + ' 프로필 이미지">'
        : escapeHtml(getInitialLetter(nickname));

      return (
        '<article class="followManageItem">' +
          '<div class="followManageAvatar">' + avatarMarkup + '</div>' +
          '<div class="followManageInfo">' +
            '<div class="followManageNameRow"><strong class="followManageName">' + escapeHtml(nickname) + '</strong>' + badgeMarkup + '</div>' +
            '<p class="followManageMeta">' + escapeHtml(handle) + '</p>' +
            '<p class="followManageBio">' + escapeHtml(bio) + '</p>' +
          '</div>' +
          '<div class="followManageActions">' + getFollowManageActions(followManageState.activeTab, item) + '</div>' +
        '</article>'
      );
    })
    .join('');
}

// 팔로우 관리 항목 제거
function removeFollowManageItem(tab, itemId) {
  followManageState.lists[tab] = (followManageState.lists[tab] || []).filter((item) => {
    const compareKey = tab === 'blocked' ? String(item.blockedId) : item.nickname;
    return String(compareKey) !== String(itemId);
  });
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
    await loadFollowManageData();
    modalOpen('follow-manage-modal');
    return;
  }

  const badgeManageOpen = event.target.closest('[data-badge-manage-open]');

  if (badgeManageOpen) {
    modalClose('profile-setting-modal');
    await loadBadgeManageData();
    modalOpen('badge-manage-modal');
    return;
  }

  const bannerEditOpen = event.target.closest('[data-banner-edit-open]');

  if (bannerEditOpen) {
    modalClose('profile-setting-modal');
    pendingProfileBannerImage = '';
    const currentImage = document.querySelector('.banner.has-image')?.style.backgroundImage || '';
    const matched = currentImage.match(/url\("?(.*?)"?\)/);
    renderBannerPreview(matched ? matched[1] : '');
    modalOpen('banner-edit-modal');
    return;
  }

  const nicknameSave = event.target.closest('[data-profile-nickname-save]');

  if (nicknameSave) {
    const nicknameInput = document.querySelector('[data-profile-nickname-input]');
    const nicknameTargets = document.querySelectorAll('[data-profile-nickname]');
    const nextNickname = nicknameInput?.value.trim();

    const nicknameValidationMessage = validateNicknameInput(nextNickname);
    if (nicknameValidationMessage) {
      alert(nicknameValidationMessage);
      return;
    }

    try {
      await requestJson('/api/profile/me/nickname', {
        method: 'PUT',
        body: JSON.stringify({ nickname: nextNickname }),
      });

      nicknameTargets.forEach((target) => {
        target.textContent = nextNickname;
      });

      if (!document.querySelector('[data-profile-avatar-open] img')) {
        renderDefaultAvatar();
      }

      modalClose('nickname-edit-modal');
      profilePageState.profileNickname = nextNickname;
      showSuccessMessage('닉네임이 수정되었습니다.');
    } catch (error) {
      alert(error.message || '닉네임 수정에 실패했습니다.');
    }
    return;
  }

  const badgeManageSave = event.target.closest('[data-badge-manage-save]');

  if (badgeManageSave) {
    try {
      const badgeIds = selectedBadges.map((badgeId) => Number(badgeId));
      await requestJson('/api/profile/me/badges/display', {
        method: 'PUT',
        body: JSON.stringify(badgeIds),
      });
      renderProfileBadges(true);
      modalClose('badge-manage-modal');
      showSuccessMessage('대표 뱃지가 저장되었습니다.');
    } catch (error) {
      alert(error.message || '뱃지 저장에 실패했습니다.');
    }
    return;
  }

  const passwordSave = event.target.closest('[data-profile-password-save]');

  if (passwordSave) {
    const currentPassword = document.getElementById('profile-password-current');
    const nextPassword = document.getElementById('profile-password-next');
    const confirmPassword = document.getElementById('profile-password-confirm');

    const validationMessage = validatePasswordInput(
      currentPassword?.value.trim(),
      nextPassword?.value.trim(),
      confirmPassword?.value.trim()
    );
    if (validationMessage) {
      alert(validationMessage);
      return;
    }

    try {
      await requestJson('/api/profile/me/password', {
        method: 'PUT',
        body: JSON.stringify({
          currentPassword: currentPassword.value.trim(),
          newPassword: nextPassword.value.trim(),
          confirmPassword: confirmPassword.value.trim(),
        }),
      });

      currentPassword.value = '';
      nextPassword.value = '';
      confirmPassword.value = '';
      modalClose('password-edit-modal');
      showSuccessMessage('비밀번호가 수정되었습니다.');
    } catch (error) {
      alert(error.message || '비밀번호 수정에 실패했습니다.');
    }
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
    try {
      let avatarUpdated = false;

      if (pendingProfileAvatarMode === 'image' && pendingProfileAvatarImage) {
        const fileInput = document.querySelector('[data-profile-edit-file]');
        const selectedFile = fileInput?.files?.[0];

        if (!selectedFile) {
          alert('프로필 이미지를 선택해 주세요.');
          return;
        }

        const formData = new FormData();
        formData.append('profileImageFile', selectedFile);
        const updatedProfile = await requestFormData('/api/profile/me/profile-image', formData);

        if (updatedProfile?.profileImage) {
          renderAvatarButton('<img src="' + updatedProfile.profileImage + '" alt="프로필 이미지">');
          renderAvatarPreview('<img src="' + updatedProfile.profileImage + '" alt="프로필 이미지">');
        }
        avatarUpdated = true;
      } else if (pendingProfileAvatarMode === 'default') {
        await requestJson('/api/profile/me/basic', {
          method: 'PUT',
          body: JSON.stringify({ profileImage: '' }),
        });
        renderDefaultAvatar();
        avatarUpdated = true;
      }

      pendingProfileAvatarImage = '';
      pendingProfileAvatarMode = 'keep';
      modalClose('profile-edit-modal');
      if (avatarUpdated) {
        showSuccessMessage('프로필 이미지가 수정되었습니다.');
      }
    } catch (error) {
      alert(error.message || '프로필 수정에 실패했습니다.');
    }
    return;
  }

  const profileBannerApply = event.target.closest('[data-profile-banner-apply]');

  if (profileBannerApply) {
    try {
      let bannerUpdated = false;

      if (pendingProfileBannerMode === 'image' && pendingProfileBannerImage) {
        const fileInput = document.querySelector('[data-profile-banner-file]');
        const selectedFile = fileInput?.files?.[0];

        if (!selectedFile) {
          alert('배너 이미지를 선택해 주세요.');
          return;
        }

        const formData = new FormData();
        formData.append('bannerImageFile', selectedFile);
        const updatedProfile = await requestFormData('/api/profile/me/banner-image', formData);
        renderBannerBackground(updatedProfile?.bannerImage || '');
        renderBannerPreview(updatedProfile?.bannerImage || '');
        bannerUpdated = true;
      }

      pendingProfileBannerImage = '';
      pendingProfileBannerMode = 'keep';
      modalClose('banner-edit-modal');
      if (bannerUpdated) {
        showSuccessMessage('프로필 배너가 수정되었습니다.');
      }
    } catch (error) {
      alert(error.message || '배너 수정에 실패했습니다.');
    }
    return;
  }

  const profileBannerRemove = event.target.closest('[data-profile-banner-remove]');

  if (profileBannerRemove) {
    try {
      const updatedProfile = await requestJson('/api/profile/me/basic', {
        method: 'PUT',
        body: JSON.stringify({ bannerImage: '' }),
      });
      pendingProfileBannerImage = '';
      pendingProfileBannerMode = 'keep';
      renderBannerBackground(updatedProfile?.bannerImage || '');
      renderBannerPreview(updatedProfile?.bannerImage || '');
      modalClose('banner-edit-modal');
      showSuccessMessage('프로필 배너가 제거되었습니다.');
    } catch (error) {
      alert(error.message || '배너 제거에 실패했습니다.');
    }
    return;
  }

  const profileSettingItem = event.target.closest('[data-profile-setting-item]');

  if (profileSettingItem) {
    modalClose('profile-setting-modal');
    return;
  }

  const channelTab = event.target.closest('[data-channel-tab]');

  if (channelTab) {
    const targetPanel = channelTab.dataset.channelTab;

    document.querySelectorAll('[data-channel-tab]').forEach((item) => {
      item.classList.remove('is-active');
    });

    channelTab.classList.add('is-active');
    document.querySelectorAll('[data-profile-panel]').forEach((panel) => {
      panel.hidden = panel.dataset.profilePanel !== targetPanel;
    });
    return;
  }

  const filterButton = event.target.closest('[data-video-filter]');

  if (filterButton) {
    const filterType = (filterButton.textContent || '').trim();

    document.querySelectorAll('[data-video-filter]').forEach((item) => {
      item.classList.remove('is-active');
    });

    filterButton.classList.add('is-active');
    document.querySelectorAll('[data-profile-panel]').forEach((panel) => {
      const cards = Array.from(panel.querySelectorAll('.videoCard'));
      if (!cards.length) {
        return;
      }

      cards.sort((left, right) => {
        const leftCreated = left.dataset.createdAt || '';
        const rightCreated = right.dataset.createdAt || '';
        const leftPopularity = Number(left.dataset.popularity || 0);
        const rightPopularity = Number(right.dataset.popularity || 0);

        if (filterType === '인기순') {
          return rightPopularity - leftPopularity || rightCreated.localeCompare(leftCreated);
        }

        if (filterType === '오래된순') {
          return leftCreated.localeCompare(rightCreated);
        }

        return rightCreated.localeCompare(leftCreated);
      });

      cards.forEach((card) => {
        panel.appendChild(card);
      });
    });
    return;
  }

  const shareOpen = event.target.closest('[data-share-button]');

  if (shareOpen) {
    resolveShareUrl();
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
    try {
      await requestJson('/api/profile/' + encodeURIComponent(resolveProfileNickname()) + '/block', {
        method: 'POST',
      });
      syncBlackButtonState(true);
      modalClose('black-modal');
      showSuccessMessage('사용자를 차단했습니다.');
    } catch (error) {
      alert(error.message || '차단에 실패했습니다.');
    }
    return;
  }

  const unblackConfirm = event.target.closest('[data-unblack-confirm]');

  if (unblackConfirm) {
    try {
      await requestJson('/api/profile/' + encodeURIComponent(resolveProfileNickname()) + '/block', {
        method: 'DELETE',
      });
      syncBlackButtonState(false);
      modalClose('unblack-modal');
      showSuccessMessage('차단이 해제되었습니다.');
    } catch (error) {
      alert(error.message || '차단 해제에 실패했습니다.');
    }
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
    const shareUrl = resolveShareUrl();

    try {
      await navigator.clipboard.writeText(shareUrl);
    } catch (error) {
      input.value = shareUrl;
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

    try {
      const shareUrl = resolveShareUrl();
      const receiverIds = window.BideoShare
        ? window.BideoShare.collectReceiverIds(shareState.selectedUsers, shareState.receiverMap)
        : shareState.selectedUsers
          .map((nickname) => shareState.receiverMap.get(nickname)?.id)
          .filter(Boolean);

      await requestJson('/api/profile/' + encodeURIComponent(resolveProfileNickname()) + '/share', {
        method: 'POST',
        body: JSON.stringify(
          window.BideoShare
            ? window.BideoShare.buildSharePayload(receiverIds, shareUrl, message?.value?.trim() || '')
            : {
                receiverIds,
                shareUrl,
                message: message?.value?.trim() || '',
              }
        ),
      });

      shareState.selectedUsers = [];
      renderShareChips();
      if (message) message.value = '';
      syncShareButtonState(false);
      modalClose('share-modal');
      showSuccessMessage('프로필을 공유했습니다.');
    } catch (error) {
      alert(error.message || '프로필 공유에 실패했습니다.');
    }
    return;
  }

  const unsubscribeConfirm = event.target.closest('[data-unsubscribe-confirm]');

  if (unsubscribeConfirm) {
    try {
      const response = await requestJson('/api/profile/' + encodeURIComponent(resolveProfileNickname()) + '/follow', {
        method: 'POST',
      });
      setSubscribeButtonState(!!response?.followed);
      applyProfileCounters(response?.profile);
      modalClose('unsubscribe-modal');
    } catch (error) {
      alert(error.message || '팔로우 변경에 실패했습니다.');
    }
    return;
  }

  const subscribeButton = event.target.closest('[data-subscribe-button]');

  if (!subscribeButton) return;

  if (subscribeButton.classList.contains('is-subscribed')) {
    modalOpen('unsubscribe-modal');
    return;
  }

  try {
    const response = await requestJson('/api/profile/' + encodeURIComponent(resolveProfileNickname()) + '/follow', {
      method: 'POST',
    });
    setSubscribeButtonState(!!response?.followed);
    applyProfileCounters(response?.profile);
  } catch (error) {
    alert(error.message || '팔로우 변경에 실패했습니다.');
  }
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
    searchShareUsers(search.value.trim()).catch((error) => {
      console.error(error);
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

  return;
});

document.addEventListener('change', (event) => {
  const fileInput = event.target.closest('[data-profile-banner-file]');

  if (!fileInput || !fileInput.files || !fileInput.files[0]) return;

  const file = fileInput.files[0];
  const reader = new FileReader();

  reader.onload = ({ target }) => {
    if (!target) return;

    pendingProfileBannerImage = String(target.result || '');
    pendingProfileBannerMode = 'image';
    renderBannerPreview(pendingProfileBannerImage);
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
    requestJson('/api/profile/' + encodeURIComponent(itemId) + '/follow', {
      method: 'POST',
    }).then(() => loadFollowManageData('following'))
      .catch((error) => alert(error.message || '팔로잉 변경에 실패했습니다.'));
    return;
  }

  if (action === 'toggle-follow-back') {
    requestJson('/api/profile/' + encodeURIComponent(itemId) + '/follow', {
      method: 'POST',
    }).then(() => loadFollowManageData('followers'))
      .catch((error) => alert(error.message || '팔로우 변경에 실패했습니다.'));
    return;
  }

  if (action === 'block-follower') {
    requestJson('/api/profile/' + encodeURIComponent(itemId) + '/block', {
      method: 'POST',
    }).then(() => loadFollowManageData('followers'))
      .catch((error) => alert(error.message || '차단에 실패했습니다.'));
    return;
  }

  if (action === 'unblock') {
    requestJson('/api/profile/me/blocks?blockedId=' + encodeURIComponent(itemId), {
      method: 'DELETE',
    }).then(() => loadFollowManageData('blocked'))
      .catch((error) => alert(error.message || '차단 해제에 실패했습니다.'));
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
renderProfileBadges();

// 기본 아바타 초기화
if (document.querySelector('[data-profile-avatar-open]') && !document.querySelector('[data-profile-avatar-open] img')) {
  renderDefaultAvatar();
}

if (document.querySelector('[data-share-list]')) {
  searchShareUsers('');
}
