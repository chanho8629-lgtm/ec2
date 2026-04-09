const searchLayout = (() => {
  const formatCount = (count) => {
    if (!count) return "0";
    if (count >= 10000) return (count / 10000).toFixed(1).replace(/\.0$/, "") + "만";
    if (count >= 1000) return (count / 1000).toFixed(1).replace(/\.0$/, "") + "천";
    return count.toString();
  };

  const esc = (str) => {
    if (!str) return "";
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  };

  const createProfileEl = (m) => {
    const el = document.createElement("div");
    el.className = "item-section-content profile-renderer";
    el.innerHTML = `
      <a href="/profile/${esc(m.nickname)}" class="channel-avatar">
        <img class="avatar-circle" src="${m.profileImage || '/images/default-profile.png'}" alt="${esc(m.nickname)}">
      </a>
      <div class="channel-info">
        <div class="channel-header">
          <h3 class="channel-name">
            <a href="/profile/${esc(m.nickname)}">${esc(m.nickname)}</a>
            ${m.creatorVerified ? '<svg class="verified-badge" viewBox="0 0 24 24" width="14" height="14" fill="#606060"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/></svg>' : ""}
          </h3>
          <button class="subscribe-btn" data-member-id="${m.id}" style="${m.isFollowing ? 'background-color:rgba(0,0,0,0.05);color:#0f0f0f' : ''}">${m.isFollowing ? '구독중' : '구독'}</button>
        </div>
        <p class="channel-handle">팔로워 ${formatCount(m.followerCount)}명</p>
        ${m.bio ? `<p class="channel-desc">${esc(m.bio)}</p>` : ""}
      </div>
    `;
    return el;
  };

  const createGalleryEl = (g) => {
    const el = document.createElement("div");
    el.className = "item-section-content gallery-renderer";
    el.innerHTML = `
      <a href="/gallery/${g.id}" class="gallery-thumbnail">
        <img class="thumbnail-img" src="${g.coverImage || '/images/default-gallery.png'}">
      </a>
      <div class="gallery-info">
        <h3 class="gallery-title"><a href="/gallery/${g.id}">${esc(g.title)}</a></h3>
        <div class="gallery-metadata">
          <span>방문수 ${formatCount(g.viewCount)}회</span>
          <span>·</span>
          <span>21시간 전</span>
        </div>
        <div class="gallery-channel">
          <span class="gallery-channel-name">${esc(g.memberNickname)}</span>
        </div>
        ${g.description ? `<p class="gallery-description">${esc(g.description)}</p>` : ""}
      </div>
      <button class="gallery-more-btn" aria-label="예술관더보기버튼">⋮</button>
      <div class="gallery-dropdown off" data-target-type="GALLERY" data-target-id="${g.id}" data-member-id="${g.memberId}">
        <div class="gallery-dropdown-item" data-action="share">
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false" aria-hidden="true" style="pointer-events: none; display: inherit;"><path d="M10 3.158V7.51c-5.428.223-8.27 3.75-8.875 11.199-.04.487-.07.975-.09 1.464l-.014.395c-.014.473.578.684.88.32.302-.368.61-.73.925-1.086l.244-.273c1.79-1.967 3-2.677 4.93-2.917a18.011 18.011 0 012-.112v4.346a1 1 0 001.646.763l9.805-8.297 1.55-1.31-1.55-1.31-9.805-8.297A1 1 0 0010 3.158Zm2 6.27v.002-4.116l7.904 6.688L12 18.689v-4.212l-2.023.024c-1.935.022-3.587.17-5.197 1.024a9 9 0 00-1.348.893c.355-1.947.916-3.39 1.63-4.425 1.062-1.541 2.607-2.385 5.02-2.485L12 9.428Z"></path></svg>
          공유
        </div>
        <div class="gallery-dropdown-item" data-action="wishlist">
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false" aria-hidden="true" style="pointer-events: none; display: inherit;"><path d="M19 2H5a2 2 0 00-2 2v16.887c0 1.266 1.382 2.048 2.469 1.399L12 18.366l6.531 3.919c1.087.652 2.469-.131 2.469-1.397V4a2 2 0 00-2-2ZM5 20.233V4h14v16.233l-6.485-3.89-.515-.309-.515.309L5 20.233Z"></path></svg>
          <span class="wishlist-text">찜 목록 추가</span>
        </div>
        <div class="gallery-dropdown-item" data-action="no-recommend">
          <img src="/images/Icon=minus-circle.png">
          채널 추천 안함
        </div>
        <div class="gallery-dropdown-item" data-action="report">
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false" aria-hidden="true" style="pointer-events: none; display: inherit;"><path d="m4 2.999-.146.073A1.55 1.55 0 003 4.454v16.545a1 1 0 102 0v-6.491a7.26 7.26 0 016.248.115l.752.376a8.94 8.94 0 008 0l.145-.073c.524-.262.855-.797.855-1.382V4.458a1.21 1.21 0 00-1.752-1.083 7.26 7.26 0 01-6.496 0L12 2.999a8.94 8.94 0 00-8 0Zm7.105 1.79v-.002l.752.376A9.26 9.26 0 0019 5.641v7.62a6.95 6.95 0 01-6.105-.052l-.752-.376A9.261 9.261 0 005 12.355v-7.62a6.94 6.94 0 016.105.054Z"></path></svg>
          신고
        </div>
      </div>
    `;
    return el;
  };

  const createWorkEl = (w) => {
    const el = document.createElement("div");
    el.className = "item-section-content work-renderer";
    el.innerHTML = `
      <a href="/work/detail/${w.id}" class="work-thumbnail">
        <img class="thumbnail-img" src="${w.thumbnailUrl || '/images/default-work.png'}">
      </a>
      <div class="work-info">
        <h3 class="work-title"><a href="/work/detail/${w.id}">${esc(w.title)}</a></h3>
        <div class="work-metadata">
          <span>조회수 ${formatCount(w.viewCount)}회</span>
          <span>·</span>
          <span>하루 전</span>
        </div>
        <div class="work-channel">
          <span class="work-channel-name">${esc(w.memberNickname)}</span>
        </div>
      </div>
      <button class="work-more-btn" aria-label="작품더보기버튼">⋮</button>
      <div class="work-dropdown off" data-target-type="WORK" data-target-id="${w.id}" data-member-id="${w.memberId}">
        <div class="work-dropdown-item" data-action="share">
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false" aria-hidden="true" style="pointer-events: none; display: inherit;"><path d="M10 3.158V7.51c-5.428.223-8.27 3.75-8.875 11.199-.04.487-.07.975-.09 1.464l-.014.395c-.014.473.578.684.88.32.302-.368.61-.73.925-1.086l.244-.273c1.79-1.967 3-2.677 4.93-2.917a18.011 18.011 0 012-.112v4.346a1 1 0 001.646.763l9.805-8.297 1.55-1.31-1.55-1.31-9.805-8.297A1 1 0 0010 3.158Zm2 6.27v.002-4.116l7.904 6.688L12 18.689v-4.212l-2.023.024c-1.935.022-3.587.17-5.197 1.024a9 9 0 00-1.348.893c.355-1.947.916-3.39 1.63-4.425 1.062-1.541 2.607-2.385 5.02-2.485L12 9.428Z"></path></svg>
          공유
        </div>
        <div class="work-dropdown-item" data-action="wishlist">
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false" aria-hidden="true" style="pointer-events: none; display: inherit;"><path d="M19 2H5a2 2 0 00-2 2v16.887c0 1.266 1.382 2.048 2.469 1.399L12 18.366l6.531 3.919c1.087.652 2.469-.131 2.469-1.397V4a2 2 0 00-2-2ZM5 20.233V4h14v16.233l-6.485-3.89-.515-.309-.515.309L5 20.233Z"></path></svg>
          <span class="wishlist-text">찜 목록 추가</span>
        </div>
        <div class="work-dropdown-item" data-action="no-recommend">
          <img src="/images/Icon=minus-circle.png">
          채널 추천 안함
        </div>
        <div class="work-dropdown-item" data-action="report">
          <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24" focusable="false" aria-hidden="true" style="pointer-events: none; display: inherit;"><path d="m4 2.999-.146.073A1.55 1.55 0 003 4.454v16.545a1 1 0 102 0v-6.491a7.26 7.26 0 016.248.115l.752.376a8.94 8.94 0 008 0l.145-.073c.524-.262.855-.797.855-1.382V4.458a1.21 1.21 0 00-1.752-1.083 7.26 7.26 0 01-6.496 0L12 2.999a8.94 8.94 0 00-8 0Zm7.105 1.79v-.002l.752.376A9.26 9.26 0 0019 5.641v7.62a6.95 6.95 0 01-6.105-.052l-.752-.376A9.261 9.261 0 005 12.355v-7.62a6.94 6.94 0 016.105.054Z"></path></svg>
          신고
        </div>
      </div>
    `;
    return el;
  };

  const render = (container, data, page) => {
    console.log("들어옴1 레이아웃", data, "page:", page);

    // 페이지 1이면 초기화, 2 이상이면 append
    if (!page || page === 1) {
      container.innerHTML = "";
    }

    if (data.profiles) data.profiles.forEach(m => container.appendChild(createProfileEl(m)));
    if (data.galleries) data.galleries.forEach(g => container.appendChild(createGalleryEl(g)));
    if (data.works) data.works.forEach(w => container.appendChild(createWorkEl(w)));

    if (container.children.length === 0) {
      container.innerHTML = `<div class="no-results">검색 결과가 없습니다.</div>`;
    }

    console.log("들어옴2 레이아웃완료, profiles:", (data.profiles || []).length, "galleries:", (data.galleries || []).length, "works:", (data.works || []).length);

    return data.criteria;
  };

  return { render: render };
})();
