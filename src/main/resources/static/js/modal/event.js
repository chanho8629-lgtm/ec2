/* 모달 열기/닫기 영역 */
function modalOpen(modalId) {
  const target = document.getElementById(modalId);

  if (!target) return;

  target.classList.remove("none");
  document.body.style.overflow = "hidden";
}

function modalClose(modalId) {
  const target = document.getElementById(modalId);

  if (!target) return;

  target.classList.add("none");

  if (!document.querySelector(".modal:not(.none)")) {
    document.body.style.overflow = "";
  }
}

function modalCloses() {
  document.querySelectorAll(".modal").forEach((modal) => {
    modal.classList.add("none");
  });

  document.body.style.overflow = "";
}

document.addEventListener("click", (event) => {
  const modal = event.target.closest(".modal");

  if (!modal || event.target !== modal) return;

  modalClose(modal.id);
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    modalCloses();
  }
});
