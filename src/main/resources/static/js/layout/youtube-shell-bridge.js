document.addEventListener("DOMContentLoaded", function () {
  var root = document.querySelector("[data-yt-shell-root]");
  if (!root) {
    return;
  }

  var desktopQuery = window.matchMedia("(min-width: 901px)");
  var menuToggle = root.querySelector("[data-yt-shell-menu-toggle]");
  var searchToggles = Array.from(root.querySelectorAll("[data-yt-shell-search-toggle]"));
  var overlay = root.querySelector("[data-yt-shell-overlay]");
  var drawer = root.querySelector("[data-yt-shell-drawer]");
  var mobileSearch = root.querySelector("[data-yt-shell-mobile-search]");
  var createToggle = root.querySelector("[data-yt-shell-create-toggle]");
  var accountToggle = root.querySelector("[data-yt-shell-account-toggle]");
  var notificationToggle = root.querySelector("[data-yt-shell-notification-toggle]");
  var createPopup = document.querySelector("[data-yt-shell-create-popup]");
  var accountPopup = document.querySelector("[data-yt-shell-account-popup]");
  var notificationPopup = document.querySelector("[data-yt-shell-notification-popup]");
  var composeModal = document.querySelector("[data-yt-compose-modal]");
  var composeContent = document.querySelector("[data-yt-compose-content]");
  var composeDismissButtons = Array.from(document.querySelectorAll("[data-yt-compose-dismiss]"));
  var composeLinks = Array.from(document.querySelectorAll("[data-compose-modal-link]"));
  var composeState = {
    url: "",
    styles: [],
    scripts: [],
    cache: {},
    rootStyles: null
  };

  function syncBodyState() {
    document.body.dataset.guideCollapsed = root.dataset.guideCollapsed || "false";
    document.body.dataset.mobileDrawerOpen = root.dataset.mobileDrawerOpen || "false";
    document.body.dataset.searchOpen = root.dataset.searchOpen || "false";
  }

  function syncOverlay() {
    var open = root.dataset.mobileDrawerOpen === "true" || root.dataset.searchOpen === "true";
    if (overlay) {
      overlay.hidden = !open;
    }
  }

  function lockBody(locked) {
    document.body.classList.toggle("yt-shell-lock", locked);
  }

  function removeComposeAssets() {
    composeState.styles.forEach(function (node) {
      node.remove();
    });
    composeState.scripts.forEach(function (node) {
      node.remove();
    });
    composeState.styles = [];
    composeState.scripts = [];
    composeState.url = "";
  }

  function lockRootTypography() {
    var html = document.documentElement;
    var body = document.body;
    var htmlStyle = window.getComputedStyle(html);
    var bodyStyle = window.getComputedStyle(body);

    if (!composeState.rootStyles) {
      composeState.rootStyles = {
        htmlFontSize: html.style.fontSize || "",
        htmlFontFamily: html.style.fontFamily || "",
        bodyFontSize: body.style.fontSize || "",
        bodyFontFamily: body.style.fontFamily || ""
      };
    }

    html.style.fontSize = htmlStyle.fontSize;
    html.style.fontFamily = htmlStyle.fontFamily;
    body.style.fontSize = bodyStyle.fontSize;
    body.style.fontFamily = bodyStyle.fontFamily;
  }

  function restoreRootTypography() {
    var html = document.documentElement;
    var body = document.body;

    if (!composeState.rootStyles) {
      return;
    }

    html.style.fontSize = composeState.rootStyles.htmlFontSize;
    html.style.fontFamily = composeState.rootStyles.htmlFontFamily;
    body.style.fontSize = composeState.rootStyles.bodyFontSize;
    body.style.fontFamily = composeState.rootStyles.bodyFontFamily;
    composeState.rootStyles = null;
  }

  function closeComposeModal() {
    if (!composeModal) {
      return;
    }

    composeModal.hidden = true;
    document.body.classList.remove("yt-compose-open");
    if (composeContent) {
      composeContent.removeAttribute("data-compose-view");
    }

    if (composeContent) {
      composeContent.innerHTML = "";
    }

    removeComposeAssets();
    restoreRootTypography();
  }

  function loadComposeStyles(parsedDocument) {
    var stylesheetLinks = Array.from(parsedDocument.querySelectorAll('link[rel="stylesheet"]'));

    stylesheetLinks.forEach(function (linkNode) {
      var href = linkNode.getAttribute("href");
      var newLink;

      if (!href || document.querySelector('link[data-compose-asset="' + href + '"]')) {
        return;
      }

      newLink = document.createElement("link");
      newLink.rel = "stylesheet";
      newLink.href = href;
      newLink.setAttribute("data-compose-asset", href);
      document.head.appendChild(newLink);
      composeState.styles.push(newLink);
    });
  }

  function loadComposeScripts(parsedDocument) {
    var scriptNodes = Array.from(parsedDocument.querySelectorAll("script[src]"));
    var loaders = scriptNodes.map(function (scriptNode) {
      var src = scriptNode.getAttribute("src");
      var newScript;

      if (!src) {
        return Promise.resolve();
      }

      return new Promise(function (resolve, reject) {
        newScript = document.createElement("script");
        newScript.src = src;
        newScript.async = false;
        newScript.setAttribute("data-compose-script", src);
        newScript.onload = resolve;
        newScript.onerror = function () {
          reject(new Error("작성 스크립트를 불러오지 못했습니다."));
        };
        document.body.appendChild(newScript);
        composeState.scripts.push(newScript);
      });
    });

    return Promise.all(loaders);
  }

  function extractComposeNodes(parsedDocument) {
    return Array.from(parsedDocument.body.children).filter(function (node) {
      return node.tagName !== "SCRIPT";
    });
  }

  function openComposeModal(url) {
    if (!composeModal || !composeContent || !url) {
      if (url) {
        window.location.href = url;
      }
      return;
    }

    closeAllPopups();
    composeModal.hidden = false;
    document.body.classList.add("yt-compose-open");
    composeContent.innerHTML = '<div class="yt-compose-modal__loading">불러오는 중...</div>';

    Promise.resolve(composeState.cache[url]).then(function (cachedHtml) {
      if (cachedHtml) {
        return cachedHtml;
      }

      return fetch(url, {
        headers: {
          "X-Requested-With": "XMLHttpRequest"
        }
      })
        .then(function (response) {
          if (!response.ok) {
            throw new Error("작성 화면을 불러오지 못했습니다.");
          }

          return response.text();
        })
        .then(function (html) {
          composeState.cache[url] = html;
          return html;
        });
    })
      .then(function (html) {
        var parser = new DOMParser();
        var parsedDocument = parser.parseFromString(html, "text/html");
        var nodes = extractComposeNodes(parsedDocument);

        if (!nodes.length) {
          throw new Error("작성 모달 내용을 찾지 못했습니다.");
        }

        if (composeContent) {
          composeContent.innerHTML = "";
        }

        removeComposeAssets();
        lockRootTypography();
        loadComposeStyles(parsedDocument);

        nodes.forEach(function (node) {
          composeContent.appendChild(document.importNode(node, true));
        });

        if (composeContent) {
          if (url.indexOf("/gallery-register") > -1) {
            composeContent.setAttribute("data-compose-view", "gallery-register");
          } else if (url.indexOf("/work/work-register") > -1) {
            composeContent.setAttribute("data-compose-view", "work-register");
          } else {
            composeContent.removeAttribute("data-compose-view");
          }
        }

        Array.from(composeContent.children).forEach(function (childNode) {
          childNode.setAttribute("data-compose-embedded", "true");
        });

        return loadComposeScripts(parsedDocument).then(function () {
          if (url.indexOf("/gallery-register") > -1 && typeof window.initializeGalleryRegister === "function") {
            window.initializeGalleryRegister();
          }

          composeState.url = url;
        });
      })
      .catch(function (error) {
        if (composeContent) {
          composeContent.innerHTML = '<div class="yt-compose-modal__error">' + (error.message || "작성 화면을 불러오지 못했습니다.") + "</div>";
        }
      });
  }

  window.closeComposeModal = closeComposeModal;
  window.openComposeModal = openComposeModal;

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
        popup.style.maxHeight = window.innerHeight - rect.bottom - 8 + "px";
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
    var anyPopupOpen = (createPopup && !createPopup.hidden) || (accountPopup && !accountPopup.hidden) || (notificationPopup && !notificationPopup.hidden);
    if (!anyPopupOpen) {
      return;
    }

    var clickedInsidePopup = (createPopup && createPopup.contains(event.target)) || (accountPopup && accountPopup.contains(event.target)) || (notificationPopup && notificationPopup.contains(event.target));
    var clickedToggle = (createToggle && createToggle.contains(event.target)) || (accountToggle && accountToggle.contains(event.target)) || (notificationToggle && notificationToggle.contains(event.target));

    if (!clickedInsidePopup && !clickedToggle) {
      closeAllPopups();
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") {
      return;
    }

    closeComposeModal();
    closeAllPopups();
    closeDrawer();
    closeSearch();
  });

  composeDismissButtons.forEach(function (button) {
    button.addEventListener("click", closeComposeModal);
  });

  composeLinks.forEach(function (link) {
    link.addEventListener("click", function (event) {
      var url = link.getAttribute("data-compose-modal-url") || link.getAttribute("href");

      event.preventDefault();
      openComposeModal(url);
    });
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
