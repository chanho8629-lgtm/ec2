document.addEventListener("DOMContentLoaded", function () {
  var badge = document.querySelector("[data-bd-notification-badge]");
  var list = document.querySelector("[data-bd-notification-list]");
  var popupToggle = document.querySelector("[data-bd-shell-notification-toggle]");
  var popup = document.querySelector("[data-bd-shell-notification-popup]");
  var toggleBtn = document.querySelector("[data-bd-notification-toggle-btn]");
  var readAllBtn = document.querySelector("[data-bd-notification-readall]");

  if (!badge || !list || !popupToggle) return;

  var notifications = [];

  function escapeHtml(value) {
    return String(value || "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
  }

  function formatTime(dateStr) {
    if (!dateStr) return "";
    var d = new Date(dateStr);
    var diff = Date.now() - d.getTime();
    if (diff < 60000) return "방금";
    if (diff < 3600000) return Math.floor(diff / 60000) + "분 전";
    if (diff < 86400000) return Math.floor(diff / 3600000) + "시간 전";
    if (diff < 604800000) return Math.floor(diff / 86400000) + "일 전";
    return (d.getMonth() + 1) + "/" + d.getDate();
  }

  function buildNotificationLink(noti) {
    if (noti.targetType === "MESSAGE" && noti.messageRoomId) return "#";
    if (noti.targetType === "WORK" && noti.targetId) return "/work/detail/" + noti.targetId;
    if (noti.targetType === "GALLERY" && noti.targetId) return "/gallery/" + noti.targetId;
    if (noti.targetType === "AUCTION" && noti.targetId) {
      if (noti.notiType === "AUCTION_END") {
        return "/payment/pay-api?auctionId=" + noti.targetId;
      }
      return "#";
    }
    if (noti.targetType === "PAYMENT" && noti.targetId) {
      if (noti.paymentStatus === "PENDING" || noti.paymentStatus === "AUTHORIZED") {
        return "/payment/pay-api?paymentId=" + noti.targetId;
      }
      return "#";
    }
    if (noti.targetType === "PAYMENT_HISTORY") return "/dashboard?tab=payment";
    if (noti.targetType === "CONTEST" && noti.targetId) return "/contest/" + noti.targetId;
    return "#";
  }

  function normalizeImageSrc(value, fallback) {
    var src = String(value || "").trim();
    return src || fallback;
  }

  var SENDER_PREFIX_TYPES = {
    FOLLOW: true,
    LIKE: true,
    BOOKMARK: true,
    COMMENT: true,
    BID: true,
    MESSAGE: true,
    AUCTION_END: true,
    PAYMENT: true,
    CONTEST_ENTRY: true,
    CONTEST_WIN: true
  };

  function resolveNotificationImage(noti) {
    var profileFallback = "/images/default-profile.svg";
    var workFallback = "/images/logo.png";
    var senderImg = String(noti.senderProfileImage || "").trim();
    var targetImg = String(noti.targetImage || "").trim();

    var t = noti.notiType;
    var tt = noti.targetType;

    if (t === "FOLLOW" || tt === "MEMBER" || tt === "MESSAGE") {
      return { src: senderImg || profileFallback, fallback: profileFallback, rounded: true };
    }

    if (tt === "WORK" || tt === "AUCTION" || tt === "PAYMENT" || tt === "ORDER") {
      return { src: targetImg || senderImg || workFallback, fallback: workFallback, rounded: false };
    }

    if (tt === "GALLERY") {
      return { src: targetImg || senderImg || workFallback, fallback: workFallback, rounded: false };
    }

    if (tt === "CONTEST") {
      return { src: targetImg || workFallback, fallback: workFallback, rounded: false };
    }

    return { src: senderImg || profileFallback, fallback: profileFallback, rounded: true };
  }

  function buildNotificationText(noti) {
    var nickname = (noti.senderNickname || "").trim();
    var message = String(noti.message || "");
    if (nickname && SENDER_PREFIX_TYPES[noti.notiType]) {
      return '<strong class="bd-shell__notification-sender">' +
             escapeHtml(nickname) +
             '</strong>님이 ' +
             escapeHtml(message);
    }
    return escapeHtml(message);
  }

  /* ── Badge ── */
  function updateBadge() {
    fetch("/api/notifications/unread-count", { credentials: "same-origin" })
        .then(function (res) { return res.ok ? res.json() : { count: 0 }; })
        .then(function (data) {
          var count = data.count || 0;
          badge.textContent = count > 99 ? "99+" : count;
          badge.style.display = count > 0 ? "" : "none";
        })
        .catch(function () {});
  }

  /* ── List ── */
  function loadNotifications() {
    fetch("/api/notifications?page=0", { credentials: "same-origin" })
        .then(function (res) { return res.ok ? res.json() : []; })
        .then(function (data) {
          notifications = data;
          renderList();
        })
        .catch(function () {});
  }

  function renderList() {
    if (notifications.length === 0) {
      list.innerHTML =
          '<div class="bd-shell__notification-empty">알림이 없습니다.</div>';
      return;
    }

    list.innerHTML = notifications.map(function (noti) {
      var unreadClass = noti.isRead ? "" : " is-unread";
      var href = buildNotificationLink(noti);
      var imageInfo = resolveNotificationImage(noti);
      var dotHtml = noti.isRead ? "" : '<div class="bd-shell__notification-dot"></div>';

      return (
          '<a class="bd-shell__notification-item' + unreadClass + '" href="' + escapeHtml(href) + '" data-noti-id="' + noti.id + '">' +
          '<img class="bd-shell__notification-avatar' + (imageInfo.rounded ? '' : ' bd-shell__notification-avatar--square') + '" src="' + escapeHtml(imageInfo.src) + '" alt="" onerror="this.onerror=null;this.src=\'' + imageInfo.fallback + '\'" />' +
          '<div class="bd-shell__notification-body">' +
          '<p class="bd-shell__notification-text">' + buildNotificationText(noti) + '</p>' +
          '<span class="bd-shell__notification-time">' + formatTime(noti.createdDatetime) + '</span>' +
          '</div>' +
          dotHtml +
          '</a>'
      );
    }).join("");

    list.querySelectorAll(".bd-shell__notification-item").forEach(function (item) {
      item.addEventListener("click", function () {
        var notiId = item.dataset.notiId;
        if (notiId && item.classList.contains("is-unread")) {
          fetch("/api/notifications/" + notiId + "/read", {
            method: "PATCH",
            credentials: "same-origin"
          }).then(function () { updateBadge(); }).catch(function () {});
          item.classList.remove("is-unread");
          var dot = item.querySelector(".bd-shell__notification-dot");
          if (dot) dot.remove();
        }
      });
    });
  }

  /* ── On/Off toggle (settings API) ── */
  function applyToggleUI(paused) {
    if (!toggleBtn) return;
    var iconOn = toggleBtn.querySelector(".notification-icon-on");
    var iconOff = toggleBtn.querySelector(".notification-icon-off");
    if (paused) {
      toggleBtn.classList.add("is-off");
      if (iconOn) iconOn.style.display = "none";
      if (iconOff) iconOff.style.display = "inherit";
    } else {
      toggleBtn.classList.remove("is-off");
      if (iconOn) iconOn.style.display = "inherit";
      if (iconOff) iconOff.style.display = "none";
    }
  }

  function loadSettings() {
    fetch("/api/notifications/settings", { credentials: "same-origin" })
        .then(function (res) { return res.ok ? res.json() : null; })
        .then(function (data) {
          if (data) applyToggleUI(data.pauseAll);
        })
        .catch(function () {});
  }

  if (toggleBtn) {
    toggleBtn.addEventListener("click", function () {
      var willPause = !toggleBtn.classList.contains("is-off");
      applyToggleUI(willPause);
      fetch("/api/notifications/settings", {
        method: "PUT",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pauseAll: willPause })
      }).catch(function () {
        applyToggleUI(!willPause);
      });
    });
  }

  if (readAllBtn) {
    readAllBtn.addEventListener("click", function () {
      fetch("/api/notifications/read-all", {
        method: "PATCH",
        credentials: "same-origin"
      })
        .then(function () {
          list.querySelectorAll(".bd-shell__notification-item.is-unread").forEach(function (item) {
            item.classList.remove("is-unread");
            var dot = item.querySelector(".bd-shell__notification-dot");
            if (dot) dot.remove();
          });
          updateBadge();
        })
        .catch(function () {});
    });
  }

  /* ── Popup open -> load ── */
  if (popup) {
    new MutationObserver(function () {
      if (!popup.hidden) loadNotifications();
    }).observe(popup, { attributes: true, attributeFilter: ["hidden"] });
  }

  /* ── Init ── */
  updateBadge();
  loadSettings();
  setInterval(updateBadge, 30000);
});
