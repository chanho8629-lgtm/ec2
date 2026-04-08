function initializeWorkRegister() {
    var modal = document.getElementById("work-register-modal");
    var dialogContent = document.getElementById("dialog-content");
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
    var videoTagsInput = document.getElementById("video-tags-input");
    var videoTagsCount = document.getElementById("video-tags-count");
    var videoTagsSuggestions = document.getElementById("video-tags-suggestions");
    var tradeToggle = document.getElementById("tradeToggle");
    var tradeConfig = document.getElementById("tradeConfig");
    var tradePriceInput = document.getElementById("tradePriceInput");
    var auctionExpandButton = document.querySelector(".auction-expand-button");
    var auctionExpandIcon = document.querySelector(".auction-expand-button .auction-expand-icon:not(.auction-expand-icon-collapse)");
    var auctionCollapseIcon = document.querySelector(".auction-expand-icon-collapse");
    var auctionConfig = document.getElementById("auctionConfig");
    var auctionBidPriceInput = document.getElementById("auctionBidPriceInput");
    var auctionDeadlineSelected = document.getElementById("auctionDeadlineSelected");
    var auctionDeadlineReset = document.getElementById("auctionDeadlineReset");
    var auctionDeadlineHoursInput = document.getElementById("auctionDeadlineHoursInput");
    var auctionDeadlineButtons = document.querySelectorAll("#auctionConfig .work-auction-config__deadline-btn");
    var videoLinkUrl = document.getElementById("video-link-url");
    var videoLinkCopyButton = document.getElementById("video-link-copy-button");
    var playlistDropdownButton = document.getElementById("playlist-dropdown-button");
    var playlistDropdownMenu = document.getElementById("playlist-dropdown-menu");
    var playlistDropdownText = document.getElementById("playlist-dropdown-text");
    var playlistOptions = document.querySelectorAll(".playlist-option");
    var submitButton = document.getElementById("work-submit-button");
    var thumbnailUploadButtons = document.querySelectorAll(".thumbnail-upload-button");
    var thumbnailFileInputs = document.querySelectorAll('input[id^="thumbnail-file-input-"]');
    var aiPromptModal = document.getElementById("ai-prompt-modal");
    var aiPromptCloseButton = document.getElementById("ai-prompt-close-button");
    var aiPromptInput = document.getElementById("ai-prompt-input");
    var aiPromptBubble = document.getElementById("ai-prompt-bubble");
    var aiPromptSendButton = document.getElementById("ai-prompt-send-button");
    var aiPromptToolButton = document.getElementById("ai-prompt-tool-button");
    var aiPromptComposeMenu = document.getElementById("ai-prompt-compose-menu");
    var aiPromptAttachButton = document.getElementById("ai-prompt-attach-button");
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
    var thumbnailPreviewUrls = {};
    var currentMediaFile = null;
    var currentExistingMediaUrl = registerState ? (registerState.getAttribute("data-media-url") || "").trim() : "";
    var currentExistingMediaType = registerState ? (registerState.getAttribute("data-media-type") || "").trim() : "";
    var selectedGalleryId = null;
    var isSubmitting = false;
    var tagSuggestionAbortController = null;
    var tagSuggestionRequestSeq = 0;
    var activeTagSuggestionIndex = -1;

    if (!modal || !dialogContent || !uploadScreen || !detailsScreen || !uploadPanel || !fileInput || !selectFileButton || !closeButton || !fileNameText) {
        return;
    }

    if (modal.dataset.workRegisterInitialized === "true") {
        return;
    }

    modal.dataset.workRegisterInitialized = "true";

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
            return;
        }

        videoLinkUrl.href = url;
        videoLinkUrl.textContent = label || url;
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

    function toggleAiPromptComposeMenu() {
        var willOpen;

        if (!aiPromptComposeMenu || !aiPromptToolButton) {
            return;
        }

        willOpen = aiPromptComposeMenu.hidden;
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
    }

    function renderAiPromptAttachment(file) {
        if (!file || !aiPromptAttachments || !aiPromptImageAttachment || !aiPromptFileAttachment) {
            return;
        }

        clearAiPromptAttachment();
        aiPromptAttachments.hidden = false;

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

    function submitAiPrompt() {
        var promptText;

        if (!aiPromptInput || !aiPromptBubble) {
            return;
        }

        promptText = aiPromptInput.value.trim();

        if (!promptText) {
            aiPromptInput.focus();
            return;
        }

        aiPromptBubble.textContent = promptText;
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
            control.classList.add("is-active");
        });

        input.addEventListener("blur", function () {
            control.classList.remove("is-active");
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
        clone.classList.add("is-active");
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

    function formatAuctionDeadline(hours) {
        if (hours <= 0) {
            return "0시간";
        }

        if (hours >= 24) {
            if (hours % 24 === 0) {
                return String(hours / 24) + "일";
            }

            return String(Math.floor(hours / 24)) + "일 " + String(hours % 24) + "시간";
        }

        return String(hours) + "시간";
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

    function extractTagNames(rawTags) {
        if (!rawTags) {
            return [];
        }

        return rawTags.split(",")
            .map(function (tag) {
                return tag.trim();
            })
            .filter(function (tag) {
                return !!tag;
            });
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
        return currentPart.trim();
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
            button.classList.toggle("is-active", index === activeTagSuggestionIndex);
        });
    }

    function applyTagSuggestion(tagName) {
        var rawValue;
        var parts;
        var nextValue;

        if (!videoTagsInput || !tagName) {
            return;
        }

        rawValue = videoTagsInput.value || "";
        parts = rawValue.split(",");

        if (!parts.length) {
            parts = [tagName];
        } else {
            parts[parts.length - 1] = " " + tagName;
        }

        nextValue = parts.join(",").replace(/^ /, "");
        if (!nextValue.endsWith(",")) {
            nextValue += ", ";
        }

        videoTagsInput.value = nextValue;
        updateTextCount(videoTagsInput, videoTagsCount, 500);
        closeTagSuggestions();
        videoTagsInput.focus();
    }

    function escapeHtml(value) {
        return String(value || "")
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\"/g, "&quot;")
            .replace(/'/g, "&#39;");
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
            var tagName = escapeHtml(tag && tag.tagName ? tag.tagName : "");
            var activeClass = index === 0 ? " is-active" : "";
            return '<button type="button" class="tags-suggestion-item' + activeClass + '" data-tag-name="' + tagName + '">' + tagName + '</button>';
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

        if (!file && !currentExistingMediaUrl) {
            throw new Error("업로드할 파일을 선택해주세요.");
        }

        if (!title) {
            throw new Error("제목을 입력해주세요.");
        }

        if (!selectedGalleryId) {
            throw new Error("예술관을 선택해주세요.");
        }

        formData.append("galleryId", String(selectedGalleryId));
        formData.append("title", title);
        formData.append("category", getCurrentMediaCategory(file));
        formData.append("description", description);
        formData.append("licenseType", "");
        formData.append("licenseTerms", "");
        formData.append("isTradable", String(!!(tradeToggle && tradeToggle.checked)));
        formData.append("allowComment", "true");
        formData.append("showSimilar", "true");
        formData.append("linkUrl", linkUrlText.indexOf("blob:") === 0 ? "" : linkUrlText);
        formData.append("auctionEnabled", String(!!(auctionConfig && !auctionConfig.hidden)));
        formData.append("auctionDeadlineHours", String(auctionDeadlineHours));
        if (file) {
            formData.append("mediaFile", file);
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
        var title = toDisplayTitle(file.name);

        uploadScreen.hidden = true;
        uploadScreen.classList.remove("is-active");
        detailsScreen.hidden = false;
        detailsScreen.classList.add("is-active");
        dialogContent.classList.add("is-details");

        if (detailsVideoTitle) {
            detailsVideoTitle.textContent = title;
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
        detailsScreen.classList.remove("is-active");
        uploadScreen.hidden = false;
        uploadScreen.classList.add("is-active");
        dialogContent.classList.remove("is-details");
    }

    function handleFiles(files) {
        var file = files && files[0];

        if (!file) {
            currentMediaFile = null;
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

    closeButton.addEventListener("click", closeModal);

    if (uploadCloseButton) {
        uploadCloseButton.addEventListener("click", closeModal);
    }

    if (detailsCloseButton) {
        detailsCloseButton.addEventListener("click", closeModal);
    }

    if (detailsBackButton) {
        detailsBackButton.addEventListener("click", showUploadScreen);
    }

    aiPromptCloseTargets.forEach(function (target) {
        target.addEventListener("click", closeAiPromptModal);
    });

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

                if (event.key === "Enter" && activeTagSuggestionIndex >= 0) {
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
        });

        videoTagsInput.addEventListener("blur", function () {
            window.setTimeout(closeTagSuggestions, 120);
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

    if (tradeToggle && tradeConfig) {
        tradeToggle.addEventListener("change", function () {
            if (tradeToggle.checked) {
                if (auctionConfig) {
                    auctionConfig.hidden = true;
                }

                if (auctionExpandIcon) {
                    auctionExpandIcon.hidden = false;
                }

                if (auctionCollapseIcon) {
                    auctionCollapseIcon.hidden = true;
                }
            }

            tradeConfig.hidden = !tradeToggle.checked;

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
            var isHidden = auctionConfig.hidden;

            if (isHidden && tradeToggle) {
                tradeToggle.checked = false;

                if (tradeConfig) {
                    tradeConfig.hidden = true;
                }

                if (tradePriceInput) {
                    tradePriceInput.value = "";
                }
            }

            auctionConfig.hidden = !isHidden;

            if (auctionExpandIcon) {
                auctionExpandIcon.hidden = !isHidden;
            }

            if (auctionCollapseIcon) {
                auctionCollapseIcon.hidden = isHidden;
            }
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
                var hours = Number(button.getAttribute("data-hours") || "0");
                var currentHours = Number(auctionDeadlineHoursInput.value || "0");
                var nextHours = currentHours + hours;

                auctionDeadlineSelected.textContent = formatAuctionDeadline(nextHours);
                auctionDeadlineHoursInput.value = String(nextHours);

                auctionDeadlineButtons.forEach(function (item) {
                    item.classList.remove("work-auction-config__deadline-btn--active");
                });

                button.classList.add("work-auction-config__deadline-btn--active");
            });
        });
    }

    if (auctionDeadlineReset && auctionDeadlineSelected && auctionDeadlineHoursInput) {
        auctionDeadlineReset.addEventListener("click", function () {
            auctionDeadlineSelected.textContent = "0시간";
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
    syncDialogSizeToDetailsScreen();
    autoResizeTextarea(videoTitleInput);
    updateTextCount(videoTitleInput, videoTitleCount, 100);
    updateTextCount(videoDescriptionInput, videoDescriptionCount, 5000);
    updateTextCount(videoTagsInput, videoTagsCount, 500);
    setSubmittingState(false);

    if (playlistOptions.length) {
        selectGalleryOption(playlistOptions[0]);
    }

    if (isEditMode() && registerState) {
        if (videoTitleInput) {
            videoTitleInput.value = registerState.getAttribute("data-title") || "";
            autoResizeTextarea(videoTitleInput);
            updateTextCount(videoTitleInput, videoTitleCount, 100);
        }

        if (videoDescriptionInput) {
            videoDescriptionInput.value = registerState.getAttribute("data-description") || "";
            updateTextCount(videoDescriptionInput, videoDescriptionCount, 5000);
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

        renderExistingMediaPreview(currentExistingMediaUrl, currentExistingMediaType);
        updateVideoLink(registerState.getAttribute("data-link-url") || currentExistingMediaUrl, registerState.getAttribute("data-link-url") || currentExistingMediaUrl);
        showDetailsScreen({ name: registerState.getAttribute("data-title") || "업로드 파일" });
    }

    window.addEventListener("resize", syncDialogSizeToDetailsScreen);
}

if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeWorkRegister);
} else {
    initializeWorkRegister();
}
