const chips = document.querySelectorAll(".chip");
const galleryRenderers = document.querySelectorAll(".gallery-renderer");
const workRenderers = document.querySelectorAll(".work-renderer");
const subscribeBtn = document.querySelector(".subscribe-btn");

// 필터 클릭 이벤트
chips.forEach((chip) => {
  chip.addEventListener("click", (e) => {
    chips.forEach((c) => c.classList.remove("active"));
    chip.classList.add("active");
  });
});

// 구독 버튼 토글
let isSubscribed = false;

subscribeBtn.addEventListener("click", (e) => {
  isSubscribed = !isSubscribed;

  if (isSubscribed) {
    subscribeBtn.textContent = "구독중";
    subscribeBtn.style.backgroundColor = "rgba(0, 0, 0, 0.05)";
    subscribeBtn.style.color = "#0f0f0f";
  } else {
    subscribeBtn.textContent = "구독";
    subscribeBtn.style.backgroundColor = "#0f0f0f";
    subscribeBtn.style.color = "#ffffff";
  }
});

// 정렬 필터 드롭다운
const sortFilterBtn = document.querySelector(".sort-filter-btn");
const sortFilterDropdown = document.querySelector(".sort-filter-dropdown");
const sortFilterItems = document.querySelectorAll(".sort-filter-dropdown-item");

sortFilterBtn.addEventListener("click", (e) => {
  e.stopPropagation();
  closeAllDropdowns();
  sortFilterDropdown.classList.toggle("off");
});

sortFilterItems.forEach((item) => {
  item.addEventListener("click", (e) => {
    e.stopPropagation();
    sortFilterItems.forEach((i) => i.classList.remove("active"));
    item.classList.add("active");
    sortFilterBtn.querySelector(".sort-filter-text").textContent = item.textContent;
    sortFilterDropdown.classList.add("off");
  });
});

// 모든 드롭다운 닫기
const closeAllDropdowns = () => {
  document.querySelectorAll(".gallery-dropdown, .work-dropdown, .sort-filter-dropdown").forEach((dropdown) => {
    dropdown.classList.add("off");
  });
};

// 예술관 더보기 클릭 이벤트
const galleryMoreBtns = document.querySelectorAll(".gallery-more-btn");

galleryMoreBtns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const dropdown = btn.nextElementSibling;
    const isOpen = !dropdown.classList.contains("off");
    closeAllDropdowns();
    if (!isOpen) {
      dropdown.classList.remove("off");
    }
  });
});

// 작품영상 더보기 클릭 이벤트
const workMoreBtns = document.querySelectorAll(".work-more-btn");

workMoreBtns.forEach((btn) => {
  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    const dropdown = btn.nextElementSibling;
    const isOpen = !dropdown.classList.contains("off");
    closeAllDropdowns();
    if (!isOpen) {
      dropdown.classList.remove("off");
    }
  });
});

// 외부 클릭 시 드롭다운 닫기
document.addEventListener("click", (e) => {
  closeAllDropdowns();
});

// 토스트
const toast = document.getElementById("toast");
const toastText = document.getElementById("toastText");
const toastAction = document.getElementById("toastAction");
let toastTimer = null;

const showToast = (message, actionText = null, actionCallback = null) => {
  if (toastTimer) {
    clearTimeout(toastTimer);
    toast.classList.add("off");
  }

  toastText.textContent = message;

  if (actionText) {
    toastAction.textContent = actionText;
    toastAction.classList.remove("off");
    toastAction.onclick = actionCallback;
  } else {
    toastAction.classList.add("off");
    toastAction.onclick = null;
  }

  requestAnimationFrame(() => {
    toast.classList.remove("off");
  });

  toastTimer = setTimeout(() => {
    toast.classList.add("off");
    toastTimer = null;
  }, 3000);
};

// 모달
// const playlistOverlay = document.getElementById("playlistOverlay");
const shareOverlay = document.querySelector(".work-share-modal-overlay");
const reportOverlay = document.getElementById("reportOverlay");
const reportCancelBtn = document.getElementById("reportCancelBtn");
const reportSubmitBtn = document.getElementById("reportSubmitBtn");
const reportRadios = document.querySelectorAll("input[name='report-reason']");
// const bookmarkIcons = document.querySelectorAll(".bookmark-icon");

const closeAllModals = () => {
  // playlistOverlay.classList.add("off");
  shareOverlay.classList.add("off");
  reportOverlay.classList.add("off");
};

// 더보기 모달 항목 이벤트(gallery + work둘다)
const dropdownItems = document.querySelectorAll(".gallery-dropdown-item[data-action], .work-dropdown-item[data-action]");

dropdownItems.forEach((item) => {
  item.addEventListener("click", (e) => {
    const action = item.dataset.action;
    closeAllDropdowns();

    switch (action) {
      // case "watch-later":
      //   showToast("나중에 볼 동영상에 저장됨", "목록 보기", () => {
      //     console.log("목록 보기 클릭");
      //   });
      //   break;

      // case "save-playlist":
      //   playlistOverlay.classList.remove("off");
      //   break;

      // case "share":
      //   navigator.clipboard
      //     .writeText("https://youtu.be/sampleVideoId")
      //     .then(() => {
      //       showToast("링크가 복사되었습니다.");
      //     })
      //     .catch(() => {
      //       showToast("링크가 복사되었습니다.");
      //     });
      //   break;
      case "share":
        const linkInput = shareOverlay.querySelector(".work-share-modal__link-input");
        linkInput.value = window.location.href;
        shareOverlay.classList.remove("off");
        break;

      case "wishlist":
        const isWished = item.dataset.wished === "true";
        const wishlistText = item.querySelector(".wishlist-text");
        if (isWished) {
          item.dataset.wished = "";
          wishlistText.textContent = "찜 목록 추가";
          showToast("찜목록에서 제거되었습니다.");
        } else {
          item.dataset.wished = "true";
          wishlistText.textContent = "찜 목록 제거";
          showToast("찜목록에 추가 되었습니다.");
        }
        break;

      case "no-recommend":
        showToast("앞으로 이 채널을 추천받지 않습니다.");
        break;

      case "report":
        reportOverlay.classList.remove("off");
        reportRadios.forEach((radio) => {
          radio.checked = false;
        });
        reportSubmitBtn.disabled = true;
        break;
    }
  });
});

