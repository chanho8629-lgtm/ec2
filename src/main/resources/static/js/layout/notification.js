document.addEventListener("DOMContentLoaded", function () {
  let badge = document.querySelector("[data-bd-notification-badge]");
  let list = document.querySelector("[data-bd-notification-list]");
  let toggle = document.querySelector("[data-bd-shell-notification-toggle]");
  let popup = document.querySelector("[data-bd-shell-notification-popup]");

  if (!badge || !list || !toggle) return;

  let notifications = [];
  let loaded = false;

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
    let d = new Date(dateStr);
    let now = new Date();
    let diff = now - d;
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
    if (noti.targetType === "AUCTION" && noti.targetId) return "/work/" + noti.targetId;
    if (noti.targetType === "CONTEST" && noti.targetId) return "/contest/" + noti.targetId;
    return "#";
  }

  function updateBadge() {
    fetch("/api/notifications/unread-count", { credentials: "same-origin" })
      .then(function (res) { return res.ok ? res.json() : { count: 0 }; })
      .then(function (data) {
        let count = data.count || 0;
        badge.textContent = count;
        badge.style.display = count > 0 ? "" : "none";
      })
      .catch(function () {});
  }

  function loadNotifications() {
    fetch("/api/notifications?page=0", { credentials: "same-origin" })
      .then(function (res) { return res.ok ? res.json() : []; })
      .then(function (data) {
        notifications = data;
        renderList();
        loaded = true;
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
      let unreadClass = noti.isRead ? "" : " is-unread";
      let href = buildNotificationLink(noti);
      let avatarSrc = noti.senderProfileImage || "/images/default-profile.svg";
      let dotHtml = noti.isRead ? "" : '<div class="bd-shell__notification-dot"></div>';

      return (
        '<a class="bd-shell__notification-item' + unreadClass + '" href="' + escapeHtml(href) + '" data-noti-id="' + noti.id + '">' +
        '<img class="bd-shell__notification-avatar" src="' + escapeHtml(avatarSrc) + '" alt="" />' +
        '<div class="bd-shell__notification-body">' +
        '<p class="bd-shell__notification-text">' + escapeHtml(noti.message) + '</p>' +
        '<span class="bd-shell__notification-time">' + formatTime(noti.createdDatetime) + '</span>' +
        '</div>' +
        dotHtml +
        '</a>'
      );
    }).join("");

    Array.from(list.querySelectorAll(".bd-shell__notification-item")).forEach(function (item) {
      item.addEventListener("click", function () {
        let notiId = item.dataset.notiId;
        if (notiId && item.classList.contains("is-unread")) {
          fetch("/api/notifications/" + notiId + "/read", {
            method: "PATCH",
            credentials: "same-origin"
          }).then(function () { updateBadge(); }).catch(function () {});
          item.classList.remove("is-unread");
          let dot = item.querySelector(".bd-shell__notification-dot");
          if (dot) dot.remove();
        }
      });
    });
  }

  // 팝업 열릴 때 알림 로드
  let observer = new MutationObserver(function () {
    if (popup && !popup.hidden) {
      loadNotifications();
    }
  });
  if (popup) {
    observer.observe(popup, { attributes: true, attributeFilter: ["hidden"] });
  }

  // 초기 뱃지 + 주기적 갱신
  updateBadge();
  setInterval(updateBadge, 30000);
});
