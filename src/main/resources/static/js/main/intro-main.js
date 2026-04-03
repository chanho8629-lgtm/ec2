document.addEventListener('DOMContentLoaded', function () {

  // 1. FAQ 탭 전환
  var tabs = document.querySelectorAll('.tablist__tab');
  var panels = document.querySelectorAll('.tabpanel');

  tabs.forEach(function (tab) {
    tab.addEventListener('click', function () {
      // 모든 탭 비활성화
      tabs.forEach(function (t) {
        t.classList.remove('tablist__tab--active');
        t.setAttribute('aria-selected', 'false');
        t.setAttribute('tabindex', '-1');
      });

      // 모든 패널 숨기기
      panels.forEach(function (p) {
        p.classList.remove('tabpanel--active');
        p.hidden = true;
      });

      // 클릭한 탭 활성화
      tab.classList.add('tablist__tab--active');
      tab.setAttribute('aria-selected', 'true');
      tab.setAttribute('tabindex', '0');

      // 대응 패널 표시
      var panelId = tab.getAttribute('aria-controls');
      var panel = document.getElementById(panelId);
      if (panel) {
        panel.classList.add('tabpanel--active');
        panel.hidden = false;
      }
    });

    // 키보드 네비게이션 (위/아래 화살표)
    tab.addEventListener('keydown', function (e) {
      var tabsArr = Array.from(tabs);
      var index = tabsArr.indexOf(tab);
      var next;

      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') {
        e.preventDefault();
        next = tabsArr[(index + 1) % tabsArr.length];
      } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') {
        e.preventDefault();
        next = tabsArr[(index - 1 + tabsArr.length) % tabsArr.length];
      } else if (e.key === 'Home') {
        e.preventDefault();
        next = tabsArr[0];
      } else if (e.key === 'End') {
        e.preventDefault();
        next = tabsArr[tabsArr.length - 1];
      }

      if (next) {
        next.click();
        next.focus();
      }
    });
  });

  // 2. 헤더 드롭다운 메뉴
  document.querySelectorAll('.site-header__nav-item--has-sub').forEach(function (btn) {
    var subnav = btn.nextElementSibling;
    if (!subnav) return;

    btn.addEventListener('click', function (e) {
      e.stopPropagation();
      var isOpen = btn.getAttribute('aria-expanded') === 'true';
      btn.setAttribute('aria-expanded', String(!isOpen));
      subnav.hidden = isOpen;
    });
  });

  // 드롭다운 외부 클릭 시 닫기
  document.addEventListener('click', function () {
    document.querySelectorAll('.site-header__nav-item--has-sub').forEach(function (btn) {
      btn.setAttribute('aria-expanded', 'false');
      var subnav = btn.nextElementSibling;
      if (subnav) subnav.hidden = true;
    });
  });

  // 3. 검색 토글
  var searchToggle = document.getElementById('search-toggle');
  var searchInner = document.getElementById('search-inner');
  if (searchToggle && searchInner) {
    searchToggle.addEventListener('click', function (e) {
      e.stopPropagation();
      var isHidden = searchInner.hidden;
      searchInner.hidden = !isHidden;
      if (isHidden) {
        var input = searchInner.querySelector('input');
        if (input) input.focus();
      }
    });

    document.addEventListener('click', function (e) {
      if (!searchInner.contains(e.target) && e.target !== searchToggle) {
        searchInner.hidden = true;
      }
    });
  }

  // 4. 모바일 메뉴 토글
  var menuBtn = document.getElementById('mobile-menu-btn');
  var navWrapper = document.getElementById('main-nav-wrapper');
  if (menuBtn && navWrapper) {
    menuBtn.addEventListener('click', function () {
      var isOpen = menuBtn.getAttribute('aria-expanded') === 'true';
      menuBtn.setAttribute('aria-expanded', String(!isOpen));
      navWrapper.classList.toggle('is-open');
    });
  }

  // 5. 히어로 비디오 음소거/해제
  var muteBtn = document.getElementById('mute-btn');
  var heroVideo = document.querySelector('.hero__video');
  if (muteBtn && heroVideo) {
    muteBtn.addEventListener('click', function () {
      heroVideo.muted = !heroVideo.muted;
      var useEl = muteBtn.querySelector('use');
      if (useEl) {
        useEl.setAttribute('href', heroVideo.muted ? '#volume-off' : '#volume-up');
      }
      muteBtn.setAttribute('aria-label', heroVideo.muted ? '음소거 해제' : '음소거');
    });
  }

  // 6. 스크롤 페이드업 애니메이션
  var fadeTargets = document.querySelectorAll('.scroll-fade-up');
  if (fadeTargets.length) {
    var fadeObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          fadeObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -60px 0px' });

    fadeTargets.forEach(function (el) { fadeObserver.observe(el); });
  }

  // 7. 비디오 자동재생 관리 (뷰포트 진입/이탈)
  var videos = document.querySelectorAll('video[autoplay]');
  if (videos.length) {
    var videoObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.play().catch(function () {});
        } else {
          entry.target.pause();
        }
      });
    }, { threshold: 0.25 });

    videos.forEach(function (video) { videoObserver.observe(video); });
  }

  // 8. 시작하기 버튼 → 로그인 모달
  document.querySelectorAll('#btn-start, #btn-hero-start, #btn-cta-start').forEach(function (btn) {
    btn.addEventListener('click', function (e) {
      e.preventDefault();
      if (typeof showAuthModal === 'function') {
        showAuthModal();
      } else {
        window.location.href = '/main';
      }
    });
  });

});