// // 재생목록 모달
// playlistOverlay.addEventListener("click", (e) => {
//   if (e.target === playlistOverlay) {
//     playlistOverlay.classList.add("off");
//   }
// });

// bookmarkIcons.forEach((icon) => {
//   icon.addEventListener("click", (e) => {
//     e.stopPropagation();
//     const listItem = icon.closest(".playlist-item");
//     const isSaved = listItem.dataset.saved === "true";
//     const playlistName = listItem.querySelector(".playlist-name").textContent;

//     if (isSaved) {
//       listItem.dataset.saved = "";
//       icon.classList.remove("saved");
//       icon.innerHTML = '<path d="M19 2H5a2 2 0 00-2 2v16.887c0 1.266 1.382 2.048 2.469 1.399L12 18.366l6.531 3.919c1.087.652 2.469-.131 2.469-1.397V4a2 2 0 00-2-2ZM5 20.233V4h14v16.233l-6.485-3.89-.515-.309-.515.309L5 20.233Z" fill="currentColor"/>';
//       showToast(playlistName + "에서 삭제됨");
//     } else {
//       listItem.dataset.saved = "true";
//       icon.classList.add("saved");
//       icon.innerHTML = '<path d="M19 2H5a2 2 0 00-2 2v16.887c0 1.266 1.382 2.048 2.469 1.399L12 18.366l6.531 3.919c1.087.652 2.469-.131 2.469-1.397V4a2 2 0 00-2-2Z" fill="currentColor"/>';
//       showToast(playlistName + "에 저장됨");
//     }
//   });
// });

// 공유 모달
const shareLinkCopyBtn = shareOverlay.querySelector(".work-share-modal__link-copy");
const shareCloseBtn = shareOverlay.querySelector(".work-share-modal__close");
const shareLinkInput = shareOverlay.querySelector(".work-share-modal__link-input");

shareLinkCopyBtn.addEventListener("click", (e) => {
  navigator.clipboard
    .writeText(shareLinkInput.value)
    .then(() => {
      shareOverlay.classList.add("off");
      showToast("링크가 복사되었습니다.");
    })
    .catch(() => {
      shareOverlay.classList.add("off");
      showToast("링크가 복사되었습니다.");
    });
});

shareCloseBtn.addEventListener("click", (e) => {
  shareOverlay.classList.add("off");
});

shareOverlay.addEventListener("click", (e) => {
  if (e.target === shareOverlay) {
    shareOverlay.classList.add("off");
  }
});

// 공유 모달 검색 드롭다운
const shareSearchInput = shareOverlay.querySelector(".work-share-modal__search");
const shareList = shareOverlay.querySelector(".work-share-modal__list");

shareSearchInput.addEventListener("input", (e) => {
  if (shareSearchInput.value.trim().length > 0) {
    shareList.classList.remove("off");
  } else {
    shareList.classList.add("off");
  }
});

// 신고 모달
reportOverlay.addEventListener("click", (e) => {
  if (e.target === reportOverlay) {
    reportOverlay.classList.add("off");
  }
});

reportCancelBtn.addEventListener("click", (e) => {
  reportOverlay.classList.add("off");
});

reportRadios.forEach((radio) => {
  radio.addEventListener("change", (e) => {
    reportSubmitBtn.disabled = false;
  });
});

reportSubmitBtn.addEventListener("click", (e) => {
  if (reportSubmitBtn.disabled) return;
  reportOverlay.classList.add("off");
  showToast("신고해 주셔서 감사합니다.");
});

// ESC 키로 모달 닫기
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeAllDropdowns();
    closeAllModals();
  }
});

// 예술관 썸넬 호버
const galleryThumbnails = document.querySelectorAll(".gallery-thumbnail");

galleryThumbnails.forEach((thumbWrap) => {
  const thumbnail = thumbWrap.querySelector(".thumbnail-img");
  if (thumbnail) {
    thumbWrap.addEventListener("mouseenter", (e) => {
      thumbnail.style.transform = "scale(1.02)";
      thumbnail.style.transition = "transform 0.2s ease";
    });
    thumbWrap.addEventListener("mouseleave", (e) => {
      thumbnail.style.transform = "scale(1)";
    });
  }
});

// 작품영상 썸넬 호버
const workThumbnails = document.querySelectorAll(".work-thumbnail");

workThumbnails.forEach((thumbWrap) => {
  const thumbnail = thumbWrap.querySelector(".thumbnail-img");
  if (thumbnail) {
    thumbWrap.addEventListener("mouseenter", (e) => {
      thumbnail.style.transform = "scale(1.02)";
      thumbnail.style.transition = "transform 0.2s ease";
    });
    thumbWrap.addEventListener("mouseleave", (e) => {
      thumbnail.style.transform = "scale(1)";
    });
  }
});
