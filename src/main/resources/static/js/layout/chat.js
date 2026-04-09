document.addEventListener("DOMContentLoaded", function () {
  let root = document.querySelector("[data-bd-shell-root]");
  if (!root) return;

  let toggle = document.querySelector("[data-bd-chat-toggle]");
  let layer = document.querySelector("[data-bd-chat-layer]");
  let panel = document.querySelector("[data-bd-chat-panel]");
  let dismissButtons = Array.from(document.querySelectorAll("[data-bd-chat-dismiss]"));
  let roomList = document.querySelector("[data-bd-chat-room-list]");
  let composeToggle = document.querySelector("[data-bd-chat-compose-toggle]");
  let peopleSearch = document.querySelector("[data-bd-chat-people-search]");
  let peopleInput = document.querySelector("[data-bd-chat-people-input]");
  let peopleList = document.querySelector("[data-bd-chat-people-list]");
  let emptyState = document.querySelector("[data-bd-chat-empty]");
  let detail = document.querySelector("[data-bd-chat-detail]");
  let avatar = document.querySelector("[data-bd-chat-avatar]");
  let nameNode = document.querySelector("[data-bd-chat-name]");
  let statusNode = document.querySelector("[data-bd-chat-status]");
  let messagesNode = document.querySelector("[data-bd-chat-messages]");
  let composer = document.querySelector("[data-bd-chat-composer]");
  let composerInput = document.querySelector("[data-bd-chat-input]");
  let composerSend = composer ? composer.querySelector(".bd-chat-composer__send") : null;
  let roomSearchInput = document.querySelector("[data-bd-chat-room-search]");
  let badgeNode = document.querySelector(".bd-chat-fab__badge");

  if (!toggle || !layer || !panel || !roomList || !emptyState || !detail || !avatar || !nameNode || !statusNode || !messagesNode || !composeToggle || !peopleSearch || !peopleList || !composer || !composerInput || !composerSend) {
    return;
  }

  // 채팅방 상태 관리
  let rooms = [];
  let activeRoomId = null;
  let composeOpen = false;
  let stompClient = null;
  let currentSubscription = null;
  let backButton = document.querySelector("[data-bd-chat-back]");
  let panelBody = document.querySelector(".bd-chat-panel__body");

  function isMobileChat() {
    return window.matchMedia("(max-width: 640px)").matches;
  }

  function showThreadMobile() {
    if (isMobileChat() && panelBody) {
      panelBody.classList.add("is-thread-open");
    }
  }

  function showListMobile() {
    if (panelBody) panelBody.classList.remove("is-thread-open");
    if (currentSubscription) { currentSubscription.unsubscribe(); currentSubscription = null; }
    activeRoomId = null;
    emptyState.hidden = false;
    detail.hidden = true;
    setComposerPlaceholder(null);
    Array.from(roomList.querySelectorAll(".bd-chat-room")).forEach(function (btn) {
      btn.classList.remove("is-active");
    });
  }

  if (backButton) backButton.addEventListener("click", showListMobile);

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  }

  // 메시지 링크 변환
  function renderMessageBody(content) {
    if (!content) {
      return "";
    }

    var safeContent = escapeHtml(content);

    safeContent = safeContent.replace(
      /(https?:\/\/[^\s<]+)/gi,
      function (url) {
        return '<a href="' + url + '" target="_blank" rel="noopener noreferrer">' + url + '</a>';
      }
    );

    safeContent = safeContent.replace(/\n/g, "<br>");
    return safeContent;
  }

  function setComposeOpen(nextState, skipAnimation) {
    if (composeOpen === nextState) return;
    composeOpen = nextState;
    composeToggle.setAttribute("aria-expanded", String(nextState));
    if (nextState) {
      peopleSearch.classList.remove("is-closing");
      peopleSearch.hidden = false;
    } else if (skipAnimation) {
      peopleSearch.hidden = true;
      peopleSearch.classList.remove("is-closing");
      if (peopleInput) { peopleInput.value = ""; renderPeopleList(""); }
    } else {
      peopleSearch.classList.add("is-closing");
      peopleSearch.addEventListener("animationend", function handler() {
        peopleSearch.removeEventListener("animationend", handler);
        peopleSearch.hidden = true;
        peopleSearch.classList.remove("is-closing");
      });
      if (peopleInput) { peopleInput.value = ""; renderPeopleList(""); }
    }
  }

  function findRoom(roomId) {
    return rooms.find(function (r) { return String(r.id) === String(roomId); });
  }

  function setComposerPlaceholder(room) {
    composerInput.value = "";
    composerInput.placeholder = room ? room.name + " 님에게 메시지를 입력하세요." : "메시지를 입력하세요.";
  }

  function openLayer() {
    layer.hidden = false;
    layer.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "true");
    document.body.dataset.bdChatOpen = "true";
    loadRooms();
    if (!stompClient || !stompClient.connected) connectWebSocket();
  }

  function closeLayer() {
    layer.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
    delete document.body.dataset.bdChatOpen;
    if (panelBody) panelBody.classList.remove("is-thread-open");
    window.setTimeout(function () {
      if (!layer.classList.contains("is-open")) layer.hidden = true;
    }, 220);
  }

  function formatTime(dateStr) {
    if (!dateStr) return "";
    let d = new Date(dateStr);
    let now = new Date();
    let diff = now - d;
    if (diff < 60000) return "방금";
    if (diff < 3600000) return Math.floor(diff / 60000) + "분";
    if (diff < 86400000) return Math.floor(diff / 3600000) + "시간";
    return (d.getMonth() + 1) + "/" + d.getDate();
  }

  function loadRooms(callback) {
    fetch("/api/messages/rooms", { credentials: "same-origin" })
      .then(function (res) {
        if (!res.ok) { rooms = []; renderRoomList(""); return; }
        return res.json();
      })
      .then(function (data) {
        if (!data) return;
        rooms = data.map(function (room) {
          let otherMember = room.members && room.members.length > 0 ? room.members[0] : null;
          return {
            id: room.id,
            name: otherMember ? otherMember.nickname : "알 수 없음",
            profileImage: otherMember ? otherMember.profileImage : null,
            avatar: otherMember ? (otherMember.nickname || "?").charAt(0).toUpperCase() : "?",
            preview: room.lastMessage || "",
            time: formatTime(room.lastMessageAt),
            unreadCount: room.unreadCount || 0,
            messages: []
          };
        });
        renderRoomList(roomSearchInput ? roomSearchInput.value : "");
        updateBadge();
        if (callback) callback();
      })
      .catch(function () { rooms = []; renderRoomList(""); });
  }

  function updateBadge() {
    fetch("/api/messages/unread-count", { credentials: "same-origin" })
      .then(function (res) { return res.ok ? res.json() : { count: 0 }; })
      .then(function (data) {
        if (badgeNode) {
          let count = data.count || 0;
          badgeNode.textContent = count;
          badgeNode.style.display = count > 0 ? "" : "none";
        }
      })
      .catch(function () {});
  }

  function connectWebSocket() {
    if (typeof SockJS === "undefined" || typeof Stomp === "undefined") return;
    let socket = new SockJS('/ws');
    stompClient = Stomp.over(socket);
    stompClient.debug = null;
    stompClient.connect({}, function () {
      if (activeRoomId) subscribeToRoom(activeRoomId);
    }, function () {
      stompClient = null;
      setTimeout(connectWebSocket, 3000);
    });
  }

  function subscribeToRoom(roomId) {
    if (currentSubscription) {
      currentSubscription.unsubscribe();
      currentSubscription = null;
    }
    if (!stompClient || !stompClient.connected || !roomId) return;
    currentSubscription = stompClient.subscribe('/topic/room.' + roomId, function (frame) {
      handleRealtimeEvent(JSON.parse(frame.body));
    });
  }

  function isChatPanelOpen() {
    return layer.classList.contains("is-open");
  }

  function handleRealtimeEvent(event) {
    if (isChatPanelOpen() && String(event.roomId) === String(activeRoomId)) {
      loadMessages(activeRoomId);
    }
    if (isChatPanelOpen()) loadRooms();
    updateBadge();
  }

  function loadMessages(roomId) {
    fetch("/api/messages/rooms/" + roomId + "/messages", { credentials: "same-origin" })
      .then(function (res) { return res.ok ? res.json() : []; })
      .then(function (messages) {
        let room = findRoom(roomId);
        if (!room) return;
        room.messages = messages;
        renderMessages(room);
        messagesNode.scrollTop = messagesNode.scrollHeight;
        fetch("/api/messages/rooms/" + roomId + "/read", { method: "PATCH", credentials: "same-origin" })
          .then(function () { loadRooms(); updateBadge(); })
          .catch(function () {});
      })
      .catch(function () {});
  }

  // 현재 채팅방 메시지를 화면에 다시 그린다.
  function renderMessages(room) {
    messagesNode.innerHTML = room.messages
      .map(function (msg) {
        let isSelf = msg.isSelf || msg.canEdit || msg.canDelete;
        let klass = isSelf ? "bd-chat-bubble bd-chat-bubble--self" : "bd-chat-bubble";
        let body = msg.deleted ? "<em>삭제된 메시지</em>" : renderMessageBody(msg.content || "");
        let hasAnyLike = msg.isLiked || msg.likeCount > 0;
        let likedClass = hasAnyLike ? " is-liked" : "";
        let actionsClass = "bd-chat-bubble__actions" + (hasAnyLike ? " has-liked" : "");

        let actionsHtml = '';
        if (!msg.deleted) {
          let deleteBtn = msg.canDelete
            ? '<button class="bd-chat-bubble__action bd-chat-bubble__action--delete" data-msg-id="' + msg.id + '" type="button" title="삭제">' +
              '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>' +
              '</button>'
            : '';
          let likeLabel = msg.likeCount > 0 ? ' ' + msg.likeCount : '';
          actionsHtml =
            '<span class="' + actionsClass + '">' +
            deleteBtn +
            '<button class="bd-chat-bubble__action bd-chat-bubble__action--like' + likedClass + '" data-msg-id="' + msg.id + '" type="button" title="좋아요">' +
            '<svg width="14" height="14" viewBox="0 0 24 24" fill="' + (hasAnyLike ? 'currentColor' : 'none') + '" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>' +
            (likeLabel ? '<span class="bd-chat-bubble__action-count">' + likeLabel + '</span>' : '') +
            '</button>' +
            '</span>';
        }

        return (
          '<article class="' + klass + '">' +
          '<div class="bd-chat-bubble__row">' +
          '<div class="bd-chat-bubble__body">' + body + '</div>' +
          actionsHtml +
          '</div>' +
          "</article>"
        );
      })
      .join("");

    Array.from(messagesNode.querySelectorAll(".bd-chat-bubble__action--like")).forEach(function (btn) {
      btn.addEventListener("click", function () {
        handleLike(btn.dataset.msgId);
      });
    });

    Array.from(messagesNode.querySelectorAll(".bd-chat-bubble__action--delete")).forEach(function (btn) {
      btn.addEventListener("click", function () {
        handleDelete(btn.dataset.msgId);
      });
    });

    bindLongPress();
  }

  function handleLike(msgId) {
    fetch("/api/messages/rooms/" + activeRoomId + "/messages/" + msgId + "/likes", {
      method: "POST",
      credentials: "same-origin"
    })
      .then(function (res) { return res.ok ? res.json() : null; })
      .then(function () { loadMessages(activeRoomId); })
      .catch(function () {});
  }

  function handleDelete(msgId) {
    showDeleteConfirm(function () {
      fetch("/api/messages/rooms/" + activeRoomId + "/messages/" + msgId, {
        method: "DELETE",
        credentials: "same-origin"
      })
        .then(function (res) { return res.ok ? res.json() : null; })
        .then(function () { loadMessages(activeRoomId); })
        .catch(function () {});
    });
  }

  function showDeleteConfirm(onConfirm) {
    let existing = panel.querySelector(".bd-chat-delete-confirm");
    if (existing) existing.remove();

    let overlay = document.createElement("div");
    overlay.className = "bd-chat-delete-confirm";

    let dialog = document.createElement("div");
    dialog.className = "bd-chat-delete-confirm__dialog";
    dialog.innerHTML =
      '<p class="bd-chat-delete-confirm__text">삭제하시겠습니까?</p>' +
      '<div class="bd-chat-delete-confirm__actions">' +
      '<button class="bd-chat-delete-confirm__btn bd-chat-delete-confirm__btn--cancel" type="button">취소</button>' +
      '<button class="bd-chat-delete-confirm__btn bd-chat-delete-confirm__btn--confirm" type="button">삭제</button>' +
      '</div>';

    overlay.appendChild(dialog);
    panel.appendChild(overlay);
    requestAnimationFrame(function () { overlay.classList.add("is-open"); });

    function close() { overlay.remove(); }

    overlay.addEventListener("click", function (e) { if (e.target === overlay) close(); });
    dialog.querySelector(".bd-chat-delete-confirm__btn--cancel").addEventListener("click", close);
    dialog.querySelector(".bd-chat-delete-confirm__btn--confirm").addEventListener("click", function () {
      close();
      onConfirm();
    });
  }

  /* ── long-press → bottom-sheet (mobile) ── */
  let longPressTimer = null;
  let longPressTriggered = false;

  function isTouchDevice() {
    return "ontouchstart" in window || navigator.maxTouchPoints > 0;
  }

  function closeMsgModal() {
    let existing = panel.querySelector(".bd-chat-msg-modal");
    if (existing) existing.remove();
  }

  function openMsgModal(msg) {
    closeMsgModal();

    let room = findRoom(activeRoomId);
    if (!room) return;

    let overlay = document.createElement("div");
    overlay.className = "bd-chat-msg-modal";

    let sheet = document.createElement("div");
    sheet.className = "bd-chat-msg-modal__sheet";

    let preview = document.createElement("div");
    preview.className = "bd-chat-msg-modal__preview";
    preview.textContent = msg.content && msg.content.length > 40
      ? msg.content.substring(0, 40) + "..."
      : (msg.content || "");
    sheet.appendChild(preview);

    let likeBtn = document.createElement("button");
    likeBtn.className = "bd-chat-msg-modal__btn";
    if (msg.isLiked) likeBtn.classList.add("is-liked");
    likeBtn.type = "button";
    likeBtn.innerHTML =
      '<svg width="20" height="20" viewBox="0 0 24 24" fill="' + (msg.isLiked ? "currentColor" : "none") + '" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>' +
      '<span>' + (msg.isLiked ? "좋아요 취소" : "좋아요") + (msg.likeCount > 0 ? " " + msg.likeCount : "") + '</span>';
    likeBtn.addEventListener("click", function () {
      closeMsgModal();
      handleLike(msg.id);
    });
    sheet.appendChild(likeBtn);

    if (msg.canDelete && !msg.deleted) {
      let deleteBtn = document.createElement("button");
      deleteBtn.className = "bd-chat-msg-modal__btn bd-chat-msg-modal__btn--danger";
      deleteBtn.type = "button";
      deleteBtn.innerHTML =
        '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2"/></svg>' +
        '<span>삭제</span>';
      deleteBtn.addEventListener("click", function () {
        closeMsgModal();
        handleDelete(msg.id);
      });
      sheet.appendChild(deleteBtn);
    }

    let cancelBtn = document.createElement("button");
    cancelBtn.className = "bd-chat-msg-modal__btn bd-chat-msg-modal__btn--cancel";
    cancelBtn.type = "button";
    cancelBtn.textContent = "취소";
    cancelBtn.addEventListener("click", closeMsgModal);
    sheet.appendChild(cancelBtn);

    overlay.appendChild(sheet);
    overlay.addEventListener("click", function (e) {
      if (e.target === overlay) closeMsgModal();
    });

    panel.appendChild(overlay);
    requestAnimationFrame(function () {
      overlay.classList.add("is-open");
    });
  }

  function findMsgDataFromBubble(bubble) {
    let room = findRoom(activeRoomId);
    if (!room) return null;
    let bubbles = Array.from(messagesNode.querySelectorAll(".bd-chat-bubble"));
    let idx = bubbles.indexOf(bubble);
    if (idx < 0 || idx >= room.messages.length) return null;
    return room.messages[idx];
  }

  function bindLongPress() {
    if (!isTouchDevice()) return;

    Array.from(messagesNode.querySelectorAll(".bd-chat-bubble")).forEach(function (bubble) {
      bubble.addEventListener("touchstart", function (e) {
        longPressTriggered = false;
        longPressTimer = setTimeout(function () {
          longPressTriggered = true;
          let msg = findMsgDataFromBubble(bubble);
          if (msg && !msg.deleted) {
            openMsgModal(msg);
            if (navigator.vibrate) navigator.vibrate(30);
          }
        }, 500);
      }, { passive: true });

      bubble.addEventListener("touchend", function () {
        clearTimeout(longPressTimer);
      });

      bubble.addEventListener("touchmove", function () {
        clearTimeout(longPressTimer);
      });

      bubble.addEventListener("touchcancel", function () {
        clearTimeout(longPressTimer);
      });
    });
  }

  function renderActiveRoom(roomId) {
    let room = findRoom(roomId);
    if (!room) return;
    activeRoomId = room.id;
    avatar.textContent = room.avatar;
    if (room.profileImage) {
      avatar.innerHTML = '<img src="' + escapeHtml(room.profileImage) + '" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" />';
    } else {
      avatar.textContent = room.avatar;
    }
    nameNode.textContent = room.name;
    statusNode.textContent = "";
    emptyState.hidden = true;
    detail.hidden = false;
    setComposerPlaceholder(room);
    showThreadMobile();
    loadMessages(roomId);
    subscribeToRoom(roomId);
    window.setTimeout(function () { composerInput.focus(); }, 0);
    Array.from(roomList.querySelectorAll(".bd-chat-room")).forEach(function (btn) {
      btn.classList.toggle("is-active", String(btn.dataset.roomId) === String(roomId));
    });
  }

  function renderRoomList(query) {
    let normalized = (query || "").trim().toLowerCase();
    let filtered = rooms.filter(function (room) {
      if (!normalized) return true;
      return room.name.toLowerCase().indexOf(normalized) >= 0 || room.preview.toLowerCase().indexOf(normalized) >= 0;
    });

    roomList.innerHTML = filtered
      .map(function (room) {
        let unreadHtml = room.unreadCount > 0
          ? '<span class="bd-chat-room__unread">' + room.unreadCount + '</span>'
          : '';
        return (
          '<button class="bd-chat-room' + (room.unreadCount > 0 ? ' has-unread' : '') + '" type="button" data-room-id="' + room.id + '">' +
          (room.profileImage
            ? '<span class="bd-chat-room__avatar" aria-hidden="true"><img src="' + escapeHtml(room.profileImage) + '" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" /></span>'
            : '<span class="bd-chat-room__avatar" aria-hidden="true">' + escapeHtml(room.avatar) + "</span>") +
          '<span class="bd-chat-room__meta">' +
          '<strong class="bd-chat-room__name">' + escapeHtml(room.name) + "</strong>" +
          '<span class="bd-chat-room__preview">' + escapeHtml(room.preview) + "</span>" +
          "</span>" +
          '<span class="bd-chat-room__time">' + escapeHtml(room.time) + unreadHtml + "</span>" +
          "</button>"
        );
      })
      .join("");

    Array.from(roomList.querySelectorAll(".bd-chat-room")).forEach(function (btn) {
      btn.addEventListener("click", function () { renderActiveRoom(btn.dataset.roomId); });
    });

    if (activeRoomId && filtered.some(function (r) { return String(r.id) === String(activeRoomId); })) {
      Array.from(roomList.querySelectorAll(".bd-chat-room")).forEach(function (btn) {
        btn.classList.toggle("is-active", String(btn.dataset.roomId) === String(activeRoomId));
      });
    } else if (!normalized) {
      activeRoomId = null;
      emptyState.hidden = false;
      detail.hidden = true;
      setComposerPlaceholder(null);
    }
  }

  let peopleDebounce = null;
  function renderPeopleList(query) {
    let normalized = (query || "").trim();
    if (!normalized) { peopleList.innerHTML = ""; return; }
    if (peopleDebounce) clearTimeout(peopleDebounce);
    peopleDebounce = setTimeout(function () {
      fetch("/api/messages/search-members?keyword=" + encodeURIComponent(normalized), { credentials: "same-origin" })
        .then(function (res) { return res.ok ? res.json() : []; })
        .then(function (members) {
          peopleList.innerHTML = members.map(function (m) {
            var avatarHtml = m.profileImage
              ? '<span class="bd-chat-person__avatar" aria-hidden="true"><img src="' + escapeHtml(m.profileImage) + '" alt="" style="width:100%;height:100%;border-radius:50%;object-fit:cover;" /></span>'
              : '<span class="bd-chat-person__avatar" aria-hidden="true">' + escapeHtml((m.nickname || "?").charAt(0).toUpperCase()) + "</span>";
            return (
              '<button class="bd-chat-person" type="button" data-person-id="' + m.id + '" data-person-nickname="' + escapeHtml(m.nickname) + '">' +
              avatarHtml +
              '<span>' +
              '<strong class="bd-chat-person__name">' + escapeHtml(m.nickname) + "</strong>" +
              (m.followerCount ? '<span class="bd-chat-person__meta">팔로워 ' + m.followerCount + '</span>' : '') +
              "</span>" +
              "</button>"
            );
          }).join("");

          Array.from(peopleList.querySelectorAll(".bd-chat-person")).forEach(function (btn) {
            btn.addEventListener("click", function () {
              let memberId = btn.dataset.personId;
              fetch("/api/messages/rooms", {
                method: "POST",
                credentials: "same-origin",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ memberIds: [Number(memberId)] })
              })
                .then(function (res) { return res.json(); })
                .then(function (room) {
                  setComposeOpen(false);
                  loadRooms(function () { renderActiveRoom(room.id); });
                })
                .catch(function () {});
            });
          });
        })
        .catch(function () { peopleList.innerHTML = ""; });
    }, 300);
  }

  toggle.addEventListener("click", function () {
    if (layer.classList.contains("is-open")) { closeLayer(); return; }
    openLayer();
  });

  dismissButtons.forEach(function (btn) { btn.addEventListener("click", closeLayer); });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && layer.classList.contains("is-open")) {
      if (composeOpen) { setComposeOpen(false); return; }
      closeLayer();
    }
  });

  composeToggle.addEventListener("click", function () {
    setComposeOpen(!composeOpen);
    if (composeOpen && peopleInput) peopleInput.focus();
  });

  if (roomSearchInput) {
    roomSearchInput.addEventListener("input", function () { renderRoomList(roomSearchInput.value); });
  }

  if (peopleInput) {
    peopleInput.addEventListener("input", function () { renderPeopleList(peopleInput.value); });
  }

  if (composer) {
    composer.addEventListener("submit", function (event) {
      event.preventDefault();
      let room = findRoom(activeRoomId);
      let nextMessage = composerInput.value.trim();
      if (!room || !nextMessage) return;

      fetch("/api/messages/rooms/" + room.id + "/send", {
        method: "POST",
        credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: nextMessage })
      })
        .then(function (res) { return res.json(); })
        .then(function () {
          composerInput.value = "";
          loadMessages(room.id);
          loadRooms();
        })
        .catch(function () {});
    });
  }

  setComposeOpen(false, true);
  setComposerPlaceholder(null);
  renderPeopleList("");
  updateBadge();
});
