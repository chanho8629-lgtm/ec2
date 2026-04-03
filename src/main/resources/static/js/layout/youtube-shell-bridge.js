document.addEventListener("DOMContentLoaded", function () {
  var root = document.querySelector("[data-yt-shell-root]");
  if (!root) {
    return;
  }

  var desktopQuery = window.matchMedia("(min-width: 901px)");
  var menuToggle = root.querySelector("[data-yt-shell-menu-toggle]");
  var searchToggles = Array.from(
    root.querySelectorAll("[data-yt-shell-search-toggle]")
  );
  var overlay = root.querySelector("[data-yt-shell-overlay]");
  var drawer = root.querySelector("[data-yt-shell-drawer]");
  var mobileSearch = root.querySelector("[data-yt-shell-mobile-search]");

  // Popup elements (popups are outside [data-yt-shell-root], so query from document)
  var createToggle = root.querySelector("[data-yt-shell-create-toggle]");
  var accountToggle = root.querySelector("[data-yt-shell-account-toggle]");
  var notificationToggle = root.querySelector("[data-yt-shell-notification-toggle]");
  var createPopup = document.querySelector("[data-yt-shell-create-popup]");
  var accountPopup = document.querySelector("[data-yt-shell-account-popup]");
  var notificationPopup = document.querySelector("[data-yt-shell-notification-popup]");

  function syncBodyState() {
    document.body.dataset.guideCollapsed = root.dataset.guideCollapsed || "false";
    document.body.dataset.mobileDrawerOpen =
      root.dataset.mobileDrawerOpen || "false";
    document.body.dataset.searchOpen = root.dataset.searchOpen || "false";
  }

  function syncOverlay() {
    var open =
      root.dataset.mobileDrawerOpen === "true" ||
      root.dataset.searchOpen === "true";
    if (overlay) {
      overlay.hidden = !open;
    }
  }

  function lockBody(locked) {
    document.body.classList.toggle("yt-shell-lock", locked);
  }

  function closeDrawer() {
    root.dataset.mobileDrawerOpen = "false";
    if (drawer) {
      drawer.hidden = true;
    }
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", "false");
    }
    lockBody(root.dataset.searchOpen === "true");
    syncOverlay();
    syncBodyState();
  }

  function closeSearch() {
    root.dataset.searchOpen = "false";
    if (mobileSearch) {
      mobileSearch.hidden = true;
    }
    searchToggles.forEach(function (toggle) {
      toggle.setAttribute("aria-expanded", "false");
    });
    lockBody(root.dataset.mobileDrawerOpen === "true");
    syncOverlay();
    syncBodyState();
  }

  function toggleGuide() {
    var collapsed = root.dataset.guideCollapsed === "true";
    root.dataset.guideCollapsed = collapsed ? "false" : "true";
    syncBodyState();
  }

  function toggleDrawer() {
    var nextState = root.dataset.mobileDrawerOpen !== "true";
    root.dataset.mobileDrawerOpen = String(nextState);
    if (drawer) {
      drawer.hidden = !nextState;
    }
    if (menuToggle) {
      menuToggle.setAttribute("aria-expanded", String(nextState));
    }
    if (nextState) {
      closeSearch();
      root.dataset.mobileDrawerOpen = "true";
      if (drawer) {
        drawer.hidden = false;
      }
    }
    lockBody(nextState);
    syncOverlay();
    syncBodyState();
  }

  function toggleSearch() {
    var nextState = root.dataset.searchOpen !== "true";
    root.dataset.searchOpen = String(nextState);
    if (mobileSearch) {
      mobileSearch.hidden = !nextState;
    }
    searchToggles.forEach(function (toggle) {
      toggle.setAttribute("aria-expanded", String(nextState));
    });
    if (nextState) {
      closeDrawer();
      root.dataset.searchOpen = "true";
      if (mobileSearch) {
        mobileSearch.hidden = false;
      }
    }
    lockBody(nextState);
    syncOverlay();
    syncBodyState();
  }

  // ── Popup dropdown functions ──

  function closeAllPopups() {
    if (createPopup) {
      createPopup.hidden = true;
    }
    if (createToggle) {
      createToggle.setAttribute("aria-expanded", "false");
    }
    if (accountPopup) {
      accountPopup.hidden = true;
    }
    if (accountToggle) {
      accountToggle.setAttribute("aria-expanded", "false");
    }
    if (notificationPopup) {
      notificationPopup.hidden = true;
    }
    if (notificationToggle) {
      notificationToggle.setAttribute("aria-expanded", "false");
    }
  }

  function positionPopup(popup, triggerButton) {
    var rect = triggerButton.getBoundingClientRect();
    var rightOffset = window.innerWidth - rect.right;
    popup.style.top = rect.bottom + "px";
    popup.style.right = rightOffset + "px";
    popup.style.left = "auto";

    requestAnimationFrame(function () {
      var popupRect = popup.getBoundingClientRect();
      if (popupRect.left < 0) {
        popup.style.right = "auto";
        popup.style.left = "0px";
      }
      if (popupRect.bottom > window.innerHeight) {
        popup.style.maxHeight = (window.innerHeight - rect.bottom - 8) + "px";
      }
    });
  }

  function toggleCreatePopup() {
    var willOpen = createPopup && createPopup.hidden;
    closeAllPopups();
    if (willOpen) {
      positionPopup(createPopup, createToggle);
      createPopup.hidden = false;
      createToggle.setAttribute("aria-expanded", "true");
    }
  }

  function toggleAccountPopup() {
    var willOpen = accountPopup && accountPopup.hidden;
    closeAllPopups();
    if (willOpen) {
      positionPopup(accountPopup, accountToggle);
      accountPopup.hidden = false;
      accountToggle.setAttribute("aria-expanded", "true");
    }
  }

  function toggleNotificationPopup() {
    var willOpen = notificationPopup && notificationPopup.hidden;
    closeAllPopups();
    if (willOpen) {
      positionPopup(notificationPopup, notificationToggle);
      notificationPopup.hidden = false;
      notificationToggle.setAttribute("aria-expanded", "true");
    }
  }

  // ── Initialization ──

  root.dataset.guideCollapsed = "false";
  root.dataset.mobileDrawerOpen = "false";
  root.dataset.searchOpen = "false";
  if (drawer) {
    drawer.hidden = true;
  }
  if (mobileSearch) {
    mobileSearch.hidden = true;
  }
  if (createPopup) {
    createPopup.hidden = true;
  }
  if (accountPopup) {
    accountPopup.hidden = true;
  }
  if (notificationPopup) {
    notificationPopup.hidden = true;
  }
  syncOverlay();
  syncBodyState();

  // ── Event listeners ──

  if (menuToggle) {
    menuToggle.addEventListener("click", function () {
      closeAllPopups();
      if (desktopQuery.matches) {
        toggleGuide();
        return;
      }
      toggleDrawer();
    });
  }

  searchToggles.forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      closeAllPopups();
      toggleSearch();
    });
  });

  if (createToggle && createPopup) {
    createToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleCreatePopup();
    });
  }

  if (accountToggle && accountPopup) {
    accountToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleAccountPopup();
    });
  }

  if (notificationToggle && notificationPopup) {
    notificationToggle.addEventListener("click", function (e) {
      e.stopPropagation();
      toggleNotificationPopup();
    });
  }

  if (overlay) {
    overlay.addEventListener("click", function () {
      closeAllPopups();
      closeDrawer();
      closeSearch();
    });
  }

  document.addEventListener("click", function (event) {
    var anyPopupOpen =
      (createPopup && !createPopup.hidden) ||
      (accountPopup && !accountPopup.hidden) ||
      (notificationPopup && !notificationPopup.hidden);
    if (!anyPopupOpen) {
      return;
    }
    var clickedInsidePopup =
      (createPopup && createPopup.contains(event.target)) ||
      (accountPopup && accountPopup.contains(event.target)) ||
      (notificationPopup && notificationPopup.contains(event.target));
    var clickedToggle =
      (createToggle && createToggle.contains(event.target)) ||
      (accountToggle && accountToggle.contains(event.target)) ||
      (notificationToggle && notificationToggle.contains(event.target));
    if (!clickedInsidePopup && !clickedToggle) {
      closeAllPopups();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") {
      return;
    }
    closeAllPopups();
    closeDrawer();
    closeSearch();
  });

  if (desktopQuery.addEventListener) {
    desktopQuery.addEventListener("change", function (event) {
      closeAllPopups();
      if (event.matches) {
        closeDrawer();
        closeSearch();
      } else {
        root.dataset.guideCollapsed = "false";
      }
    });
  } else if (desktopQuery.addListener) {
    desktopQuery.addListener(function (event) {
      closeAllPopups();
      if (event.matches) {
        closeDrawer();
        closeSearch();
      } else {
        root.dataset.guideCollapsed = "false";
      }
    });
  }
});
