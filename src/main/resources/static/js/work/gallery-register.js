document.addEventListener("DOMContentLoaded", function () {
    var modal = document.getElementById("galleryModal");
    var closeBtn = document.getElementById("closeBtn");
    var titleBox = document.getElementById("titleBox");
    var descBox = document.getElementById("descBox");
    var titleCount = document.getElementById("titleCount");
    var descCount = document.getElementById("descCount");
    var titleError = document.getElementById("titleError");
    var thumbInput = document.getElementById("thumbInput");
    var thumbBtn = document.getElementById("thumbBtn");
    var thumbShell = document.querySelector(".thumb-btn");
    var thumbPreviewImage = document.getElementById("thumbPreviewImage");
    var thumbError = document.getElementById("thumbError");
    var tagList = document.getElementById("tagList");
    var tagInput = document.getElementById("tagInput");
    var galleryLinkUrl = document.getElementById("galleryLinkUrl");
    var galleryLinkCopyButton = document.getElementById("galleryLinkCopyButton");
    var thumbLinkMeta = document.getElementById("thumbLinkMeta");
    var openArtworkModalBtn = document.getElementById("openArtworkModalBtn");
    var artworkDialogBackdrop = document.getElementById("artworkDialogBackdrop");
    var closeArtworkModalBtn = document.getElementById("closeArtworkModalBtn");
    var cancelArtworkModalBtn = document.getElementById("cancelArtworkModalBtn");
    var confirmArtworkModalBtn = document.getElementById("confirmArtworkModalBtn");
    var artworkList = document.getElementById("artworkList");
    var selectedArtworkList = document.getElementById("selectedArtworkList");
    var selectedArtworkLinks = document.getElementById("selectedArtworkLinks");
    var artworkSearchInput = document.getElementById("artworkSearchInput");
    var createBtn = document.getElementById("createBtn");
    var isSubmitting = false;
    var previewUrl = "";
    var thumbOk = false;
    var tags = [];
    var committedArtworkLinks = [];

    if (!modal || !titleBox || !descBox || !createBtn) {
        return;
    }

    function closeModal() {
        modal.style.display = "none";
    }

    function setCaretEnd(node) {
        var range;
        var sel;

        if (!node || !window.getSelection || !document.createRange) {
            return;
        }

        range = document.createRange();
        range.selectNodeContents(node);
        range.collapse(false);
        sel = window.getSelection();
        sel.removeAllRanges();
        sel.addRange(range);
    }

    function getText(node, max) {
        var text = "";

        if (!node) {
            return text;
        }

        text = node.textContent.replace(/\u00a0/g, " ").replace(/\s+\n/g, "\n");

        if (text.length > max) {
            text = text.slice(0, max);
            node.textContent = text;
            setCaretEnd(node);
        }

        return text.trim();
    }

    function setCount(node, countNode, max) {
        var text = getText(node, max);
        countNode.textContent = String(text.length) + "/" + String(max);
        return text;
    }

    function setTitleError(show) {
        if (!titleError) {
            titleBox.setAttribute("aria-invalid", show ? "true" : "false");
            return;
        }

        titleError.hidden = !show;
        titleBox.setAttribute("aria-invalid", show ? "true" : "false");
    }

    function clearPreviewUrl() {
        if (previewUrl) {
            URL.revokeObjectURL(previewUrl);
            previewUrl = "";
        }
    }

    function setThumbError(message) {
        thumbError.textContent = message || "";
        thumbError.hidden = !message;
    }

    function syncCreateBtn() {
        var hasTitle = setCount(titleBox, titleCount, 150).length > 0;
        createBtn.disabled = isSubmitting || !(hasTitle && thumbOk);
    }

    function syncGalleryLink(url) {
        if (!galleryLinkUrl) {
            return;
        }

        galleryLinkUrl.textContent = url || "";
        galleryLinkUrl.href = url || "#";
    }

    function copyGalleryLink() {
        if (!galleryLinkUrl || !navigator.clipboard || !navigator.clipboard.writeText) {
            return;
        }

        navigator.clipboard.writeText(galleryLinkUrl.textContent.trim()).catch(function () {
        });
    }

    function openArtworkModal() {
        if (!artworkDialogBackdrop) {
            return;
        }

        artworkDialogBackdrop.hidden = false;
    }

    function closeArtworkModal() {
        if (!artworkDialogBackdrop) {
            return;
        }

        artworkDialogBackdrop.hidden = true;
    }

    function getArtworkCheckboxes() {
        if (!artworkList) {
            return [];
        }

        return Array.prototype.slice.call(artworkList.querySelectorAll(".artwork-checkbox"));
    }

    function getSelectedArtworkData() {
        return getArtworkCheckboxes().filter(function (checkbox) {
            return checkbox.checked;
        }).map(function (checkbox) {
            var row = checkbox.closest(".artwork-row");
            var titleNode = row ? row.querySelector(".artwork-row-title") : null;
            var title = titleNode ? titleNode.textContent.trim() : checkbox.value;
            var link = row ? row.getAttribute("data-link") : "#";
            var thumb = row ? row.getAttribute("data-thumb") : "";

            return {
                title: title,
                link: link || "#",
                thumb: thumb || ""
            };
        });
    }

    function renderSelectedArtworks() {
        var selectedData = getSelectedArtworkData();
        var selectedItems = selectedData.map(function (item) {
            return '<div class="artwork-selection-item">' +
                '<span class="artwork-thumb artwork-thumb-selection">' +
                '<img src="' + item.thumb + '" alt="' + item.title + ' 썸네일">' +
                '</span>' +
                '<div class="artwork-selection-title">' + item.title + '</div>' +
                '</div>';
        }).join("");

        if (!selectedArtworkList) {
            return;
        }

        selectedArtworkList.innerHTML = selectedItems || '<div class="artwork-selection-empty">선택한 작품이 여기에 표시됩니다.</div>';

        if (confirmArtworkModalBtn) {
            confirmArtworkModalBtn.disabled = !selectedItems;
        }
    }

    function renderSelectedArtworkLinks() {
        var selectedData = committedArtworkLinks;
        var items;

        if (!selectedArtworkLinks) {
            return;
        }

        items = selectedData.map(function (item) {
            return '<div class="selected-artwork-link-item">' +
                '<span class="artwork-thumb artwork-thumb-link">' +
                '<img src="' + item.thumb + '" alt="' + item.title + ' 썸네일">' +
                '</span>' +
                '<div class="selected-artwork-link-content">' +
                '<div class="selected-artwork-link-title">' + item.title + '</div>' +
                '<a href="' + item.link + '">' + item.link + '</a>' +
                '</div>' +
                '</div>';
        }).join("");

        selectedArtworkLinks.innerHTML = items || '<div class="selected-artwork-empty">추가된 작품 링크가 여기에 표시됩니다.</div>';
    }

    function filterArtworks() {
        var keyword = artworkSearchInput ? artworkSearchInput.value.trim().toLowerCase() : "";

        getArtworkCheckboxes().forEach(function (checkbox) {
            var row = checkbox.closest(".artwork-row");
            var titleNode = row ? row.querySelector(".artwork-row-title") : null;
            var title = titleNode ? titleNode.textContent.toLowerCase() : "";

            if (!row) {
                return;
            }

            row.hidden = !!keyword && title.indexOf(keyword) === -1;
        });
    }

    function renderTags() {
        var chips = "";

        if (!tagList) {
            return;
        }

        chips = tags.map(function (tag, index) {
            return '<span class="tag-chip">' +
                '<span>' + tag + '</span>' +
                '<button type="button" data-tag-index="' + index + '" aria-label="' + tag + ' 삭제">x</button>' +
                '</span>';
        }).join("");

        tagList.innerHTML = chips;
    }

    function addTag(rawValue) {
        var value = (rawValue || "").trim();

        if (!value || tags.indexOf(value) > -1) {
            return;
        }

        tags.push(value);
        renderTags();
    }

    function getSelectedWorkIds() {
        return getArtworkCheckboxes().filter(function (checkbox) {
            return checkbox.checked;
        }).map(function (checkbox) {
            var numericId = Number(checkbox.value);
            return Number.isNaN(numericId) ? null : numericId;
        }).filter(function (workId) {
            return workId !== null;
        });
    }

    function setSubmitting(submitting) {
        isSubmitting = submitting;
        createBtn.textContent = submitting ? "만드는 중..." : "만들기";
        syncCreateBtn();
    }

    function createGallery() {
        var formData;
        var title = setCount(titleBox, titleCount, 150);
        var description = setCount(descBox, descCount, 500);
        var coverFile = thumbInput.files && thumbInput.files[0];
        var workIds = getSelectedWorkIds();

        if (!title) {
            setTitleError(true);
            titleBox.focus();
            return;
        }

        if (!coverFile) {
            setThumbError("대표 이미지를 업로드해 주세요.");
            return;
        }

        formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("coverFile", coverFile);

        tags.forEach(function (tag) {
            formData.append("tagNames", tag);
        });

        workIds.forEach(function (workId) {
            formData.append("workIds", String(workId));
        });

        setSubmitting(true);

        fetch("/api/galleries", {
            method: "POST",
            body: formData
        })
            .then(function (response) {
                if (response.redirected) {
                    throw new Error("login required");
                }

                if (!response.ok) {
                    return response.text().then(function (message) {
                        throw new Error(message || "예술관 생성에 실패했습니다.");
                    });
                }

                return response.json();
            })
            .then(function (data) {
                var redirectUrl = data && data.redirectUrl;
                window.location.href = redirectUrl || "/profile";
            })
            .catch(function (error) {
                if (error.message === "login required") {
                    window.alert("로그인이 필요합니다.");
                    window.location.href = "/";
                    return;
                }

                window.alert(error.message || "예술관 생성 중 오류가 발생했습니다.");
            })
            .finally(function () {
                setSubmitting(false);
            });
    }

    function resetThumb() {
        clearPreviewUrl();
        thumbOk = false;
        thumbInput.value = "";
        if (thumbPreviewImage) {
            thumbPreviewImage.removeAttribute("src");
        }
        if (thumbShell) {
            thumbShell.classList.remove("is-filled");
        }
        if (thumbLinkMeta) {
            thumbLinkMeta.hidden = true;
        }
        syncGalleryLink("");
        setThumbError("");
        syncCreateBtn();
    }

    function applyThumb(file) {
        clearPreviewUrl();
        previewUrl = URL.createObjectURL(file);
        thumbOk = true;
        if (thumbPreviewImage) {
            thumbPreviewImage.src = previewUrl;
        }
        if (thumbShell) {
            thumbShell.classList.add("is-filled");
        }
        if (thumbLinkMeta) {
            thumbLinkMeta.hidden = false;
        }
        syncGalleryLink(previewUrl);
        setThumbError("");
        syncCreateBtn();
    }

    function onThumbFile(file) {
        if (!file) {
            resetThumb();
            return;
        }

        if (!/^image\/(jpeg|png|gif)$/i.test(file.type)) {
            thumbOk = false;
            setThumbError("JPG, PNG 또는 GIF 파일만 업로드할 수 있습니다.");
            syncCreateBtn();
            return;
        }

        applyThumb(file);
    }

    closeBtn.addEventListener("click", closeModal);

    titleBox.addEventListener("input", function () {
        var hasTitle = setCount(titleBox, titleCount, 150).length > 0;
        setTitleError(!hasTitle);
        syncCreateBtn();
    });

    titleBox.addEventListener("blur", function () {
        setTitleError(setCount(titleBox, titleCount, 150).length === 0);
    });

    descBox.addEventListener("input", function () {
        setCount(descBox, descCount, 500);
    });

    thumbBtn.addEventListener("click", function () {
        thumbInput.click();
    });

    if (galleryLinkUrl) {
        galleryLinkUrl.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            copyGalleryLink();
        });
    }

    if (galleryLinkCopyButton) {
        galleryLinkCopyButton.addEventListener("click", function (event) {
            event.preventDefault();
            event.stopPropagation();
            copyGalleryLink();
        });
    }

    thumbInput.addEventListener("change", function () {
        onThumbFile(thumbInput.files && thumbInput.files[0]);
    });

    if (openArtworkModalBtn) {
        openArtworkModalBtn.addEventListener("click", openArtworkModal);
    }

    if (closeArtworkModalBtn) {
        closeArtworkModalBtn.addEventListener("click", closeArtworkModal);
    }

    if (cancelArtworkModalBtn) {
        cancelArtworkModalBtn.addEventListener("click", closeArtworkModal);
    }

    if (confirmArtworkModalBtn) {
        confirmArtworkModalBtn.addEventListener("click", function () {
            committedArtworkLinks = getSelectedArtworkData();
            renderSelectedArtworkLinks();
            closeArtworkModal();
        });
    }

    if (artworkDialogBackdrop) {
        artworkDialogBackdrop.addEventListener("click", function (event) {
            if (event.target === artworkDialogBackdrop) {
                closeArtworkModal();
            }
        });
    }

    if (artworkList) {
        artworkList.addEventListener("change", function (event) {
            if (event.target && event.target.classList.contains("artwork-checkbox")) {
                renderSelectedArtworks();
            }
        });
    }

    if (artworkSearchInput) {
        artworkSearchInput.addEventListener("input", filterArtworks);
    }

    if (tagInput && tagList) {
        tagInput.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === ",") {
                event.preventDefault();
                addTag(tagInput.value.replace(/,/g, ""));
                tagInput.value = "";
            }

            if (event.key === "Backspace" && !tagInput.value && tags.length) {
                tags.pop();
                renderTags();
            }
        });

        tagInput.addEventListener("blur", function () {
            if (tagInput.value.trim()) {
                addTag(tagInput.value.replace(/,/g, ""));
                tagInput.value = "";
            }
        });

        tagList.addEventListener("click", function (event) {
            var button = event.target.closest("button[data-tag-index]");
            var index;

            if (!button) {
                return;
            }

            index = Number(button.getAttribute("data-tag-index"));

            if (Number.isNaN(index)) {
                return;
            }

            tags.splice(index, 1);
            renderTags();
            tagInput.focus();
        });
    }

    createBtn.addEventListener("click", function () {
        setTitleError(setCount(titleBox, titleCount, 150).length === 0);
        syncCreateBtn();
        if (!createBtn.disabled) {
            createGallery();
        }
    });

    setCount(titleBox, titleCount, 150);
    setCount(descBox, descCount, 500);
    resetThumb();
    renderTags();
    renderSelectedArtworks();
    renderSelectedArtworkLinks();
    syncGalleryLink("");
    setTitleError(false);
    syncCreateBtn();
});
