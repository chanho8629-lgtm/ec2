document.addEventListener("DOMContentLoaded", function () {
  var badge = document.querySelector("[data-bd-notification-badge]");
  var list = document.querySelector("[data-bd-notification-list]");
  var popupToggle = document.querySelector("[data-bd-shell-notification-toggle]");
  var popup = document.querySelector("[data-bd-shell-notification-popup]");
  var toggleBtn = document.querySelector("[data-bd-notification-toggle-btn]");

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
    if (noti.targetType === "AUCTION" && noti.targetId) return "/payment/pay-api?auctionId=" + noti.targetId;
    if (noti.targetType === "PAYMENT" && noti.targetId) return "/payment/pay-api?paymentId=" + noti.targetId;
    if (noti.targetType === "PAYMENT_HISTORY") return "/dashboard?tab=payment";
    if (noti.targetType === "CONTEST" && noti.targetId) return "/contest/" + noti.targetId;
    return "#";
  }

  function normalizeImageSrc(value, fallback) {
    var src = String(value || "").trim();
    return src || fallback;
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
      var avatarSrc = normalizeImageSrc(noti.senderProfileImage, "/images/default-profile.svg");
      var dotHtml = noti.isRead ? "" : '<div class="bd-shell__notification-dot"></div>';

      return (
          '<a class="bd-shell__notification-item' + unreadClass + '" href="' + escapeHtml(href) + '" data-noti-id="' + noti.id + '">' +
          '<img class="bd-shell__notification-avatar" src="' + escapeHtml(avatarSrc) + '" alt="" onerror="this.onerror=null;this.src=\'/images/default-profile.svg\'" />' +
          '<div class="bd-shell__notification-body">' +
          '<p class="bd-shell__notification-text">' + escapeHtml(noti.message) + '</p>' +
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
