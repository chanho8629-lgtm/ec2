document.addEventListener("DOMContentLoaded", function () {
  var modal = document.querySelector("[data-bd-shell-voice-modal]");
  var scrim = document.querySelector("[data-bd-shell-voice-scrim]");
  var closeButton = document.querySelector("[data-bd-shell-voice-close]");
  var prompt = document.querySelector("[data-bd-shell-voice-prompt]");
  var transcriptionHigh = document.querySelector(
    "[data-bd-shell-voice-transcription-high]"
  );
  var transcriptionLow = document.querySelector(
    "[data-bd-shell-voice-transcription-low]"
  );
  var body = document.querySelector("[data-bd-shell-voice-body]");
  var micButton = document.querySelector("[data-bd-shell-voice-mic]");
  var micLabel = document.querySelector("[data-bd-shell-voice-label]");
  var levelSurface = document.querySelector("[data-bd-shell-voice-levels]");
  var toggles = Array.from(
    document.querySelectorAll("[data-bd-shell-voice-toggle]")
  );

  if (
    !modal ||
    !scrim ||
    !closeButton ||
    !prompt ||
    !transcriptionHigh ||
    !transcriptionLow ||
    !body ||
    !micButton ||
    !micLabel ||
    !toggles.length
  ) {
    return;
  }

  var SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;
  var recognition = null;
  var activeSource = null;
  var heardTranscript = false;
  var closingBySuccess = false;
  var forceRetryOnEnd = false;

  var stateCopy = {
    permission: {
      prompt: "마이크 사용 권한을 허용해 주세요",
      body: [
        "브라우저 권한 팝업이 보이면 마이크를 허용해 주세요.",
        "허용 후 검색어를 말하면 자동으로 검색됩니다."
      ],
      label: "마이크 권한을 기다리는 중입니다."
    },
    listening: {
      prompt: "듣고 있습니다...",
      body: [
        "원하는 검색어를 말하면 자동으로 검색됩니다.",
        "말을 멈추면 인식이 종료됩니다."
      ],
      label: "말씀해 주세요."
    },
    retry: {
      prompt: "마이크가 꺼져 있습니다. 다시 시도해 주세요",
      body: [
        "음성을 듣지 못했거나 마이크에 접근할 수 없습니다.",
        "아래 마이크를 눌러 다시 시도해 주세요."
      ],
      label: "다시 시도하려면 마이크를 탭하세요."
    }
  };

  function buildBody(lines) {
    return lines
      .map(function (line) {
        return '<div class="bd-voice-modal__body-line">' + line + "</div>";
      })
      .join("");
  }

  function setState(state, override) {
    var copy = stateCopy[state];
    if (!copy) {
      return;
    }

    modal.dataset.state = state;
    prompt.textContent = override && override.prompt ? override.prompt : copy.prompt;
    body.innerHTML = buildBody(
      override && override.body ? override.body : copy.body
    );
    micLabel.textContent = override && override.label ? override.label : copy.label;

    if (!(override && override.keepHigh)) {
      transcriptionHigh.textContent = "";
    }
    if (!(override && override.keepLow)) {
      transcriptionLow.textContent = "";
    }
  }

  function updateLevels(scale) {
    if (!levelSurface) {
      return;
    }
    levelSurface.style.transform = "scale(" + scale + ")";
    levelSurface.style.opacity = String(Math.min(0.92, Math.max(0.24, scale / 2)));
  }

  function syncTranscriptValue(transcript) {
    if (!activeSource || !activeSource.input) {
      return;
    }
    activeSource.input.value = transcript;
  }

  function submitActiveSource() {
    if (!activeSource || !activeSource.form) {
      return;
    }

    var submitter = activeSource.form.querySelector('[type="submit"]');
    if (activeSource.form.requestSubmit) {
      activeSource.form.requestSubmit(submitter || undefined);
      return;
    }
    activeSource.form.submit();
  }

  function closeModal(options) {
    if (recognition) {
      try {
        if (options && options.abort) {
          recognition.abort();
        } else {
          recognition.stop();
        }
      } catch (error) {
        // Ignore invalid state errors from repeated cleanup.
      }
    }

    modal.hidden = true;
    updateLevels(1);
    if (!options || !options.preserveSource) {
      activeSource = null;
    }
    heardTranscript = false;
    forceRetryOnEnd = false;
  }

  function closeForCancel() {
    closingBySuccess = false;
    closeModal({ abort: true });
  }

  function handleRetry(promptText, bodyLines, labelText) {
    setState("retry", {
      prompt: promptText,
      body: bodyLines,
      label: labelText
    });
    updateLevels(1);
  }

  function startRecognition() {
    if (!SpeechRecognition) {
      handleRetry(
        "이 브라우저는 음성 검색을 지원하지 않습니다",
        ["Chrome 계열 브라우저에서 다시 시도해 주세요.", "텍스트 검색은 계속 사용할 수 있습니다."],
        "지원되는 브라우저에서 다시 시도해 주세요."
      );
      return;
    }

    if (!recognition) {
      recognition = new SpeechRecognition();
      recognition.lang = "ko-KR";
      recognition.continuous = false;
      recognition.interimResults = true;

      recognition.onstart = function () {
        heardTranscript = false;
        forceRetryOnEnd = false;
        setState("listening");
        updateLevels(1.05);
      };

      recognition.onresult = function (event) {
        var finalText = "";
        var interimText = "";

        for (var index = event.resultIndex; index < event.results.length; index += 1) {
          var result = event.results[index];
          var transcript = result[0] && result[0].transcript ? result[0].transcript.trim() : "";
          if (!transcript) {
            continue;
          }
          if (result.isFinal) {
            finalText += (finalText ? " " : "") + transcript;
          } else {
            interimText += (interimText ? " " : "") + transcript;
          }
        }

        if (finalText) {
          heardTranscript = true;
          transcriptionHigh.textContent = finalText;
          transcriptionLow.textContent = "";
          updateLevels(1.2);
          syncTranscriptValue(finalText);
          closingBySuccess = true;
          closeModal({ preserveSource: true });
          submitActiveSource();
          activeSource = null;
          return;
        }

        transcriptionHigh.textContent = "";
        transcriptionLow.textContent = interimText;
        updateLevels(interimText ? 1.16 : 1.04);
      };

      recognition.onerror = function (event) {
        forceRetryOnEnd = true;

        if (event.error === "no-speech") {
          handleRetry(
            "들을 수 있는 음성이 없습니다. 다시 시도해 주세요",
            ["조금 더 또렷하게 말씀해 주세요.", "마이크가 연결되어 있는지도 확인해 주세요."],
            "다시 시도하려면 마이크를 탭하세요."
          );
          return;
        }

        if (
          event.error === "audio-capture" ||
          event.error === "not-allowed" ||
          event.error === "service-not-allowed"
        ) {
          handleRetry(
            "마이크가 꺼져 있습니다. 다시 시도해 주세요",
            ["브라우저 또는 시스템의 마이크 권한을 확인해 주세요.", "허용 후 아래 마이크를 눌러 다시 시도할 수 있습니다."],
            "다시 시도하려면 마이크를 탭하세요."
          );
          return;
        }

        handleRetry(
          "음성 검색을 시작하지 못했습니다",
          ["잠시 후 다시 시도해 주세요.", "문제가 계속되면 텍스트 검색을 이용해 주세요."],
          "다시 시도하려면 마이크를 탭하세요."
        );
      };

      recognition.onend = function () {
        updateLevels(1);
        if (closingBySuccess) {
          closingBySuccess = false;
          return;
        }
        if (modal.hidden) {
          return;
        }
        if (forceRetryOnEnd || !heardTranscript) {
          handleRetry(
            "마이크가 꺼져 있습니다. 다시 시도해 주세요",
            ["음성을 듣지 못했습니다.", "아래 마이크를 눌러 다시 시도해 주세요."],
            "다시 시도하려면 마이크를 탭하세요."
          );
        }
      };
    }

    heardTranscript = false;
    forceRetryOnEnd = false;
    setState("permission");
    updateLevels(1);

    try {
      recognition.start();
    } catch (error) {
      handleRetry(
        "음성 검색을 다시 시작할 수 없습니다",
        ["브라우저가 현재 마이크를 준비하지 못했습니다.", "잠시 후 다시 시도해 주세요."],
        "다시 시도하려면 마이크를 탭하세요."
      );
    }
  }

  function openFromTrigger(trigger) {
    var mode = trigger.getAttribute("data-bd-shell-voice-toggle");
    var form = document.querySelector(
      '[data-bd-search-form="' + mode + '"]'
    );
    var input = form
      ? form.querySelector('[data-bd-search-input="' + mode + '"]')
      : null;

    if (!form || !input) {
      return;
    }

    activeSource = {
      mode: mode,
      form: form,
      input: input
    };

    document.dispatchEvent(new CustomEvent("bd-shell:close-search-portal"));
    modal.hidden = false;
    setState("permission");
    startRecognition();
  }

  toggles.forEach(function (toggle) {
    toggle.addEventListener("click", function () {
      openFromTrigger(toggle);
    });
  });

  micButton.addEventListener("click", function () {
    if (modal.dataset.state !== "retry") {
      return;
    }
    startRecognition();
  });

  closeButton.addEventListener("click", closeForCancel);
  scrim.addEventListener("click", closeForCancel);

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !modal.hidden) {
      closeForCancel();
    }
  });
});
