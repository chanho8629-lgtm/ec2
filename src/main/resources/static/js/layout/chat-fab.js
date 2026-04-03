document.addEventListener("DOMContentLoaded", function () {
  var root = document.querySelector("[data-yt-shell-root]");
  if (!root) {
    return;
  }

  var toggle = document.querySelector("[data-yt-chat-toggle]");
  var layer = document.querySelector("[data-yt-chat-layer]");
  var panel = document.querySelector("[data-yt-chat-panel]");
  var dismissButtons = Array.from(document.querySelectorAll("[data-yt-chat-dismiss]"));
  var roomList = document.querySelector("[data-yt-chat-room-list]");
  var composeToggle = document.querySelector("[data-yt-chat-compose-toggle]");
  var peopleSearch = document.querySelector("[data-yt-chat-people-search]");
  var peopleInput = document.querySelector("[data-yt-chat-people-input]");
  var peopleList = document.querySelector("[data-yt-chat-people-list]");
  var emptyState = document.querySelector("[data-yt-chat-empty]");
  var detail = document.querySelector("[data-yt-chat-detail]");
  var avatar = document.querySelector("[data-yt-chat-avatar]");
  var nameNode = document.querySelector("[data-yt-chat-name]");
  var statusNode = document.querySelector("[data-yt-chat-status]");
  var messagesNode = document.querySelector("[data-yt-chat-messages]");
  var composer = document.querySelector("[data-yt-chat-composer]");
  var composerInput = document.querySelector("[data-yt-chat-input]");
  var composerSend = composer ? composer.querySelector(".yt-chat-composer__send") : null;
  var roomSearchInput = document.querySelector("[data-yt-chat-room-search]");

  if (!toggle || !layer || !panel || !roomList || !emptyState || !detail || !avatar || !nameNode || !statusNode || !messagesNode || !composeToggle || !peopleSearch || !peopleList || !composer || !composerInput || !composerSend) {
    return;
  }

  var rooms = [
    {
      id: "room-1",
      name: "Studio Clid",
      status: "방금 전 응답 가능",
      preview: "브랜드 필름 수정본 확인 부탁드려요.",
      time: "2m",
      avatar: "C",
      messages: [
        { sender: "clid", label: "Studio Clid", body: "브랜드 필름 수정본 확인 부탁드려요. 컷 길이만 조금 더 줄이면 될 것 같아요.", self: false },
        { sender: "me", label: "나", body: "좋아요. 오프닝 3초 줄인 버전으로 다시 묶어둘게요.", self: true },
        { sender: "clid", label: "Studio Clid", body: "좋습니다. 오늘 안에만 받으면 바로 검수할게요.", self: false }
      ]
    },
    {
      id: "room-2",
      name: "MOTION ARCHIVE",
      status: "오늘 14:20 마지막 확인",
      preview: "콜렉션 썸네일 방향성은 지금 무드가 좋아요.",
      time: "1h",
      avatar: "M",
      messages: [
        { sender: "archive", label: "MOTION ARCHIVE", body: "콜렉션 썸네일 방향성은 지금 무드가 좋아요. 타이포만 조금 더 크게 가도 됩니다.", self: false },
        { sender: "me", label: "나", body: "네. 커버 타이포 대비를 올려서 다시 맞춰보겠습니다.", self: true }
      ]
    },
    {
      id: "room-3",
      name: "BIDEO Curator Team",
      status: "새 제안 1건",
      preview: "다음 주 큐레이션 피처드 슬롯이 비어 있습니다.",
      time: "Mon",
      avatar: "B",
      messages: [
        { sender: "curator", label: "Curator", body: "다음 주 큐레이션 피처드 슬롯이 비어 있습니다. 신작 2개 중 하나를 올릴까요?", self: false },
        { sender: "me", label: "나", body: "신작 티저보다 경매 종료작 하이라이트를 먼저 올리고 싶습니다.", self: true }
      ]
    }
  ];

  var people = [
    { id: "person-1", name: "Lee Mina", meta: "브랜드 필름 크리에이터", avatar: "L" },
    { id: "person-2", name: "Park Doyeon", meta: "광고 컷 편집자", avatar: "P" },
    { id: "person-3", name: "Han Jiwon", meta: "큐레이터 · 모션 디자이너", avatar: "H" },
    { id: "person-4", name: "Studio Namu", meta: "아트디렉션 파트너", avatar: "N" }
  ];

  var backButton = document.querySelector("[data-yt-chat-back]");
  var panelBody = document.querySelector(".yt-chat-panel__body");

  var activeRoomId = null;
  var composeOpen = false;

  function isMobileChat() {
    return window.matchMedia("(max-width: 640px)").matches;
  }

  function showThreadMobile() {
    if (isMobileChat() && panelBody) {
      panelBody.classList.add("is-thread-open");
    }
  }

  function showListMobile() {
    if (panelBody) {
      panelBody.classList.remove("is-thread-open");
    }
    activeRoomId = null;
    emptyState.hidden = false;
    detail.hidden = true;
    setComposerPlaceholder(null);
    Array.from(roomList.querySelectorAll(".yt-chat-room")).forEach(function (button) {
      button.classList.remove("is-active");
    });
  }

  if (backButton) {
    backButton.addEventListener("click", showListMobile);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
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
      if (peopleInput) {
        peopleInput.value = "";
        renderPeopleList("");
      }
    } else {
      peopleSearch.classList.add("is-closing");
      peopleSearch.addEventListener("animationend", function handler() {
        peopleSearch.removeEventListener("animationend", handler);
        peopleSearch.hidden = true;
        peopleSearch.classList.remove("is-closing");
      });
      if (peopleInput) {
        peopleInput.value = "";
        renderPeopleList("");
      }
    }
  }

  function findRoom(roomId) {
    return rooms.find(function (item) {
      return item.id === roomId;
    });
  }

  function setComposerPlaceholder(room) {
    if (!room) {
      composerInput.value = "";
      composerInput.placeholder = "메시지를 입력하세요.";
      return;
    }

    composerInput.placeholder = room.name + " 님에게 메시지를 입력하세요.";
  }

  function openLayer() {
    layer.hidden = false;
    layer.classList.add("is-open");
    panel.setAttribute("aria-hidden", "false");
    toggle.setAttribute("aria-expanded", "true");
    document.body.dataset.ytChatOpen = "true";
  }

  function closeLayer() {
    layer.classList.remove("is-open");
    panel.setAttribute("aria-hidden", "true");
    toggle.setAttribute("aria-expanded", "false");
    delete document.body.dataset.ytChatOpen;
    if (panelBody) {
      panelBody.classList.remove("is-thread-open");
    }
    window.setTimeout(function () {
      if (!layer.classList.contains("is-open")) {
        layer.hidden = true;
      }
    }, 220);
  }

  function renderMessages(room) {
    messagesNode.innerHTML = room.messages
      .map(function (message) {
        var klass = message.self ? "yt-chat-bubble yt-chat-bubble--self" : "yt-chat-bubble";
        return (
          '<article class="' + klass + '">' +
          '<span class="yt-chat-bubble__label">' + escapeHtml(message.label) + "</span>" +
          '<div class="yt-chat-bubble__body">' + escapeHtml(message.body) + "</div>" +
          "</article>"
        );
      })
      .join("");
  }

  function renderActiveRoom(roomId) {
    var room = findRoom(roomId);

    if (!room) {
      return;
    }

    activeRoomId = room.id;
    avatar.textContent = room.avatar;
    nameNode.textContent = room.name;
    statusNode.textContent = room.status;
    renderMessages(room);
    emptyState.hidden = true;
    detail.hidden = false;
    setComposerPlaceholder(room);
    showThreadMobile();
    window.setTimeout(function () {
      composerInput.focus();
    }, 0);

    Array.from(roomList.querySelectorAll(".yt-chat-room")).forEach(function (button) {
      button.classList.toggle("is-active", button.dataset.roomId === roomId);
    });
  }

  function openDraftConversation(person) {
    var existingRoom = rooms.find(function (room) {
      return room.name === person.name;
    });

    if (!existingRoom) {
      existingRoom = {
        id: "room-" + person.id,
        name: person.name,
        status: "새 대화를 시작할 수 있습니다.",
        preview: "첫 메시지를 보내보세요.",
        time: "now",
        avatar: person.avatar,
        messages: [
          {
            sender: "system",
            label: "새 대화",
            body: person.name + " 님과 대화를 시작할 준비가 되었습니다.",
            self: false
          }
        ]
      };
      rooms.unshift(existingRoom);
    }

    renderRoomList(roomSearchInput ? roomSearchInput.value : "");
    renderActiveRoom(existingRoom.id);
    setComposeOpen(false);
  }

  function renderRoomList(query) {
    var normalized = (query || "").trim().toLowerCase();
    var filtered = rooms.filter(function (room) {
      if (!normalized) {
        return true;
      }
      return (
        room.name.toLowerCase().indexOf(normalized) >= 0 ||
        room.preview.toLowerCase().indexOf(normalized) >= 0
      );
    });

    roomList.innerHTML = filtered
      .map(function (room) {
        return (
          '<button class="yt-chat-room" type="button" data-room-id="' + room.id + '">' +
          '<span class="yt-chat-room__avatar" aria-hidden="true">' + escapeHtml(room.avatar) + "</span>" +
          '<span class="yt-chat-room__meta">' +
          '<strong class="yt-chat-room__name">' + escapeHtml(room.name) + "</strong>" +
          '<span class="yt-chat-room__preview">' + escapeHtml(room.preview) + "</span>" +
          "</span>" +
          '<span class="yt-chat-room__time">' + escapeHtml(room.time) + "</span>" +
          "</button>"
        );
      })
      .join("");

    Array.from(roomList.querySelectorAll(".yt-chat-room")).forEach(function (button) {
      button.addEventListener("click", function () {
        renderActiveRoom(button.dataset.roomId);
      });
    });

    if (activeRoomId && filtered.some(function (room) { return room.id === activeRoomId; })) {
      renderActiveRoom(activeRoomId);
    } else if (!normalized) {
      activeRoomId = null;
      emptyState.hidden = false;
      detail.hidden = true;
      setComposerPlaceholder(null);
    }
  }

  function renderPeopleList(query) {
    var normalized = (query || "").trim().toLowerCase();
    var filtered = people.filter(function (person) {
      if (!normalized) {
        return true;
      }
      return (
        person.name.toLowerCase().indexOf(normalized) >= 0 ||
        person.meta.toLowerCase().indexOf(normalized) >= 0
      );
    });

    peopleList.innerHTML = filtered
      .map(function (person) {
        return (
          '<button class="yt-chat-person" type="button" data-person-id="' + person.id + '">' +
          '<span class="yt-chat-person__avatar" aria-hidden="true">' + escapeHtml(person.avatar) + "</span>" +
          '<span>' +
          '<strong class="yt-chat-person__name">' + escapeHtml(person.name) + "</strong>" +
          '<span class="yt-chat-person__meta">' + escapeHtml(person.meta) + "</span>" +
          "</span>" +
          "</button>"
        );
      })
      .join("");

    Array.from(peopleList.querySelectorAll(".yt-chat-person")).forEach(function (button) {
      button.addEventListener("click", function () {
        var person = people.find(function (item) {
          return item.id === button.dataset.personId;
        });
        if (person) {
          openDraftConversation(person);
        }
      });
    });
  }

  toggle.addEventListener("click", function () {
    if (layer.classList.contains("is-open")) {
      closeLayer();
      return;
    }
    openLayer();
  });

  dismissButtons.forEach(function (button) {
    button.addEventListener("click", closeLayer);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && layer.classList.contains("is-open")) {
      if (composeOpen) {
        setComposeOpen(false);
        return;
      }
      closeLayer();
    }
  });

  composeToggle.addEventListener("click", function () {
    setComposeOpen(!composeOpen);
    if (composeOpen && peopleInput) {
      peopleInput.focus();
    }
  });

  if (roomSearchInput) {
    roomSearchInput.addEventListener("input", function () {
      renderRoomList(roomSearchInput.value);
    });
  }

  if (peopleInput) {
    peopleInput.addEventListener("input", function () {
      renderPeopleList(peopleInput.value);
    });
  }

  if (composer) {
    composer.addEventListener("submit", function (event) {
      event.preventDefault();

      var room = findRoom(activeRoomId);
      var nextMessage = composerInput.value.trim();

      if (!room || !nextMessage) {
        return;
      }

      room.messages.push({
        sender: "me",
        label: "나",
        body: nextMessage,
        self: true
      });
      room.preview = nextMessage;
      room.time = "now";
      composerInput.value = "";
      renderRoomList(roomSearchInput ? roomSearchInput.value : "");
      renderActiveRoom(room.id);
      messagesNode.scrollTop = messagesNode.scrollHeight;
    });
  }

  setComposeOpen(false, true);
  setComposerPlaceholder(null);
  renderPeopleList("");
  renderRoomList("");
});
