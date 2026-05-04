/* 공통 none 제어 영역 */
function openNone(target) {
  if (!target) return;

  target.classList.remove("none");
}

function closeNone(target) {
  if (!target) return;

  target.classList.add("none");
}

function toggleNone(target) {
  if (!target) return;

  target.classList.toggle("none");
}

/* 공통 셀렉트 영역 */
document.addEventListener("click", (event) => {
  const trigger = event.target.closest("[data-select-trigger]");

  if (trigger) {
    event.preventDefault();

    const select = trigger.closest(".select");
    const optionGroup = select ? select.querySelector(".select-option-group") : null;

    if (!select || !optionGroup) return;

    const isHidden = optionGroup.classList.contains("none");

    document.querySelectorAll(".select").forEach((item) => {
      item.classList.remove("is-open");

      const group = item.querySelector(".select-option-group");
      closeNone(group);
    });

    if (isHidden) {
      select.classList.add("is-open");
      openNone(optionGroup);
    }

    return;
  }

  document.querySelectorAll(".select").forEach((item) => {
    item.classList.remove("is-open");

    const group = item.querySelector(".select-option-group");
    closeNone(group);
  });
});

document.addEventListener("click", (event) => {
  const option = event.target.closest("[data-select-option]");

  if (!option) return;

  event.preventDefault();

  const select = option.closest(".select");
  const triggerLabel = select?.querySelector("[data-select-label]");
  const optionGroup = select?.querySelector(".select-option-group");

  if (!select || !triggerLabel || !optionGroup) return;

  select.querySelectorAll("[data-select-option]").forEach((item) => {
    item.classList.remove("is-active");
  });

  option.classList.add("is-active");
  triggerLabel.textContent = option.textContent;
  select.classList.remove("is-open");
  closeNone(optionGroup);
});

/* 아코디언 영역 */
document.addEventListener("click", (event) => {
  const accordionTrigger = event.target.closest("[data-accordion-trigger]");

  if (!accordionTrigger) return;

  event.preventDefault();

  const accordion = accordionTrigger.closest(".accordion");
  const accordionBody = accordion ? accordion.querySelector(".accordion-body") : null;

  if (!accordion || !accordionBody) return;

  accordion.classList.toggle("is-open");
  toggleNone(accordionBody);
});

/* 드롭다운 영역 */
document.addEventListener("click", (event) => {
  const dropdownTrigger = event.target.closest("[data-dropdown-trigger]");

  if (dropdownTrigger) {
    event.preventDefault();

    const dropdownWrap = dropdownTrigger.closest(".dropdownField");
    const dropdown = dropdownWrap ? dropdownWrap.querySelector(".dropdown") : null;

    if (!dropdownWrap || !dropdown) return;

    const isHidden = dropdown.classList.contains("none");

    document.querySelectorAll(".dropdownField .dropdown").forEach((item) => {
      closeNone(item);
    });

    if (isHidden) {
      openNone(dropdown);
    }

    return;
  }

  document.querySelectorAll(".dropdownField .dropdown").forEach((item) => {
    closeNone(item);
  });
});

document.addEventListener("click", (event) => {
  const dropdownItem = event.target.closest("[data-dropdown-item]");

  if (!dropdownItem) return;

  event.preventDefault();

  const dropdown = dropdownItem.closest(".dropdown");

  if (!dropdown) return;

  dropdown.querySelectorAll("[data-dropdown-item]").forEach((item) => {
    item.classList.remove("is-active");
  });

  dropdownItem.classList.add("is-active");
  closeNone(dropdown);
});

/* 탭 영역 */
document.addEventListener("click", (event) => {
  const tab = event.target.closest("[data-tab]");

  if (!tab) return;

  event.preventDefault();

  const tabField = tab.closest(".tabField");

  if (!tabField) return;

  tabField.querySelectorAll("[data-tab]").forEach((item) => {
    item.classList.remove("is-active");
  });

  tab.classList.add("is-active");
});

/* 페이징 영역 */
document.addEventListener("click", (event) => {
  const page = event.target.closest("[data-page]");

  if (!page) return;

  event.preventDefault();

  const paging = page.closest(".paging");

  if (!paging) return;

  paging.querySelectorAll("[data-page]").forEach((item) => {
    item.classList.remove("is-active");
  });

  page.classList.add("is-active");
});

/* 파일 미리보기 영역 */
document.addEventListener("change", (event) => {
  const profileInput = event.target.closest("[data-file-profile-input]");

  if (profileInput && profileInput.files && profileInput.files[0]) {
    const preview = profileInput
      .closest(".file-profile")
      ?.querySelector("[data-file-profile-preview]");

    if (!preview) return;

    const image = preview.querySelector("img");
    const fileReader = new FileReader();

    fileReader.onload = ({ target }) => {
      if (!image || !target) return;

      image.src = target.result;
      image.alt = profileInput.files[0].name;
      image.classList.remove("none");

      const placeholder = preview.querySelector("[data-file-profile-placeholder]");
      closeNone(placeholder);
    };

    fileReader.readAsDataURL(profileInput.files[0]);
    return;
  }

  const uploadInput = event.target.closest("[data-file-upload-input]");

  if (!uploadInput || !uploadInput.files || uploadInput.files.length === 0) return;

  const previewList = uploadInput
    .closest(".file-upload")
    ?.querySelector("[data-file-upload-preview-list]");

  if (!previewList) return;

  previewList.innerHTML = "";

  Array.from(uploadInput.files).forEach((file) => {
    if (!file.type.startsWith("image/")) return;

    const reader = new FileReader();

    reader.onload = ({ target }) => {
      if (!target) return;

      const item = document.createElement("div");
      item.className = "file-upload-preview-item";

      const image = document.createElement("img");
      image.src = target.result;
      image.alt = file.name;

      item.appendChild(image);
      previewList.appendChild(item);
    };

    reader.readAsDataURL(file);
  });
});

/* 날짜 입력 영역 */
document.addEventListener("click", (event) => {
  const dateInput = event.target.closest("input.date[type='date']");

  if (!dateInput) return;

  dateInput.focus();

  if (typeof dateInput.showPicker === "function") {
    dateInput.showPicker();
  }
});

// 1. 마우스 우클릭 방지
document.oncontextmenu = function() {
  return false;
};

// 2. 드래그 및 텍스트 선택 방지
document.onselectstart = function() {
  return false;
};

// 3. 주요 단축키 차단 (F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S)
document.onkeydown = function(e) {
  if (e.keyCode == 123) { // F12
    return false;
  }
  if (e.ctrlKey && e.shiftKey && e.keyCode == 73) { // Ctrl+Shift+I
    return false;
  }
  if (e.ctrlKey && e.keyCode == 85) { // Ctrl+U (소스보기)
    return false;
  }
  if (e.ctrlKey && e.keyCode == 83) { // Ctrl+S (저장)
    return false;
  }
};

// 4. 개발자 도구 감지 시 페이지 멈춤 (우회 가능성 있음)
window.addEventListener('devtoolschange', function(e) {
  if (e.detail.open) {
    document.body.innerHTML = '개발자 도구는 사용할 수 없습니다.';
  }
});
