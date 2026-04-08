window.onload = () => {
  let isBound = false;

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
    console.log("들어옴1 - showToast", message);
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
    console.log("들어옴1 - bindDynamic");

    // 구독 버튼 토글
    document.querySelectorAll(".subscribe-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        console.log("들어옴1 - 구독 버튼 클릭");
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
        console.log("들어옴1 - 드롭다운 액션", action);
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
            const targetId = Number(dropdown.dataset.targetId);

            searchService.toggleBookmark(targetType, targetId, (result) => {
              console.log("들어옴2 - 북마크 콜백", result);
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
            }).catch(() => showToast("로그인이 필요합니다."));
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

  // 정적 요소 이벤트 (페이지 로드 시 1회, guard로 중복 방지)
  const init = () => {
    if (isBound) return;
    isBound = true;
    console.log("들어옴1 - init");

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

    // 공유 모달 - 링크 복사
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

    // 공유 모달 - 받는 사람 검색
    const shareSearchInput = shareOverlay.querySelector(".work-share-modal__search");
    const shareList = shareOverlay.querySelector(".work-share-modal__list");
    const shareChips = shareOverlay.querySelector(".work-share-modal__chips");
    const shareSendBtn = shareOverlay.querySelector(".work-share-modal__send");
    const shareMessageInput = shareOverlay.querySelector(".work-share-modal__message");
    let shareSelectedMembers = [];
    let shareSearchTimer = null;

    shareSearchInput.addEventListener("input", (e) => {
      const keyword = shareSearchInput.value.trim();
      if (shareSearchTimer) clearTimeout(shareSearchTimer);

      if (keyword.length === 0) {
        shareList.classList.add("off");
        return;
      }

      shareSearchTimer = setTimeout(() => {
        searchService.searchMembers(keyword, (members) => {
          console.log("들어옴1 - 멤버검색 콜백", members);
          shareList.innerHTML = "";
          members.forEach((m) => {
            const btn = document.createElement("button");
            btn.className = "work-share-recipient";
            btn.dataset.memberId = m.id;
            btn.dataset.nickname = m.nickname;
            btn.innerHTML = `
              <div class="work-share-recipient__main">
                <div class="work-share-recipient__avatar"><img src="${m.profileImage || '/images/default-profile.png'}" alt=""></div>
                <div class="work-share-recipient__copy">
                  <span class="work-share-recipient__username">${m.nickname}</span>
                </div>
              </div>
              <div class="work-share-recipient__check"></div>
            `;
            btn.addEventListener("click", () => {
              const id = Number(m.id);
              if (shareSelectedMembers.find((s) => s.id === id)) return;
              shareSelectedMembers.push({ id: id, nickname: m.nickname });
              renderShareChips();
              shareSearchInput.value = "";
              shareList.classList.add("off");
            });
            shareList.appendChild(btn);
          });
          shareList.classList.remove("off");
        }).catch(() => shareList.classList.add("off"));
      }, 300);
    });

    const renderShareChips = () => {
      shareChips.innerHTML = "";
      shareSelectedMembers.forEach((m, idx) => {
        const chip = document.createElement("span");
        chip.className = "work-share-chip";
        chip.textContent = m.nickname;
        chip.style.cssText = "display:inline-flex;align-items:center;gap:4px;padding:2px 8px;border-radius:12px;background:#e0e0e0;font-size:13px;margin-right:4px;";
        const removeBtn = document.createElement("button");
        removeBtn.textContent = "×";
        removeBtn.style.cssText = "border:none;background:none;cursor:pointer;font-size:14px;padding:0 2px;";
        removeBtn.addEventListener("click", () => {
          shareSelectedMembers.splice(idx, 1);
          renderShareChips();
        });
        chip.appendChild(removeBtn);
        shareChips.appendChild(chip);
      });
    };

    // 공유 모달 - 보내기
    shareSendBtn.addEventListener("click", async () => {
      console.log("들어옴1 - 공유 보내기 클릭");
      if (shareSelectedMembers.length === 0) {
        showToast("받는 사람을 선택해주세요.");
        return;
      }

      const messageText = shareMessageInput.value.trim();
      const linkText = shareLinkInput.value;
      const content = messageText ? `${messageText}\n${linkText}` : linkText;

      try {
        for (const member of shareSelectedMembers) {
          await searchService.shareToMember(member.id, content, (data) => {
            console.log("들어옴2 - 공유 전송 콜백", data);
          });
        }
        showToast("공유되었습니다.");
      } catch (error) {
        showToast("로그인이 필요합니다.");
      }

      shareOverlay.classList.add("off");
      shareSelectedMembers = [];
      shareChips.innerHTML = "";
      shareMessageInput.value = "";
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

      console.log("들어옴1 신고 제출", reportTarget.targetType, reportTarget.targetId, selectedReason.value);

      searchService.report(reportTarget.targetType, reportTarget.targetId, selectedReason.value, () => {
        console.log("들어옴2 신고 콜백댐");
        reportOverlay.classList.add("off");
        showToast("신고해 주셔서 감사합니다.");
      }).catch(() => {
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

  // 페이지 초기화
  const keyword = new URLSearchParams(location.search).get("search_query") || "";
  console.log("들어옴2 keyword", keyword);

  init();

  if (keyword.trim()) {
    const searchResults = document.getElementById("searchResults");
    searchService.search(keyword, (data) => {
      console.log("들어옴3 search 콜백댐");
      const criteria = searchLayout.render(searchResults, data);
      console.log("들어옴4 결과", criteria);
      bindDynamic();
    });
  }
};
