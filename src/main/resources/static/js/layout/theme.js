(function () {
  var STORAGE_KEY = "bd-theme";
  var THEMES = {
    device: { value: "device", label: "기기 테마" },
    dark:   { value: "dark",   label: "다크 모드" },
    light:  { value: "light",  label: "라이트 모드" }
  };

  function readPreference() {
    try {
      var v = localStorage.getItem(STORAGE_KEY);
      return THEMES[v] ? v : "device";
    } catch (e) {
      return "device";
    }
  }

  function writePreference(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) {}
  }

  function resolveAppliedTheme(pref) {
    if (pref === "dark" || pref === "light") return pref;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark" : "light";
  }

  function applyTheme(pref) {
    var resolved = resolveAppliedTheme(pref);
    document.documentElement.setAttribute("data-theme", resolved);
    document.documentElement.setAttribute("data-theme-pref", pref);
  }

  // Apply immediately on script eval (before DOMContentLoaded so no flash)
  applyTheme(readPreference());

  // Listen for OS theme changes when user is on "device"
  if (window.matchMedia) {
    var mql = window.matchMedia("(prefers-color-scheme: dark)");
    var handler = function () {
      if (readPreference() === "device") applyTheme("device");
    };
    if (mql.addEventListener) mql.addEventListener("change", handler);
    else if (mql.addListener) mql.addListener(handler);
  }

  document.addEventListener("DOMContentLoaded", function () {
    var trigger = document.querySelector("[data-bd-theme-trigger]");
    var label = document.querySelector("[data-bd-theme-label]");
    if (!trigger) return;

    var picker = null;

    function updateLabel() {
      if (!label) return;
      var pref = readPreference();
      label.textContent = "디자인: " + (THEMES[pref] ? THEMES[pref].label : "기기 테마");
    }
    updateLabel();

    function ensurePicker() {
      if (picker) return picker;
      picker = document.createElement("div");
      picker.className = "bd-theme-picker";
      picker.hidden = true;
      picker.innerHTML =
        '<p class="bd-theme-picker__title">화면 테마</p>' +
        renderOption("device", THEMES.device.label, deviceIcon()) +
        renderOption("dark",   THEMES.dark.label,   moonIcon()) +
        renderOption("light",  THEMES.light.label,  sunIcon());
      document.body.appendChild(picker);

      picker.querySelectorAll(".bd-theme-picker__option").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var v = btn.getAttribute("data-theme-value");
          writePreference(v);
          applyTheme(v);
          markActive(v);
          updateLabel();
          hidePicker();
        });
      });

      document.addEventListener("click", function (e) {
        if (!picker || picker.hidden) return;
        if (picker.contains(e.target) || trigger.contains(e.target)) return;
        hidePicker();
      });

      return picker;
    }

    function renderOption(value, text, iconSvg) {
      return (
        '<button type="button" class="bd-theme-picker__option" data-theme-value="' + value + '">' +
        iconSvg +
        '<span>' + text + '</span>' +
        '<svg class="bd-theme-picker__check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="5 12 10 17 19 8"></polyline></svg>' +
        '</button>'
      );
    }

    function markActive(value) {
      if (!picker) return;
      picker.querySelectorAll(".bd-theme-picker__option").forEach(function (btn) {
        btn.classList.toggle("is-active", btn.getAttribute("data-theme-value") === value);
      });
    }

    function showPicker() {
      ensurePicker();
      var rect = trigger.getBoundingClientRect();
      picker.style.top = (rect.bottom + 6) + "px";
      picker.style.left = Math.max(8, rect.left - 60) + "px";
      picker.hidden = false;
      markActive(readPreference());
    }

    function hidePicker() {
      if (picker) picker.hidden = true;
    }

    trigger.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      ensurePicker();
      if (picker.hidden) showPicker();
      else hidePicker();
    });
  });

  function deviceIcon() {
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>';
  }
  function moonIcon() {
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M21 12.79A9 9 0 0 1 11.21 3 7 7 0 1 0 21 12.79z"/></svg>';
  }
  function sunIcon() {
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>';
  }
})();
