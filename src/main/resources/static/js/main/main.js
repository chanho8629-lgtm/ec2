document.addEventListener("DOMContentLoaded", function () {
  const thumbnailLinks = Array.from(
    document.querySelectorAll(".shelf-card__thumb")
  );

  thumbnailLinks.forEach(function (link) {
    const overlay = link.querySelector(".shelf-card__overlay");
    if (!overlay) {
      return;
    }

    function showOverlay() {
      overlay.style.display = "flex";
    }

    function hideOverlay() {
      overlay.style.display = "none";
    }

    hideOverlay();

    link.addEventListener("mouseenter", showOverlay);
    link.addEventListener("mouseleave", hideOverlay);
    link.addEventListener("focusin", showOverlay);
    link.addEventListener("focusout", function (event) {
      if (event.relatedTarget && link.contains(event.relatedTarget)) {
        return;
      }
      hideOverlay();
    });
  });
});
