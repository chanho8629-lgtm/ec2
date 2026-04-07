const searchEvent = (() => {
  // 모든 드롭다운 닫기
  const closeAllDropdowns = () => {
    document.querySelectorAll(".gallery-dropdown, .work-dropdown, .sort-filter-dropdown").forEach((dropdown) => {
      dropdown.classList.add("off");
    });
  };

  // 모달
  const shareOverlay = document.querySelector(".work-share-modal-overlay");
  const reportOverlay = document.getElementById("reportOverlay");
  const reportCancelBtn = document.getElementById("reportCancelBtn");
  const reportSubmitBtn = document.getElementById("reportSubmitBtn");
  const reportRadios = document.querySelectorAll("input[name='report-reason']");

  // 현재 신고 대상
  let reportTarget = { targetType: null, targetId: null };

  const closeAllModals = () => {
    shareOverlay.classList.add("off");
    reportOverlay.classList.add("off");
  };

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

  // 동적 요소 인터랙션 바인딩 (검색 결과 렌더링 후 호출)
  const bindDynamic = () => {
    // 구독 버튼 토글
    document.querySelectorAll(".subscribe-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const isSubscribed = btn.textContent === "구독중";
        if (isSubscribed) {
          btn.textContent = "구독";
          btn.style.backgroundColor = "#0f0f0f";
          btn.style.color = "#ffffff";
        } else {
          btn.textContent = "구독중";
          btn.style.backgroundColor = "rgba(0, 0, 0, 0.05)";
          btn.style.color = "#0f0f0f";
        }
      });
    });

    // 더보기 드롭다운
    document.querySelectorAll(".gallery-more-btn, .work-more-btn").forEach((btn) => {
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

    // 더보기 항목 이벤트
    document.querySelectorAll(".gallery-dropdown-item[data-action], .work-dropdown-item[data-action]").forEach((item) => {
      item.addEventListener("click", (e) => {
        const action = item.dataset.action;
        closeAllDropdowns();

        switch (action) {
          case "share":
            const linkInput = shareOverlay.querySelector(".work-share-modal__link-input");
            linkInput.value = window.location.href;
            shareOverlay.classList.remove("off");
            break;

          case "wishlist":
            const dropdown = item.closest(".gallery-dropdown, .work-dropdown");
            const targetType = dropdown.dataset.targetType;
            const targetId = dropdown.dataset.targetId;

            fetch("/api/bookmarks", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ targetType, targetId: Number(targetId) })
            })
              .then(r => r.json())
              .then(result => {
                const wishlistText = item.querySelector(".wishlist-text");
                if (result.bookmarked) {
                  item.dataset.wished = "true";
                  wishlistText.textContent = "찜 목록 제거";
                  showToast("찜목록에 추가 되었습니다.");
                } else {
                  item.dataset.wished = "";
                  wishlistText.textContent = "찜 목록 추가";
                  showToast("찜목록에서 제거되었습니다.");
                }
              })
              .catch(() => showToast("로그인이 필요합니다."));
            break;

          case "no-recommend":
            showToast("앞으로 이 채널을 추천받지 않습니다.");
            break;

          case "report":
            const reportDropdown = item.closest(".gallery-dropdown, .work-dropdown");
            reportTarget.targetType = reportDropdown.dataset.targetType;
            reportTarget.targetId = Number(reportDropdown.dataset.targetId);
            reportOverlay.classList.remove("off");
            reportRadios.forEach((radio) => {
              radio.checked = false;
            });
            reportSubmitBtn.disabled = true;
            break;
        }
      });
    });

    // 썸네일 호버
    document.querySelectorAll(".gallery-thumbnail, .work-thumbnail").forEach((thumbWrap) => {
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
  };

  // 정적 요소 이벤트 (페이지 로드 시 1회)
  const init = () => {
    // 필터 클릭
    const chips = document.querySelectorAll(".chip");
    chips.forEach((chip) => {
      chip.addEventListener("click", (e) => {
        chips.forEach((c) => c.classList.remove("active"));
        chip.classList.add("active");
      });
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

    // 외부 클릭 시 드롭다운 닫기
    document.addEventListener("click", (e) => {
      closeAllDropdowns();
    });

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

      const selectedReason = document.querySelector("input[name='report-reason']:checked");
      if (!selectedReason) return;

      fetch("/api/reports", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetType: reportTarget.targetType,
          targetId: reportTarget.targetId,
          reason: selectedReason.value,
          detail: ""
        })
      })
        .then(r => {
          reportOverlay.classList.add("off");
          showToast("신고해 주셔서 감사합니다.");
        })
        .catch(() => {
          reportOverlay.classList.add("off");
          showToast("로그인이 필요합니다.");
        });
    });

    // ESC 키로 모달 닫기
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        closeAllDropdowns();
        closeAllModals();
      }
    });
  };

  return { init, bindDynamic };
})();
