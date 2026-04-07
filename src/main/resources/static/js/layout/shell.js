document.addEventListener("DOMContentLoaded", function () {
  let root = document.querySelector("[data-bd-shell-root]");
  if (!root) {
    return;
  }

  let desktopQuery = window.matchMedia("(min-width: 901px)");
  let menuToggle = root.querySelector("[data-bd-shell-menu-toggle]");
  let searchToggles = Array.from(
    root.querySelectorAll("[data-bd-search-toggle]")
  );


  // Popup elements (popups are outside [data-bd-shell-root], so query from document)


  let overlay = root.querySelector("[data-bd-shell-overlay]");
  let drawer = root.querySelector("[data-bd-shell-drawer]");
  let mobileSearch = root.querySelector("[data-bd-shell-mobile-search]");
  let createToggle = root.querySelector("[data-bd-shell-create-toggle]");
  let accountToggle = root.querySelector("[data-bd-shell-account-toggle]");
  let notificationToggle = root.querySelector("[data-bd-shell-notification-toggle]");
  let createPopup = document.querySelector("[data-bd-shell-create-popup]");
  let accountPopup = document.querySelector("[data-bd-shell-account-popup]");
  let notificationPopup = document.querySelector("[data-bd-shell-notification-popup]");
  let composeModal = document.querySelector("[data-yt-compose-modal]");
  let composeContent = document.querySelector("[data-yt-compose-content]");
  let composeDismissButtons = Array.from(document.querySelectorAll("[data-yt-compose-dismiss]"));
  let composeLinks = Array.from(document.querySelectorAll("[data-compose-modal-link]"));
  let composeState = {
    url: "",
    styles: [],
    scripts: [],
    cache: {}
  };

  function syncBodyState() {
    document.body.dataset.guideCollapsed = root.dataset.guideCollapsed || "false";
    document.body.dataset.mobileDrawerOpen = root.dataset.mobileDrawerOpen || "false";
    document.body.dataset.searchOpen = root.dataset.searchOpen || "false";
  }

  function syncOverlay() {
    let open = root.dataset.mobileDrawerOpen === "true" || root.dataset.searchOpen === "true";
    if (overlay) {
      overlay.hidden = !open;
    }
  }

  function lockBody(locked) {
    document.body.classList.toggle("bd-shell-lock", locked);
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
  }

  function loadComposeStyles(parsedDocument) {
    let stylesheetLinks = Array.from(parsedDocument.querySelectorAll('link[rel="stylesheet"]'));

    stylesheetLinks.forEach(function (linkNode) {
      let href = linkNode.getAttribute("href");
      let newLink;

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
    let scriptNodes = Array.from(parsedDocument.querySelectorAll("script[src]"));
    let loaders = scriptNodes.map(function (scriptNode) {
      let src = scriptNode.getAttribute("src");
      let newScript;

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
        let parser = new DOMParser();
        let parsedDocument = parser.parseFromString(html, "text/html");
        let nodes = extractComposeNodes(parsedDocument);

        if (!nodes.length) {
          throw new Error("작성 모달 내용을 찾지 못했습니다.");
        }

        if (composeContent) {
          composeContent.innerHTML = "";
        }

        removeComposeAssets();
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
    let collapsed = root.dataset.guideCollapsed === "true";
    root.dataset.guideCollapsed = collapsed ? "false" : "true";
    syncBodyState();
  }

  function toggleDrawer() {
    let nextState = root.dataset.mobileDrawerOpen !== "true";
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
    let nextState = root.dataset.searchOpen !== "true";
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
    let rect = triggerButton.getBoundingClientRect();
    let rightOffset = window.innerWidth - rect.right;
    popup.style.top = rect.bottom + "px";
    popup.style.right = rightOffset + "px";
    popup.style.left = "auto";

    requestAnimationFrame(function () {
      let popupRect = popup.getBoundingClientRect();
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
    let willOpen = createPopup && createPopup.hidden;
    closeAllPopups();
    if (willOpen) {
      positionPopup(createPopup, createToggle);
      createPopup.hidden = false;
      createToggle.setAttribute("aria-expanded", "true");
    }
  }

  function toggleAccountPopup() {
    let willOpen = accountPopup && accountPopup.hidden;
    closeAllPopups();
    if (willOpen) {
      positionPopup(accountPopup, accountToggle);
      accountPopup.hidden = false;
      accountToggle.setAttribute("aria-expanded", "true");
    }
  }

  function toggleNotificationPopup() {
    let willOpen = notificationPopup && notificationPopup.hidden;
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
    let anyPopupOpen = (createPopup && !createPopup.hidden) || (accountPopup && !accountPopup.hidden) || (notificationPopup && !notificationPopup.hidden);
    if (!anyPopupOpen) {
      return;
    }

    let clickedInsidePopup = (createPopup && createPopup.contains(event.target)) || (accountPopup && accountPopup.contains(event.target)) || (notificationPopup && notificationPopup.contains(event.target));
    let clickedToggle = (createToggle && createToggle.contains(event.target)) || (accountToggle && accountToggle.contains(event.target)) || (notificationToggle && notificationToggle.contains(event.target));

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
      let url = link.getAttribute("data-compose-modal-url") || link.getAttribute("href");

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
