function initializeWorkRegister() {
    var modal = document.getElementById("work-register-root");
    var dialogContent = document.getElementById("dialog-content") || modal;
    var uploadScreen = document.getElementById("upload-screen");
    var detailsScreen = document.getElementById("details-screen");
    var uploadPanel = document.getElementById("drop-zone");
    var fileInput = document.getElementById("video-file-input");
    var selectFileButton = document.getElementById("select-file-button");
    var uploadAiButton = document.getElementById("upload-ai-button");
    var closeButton = document.getElementById("close-modal-button");
    var uploadCloseButton = document.getElementById("upload-close-button");
    var detailsCloseButton = document.getElementById("details-close-button");
    var detailsBackButton = document.getElementById("details-back-button");
    var fileNameText = document.getElementById("selected-file-name");
    var detailsVideoTitle = document.getElementById("details-video-title");
    var videoFileLabel = document.getElementById("video-file-label");
    var videoPreviewShell = document.getElementById("video-preview-shell");
    var videoPreviewPlayer = document.getElementById("video-preview-player");
    var imagePreviewPlayer = document.getElementById("image-preview-player");
    var videoTitleInput = document.getElementById("video-title-input");
    var videoTitleCount = document.getElementById("video-title-count");
    var videoDescriptionInput = document.getElementById("video-description-input");
    var videoDescriptionCount = document.getElementById("video-description-count");
    var videoTagsList = document.getElementById("video-tags-list");
    var videoTagsInput = document.getElementById("video-tags-input");
    var videoTagsCount = document.getElementById("video-tags-count");
    var videoTagsSuggestions = document.getElementById("video-tags-suggestions");
    var tradeToggle = document.getElementById("tradeToggle");
    var tradeConfig = document.getElementById("tradeConfig");
    var tradePriceInput = document.getElementById("tradePriceInput");
    var auctionExpandButton = document.querySelector(".auction-expand-button");
    var auctionConfig = document.getElementById("auctionConfig");
    var auctionBidPriceInput = document.getElementById("auctionBidPriceInput");
    var auctionDeadlineSelected = document.getElementById("auctionDeadlineSelected");
    var auctionDeadlineReset = document.getElementById("auctionDeadlineReset");
    var auctionDeadlineHoursInput = document.getElementById("auctionDeadlineHoursInput");
    var auctionDeadlineButtons = document.querySelectorAll("#auctionConfig .work-auction-config__deadline-btn");
    var videoLinkUrl = document.getElementById("video-link-url");
    var videoLinkRemoveButton = document.getElementById("video-link-remove-button");
    var videoLinkCopyButton = document.getElementById("video-link-copy-button");
    var playlistDropdownButton = document.getElementById("playlist-dropdown-button");
    var playlistDropdownMenu = document.getElementById("playlist-dropdown-menu");
    var playlistDropdownText = document.getElementById("playlist-dropdown-text");
    var playlistOptions = document.querySelectorAll(".playlist-option");
    var submitButton = document.getElementById("work-submit-button");
    var workPredictionButton = document.getElementById("work-prediction-button");
    var workPredictionStatus = document.getElementById("work-prediction-status");
    var workRegressionViews = document.getElementById("work-regression-views");
    var workPredictionLikes = document.getElementById("work-prediction-likes");
    var workClassificationLabel = document.getElementById("work-classification-label");
    var workClassificationProbability = document.getElementById("work-classification-probability");
    var thumbnailUploadButtons = document.querySelectorAll(".thumbnail-upload-button");
    var thumbnailFileInputs = document.querySelectorAll('input[id^="thumbnail-file-input-"]');
    var aiPromptModal = document.getElementById("ai-prompt-modal");
    var aiPromptCloseButton = document.getElementById("ai-prompt-close-button");
    var aiPromptInput = document.getElementById("ai-prompt-input");
    var aiPromptThread = document.getElementById("ai-prompt-thread");
    var aiPromptSendButton = document.getElementById("ai-prompt-send-button");
    var aiPromptToolButton = document.getElementById("ai-prompt-tool-button");
    var aiPromptComposeMenu = document.getElementById("ai-prompt-compose-menu");
    var aiPromptAttachButton = document.getElementById("ai-prompt-attach-button");
    var aiPromptDeleteButton = document.getElementById("ai-prompt-delete-button");
    var aiPromptFileInput = document.getElementById("ai-prompt-file-input");
    var aiPromptAttachments = document.getElementById("ai-prompt-attachments");
    var aiPromptImageAttachment = document.getElementById("ai-prompt-image-attachment");
    var aiPromptImagePreview = document.getElementById("ai-prompt-image-preview");
    var aiPromptRemoveAttachment = document.getElementById("ai-prompt-remove-attachment");
    var aiPromptFileAttachment = document.getElementById("ai-prompt-file-attachment");
    var aiPromptFileName = document.getElementById("ai-prompt-file-name");
    var aiPromptRemoveFileAttachment = document.getElementById("ai-prompt-remove-file-attachment");
    var aiPromptCloseTargets = document.querySelectorAll('[data-role="ai-prompt-close"]');
    var registerState = document.getElementById("work-register-state");
    var currentPreviewUrl = "";
    var currentAiPromptAttachmentUrl = "";
    var currentAiGeneratedAssetUrl = "";
    var currentAiGeneratedTitle = "";
    var currentAiGeneratedDescription = "";
    var currentAiDescriptionReady = false;
    var currentAiGeneratedImageKey = "";
    var currentAiGeneratedFileType = "";
    var currentAiGeneratedFileSize = 0;
    var thumbnailPreviewUrls = {};
    var currentMediaFile = null;
    var currentExistingMediaUrl = registerState ? (registerState.getAttribute("data-media-url") || "").trim() : "";
    var currentExistingMediaType = registerState ? (registerState.getAttribute("data-media-type") || "").trim() : "";
    var selectedGalleryId = null;
    var isSubmitting = false;
    var tagSuggestionAbortController = null;
    var tagSuggestionRequestSeq = 0;
    var activeTagSuggestionIndex = -1;
    var selectedExistingTagNames = {};
    var selectedTagNames = [];
    var workPredictionAbortController = null;
    var lastPredictedViews = 0;
    var lastPredictedLikes = 0;
    var lastPredictedPopular = 0;
    var lastPredictedPopularProbability = 0;

    if (!modal || !dialogContent || !uploadScreen || !detailsScreen || !uploadPanel || !fileInput || !selectFileButton || !fileNameText) {
        return;
    }

    if (modal.dataset.workRegisterInitialized === "true") {
        return;
    }

    modal.dataset.workRegisterInitialized = "true";

    if (document.body && document.body.classList.contains("work-register-page")) {
        var composeModal = document.querySelector("[data-yt-compose-modal]");
        var composeContent = document.querySelector("[data-yt-compose-content]");
        var embeddedRoots = document.querySelectorAll('[data-compose-embedded="true"]');

        if (composeContent) {
            composeContent.innerHTML = "";
        }

        if (composeModal) {
            composeModal.hidden = true;
        }

        Array.prototype.forEach.call(embeddedRoots, function (node) {
            if (node !== modal && !modal.contains(node)) {
                node.remove();
            }
        });
    }

    ensureWorkPredictionPanel();

    function ensureWorkPredictionPanel() {
        var panel = document.getElementById("work-ai-prediction");
        var formCard = detailsScreen ? detailsScreen.querySelector(".form-card") : null;
        var targetParent;

        if (!formCard) {
            return;
        }

        targetParent = formCard.parentNode;
        if (!targetParent) {
            return;
        }

        if (!panel) {
            panel = document.createElement("div");
            panel.className = "work-ai-prediction";
            panel.id = "work-ai-prediction";
            panel.innerHTML = [
                '<div class="work-ai-prediction__header">',
                '  <div>',
                '    <div class="work-ai-prediction__eyebrow">AI · Regression / Classification</div>',
                '    <div class="work-ai-prediction__status" id="work-prediction-status">작성값 기준 예측 대기</div>',
                '  </div>',
                '  <button type="button" class="work-ai-prediction__button" id="work-prediction-button">예측하기</button>',
                '</div>',
                '<div class="work-ai-prediction__hero">',
                '  <div>',
                '    <span class="work-ai-prediction__views-label">예상 조회수</span>',
                '    <strong id="work-regression-views" class="work-ai-prediction__views-value">-</strong>',
                '  </div>',
                '  <div class="work-ai-prediction__badges">',
                '    <span id="work-prediction-grade" class="work-ai-prediction__grade-badge">-</span>',
                '    <span id="work-classification-label" class="work-ai-prediction__class-badge">-</span>',
                '  </div>',
                '</div>',
                '<div class="work-ai-prediction__prob">',
                '  <div class="work-ai-prediction__prob-header">',
                '    <span>고조회수 가능성</span>',
                '    <strong id="work-classification-probability">-</strong>',
                '  </div>',
                '  <div class="work-ai-prediction__prob-track">',
                '    <div class="work-ai-prediction__prob-fill" id="work-prob-fill"></div>',
                '  </div>',
                '</div>',
                '<div class="work-ai-prediction__grid">',
                '  <div class="work-ai-prediction__item"><span>예상 좋아요</span><strong id="work-prediction-likes">-</strong></div>',
                '  <div class="work-ai-prediction__item"><span>예상 댓글</span><strong id="work-prediction-comments">-</strong></div>',
                '  <div class="work-ai-prediction__item"><span>예상 공유</span><strong id="work-prediction-shares">-</strong></div>',
                '  <div class="work-ai-prediction__item"><span>신뢰도</span><strong id="work-prediction-confidence">-</strong></div>',
                '</div>',
                '<div class="work-ai-prediction__signal" id="work-prediction-signal-wrap">',
                '  <span>모델 근거</span>',
                '  <p id="work-prediction-signal">-</p>',
                '</div>'
            ].join("");
        }

        if (formCard.nextSibling !== panel) {
            targetParent.insertBefore(panel, formCard.nextSibling);
        }

        workPredictionButton = document.getElementById("work-prediction-button");
        workPredictionStatus = document.getElementById("work-prediction-status");
        workRegressionViews = document.getElementById("work-regression-views");
        workPredictionLikes = document.getElementById("work-prediction-likes");
        workClassificationLabel = document.getElementById("work-classification-label");
        workClassificationProbability = document.getElementById("work-classification-probability");
    }

    function closeModal() {
        if (typeof window.closeComposeModal === "function") {
            window.closeComposeModal();
            return;
        }

        if (window.parent && window.parent !== window && typeof window.parent.closeComposeModal === "function") {
            window.parent.closeComposeModal();
            return;
        }

        modal.style.display = "none";
    }

    function updateVideoLink(url, label) {
        if (!videoLinkUrl) {
            return;
        }

        if (!url) {
            videoLinkUrl.removeAttribute("href");
            videoLinkUrl.textContent = "";
            if (videoLinkRemoveButton) {
                videoLinkRemoveButton.hidden = true;
            }
            if (videoLinkCopyButton) {
                videoLinkCopyButton.hidden = true;
            }
            return;
        }

        videoLinkUrl.href = url;
        videoLinkUrl.textContent = label || url;
        if (videoLinkRemoveButton) {
            videoLinkRemoveButton.hidden = false;
        }
        if (videoLinkCopyButton) {
            videoLinkCopyButton.hidden = false;
        }
    }

    function navigateAfterSubmit(url) {
        var targetUrl = url || resolveProfileRedirectUrl();

        if (window.top && window.top !== window) {
            window.top.location.href = targetUrl;
            return;
        }

        window.location.href = targetUrl;
    }

    function isEditMode() {
        return !!registerState && registerState.getAttribute("data-edit-mode") === "true";
    }

    function isStateFlagEnabled(name) {
        if (!registerState) {
            return false;
        }

        return String(registerState.getAttribute(name) || "").trim().toLowerCase() === "true";
    }

    function openAiPromptModal() {
        if (!aiPromptModal) {
            return;
        }

        aiPromptModal.hidden = false;

        if (aiPromptInput) {
            aiPromptInput.focus();
        }
    }

    function closeAiPromptModal() {
        if (!aiPromptModal) {
            return;
        }

        aiPromptModal.hidden = true;
        closeAiPromptComposeMenu();
    }

    function closeAiPromptComposeMenu() {
        if (!aiPromptComposeMenu || !aiPromptToolButton) {
            return;
        }

        aiPromptComposeMenu.hidden = true;
        aiPromptToolButton.setAttribute("aria-expanded", "false");
    }

    function hasAiPromptAttachment() {
        return !!(aiPromptFileInput && aiPromptFileInput.files && aiPromptFileInput.files[0]);
    }

    function syncAiPromptComposeMenuState() {
        if (!aiPromptDeleteButton) {
            return;
        }

        aiPromptDeleteButton.hidden = !hasAiPromptAttachment();
    }

    function toggleAiPromptComposeMenu() {
        var willOpen;

        if (!aiPromptComposeMenu || !aiPromptToolButton) {
            return;
        }

        willOpen = aiPromptComposeMenu.hidden;
        syncAiPromptComposeMenuState();
        aiPromptComposeMenu.hidden = !willOpen;
        aiPromptToolButton.setAttribute("aria-expanded", willOpen ? "true" : "false");
    }

    function clearAiPromptAttachment() {
        if (currentAiPromptAttachmentUrl) {
            URL.revokeObjectURL(currentAiPromptAttachmentUrl);
            currentAiPromptAttachmentUrl = "";
        }

        if (aiPromptFileInput) {
            aiPromptFileInput.value = "";
        }

        if (aiPromptImagePreview) {
            aiPromptImagePreview.removeAttribute("src");
        }

        if (aiPromptFileName) {
            aiPromptFileName.textContent = "";
        }

        if (aiPromptImageAttachment) {
            aiPromptImageAttachment.hidden = true;
        }

        if (aiPromptFileAttachment) {
            aiPromptFileAttachment.hidden = true;
        }

        if (aiPromptAttachments) {
            aiPromptAttachments.hidden = true;
        }

        syncAiPromptComposeMenuState();
    }

    function clearAiGeneratedAsset() {
        if (currentAiGeneratedAssetUrl && currentAiGeneratedAssetUrl.indexOf("blob:") === 0) {
            URL.revokeObjectURL(currentAiGeneratedAssetUrl);
        }

        currentAiGeneratedAssetUrl = "";
        currentAiGeneratedTitle = "";
        currentAiGeneratedDescription = "";
        currentAiDescriptionReady = false;
        currentAiGeneratedImageKey = "";
        currentAiGeneratedFileType = "";
        currentAiGeneratedFileSize = 0;
    }

    function renderAiPromptAttachment(file) {
        if (!file || !aiPromptAttachments || !aiPromptImageAttachment || !aiPromptFileAttachment) {
            return;
        }

        clearAiPromptAttachment();
        aiPromptAttachments.hidden = false;
        syncAiPromptComposeMenuState();

        if (file.type && file.type.indexOf("image/") === 0) {
            currentAiPromptAttachmentUrl = URL.createObjectURL(file);

            if (aiPromptImagePreview) {
                aiPromptImagePreview.src = currentAiPromptAttachmentUrl;
            }

            aiPromptImageAttachment.hidden = false;
            return;
        }

        if (aiPromptFileName) {
            aiPromptFileName.textContent = file.name;
        }

        aiPromptFileAttachment.hidden = false;
    }

    function renderThumbnailPreview(input, file) {
        var placeholder;
        var previewImage;
        var oldUrl;

        if (!input) {
            return;
        }

        placeholder = input.closest(".thumbnail-placeholder");
        if (!placeholder) {
            return;
        }

        previewImage = placeholder.querySelector(".thumbnail-preview-image");
        if (!previewImage) {
            previewImage = document.createElement("img");
            previewImage.className = "thumbnail-preview-image";
            previewImage.alt = "썸네일 미리보기";
            placeholder.appendChild(previewImage);
        }

        oldUrl = thumbnailPreviewUrls[input.id];
        if (oldUrl) {
            URL.revokeObjectURL(oldUrl);
            delete thumbnailPreviewUrls[input.id];
        }

        if (!file || !file.type || file.type.indexOf("image/") !== 0) {
            previewImage.removeAttribute("src");
            placeholder.classList.remove("has-thumbnail-preview");
            return;
        }

        thumbnailPreviewUrls[input.id] = URL.createObjectURL(file);
        previewImage.src = thumbnailPreviewUrls[input.id];
        placeholder.classList.add("has-thumbnail-preview");
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#39;");
    }

    function buildAiGeneratedPlaceholderSvg() {
        return [
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1080 1280">',
            '<defs>',
            '<linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">',
            '<stop offset="0%" stop-color="#d7dcff"/>',
            '<stop offset="42%" stop-color="#f8c8bd"/>',
            '<stop offset="70%" stop-color="#f4b56d"/>',
            '<stop offset="100%" stop-color="#3c312d"/>',
            '</linearGradient>',
            '<linearGradient id="ground" x1="0" y1="0" x2="1" y2="1">',
            '<stop offset="0%" stop-color="#6b4a35"/>',
            '<stop offset="100%" stop-color="#251d1a"/>',
            '</linearGradient>',
            '</defs>',
            '<rect width="1080" height="1280" fill="url(#sky)"/>',
            '<circle cx="515" cy="420" r="96" fill="#fff2c2" opacity="0.95"/>',
            '<ellipse cx="520" cy="560" rx="440" ry="120" fill="#fff8ee" opacity="0.35"/>',
            '<ellipse cx="520" cy="620" rx="520" ry="120" fill="#f7ede8" opacity="0.44"/>',
            '<path d="M0 820L170 720L280 760L420 650L610 720L760 640L900 740L1080 700V1280H0Z" fill="url(#ground)"/>',
            '<path d="M470 615C500 615 524 640 524 670V820H444V670C444 640 470 615 470 615Z" fill="#2c2a2c"/>',
            '<circle cx="484" cy="586" r="34" fill="#2c2a2c"/>',
            '<path d="M414 680L556 680L630 812L340 812Z" fill="#876332"/>',
            '<path d="M434 700H538V736H434Z" fill="#c9a24e"/>',
            '<path d="M404 720L454 918H392L338 806Z" fill="#2b2422"/>',
            '<path d="M526 720L602 900H544L486 812Z" fill="#2b2422"/>',
            '</svg>'
        ].join("");
    }

    function createAiGeneratedAssetUrl(promptText) {
        var svgBlob = new Blob([buildAiGeneratedPlaceholderSvg(promptText)], { type: "image/svg+xml;charset=UTF-8" });

        clearAiGeneratedAsset();
        currentAiGeneratedAssetUrl = URL.createObjectURL(svgBlob);
        return currentAiGeneratedAssetUrl;
    }

    function scrollAiPromptThreadToBottom() {
        if (!aiPromptThread) {
            return;
        }

        aiPromptThread.scrollTop = aiPromptThread.scrollHeight;
    }

    function removeAiPromptPending() {
        var pendingNode;

        if (!aiPromptThread) {
            return;
        }

        pendingNode = aiPromptThread.querySelector('[data-role="ai-prompt-pending"]');
        if (pendingNode) {
            pendingNode.remove();
        }
    }

    function renderAiPromptConversation(promptText, result) {
        var previewSource;

        if (!aiPromptThread) {
            return;
        }

        if (result && result.imageUrl) {
            clearAiGeneratedAsset();
            currentAiGeneratedAssetUrl = result.imageUrl;
            currentAiGeneratedTitle = result.title || "";
            currentAiGeneratedDescription = result.description || "";
            currentAiDescriptionReady = false;
            currentAiGeneratedImageKey = result.imageKey || "";
            currentAiGeneratedFileType = result.fileType || "image/png";
            currentAiGeneratedFileSize = Number(result.fileSize || 0);
        }

        previewSource = currentAiPromptAttachmentUrl || currentAiGeneratedAssetUrl || createAiGeneratedAssetUrl(promptText);

        removeAiPromptPending();

        aiPromptThread.insertAdjacentHTML("beforeend", [
            '<div class="ai-prompt-thread__result">',
            '<div class="ai-prompt-preview-card" data-role="ai-preview-card">',
            '<img src="', escapeHtml(previewSource), '" alt="AI 생성 이미지">',
            '</div>',
            '<div class="ai-prompt-preview-actions">',
            '<button type="button" class="ai-prompt-preview-actions__button" data-role="ai-preview-copy" aria-label="복사">',
            '<svg viewBox="0 0 24 24"><path d="M16 1H6c-1.1 0-2 .9-2 2v12h2V3h10V1Zm3 4H10c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h9c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2Zm0 16H10V7h9v14Z"/></svg>',
            '</button>',
            '<button type="button" class="ai-prompt-preview-actions__button" data-role="ai-preview-apply" aria-label="업로드에 사용">',
            '<svg viewBox="0 0 24 24"><path d="M14 3v7h7v2h-7v7h-2v-7H5v-2h7V3h2Z"/></svg>',
            '</button>',
            '<button type="button" class="ai-prompt-preview-actions__button" data-role="ai-preview-more" aria-label="더보기">',
            '<svg viewBox="0 0 24 24"><circle cx="5" cy="12" r="1.8"/><circle cx="12" cy="12" r="1.8"/><circle cx="19" cy="12" r="1.8"/></svg>',
            '</button>',
            '</div>',
            '</div>'
        ].join(""));

        scrollAiPromptThreadToBottom();
    }

    function renderAiDescriptionConversation(promptText, result) {
        if (!aiPromptThread) {
            return;
        }

        currentAiGeneratedTitle = result && result.title ? result.title : currentAiGeneratedTitle;
        currentAiGeneratedDescription = result && result.description ? result.description : currentAiGeneratedDescription;
        currentAiDescriptionReady = !!(currentAiGeneratedTitle || currentAiGeneratedDescription);

        if (currentAiDescriptionReady && currentAiGeneratedTitle && videoTitleInput) {
            videoTitleInput.value = currentAiGeneratedTitle;
            autoResizeTextarea(videoTitleInput);
            updateTextCount(videoTitleInput, videoTitleCount, 100);
            if (detailsVideoTitle) {
                detailsVideoTitle.textContent = currentAiGeneratedTitle;
            }
        }

        if (currentAiDescriptionReady && currentAiGeneratedDescription && videoDescriptionInput) {
            videoDescriptionInput.value = currentAiGeneratedDescription;
            updateTextCount(videoDescriptionInput, videoDescriptionCount, 5000);
        }

        removeAiPromptPending();

        aiPromptThread.insertAdjacentHTML("beforeend", [
            '<div class="ai-prompt-thread__message ai-prompt-thread__message--assistant">',
            escapeHtml([currentAiGeneratedTitle, currentAiGeneratedDescription].filter(Boolean).join("\n\n")),
            '</div>'
        ].join(""));

        scrollAiPromptThreadToBottom();
    }

    function isDescriptionPrompt(promptText) {
        var normalized = String(promptText || "").replace(/\s+/g, "").toLowerCase();

        return normalized.indexOf("설명") >= 0 ||
            normalized.indexOf("분석") >= 0 ||
            normalized.indexOf("제목") >= 0 ||
            normalized.indexOf("내용") >= 0 ||
            normalized.indexOf("묘사") >= 0 ||
            normalized.indexOf("describe") >= 0 ||
            normalized.indexOf("analyze") >= 0;
    }

    function getCurrentAiDescriptionTarget() {
        if (currentAiGeneratedImageKey || currentAiGeneratedAssetUrl) {
            return {
                imageKey: currentAiGeneratedImageKey,
                imageUrl: currentAiGeneratedAssetUrl
            };
        }

        if (currentExistingMediaUrl && currentExistingMediaType.indexOf("image/") === 0) {
            return {
                imageKey: "",
                imageUrl: currentExistingMediaUrl
            };
        }

        if (currentPreviewUrl && currentPreviewUrl.indexOf("blob:") !== 0) {
            return {
                imageKey: "",
                imageUrl: currentPreviewUrl
            };
        }

        return null;
    }

    function dataUrlToFile(dataUrl, fileName) {
        var parts;
        var mimeMatch;
        var mimeType;
        var binaryString;
        var length;
        var bytes;
        var index;

        parts = String(dataUrl || "").split(",");
        if (parts.length < 2) {
            return null;
        }

        mimeMatch = parts[0].match(/data:(.*?);base64/);
        mimeType = mimeMatch ? mimeMatch[1] : "image/png";
        binaryString = window.atob(parts[1]);
        length = binaryString.length;
        bytes = new Uint8Array(length);

        for (index = 0; index < length; index += 1) {
            bytes[index] = binaryString.charCodeAt(index);
        }

        return new File([bytes], fileName || "ai-generated.png", { type: mimeType });
    }

    function applyAiGeneratedPreview() {
        var promptText;
        var generatedFile;
        var dataUrl;
        var attachedFile;

        promptText = aiPromptInput ? aiPromptInput.value.trim() : "";
        attachedFile = aiPromptFileInput && aiPromptFileInput.files ? aiPromptFileInput.files[0] : null;

        if (currentAiGeneratedImageKey && currentAiGeneratedAssetUrl) {
            generatedFile = {
                name: "ai-generated-artwork.png",
                type: currentAiGeneratedFileType || "image/png"
            };
            currentMediaFile = null;
            currentExistingMediaUrl = currentAiGeneratedAssetUrl;
            currentExistingMediaType = currentAiGeneratedFileType || "image/png";
        } else if (attachedFile && attachedFile.type && attachedFile.type.indexOf("image/") === 0) {
            generatedFile = attachedFile;
            currentMediaFile = generatedFile;
            currentExistingMediaUrl = "";
            currentExistingMediaType = generatedFile.type || "image/svg+xml";
        } else if (currentAiGeneratedAssetUrl && currentAiGeneratedAssetUrl.indexOf("data:") === 0) {
            generatedFile = dataUrlToFile(currentAiGeneratedAssetUrl, "ai-generated-artwork.png");
            currentMediaFile = generatedFile;
            currentExistingMediaUrl = "";
            currentExistingMediaType = generatedFile.type || "image/svg+xml";
        } else {
            dataUrl = "data:image/svg+xml;base64," + window.btoa(unescape(encodeURIComponent(buildAiGeneratedPlaceholderSvg(promptText))));
            generatedFile = dataUrlToFile(dataUrl, "ai-generated-artwork.svg");
            currentMediaFile = generatedFile;
            currentExistingMediaUrl = "";
            currentExistingMediaType = generatedFile.type || "image/svg+xml";
        }

        if (!generatedFile) {
            return;
        }

        if (currentAiDescriptionReady && currentAiGeneratedTitle && videoTitleInput) {
            videoTitleInput.value = currentAiGeneratedTitle;
            autoResizeTextarea(videoTitleInput);
            updateTextCount(videoTitleInput, videoTitleCount, 100);
            if (detailsVideoTitle) {
                detailsVideoTitle.textContent = currentAiGeneratedTitle;
            }
        }
        if (currentAiDescriptionReady && currentAiGeneratedDescription && videoDescriptionInput) {
            videoDescriptionInput.value = currentAiGeneratedDescription;
            updateTextCount(videoDescriptionInput, videoDescriptionCount, 5000);
        }
        updateSelectedFile(generatedFile);
        if (currentAiGeneratedImageKey && currentAiGeneratedAssetUrl) {
            renderExistingMediaPreview(currentAiGeneratedAssetUrl, currentAiGeneratedFileType || "image/png");
        } else {
            updateMediaPreview(generatedFile);
        }
        updateVideoLink(currentPreviewUrl, generatedFile.name);
        closeAiPromptModal();
        showDetailsScreen(generatedFile);

        if (currentAiDescriptionReady && currentAiGeneratedTitle && videoTitleInput) {
            videoTitleInput.value = currentAiGeneratedTitle;
            autoResizeTextarea(videoTitleInput);
            updateTextCount(videoTitleInput, videoTitleCount, 100);
            if (detailsVideoTitle) {
                detailsVideoTitle.textContent = currentAiGeneratedTitle;
            }
        }
        if (currentAiDescriptionReady && currentAiGeneratedDescription && videoDescriptionInput) {
            videoDescriptionInput.value = currentAiGeneratedDescription;
            updateTextCount(videoDescriptionInput, videoDescriptionCount, 5000);
        }
    }

    function submitAiPrompt() {
        var promptText;

        if (!aiPromptInput || !aiPromptThread) {
            return;
        }

        promptText = aiPromptInput.value.trim();

        if (!promptText) {
            aiPromptInput.focus();
            return;
        }

        aiPromptSendButton.disabled = true;
        aiPromptInput.disabled = true;
        aiPromptInput.value = "";
        aiPromptThread.insertAdjacentHTML("beforeend", [
            '<div class="ai-prompt-thread__message ai-prompt-thread__message--user">', escapeHtml(promptText), '</div>',
            '<div class="ai-prompt-thread__result" data-role="ai-prompt-pending">',
            '<div class="ai-prompt-thread__label">처리 중...</div>',
            '</div>'
        ].join(""));
        scrollAiPromptThreadToBottom();

        var descriptionTarget = isDescriptionPrompt(promptText) ? getCurrentAiDescriptionTarget() : null;
        var requestUrl = descriptionTarget ? "/api/works/ai/image/describe" : "/api/works/ai/image/pipeline";
        var requestBody = descriptionTarget ? descriptionTarget : {
            prompt: promptText,
            size: "1024x1024"
        };

        fetch(requestUrl, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        })
            .then(function (response) {
                if (!response.ok) {
                    return response.text().then(function (message) {
                        throw new Error(message || "AI 이미지 생성에 실패했습니다.");
                    });
                }
                return response.json();
            })
            .then(function (data) {
                if (descriptionTarget) {
                    renderAiDescriptionConversation(promptText, data);
                    return;
                }

                renderAiPromptConversation(promptText, data);
            })
            .catch(function (error) {
                window.alert(error.message || "AI 처리 중 오류가 발생했습니다.");
                if (!descriptionTarget) {
                    renderAiPromptConversation(promptText);
                }
            })
            .finally(function () {
                aiPromptSendButton.disabled = false;
                aiPromptInput.disabled = false;
                aiPromptInput.focus();
            });
    }

    function updateMediaPreview(file) {
        if (!videoPreviewShell || !videoPreviewPlayer || !imagePreviewPlayer) {
            return;
        }

        if (currentPreviewUrl && currentPreviewUrl.indexOf("blob:") === 0) {
            URL.revokeObjectURL(currentPreviewUrl);
            currentPreviewUrl = "";
        }

        if (!file) {
            videoPreviewPlayer.removeAttribute("src");
            videoPreviewPlayer.load();
            imagePreviewPlayer.removeAttribute("src");
            videoPreviewShell.classList.remove("has-video");
            videoPreviewShell.classList.remove("has-image");
            return;
        }

        currentPreviewUrl = URL.createObjectURL(file);

        if (file.type.indexOf("image/") === 0) {
            videoPreviewPlayer.removeAttribute("src");
            videoPreviewPlayer.load();
            imagePreviewPlayer.src = currentPreviewUrl;
            videoPreviewShell.classList.remove("has-video");
            videoPreviewShell.classList.add("has-image");
            return;
        }

        imagePreviewPlayer.removeAttribute("src");
        videoPreviewPlayer.src = currentPreviewUrl;
        videoPreviewPlayer.load();
        videoPreviewShell.classList.remove("has-image");
        videoPreviewShell.classList.add("has-video");
    }

    function renderExistingMediaPreview(url, fileType) {
        if (!videoPreviewShell || !videoPreviewPlayer || !imagePreviewPlayer) {
            return;
        }

        if (currentPreviewUrl && currentPreviewUrl.indexOf("blob:") === 0) {
            URL.revokeObjectURL(currentPreviewUrl);
        }

        currentPreviewUrl = url || "";

        if (!url) {
            updateMediaPreview(null);
            return;
        }

        if (String(fileType || "").indexOf("image/") === 0) {
            videoPreviewPlayer.removeAttribute("src");
            videoPreviewPlayer.load();
            imagePreviewPlayer.src = url;
            videoPreviewShell.classList.remove("has-video");
            videoPreviewShell.classList.add("has-image");
            return;
        }

        imagePreviewPlayer.removeAttribute("src");
        videoPreviewPlayer.src = url;
        videoPreviewPlayer.load();
        videoPreviewShell.classList.remove("has-image");
        videoPreviewShell.classList.add("has-video");
    }

    function updateSelectedFile(file) {
        if (!file) {
            fileNameText.textContent = "";
            fileNameText.hidden = true;
            return;
        }

        fileNameText.textContent = file.name;
        fileNameText.hidden = false;
    }

    function isSupportedMediaFile(file) {
        return !!file && !!file.type && (file.type.indexOf("video/") === 0 || file.type.indexOf("image/") === 0);
    }

    function updateTextCount(input, output, maxLength) {
        if (!input || !output) {
            return;
        }

        if (input.value.length > maxLength) {
            input.value = input.value.slice(0, maxLength);
        }

        output.textContent = input.value.length + "/" + maxLength;
    }

    function autoResizeTextarea(textarea) {
        if (!textarea) {
            return;
        }

        textarea.style.height = "auto";
        textarea.style.height = textarea.scrollHeight + "px";
    }

    function bindFieldCountVisibility(input) {
        var control;

        if (!input) {
            return;
        }

        control = input.parentElement;

        if (!control) {
            return;
        }

        input.addEventListener("focus", function () {
            control.classList.add("field-focused");
        });

        input.addEventListener("blur", function () {
            control.classList.remove("field-focused");
        });
    }

    function toDisplayTitle(fileName) {
        if (!fileName) {
            return "업로드한 동영상";
        }

        return fileName.replace(/\.[^/.]+$/, "");
    }

    function syncDialogSizeToDetailsScreen() {
        var clone;
        var measuredHeight;
        var maxAllowedHeight;
        var finalHeight;

        if (!dialogContent || !detailsScreen) {
            return;
        }

        clone = detailsScreen.cloneNode(true);
        clone.hidden = false;
        clone.removeAttribute("hidden");
        clone.classList.add("work-register-view-current");
        clone.style.position = "absolute";
        clone.style.visibility = "hidden";
        clone.style.pointerEvents = "none";
        clone.style.left = "-99999px";
        clone.style.top = "0";
        clone.style.width = window.getComputedStyle(dialogContent).width;
        clone.style.height = "auto";
        clone.style.maxHeight = "none";

        document.body.appendChild(clone);
        measuredHeight = clone.scrollHeight;
        document.body.removeChild(clone);

        if (measuredHeight > 0) {
            maxAllowedHeight = Math.max(window.innerHeight - 40, 520);
            finalHeight = Math.round(Math.min(measuredHeight, maxAllowedHeight) * 0.9);
            finalHeight = Math.max(finalHeight, 540);

            dialogContent.style.height = finalHeight + "px";
            dialogContent.style.minHeight = finalHeight + "px";
            dialogContent.style.maxHeight = finalHeight + "px";
        }
    }

    function formatAuctionDeadline(minutes) {
        if (minutes <= 0) {
            return "0분";
        }

        if (minutes < 60) {
            return String(minutes) + "분";
        }

        if (minutes % 60 === 0) {
            return String(minutes / 60) + "시간";
        }

        return String(Math.floor(minutes / 60)) + "시간 " + String(minutes % 60) + "분";
    }

    function formatAuctionPrice(value) {
        var numbersOnly = value.replace(/,/g, "").replace(/\D/g, "");

        return numbersOnly ? Number(numbersOnly).toLocaleString("ko-KR") : "";
    }

    function parseNumber(value) {
        var numbersOnly;

        if (!value) {
            return null;
        }

        numbersOnly = String(value).replace(/,/g, "").replace(/\D/g, "");
        return numbersOnly ? Number(numbersOnly) : null;
    }

    function getSelectedMediaFile() {
        if (currentMediaFile) {
            return currentMediaFile;
        }

        return fileInput && fileInput.files && fileInput.files[0] ? fileInput.files[0] : null;
    }

    function getCurrentMediaCategory(file) {
        var category = registerState ? (registerState.getAttribute("data-category") || "").trim() : "";

        if (file && file.type) {
            return file.type.indexOf("image/") === 0 ? "IMAGE" : "VIDEO";
        }

        if (currentExistingMediaType.indexOf("image/") === 0) {
            return "IMAGE";
        }

        if (currentExistingMediaType.indexOf("video/") === 0) {
            return "VIDEO";
        }

        return category || "VIDEO";
    }

    function clampNumber(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    function buildWorkPredictionPayload() {
        var file = getSelectedMediaFile();
        var title = videoTitleInput ? videoTitleInput.value.trim() : "";
        var description = videoDescriptionInput ? videoDescriptionInput.value.trim() : "";
        var category = getCurrentMediaCategory(file);
        var tagCount = selectedTagNames.length;
        var tradePrice = tradePriceInput ? parseNumber(tradePriceInput.value) : null;
        var auctionStartingPrice = auctionBidPriceInput ? parseNumber(auctionBidPriceInput.value) : null;
        var auctionEnabled = !!(auctionConfig && !auctionConfig.hidden);
        var startingBid = auctionStartingPrice || tradePrice || 10000;
        var finalBidPrice = auctionEnabled ? Math.round(startingBid * 1.35) : startingBid;
        var ageDays = 1;
        var titleQuality = clampNumber(title.length / 45, 0, 1);
        var descriptionQuality = clampNumber(description.length / 320, 0, 1);
        var titleCompleteness = clampNumber(title.length / 12, 0, 1);
        var descriptionCompleteness = clampNumber(description.length / 80, 0, 1);
        var tagQuality = clampNumber(tagCount / 5, 0, 1);
        var contentCompleteness = clampNumber(0.03 + titleCompleteness * 0.27 + descriptionCompleteness * 0.55 + tagQuality * 0.15, 0.03, 1);
        var mediaQuality = file || currentAiGeneratedImageKey || currentExistingMediaUrl ? 1 : 0;
        var qualityRatio = clampNumber(
            0.03 + titleQuality * 0.24 + descriptionQuality * 0.35 + tagQuality * 0.18 + mediaQuality * 0.20,
            0.01,
            0.98
        );
        var aiQualityScore = Math.round(clampNumber(10 + qualityRatio * 89, 10, 99) * 10) / 10;
        var estimatedViewsForRatio = Math.round(clampNumber(
            (120 + Math.pow(qualityRatio, 1.9) * 12000 + tagQuality * 900 + descriptionQuality * 1600 + mediaQuality * 700) * contentCompleteness,
            20,
            18000
        ));
        var likeRatio = clampNumber((0.006 + qualityRatio * 0.035 + tagQuality * 0.006) * contentCompleteness, 0.001, 0.06);
        var commentRatio = clampNumber((0.0003 + descriptionQuality * 0.003 + tagQuality * 0.0015) * contentCompleteness, 0, 0.008);
        var shareRatio = clampNumber((0.0002 + titleQuality * 0.0018 + tagQuality * 0.0012 + (currentAiGeneratedImageKey ? 0.0008 : 0)) * contentCompleteness, 0, 0.006);
        var likes = Math.round(estimatedViewsForRatio * likeRatio);
        var comments = Math.round(estimatedViewsForRatio * commentRatio);
        var shares = Math.round(estimatedViewsForRatio * shareRatio);
        var engagementScore = likes + comments + shares;
        var watchCompletionRate = clampNumber(0.08 + qualityRatio * 0.62 * contentCompleteness, 0.08, 0.82);
        var now = new Date();
        var bidderCount = auctionEnabled ? Math.round(clampNumber(tagCount + 2 + qualityRatio * 6, 1, 30)) : 0;
        var bidCount = auctionEnabled ? bidderCount * 2 : 0;
        var priceGap = finalBidPrice - startingBid;

        return {
            regression: {
                video_length_sec: category === "IMAGE" ? 15 : 60,
                age_days: ageDays,
                likes: likes,
                comments: comments,
                shares: shares,
                watch_completion_rate: watchCompletionRate,
                ai_quality_score: aiQualityScore,
                like_ratio: likes / estimatedViewsForRatio,
                comment_ratio: comments / estimatedViewsForRatio,
                share_ratio: shares / estimatedViewsForRatio,
                engagement_score: engagementScore,
                upload_month: now.getMonth() + 1,
                upload_dayofweek: now.getDay(),
                upload_year: now.getFullYear(),
                reaction_score: engagementScore,
                likes_per_day: likes / ageDays,
                comments_per_day: comments / ageDays,
                shares_per_day: shares / ageDays,
                engagement_per_day: engagementScore / ageDays,
                quality_completion_score: aiQualityScore * watchCompletionRate,
                short_video_score: category === "IMAGE" ? 1 : 0,
                log_likes: Math.log1p(likes),
                log_comments: Math.log1p(comments),
                log_shares: Math.log1p(shares),
                log_engagement_score: Math.log1p(engagementScore)
            },
            classification: {
                category: category === "IMAGE" ? "Animation" : "Vlog",
                quality: "1080p",
                license_type: "Limited",
                creator_tier: "Silver",
                video_length_sec: category === "IMAGE" ? 15 : 60,
                age_days: ageDays,
                likes: likes,
                comments: comments,
                shares: shares,
                watch_completion_rate: watchCompletionRate,
                ai_quality_score: aiQualityScore,
                starting_bid: startingBid,
                bidder_count: bidderCount,
                bid_count: bidCount,
                final_bid_price: finalBidPrice,
                engagement_score: engagementScore,
                price_gap: priceGap,
                engagement_per_bidder: bidderCount > 0 ? engagementScore / bidderCount : engagementScore,
                bid_to_starting_ratio: startingBid > 0 ? finalBidPrice / startingBid : 1
            }
        };
    }

    function setWorkPredictionLoading(loading) {
        if (workPredictionButton) {
            workPredictionButton.disabled = loading;
            workPredictionButton.textContent = loading ? "예측 중..." : "예측하기";
        }

        if (workPredictionStatus) {
            workPredictionStatus.textContent = loading ? "FastAPI 모델 예측 중" : "작성값 기준 예측";
        }
    }

    function renderWorkPrediction(data) {
        lastPredictedViews = Number(data.predictedViews || 0);
        lastPredictedLikes = Number(data.estimatedLikes || 0);
        lastPredictedPopular = Number(data.predictedPopular || 0);
        lastPredictedPopularProbability = Number(data.popularProbability || 0);

        var probabilityPct = Math.round(lastPredictedPopularProbability * 1000) / 10;
        var grade = data.predictionGrade || "-";
        var label = data.predictedLabel || "-";

        // 조회수
        if (workRegressionViews) {
            workRegressionViews.textContent = lastPredictedViews.toLocaleString("ko-KR") + "회";
        }

        // 좋아요
        if (workPredictionLikes) {
            workPredictionLikes.textContent = lastPredictedLikes.toLocaleString("ko-KR") + "개";
        }

        // 확률 텍스트
        if (workClassificationProbability) {
            workClassificationProbability.textContent = probabilityPct + "%";
        }

        // 확률 바
        var probFill = document.getElementById("work-prob-fill");
        if (probFill) {
            probFill.style.width = Math.min(probabilityPct, 100) + "%";
        }

        // 등급 뱃지
        var gradeBadge = document.getElementById("work-prediction-grade");
        if (gradeBadge) {
            gradeBadge.textContent = grade;
            var gradeKey = grade === "상위 노출 기대" ? "top"
                : grade === "성장 가능" ? "good"
                : grade === "보통" ? "mid" : "low";
            gradeBadge.setAttribute("data-grade", gradeKey);
        }

        // 분류 뱃지
        if (workClassificationLabel) {
            workClassificationLabel.textContent = label;
            workClassificationLabel.setAttribute("data-class", label === "고조회수" ? "high" : "low");
        }

        // 상태
        if (workPredictionStatus) {
            workPredictionStatus.textContent = "최근 작성값으로 계산됨";
        }

        setPredictionText("work-prediction-comments", Number(data.estimatedComments || 0).toLocaleString("ko-KR") + "개");
        setPredictionText("work-prediction-shares", Number(data.estimatedShares || 0).toLocaleString("ko-KR") + "회");
        setPredictionText("work-prediction-confidence", Math.round(Number(data.confidence || 0) * 1000) / 10 + "%");

        var signalEl = document.getElementById("work-prediction-signal");
        if (signalEl) { signalEl.textContent = data.modelSignal || "-"; }
    }

    function setPredictionText(id, value) {
        var element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }

    function requestWorkPrediction() {
        if (!workPredictionButton && !workRegressionViews && !workClassificationLabel) {
            return;
        }

        if (workPredictionAbortController) {
            workPredictionAbortController.abort();
        }

        workPredictionAbortController = new AbortController();
        setWorkPredictionLoading(true);

        fetch("/api/works/ai/prediction", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(buildWorkPredictionPayload()),
            signal: workPredictionAbortController.signal
        })
            .then(function (response) {
                if (!response.ok) {
                    return response.text().then(function (message) {
                        throw new Error(message || "AI 예측에 실패했습니다.");
                    });
                }
                return response.json();
            })
            .then(renderWorkPrediction)
            .catch(function (error) {
                if (error && error.name === "AbortError") {
                    return;
                }
                if (workPredictionStatus) {
                    workPredictionStatus.textContent = error.message || "AI 예측 실패";
                }
            })
            .finally(function () {
                setWorkPredictionLoading(false);
            });
    }

    function getSelectedThumbnailFile() {
        var manualThumbnailInput = document.getElementById("thumbnail-file-input-1");

        if (!manualThumbnailInput || !manualThumbnailInput.files || !manualThumbnailInput.files[0]) {
            return null;
        }

        return manualThumbnailInput.files[0];
    }

    function getSelectedGalleryOption() {
        if (!selectedGalleryId) {
            return null;
        }

        return Array.prototype.find.call(playlistOptions, function (option) {
            return option.getAttribute("data-gallery-id") === String(selectedGalleryId);
        }) || null;
    }

    function selectGalleryOption(option) {
        var galleryName;
        var galleryId;

        if (!option || !playlistDropdownText) {
            return;
        }

        galleryName = option.getAttribute("data-playlist-name") || option.textContent.trim();
        galleryId = option.getAttribute("data-gallery-id");

        selectedGalleryId = galleryId ? Number(galleryId) : null;
        playlistDropdownText.textContent = galleryName || "선택";
    }

    function normalizeSelectedTagName(tagName) {
        var normalized = (tagName || "").trim();

        if (normalized.indexOf("#") === 0) {
            normalized = normalized.substring(1).trim();
        }

        return normalized;
    }

    function formatVisibleTagName(tagName) {
        var normalized = normalizeSelectedTagName(tagName);
        return normalized ? "#" + normalized : "";
    }

    function extractTagNames(rawTags) {
        if (selectedTagNames.length) {
            return selectedTagNames.slice();
        }

        if (!rawTags) {
            return [];
        }

        return rawTags.split(",")
            .map(function (tag) {
                return normalizeSelectedTagName(tag);
            })
            .filter(function (tag) {
                return !!tag;
            });
    }

    function renderSelectedTags() {
        if (!videoTagsList) {
            return;
        }

        videoTagsList.innerHTML = selectedTagNames.map(function (tagName, index) {
            return '<span class="tag-chip">' +
                '<span>#' + escapeHtml(tagName) + '</span>' +
                '<button type="button" data-video-tag-index="' + index + '" aria-label="' + escapeHtml(tagName) + ' 삭제">x</button>' +
                '</span>';
        }).join("");
    }

    function addSelectedTag(tagName) {
        var normalizedTagName = normalizeSelectedTagName(tagName);

        if (!normalizedTagName) {
            return false;
        }

        if (selectedTagNames.indexOf(normalizedTagName) > -1) {
            if (videoTagsInput) {
                videoTagsInput.value = "";
                updateTextCount(videoTagsInput, videoTagsCount, 500);
            }
            closeTagSuggestions();
            return false;
        }

        selectedExistingTagNames[normalizedTagName] = true;
        selectedTagNames.push(normalizedTagName);
        renderSelectedTags();
        if (videoTagsInput) {
            videoTagsInput.value = "";
            updateTextCount(videoTagsInput, videoTagsCount, 500);
        }
        closeTagSuggestions();
        return true;
    }

    function getCurrentTagKeyword() {
        var rawValue;
        var parts;
        var currentPart;

        if (!videoTagsInput) {
            return "";
        }

        rawValue = videoTagsInput.value || "";
        parts = rawValue.split(",");
        currentPart = parts.length ? parts[parts.length - 1] : rawValue;
        return normalizeSelectedTagName(currentPart);
    }

    function closeTagSuggestions() {
        if (!videoTagsSuggestions) {
            return;
        }

        activeTagSuggestionIndex = -1;
        videoTagsSuggestions.hidden = true;
        videoTagsSuggestions.innerHTML = "";
    }

    function getTagSuggestionButtons() {
        if (!videoTagsSuggestions) {
            return [];
        }

        return Array.prototype.slice.call(videoTagsSuggestions.querySelectorAll(".tags-suggestion-item"));
    }

    function highlightActiveTagSuggestion() {
        getTagSuggestionButtons().forEach(function (button, index) {
            button.classList.toggle("tags-suggestion-current", index === activeTagSuggestionIndex);
        });
    }

    function applyTagSuggestion(tagName) {
        var normalizedTagName;

        if (!videoTagsInput || !tagName) {
            return;
        }

        normalizedTagName = normalizeSelectedTagName(tagName);
        addSelectedTag(normalizedTagName);
        videoTagsInput.focus();
    }

    function validateSelectedTags(tags) {
        var invalidTag = tags.find(function (tagName) {
            return !selectedExistingTagNames[tagName];
        });

        if (invalidTag) {
            throw new Error("태그는 추천 목록에서 선택해주세요: " + invalidTag);
        }
    }

    function renderTagSuggestions(tags) {
        if (!videoTagsSuggestions) {
            return;
        }

        if (!tags || !tags.length) {
            videoTagsSuggestions.innerHTML = '<div class="tags-suggestion-empty">일치하는 태그가 없습니다.</div>';
            videoTagsSuggestions.hidden = false;
            activeTagSuggestionIndex = -1;
            return;
        }

        videoTagsSuggestions.innerHTML = tags.map(function (tag, index) {
            var tagName = escapeHtml(normalizeSelectedTagName(tag && tag.tagName ? tag.tagName : ""));
            var activeClass = index === 0 ? " tags-suggestion-current" : "";
            return '<button type="button" class="tags-suggestion-item' + activeClass + '" data-tag-name="' + tagName + '">#' + tagName + '</button>';
        }).join("");
        videoTagsSuggestions.hidden = false;
        activeTagSuggestionIndex = 0;
    }

    function fetchTagSuggestions() {
        var keyword = getCurrentTagKeyword();
        var requestSeq;

        if (!videoTagsSuggestions) {
            return;
        }

        if (tagSuggestionAbortController) {
            tagSuggestionAbortController.abort();
            tagSuggestionAbortController = null;
        }

        if (!keyword) {
            closeTagSuggestions();
            return;
        }

        requestSeq = ++tagSuggestionRequestSeq;
        tagSuggestionAbortController = new AbortController();

        fetch("/api/works/tags/suggestions?keyword=" + encodeURIComponent(keyword), {
            signal: tagSuggestionAbortController.signal
        })
            .then(function (response) {
                if (!response.ok) {
                    throw new Error("tag suggestions failed");
                }

                return response.json();
            })
            .then(function (tags) {
                if (requestSeq !== tagSuggestionRequestSeq) {
                    return;
                }

                renderTagSuggestions(Array.isArray(tags) ? tags : []);
            })
            .catch(function (error) {
                if (error && error.name === "AbortError") {
                    return;
                }

                closeTagSuggestions();
            });
    }

    function moveActiveTagSuggestion(direction) {
        var buttons = getTagSuggestionButtons();

        if (!buttons.length) {
            return;
        }

        activeTagSuggestionIndex += direction;
        if (activeTagSuggestionIndex < 0) {
            activeTagSuggestionIndex = buttons.length - 1;
        }
        if (activeTagSuggestionIndex >= buttons.length) {
            activeTagSuggestionIndex = 0;
        }

        highlightActiveTagSuggestion();
    }

    function buildWorkFormData(file) {
        var formData = new FormData();
        var title = videoTitleInput ? videoTitleInput.value.trim() : "";
        var description = videoDescriptionInput ? videoDescriptionInput.value.trim() : "";
        var tradePrice = tradePriceInput ? parseNumber(tradePriceInput.value) : null;
        var auctionStartingPrice = auctionBidPriceInput ? parseNumber(auctionBidPriceInput.value) : null;
        var auctionDeadlineHours = auctionDeadlineHoursInput ? Number(auctionDeadlineHoursInput.value || "0") : 0;
        var linkUrlText = videoLinkUrl ? (videoLinkUrl.getAttribute("href") || "").trim() : "";
        var tags = extractTagNames(videoTagsInput ? videoTagsInput.value : "");
        var thumbnailFile = getSelectedThumbnailFile();
        var predictionPayload = buildWorkPredictionPayload();

        if (!file && !currentExistingMediaUrl) {
            throw new Error("업로드할 파일을 선택해주세요.");
        }

        if (!title) {
            throw new Error("제목을 입력해주세요.");
        }

        if (!selectedGalleryId) {
            throw new Error("예술관을 선택해주세요.");
        }

        validateSelectedTags(tags);

        formData.append("galleryId", String(selectedGalleryId));
        formData.append("title", title);
        formData.append("category", getCurrentMediaCategory(file));
        formData.append("description", description);
        formData.append("licenseType", "");
        formData.append("licenseTerms", "");
        formData.append("isTradable", String(!!(tradeToggle && tradeToggle.checked)));
        formData.append("allowComment", "true");
        formData.append("showSimilar", "true");
        formData.append("linkUrl", resolveSubmitLinkUrl(linkUrlText));
        formData.append("auctionEnabled", String(!!(auctionConfig && !auctionConfig.hidden)));
        formData.append("auctionDeadlineHours", String(auctionDeadlineHours));
        formData.append("mediaType", file && file.type ? file.type : (currentAiGeneratedFileType || getCurrentMediaCategory(file)));
        formData.append("titleLength", String(title.length));
        formData.append("descriptionLength", String(description.length));
        formData.append("tagCount", String(tags.length));
        formData.append("thumbnailExists", String(!!thumbnailFile));
        formData.append("isAiGenerated", String(!!currentAiGeneratedImageKey));
        formData.append("aiQualityScore", String(predictionPayload.regression.ai_quality_score || 0));
        formData.append("predictedViews", String(Math.round(lastPredictedViews || 0)));
        formData.append("predictedLikeCount", String(Math.round(lastPredictedLikes || 0)));
        formData.append("predictedPopular", String(Math.round(lastPredictedPopular || 0)));
        formData.append("predictedPopularProbability", String(lastPredictedPopularProbability || 0));
        if (file) {
            formData.append("mediaFile", file);
        } else if (currentAiGeneratedImageKey) {
            formData.append("files[0].fileUrl", currentAiGeneratedImageKey);
            formData.append("files[0].fileType", currentAiGeneratedFileType || "image/png");
            formData.append("files[0].fileSize", String(currentAiGeneratedFileSize || 0));
            formData.append("files[0].sortOrder", "0");
        }

        if (thumbnailFile) {
            formData.append("thumbnailFile", thumbnailFile);
        }

        if (tradePrice !== null) {
            formData.append("price", String(tradePrice));
        }

        if (auctionStartingPrice !== null) {
            formData.append("auctionStartingPrice", String(auctionStartingPrice));
        }

        tags.forEach(function (tagName) {
            formData.append("tagNames", tagName);
        });

        return formData;
    }

    function resolveSubmitLinkUrl(linkUrlText) {
        var value = String(linkUrlText || "").trim();

        if (!value || value.indexOf("blob:") === 0) {
            return "";
        }

        if (currentAiGeneratedImageKey || currentExistingMediaUrl) {
            return "";
        }

        return value.slice(0, 255);
    }

    function resolveProfileRedirectUrl() {
        if (selectedGalleryId) {
            return "/profile?tab=works&galleryId=" + encodeURIComponent(String(selectedGalleryId));
        }

        return "/profile?tab=works";
    }

    function setSubmittingState(submitting) {
        if (!submitButton) {
            return;
        }

        isSubmitting = submitting;
        submitButton.disabled = submitting;
        submitButton.textContent = submitting
            ? (isEditMode() ? "수정 중..." : "등록 중...")
            : (registerState ? registerState.getAttribute("data-submit-label") || "등록" : "등록");
    }

    function submitWork() {
        var file;
        var formData;

        if (isSubmitting) {
            return;
        }

        try {
            file = getSelectedMediaFile();
            formData = buildWorkFormData(file);
        } catch (error) {
            window.alert(error.message);
            return;
        }

        setSubmittingState(true);

        fetch(isEditMode() && registerState && registerState.getAttribute("data-work-id")
            ? "/api/works/" + registerState.getAttribute("data-work-id") + "/edit"
            : "/api/works", {
            method: "POST",
            body: formData
        })
            .then(function (response) {
                if (!response.ok) {
                    return response.text().then(function (message) {
                        throw new Error(message || "작품 등록에 실패했습니다.");
                    });
                }

                return response.json();
            })
            .then(function (data) {
                navigateAfterSubmit(data && data.redirectUrl ? data.redirectUrl : resolveProfileRedirectUrl());
            })
            .catch(function (error) {
                window.alert(error.message || "작품 등록 중 오류가 발생했습니다.");
            })
            .finally(function () {
                setSubmittingState(false);
            });
    }

    function copyVideoLink() {
        if (!videoLinkUrl || !navigator.clipboard || !navigator.clipboard.writeText) {
            return;
        }

        navigator.clipboard.writeText((videoLinkUrl.getAttribute("href") || videoLinkUrl.textContent || "").trim()).catch(function () {
        });
    }

    function showDetailsScreen(file) {
        var title = "";
        var displayTitle = "업로드한 이미지";

        if (currentAiDescriptionReady && currentAiGeneratedImageKey && currentAiGeneratedTitle) {
            title = currentAiGeneratedTitle;
            displayTitle = currentAiGeneratedTitle;
        } else if (!currentAiGeneratedImageKey) {
            title = toDisplayTitle(file.name);
            displayTitle = title;
        }

        if (uploadScreen) {
            uploadScreen.hidden = true;
            uploadScreen.classList.remove("work-register-view-current");
        }
        detailsScreen.hidden = false;
        detailsScreen.classList.add("work-register-view-current");
        dialogContent.classList.add("is-details");

        if (detailsVideoTitle) {
            detailsVideoTitle.textContent = displayTitle;
        }

        if (videoFileLabel) {
            videoFileLabel.textContent = file.name;
        }

        if (videoTitleInput) {
            videoTitleInput.value = title;
            autoResizeTextarea(videoTitleInput);
            updateTextCount(videoTitleInput, videoTitleCount, 100);
        }
    }

    function showUploadScreen() {
        detailsScreen.hidden = true;
        detailsScreen.classList.remove("work-register-view-current");
        uploadScreen.hidden = false;
        uploadScreen.classList.add("work-register-view-current");
        dialogContent.classList.remove("is-details");
    }

    function clearSelectedMedia() {
        currentMediaFile = null;
        currentExistingMediaUrl = "";
        currentExistingMediaType = "";
        currentAiGeneratedImageKey = "";
        currentAiGeneratedFileType = "";
        currentAiGeneratedFileSize = 0;

        if (fileInput) {
            fileInput.value = "";
        }

        updateSelectedFile(null);
        updateMediaPreview(null);
        updateVideoLink("", "");

        if (videoFileLabel) {
            videoFileLabel.textContent = "";
        }

        showUploadScreen();
    }

    function hasSelectedSessionMedia() {
        return !!currentMediaFile || !!currentAiGeneratedImageKey || (currentPreviewUrl && currentPreviewUrl.indexOf("blob:") === 0);
    }

    function clearLinkOnly() {
        updateVideoLink("", "");
    }

    function handleFiles(files) {
        var file = files && files[0];

        if (!file) {
            currentMediaFile = null;
            currentAiGeneratedImageKey = "";
            currentAiGeneratedFileType = "";
            currentAiGeneratedFileSize = 0;
            updateSelectedFile(null);
            updateMediaPreview(null);
            updateVideoLink("", "");
            return;
        }

        if (!isSupportedMediaFile(file)) {
            return;
        }

        currentMediaFile = file;
        currentExistingMediaUrl = "";
        currentExistingMediaType = "";
        currentAiGeneratedImageKey = "";
        currentAiGeneratedFileType = "";
        currentAiGeneratedFileSize = 0;
        updateSelectedFile(file);
        updateMediaPreview(file);
        updateVideoLink(currentPreviewUrl, file.name);
        showDetailsScreen(file);
    }

    selectFileButton.addEventListener("click", function () {
        fileInput.click();
    });

    if (uploadAiButton) {
        uploadAiButton.addEventListener("click", openAiPromptModal);
    }

    fileInput.addEventListener("change", function () {
        handleFiles(fileInput.files);
    });

    ["dragenter", "dragover"].forEach(function (eventName) {
        uploadPanel.addEventListener(eventName, function (event) {
            event.preventDefault();
            uploadPanel.classList.add("is-dragover");
        });
    });

    ["dragleave", "drop"].forEach(function (eventName) {
        uploadPanel.addEventListener(eventName, function (event) {
            event.preventDefault();
            uploadPanel.classList.remove("is-dragover");
        });
    });

    uploadPanel.addEventListener("drop", function (event) {
        handleFiles(event.dataTransfer.files);
    });

    if (closeButton) {
        closeButton.addEventListener("click", closeModal);
    }

    if (uploadCloseButton) {
        uploadCloseButton.addEventListener("click", closeModal);
    }

    if (detailsCloseButton) {
        detailsCloseButton.addEventListener("click", closeModal);
    }

    if (detailsBackButton) {
        detailsBackButton.addEventListener("click", showUploadScreen);
    }

    if (videoLinkRemoveButton) {
        videoLinkRemoveButton.addEventListener("click", function () {
            if (hasSelectedSessionMedia()) {
                clearSelectedMedia();
                return;
            }

            clearLinkOnly();
        });
    }

    aiPromptCloseTargets.forEach(function (target) {
        target.addEventListener("click", closeAiPromptModal);
    });

    if (aiPromptThread) {
        aiPromptThread.addEventListener("click", function (event) {
            var actionButton = event.target.closest("[data-role]");

            if (!actionButton) {
                return;
            }

            if (actionButton.getAttribute("data-role") === "ai-preview-apply") {
                applyAiGeneratedPreview();
                return;
            }

            if (actionButton.getAttribute("data-role") === "ai-preview-copy" && aiPromptInput && navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(aiPromptInput.value.trim()).catch(function () {
                });
                return;
            }

            if (actionButton.getAttribute("data-role") === "ai-preview-more") {
                window.alert("AI 생성 결과 옵션은 다음 단계에서 연결할 수 있습니다.");
            }
        });
    }

    if (aiPromptCloseButton) {
        aiPromptCloseButton.addEventListener("click", closeAiPromptModal);
    }

    if (aiPromptSendButton) {
        aiPromptSendButton.addEventListener("click", submitAiPrompt);
    }

    if (aiPromptToolButton) {
        aiPromptToolButton.addEventListener("click", function (event) {
            event.stopPropagation();
            toggleAiPromptComposeMenu();
        });
    }

    if (aiPromptAttachButton && aiPromptFileInput) {
        aiPromptAttachButton.addEventListener("click", function () {
            closeAiPromptComposeMenu();
            aiPromptFileInput.click();
        });
    }

    if (aiPromptDeleteButton) {
        aiPromptDeleteButton.addEventListener("click", function () {
            clearAiPromptAttachment();
            closeAiPromptComposeMenu();
        });
    }

    if (aiPromptComposeMenu) {
        aiPromptComposeMenu.addEventListener("click", function (event) {
            event.stopPropagation();
        });
    }

    if (aiPromptFileInput) {
        aiPromptFileInput.addEventListener("change", function () {
            if (!aiPromptFileInput.files || !aiPromptFileInput.files[0]) {
                return;
            }

            renderAiPromptAttachment(aiPromptFileInput.files[0]);
        });
    }

    if (aiPromptRemoveAttachment) {
        aiPromptRemoveAttachment.addEventListener("click", clearAiPromptAttachment);
    }

    if (aiPromptRemoveFileAttachment) {
        aiPromptRemoveFileAttachment.addEventListener("click", clearAiPromptAttachment);
    }

    if (aiPromptInput) {
        aiPromptInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter") {
                event.preventDefault();
                submitAiPrompt();
            }
        });
    }

    thumbnailUploadButtons.forEach(function (button) {
        button.addEventListener("click", function (event) {
            event.stopPropagation();
            var inputId = button.getAttribute("data-target-input");
            var targetInput = inputId ? document.getElementById(inputId) : null;

            if (targetInput) {
                targetInput.click();
            }
        });

        button.addEventListener("keydown", function (event) {
            if (event.key !== "Enter" && event.key !== " ") {
                return;
            }

            event.preventDefault();
            button.click();
        });
    });

    thumbnailFileInputs.forEach(function (input) {
        input.addEventListener("change", function () {
            var file = input.files && input.files[0];
            renderThumbnailPreview(input, file);
        });

        input.closest(".thumbnail-placeholder")?.addEventListener("click", function (event) {
            if (event.target.closest(".thumbnail-upload-button")) {
                return;
            }

            if (event.target === input) {
                return;
            }

            input.click();
        });
    });

    if (videoLinkUrl) {
        videoLinkUrl.addEventListener("click", function (event) {
            event.preventDefault();
            copyVideoLink();
        });
    }

    if (videoLinkCopyButton) {
        videoLinkCopyButton.addEventListener("click", function (event) {
            event.preventDefault();
            copyVideoLink();
        });
    }

    if (playlistDropdownButton && playlistDropdownMenu && playlistDropdownText) {
        playlistDropdownButton.addEventListener("click", function () {
            var isOpen = !playlistDropdownMenu.hidden;

            playlistDropdownMenu.hidden = isOpen;
            playlistDropdownButton.setAttribute("aria-expanded", String(!isOpen));
        });

        playlistOptions.forEach(function (option) {
            option.addEventListener("click", function () {
                selectGalleryOption(option);
                playlistDropdownMenu.hidden = true;
                playlistDropdownButton.setAttribute("aria-expanded", "false");
            });
        });

        document.addEventListener("click", function (event) {
            if (!playlistDropdownButton.contains(event.target) && !playlistDropdownMenu.contains(event.target)) {
                playlistDropdownMenu.hidden = true;
                playlistDropdownButton.setAttribute("aria-expanded", "false");
            }
        });
    }

    if (submitButton) {
        submitButton.addEventListener("click", submitWork);
    }

    if (workPredictionButton) {
        workPredictionButton.addEventListener("click", requestWorkPrediction);
    }

    if (videoTitleInput && videoTitleCount) {
        videoTitleInput.addEventListener("input", function () {
            autoResizeTextarea(videoTitleInput);
            updateTextCount(videoTitleInput, videoTitleCount, 100);

            if (detailsVideoTitle) {
                detailsVideoTitle.textContent = videoTitleInput.value || "업로드한 동영상";
            }
        });
    }

    if (videoDescriptionInput && videoDescriptionCount) {
        videoDescriptionInput.addEventListener("input", function () {
            updateTextCount(videoDescriptionInput, videoDescriptionCount, 5000);
        });
    }

    if (videoTagsInput && videoTagsCount) {
        videoTagsInput.addEventListener("input", function () {
            updateTextCount(videoTagsInput, videoTagsCount, 500);
            fetchTagSuggestions();
        });

        videoTagsInput.addEventListener("keydown", function (event) {
            var buttons = getTagSuggestionButtons();
            var activeButton;

            if (videoTagsSuggestions && !videoTagsSuggestions.hidden && buttons.length) {
                if (event.key === "ArrowDown") {
                    event.preventDefault();
                    moveActiveTagSuggestion(1);
                    return;
                }

                if (event.key === "ArrowUp") {
                    event.preventDefault();
                    moveActiveTagSuggestion(-1);
                    return;
                }

                if ((event.key === "Enter" || event.key === ",") && activeTagSuggestionIndex >= 0) {
                    event.preventDefault();
                    activeButton = buttons[activeTagSuggestionIndex];
                    if (activeButton) {
                        applyTagSuggestion(activeButton.getAttribute("data-tag-name"));
                    }
                    return;
                }

                if (event.key === "Escape") {
                    closeTagSuggestions();
                }
            }

            if (event.key === "Enter" || event.key === ",") {
                event.preventDefault();
                fetchTagSuggestions();
            }

            if (event.key === "Backspace" && !videoTagsInput.value && selectedTagNames.length) {
                selectedTagNames.pop();
                renderSelectedTags();
            }
        });

        videoTagsInput.addEventListener("blur", function () {
            window.setTimeout(closeTagSuggestions, 120);
        });
    }

    if (videoTagsList) {
        videoTagsList.addEventListener("click", function (event) {
            var button = event.target.closest("button[data-video-tag-index]");
            var index;

            if (!button) {
                return;
            }

            index = Number(button.getAttribute("data-video-tag-index"));
            if (Number.isNaN(index)) {
                return;
            }

            selectedTagNames.splice(index, 1);
            renderSelectedTags();
            if (videoTagsInput) {
                videoTagsInput.focus();
            }
        });
    }

    if (videoTagsSuggestions) {
        videoTagsSuggestions.addEventListener("mousedown", function (event) {
            var button = event.target.closest(".tags-suggestion-item");

            if (!button) {
                return;
            }

            event.preventDefault();
            applyTagSuggestion(button.getAttribute("data-tag-name"));
        });
    }

    function resetAuctionConfig() {
        if (auctionConfig) {
            auctionConfig.hidden = true;
            auctionConfig.style.display = "none";
        }

        if (auctionBidPriceInput) {
            auctionBidPriceInput.value = "";
        }

        if (auctionDeadlineSelected) {
            auctionDeadlineSelected.textContent = "0분";
        }

        if (auctionDeadlineHoursInput) {
            auctionDeadlineHoursInput.value = "0";
        }

        auctionDeadlineButtons.forEach(function (item) {
            item.classList.remove("work-auction-config__deadline-btn--active");
        });

        if (auctionExpandButton) {
            auctionExpandButton.setAttribute("aria-expanded", "false");
        }
    }

    function openAuctionConfig() {
        if (!auctionConfig) {
            return;
        }

        auctionConfig.hidden = false;
        auctionConfig.style.display = "";

        if (auctionExpandButton) {
            auctionExpandButton.setAttribute("aria-expanded", "true");
        }

        window.requestAnimationFrame(function () {
            auctionBidPriceInput?.scrollIntoView({ behavior: "smooth", block: "center" });
            auctionBidPriceInput?.focus();
        });
    }

    function resetTradeConfig() {
        if (tradeToggle) {
            tradeToggle.checked = false;
        }

        if (tradeConfig) {
            tradeConfig.hidden = true;
        }

        if (tradePriceInput) {
            tradePriceInput.value = "";
        }
    }

    if (tradeToggle && tradeConfig) {
        tradeToggle.addEventListener("change", function () {
            if (tradeToggle.checked) {
                resetAuctionConfig();
            }

            tradeConfig.hidden = !tradeToggle.checked;
            tradeConfig.style.display = tradeToggle.checked ? "" : "none";

            if (!tradeToggle.checked && tradePriceInput) {
                tradePriceInput.value = "";
            }
        });
    }

    if (tradePriceInput) {
        tradePriceInput.addEventListener("input", function (event) {
            event.target.value = formatAuctionPrice(event.target.value);
        });
    }

    if (auctionExpandButton && auctionConfig) {
        auctionExpandButton.addEventListener("click", function () {
            var willOpen = auctionConfig.hidden;

            if (willOpen) {
                resetTradeConfig();
                openAuctionConfig();
                return;
            }

            resetAuctionConfig();
        });
    }

    if (auctionBidPriceInput) {
        auctionBidPriceInput.addEventListener("input", function (event) {
            event.target.value = formatAuctionPrice(event.target.value);
        });
    }

    if (auctionDeadlineButtons.length && auctionDeadlineSelected && auctionDeadlineHoursInput) {
        auctionDeadlineButtons.forEach(function (button) {
            button.addEventListener("click", function () {
                var minutes = Number(button.getAttribute("data-hours") || "0");

                auctionDeadlineSelected.textContent = formatAuctionDeadline(minutes);
                auctionDeadlineHoursInput.value = String(minutes);

                auctionDeadlineButtons.forEach(function (item) {
                    item.classList.remove("work-auction-config__deadline-btn--active");
                });

                button.classList.add("work-auction-config__deadline-btn--active");
            });
        });
    }

    if (auctionDeadlineReset && auctionDeadlineSelected && auctionDeadlineHoursInput) {
        auctionDeadlineReset.addEventListener("click", function () {
            auctionDeadlineSelected.textContent = "0분";
            auctionDeadlineHoursInput.value = "0";

            auctionDeadlineButtons.forEach(function (item) {
                item.classList.remove("work-auction-config__deadline-btn--active");
            });
        });
    }

    document.addEventListener("keydown", function (event) {
        if (event.key === "Escape" && aiPromptModal && !aiPromptModal.hidden) {
            closeAiPromptModal();
        }
    });

    document.addEventListener("click", function (event) {
        if (!aiPromptComposeMenu || !aiPromptToolButton || aiPromptComposeMenu.hidden) {
            if (videoTagsSuggestions && !videoTagsSuggestions.hidden &&
                videoTagsInput && !videoTagsInput.contains(event.target) &&
                !videoTagsSuggestions.contains(event.target)) {
                closeTagSuggestions();
            }
            return;
        }

        if (!aiPromptComposeMenu.contains(event.target) && !aiPromptToolButton.contains(event.target)) {
            closeAiPromptComposeMenu();
        }

        if (videoTagsSuggestions && !videoTagsSuggestions.hidden &&
            videoTagsInput && !videoTagsInput.contains(event.target) &&
            !videoTagsSuggestions.contains(event.target)) {
            closeTagSuggestions();
        }
    });

    bindFieldCountVisibility(videoTitleInput);
    bindFieldCountVisibility(videoDescriptionInput);

    updateSelectedFile(null);
    updateMediaPreview(null);
    updateVideoLink("", "");
    if (aiPromptThread) {
        aiPromptThread.innerHTML = "";
    }
    syncDialogSizeToDetailsScreen();
    autoResizeTextarea(videoTitleInput);
    updateTextCount(videoTitleInput, videoTitleCount, 100);
    updateTextCount(videoDescriptionInput, videoDescriptionCount, 5000);
    updateTextCount(videoTagsInput, videoTagsCount, 500);
    setSubmittingState(false);
    resetTradeConfig();
    resetAuctionConfig();

    if (playlistOptions.length) {
        selectGalleryOption(playlistOptions[0]);
    }

    if (isEditMode() && registerState) {
        if (document.body) {
            document.body.classList.add("work-register-edit-mode");
        }
        var editTradeEnabled = isStateFlagEnabled("data-is-tradable");
        var editAuctionEnabled = isStateFlagEnabled("data-has-active-auction");
        var editTradePrice = registerState.getAttribute("data-price") || "";
        var editAuctionStartingPrice = registerState.getAttribute("data-auction-starting-price") || "";
        var editAuctionDeadlineHours = Number(registerState.getAttribute("data-auction-deadline-hours") || "0");

        if (videoTitleInput) {
            videoTitleInput.value = registerState.getAttribute("data-title") || "";
            autoResizeTextarea(videoTitleInput);
            updateTextCount(videoTitleInput, videoTitleCount, 100);
        }

        if (videoDescriptionInput) {
            videoDescriptionInput.value = registerState.getAttribute("data-description") || "";
            updateTextCount(videoDescriptionInput, videoDescriptionCount, 5000);
        }

        if (videoTagsInput) {
            var initialTags = (registerState.getAttribute("data-tags") || "")
                .split(",")
                .map(function (tagName) {
                    return normalizeSelectedTagName(tagName);
                })
                .filter(function (tagName) {
                    return !!tagName;
                });

            selectedTagNames = [];
            initialTags.forEach(addSelectedTag);
            videoTagsInput.value = "";
            updateTextCount(videoTagsInput, videoTagsCount, 500);
        }

        if (registerState.getAttribute("data-gallery-id")) {
            selectedGalleryId = Number(registerState.getAttribute("data-gallery-id"));
            Array.prototype.forEach.call(playlistOptions, function (option) {
                if (option.getAttribute("data-gallery-id") === String(selectedGalleryId)) {
                    selectGalleryOption(option);
                }
            });
        }

        if (detailsVideoTitle) {
            detailsVideoTitle.textContent = registerState.getAttribute("data-title") || "업로드 파일";
        }

        if (videoFileLabel) {
            videoFileLabel.textContent = registerState.getAttribute("data-title") || "업로드 파일";
        }

        if (editTradeEnabled) {
            if (tradeToggle) {
                tradeToggle.checked = true;
            }

            if (tradeConfig) {
                tradeConfig.hidden = false;
                tradeConfig.style.display = "";
            }

            if (tradePriceInput) {
                tradePriceInput.value = formatAuctionPrice(editTradePrice);
            }
        }

        if (editAuctionEnabled) {
            openAuctionConfig();

            if (auctionBidPriceInput) {
                auctionBidPriceInput.value = formatAuctionPrice(editAuctionStartingPrice);
            }

            if (auctionDeadlineSelected) {
                auctionDeadlineSelected.textContent = formatAuctionDeadline(editAuctionDeadlineHours);
            }

            if (auctionDeadlineHoursInput) {
                auctionDeadlineHoursInput.value = String(editAuctionDeadlineHours);
            }

            auctionDeadlineButtons.forEach(function (item) {
                var itemHours = Number(item.getAttribute("data-hours") || "0");
                item.classList.toggle("work-auction-config__deadline-btn--active", itemHours === editAuctionDeadlineHours);
            });
        }

        renderExistingMediaPreview(currentExistingMediaUrl, currentExistingMediaType);
        updateVideoLink(registerState.getAttribute("data-link-url") || currentExistingMediaUrl, registerState.getAttribute("data-link-url") || currentExistingMediaUrl);
        showDetailsScreen({ name: registerState.getAttribute("data-title") || "업로드 파일" });
    } else if (document.body) {
        document.body.classList.remove("work-register-edit-mode");
    }

    window.addEventListener("resize", syncDialogSizeToDetailsScreen);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeWorkRegister);
} else {
    initializeWorkRegister();
}
