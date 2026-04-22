const workDetails = [];
const currentWorkId = Number(window.location.pathname.split("/").filter(Boolean).pop() || "0");

function getCurrentWorkId() {
    return Number.isFinite(currentWorkId) && currentWorkId > 0 ? currentWorkId : null;
}

function getMediaFiles(detail) {
    return Array.isArray(detail?.files) ? detail.files : [];
}

function isThumbnailFile(file) {
    return Number(file?.sortOrder) === 0;
}

function isMediaFile(file) {
    return Number(file?.sortOrder) > 0;
}

function getThumbnailSource(detail) {
    const files = getMediaFiles(detail);
    const thumbnailFile = files.find((file) => isThumbnailFile(file) && String(file?.fileType || "").startsWith("image/"));
    const imageFile = files.find((file) => String(file?.fileType || "").startsWith("image/"));
    const firstFile = files[0];

    return thumbnailFile?.fileUrl || imageFile?.fileUrl || firstFile?.fileUrl || "";
}

function getMediaSource(detail) {
    const files = getMediaFiles(detail);

    if (detail?.category === "VIDEO") {
        const videoFile = files.find((file) => isMediaFile(file) && String(file?.fileType || "").startsWith("video/"))
            || files.find((file) => String(file?.fileType || "").startsWith("video/"));
        return videoFile?.fileUrl || "";
    }

    const imageFile = files.find((file) => isMediaFile(file) && String(file?.fileType || "").startsWith("image/"))
        || files.find((file) => !isThumbnailFile(file) && String(file?.fileType || "").startsWith("image/"))
        || files.find((file) => String(file?.fileType || "").startsWith("image/"));
    return imageFile?.fileUrl || "";
}

function getAvatarText(nickname) {
    const base = String(nickname || "").replace(/^@/, "").trim();
    return base ? base.charAt(0).toUpperCase() : "@";
}

function isTruthyFlag(value) {
    if (typeof value === "boolean") {
        return value;
    }

    if (typeof value === "number") {
        return value > 0;
    }

    const normalized = String(value || "").trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "y" || normalized === "yes";
}

function resolveMarketType(detail) {
    if (isTruthyFlag(detail?.hasActiveAuction)) {
        return "auction";
    }

    if (isTruthyFlag(detail?.isTradable)) {
        return "trade";
    }

    if (Number(detail?.price) > 0) {
        return "trade";
    }

    return "";
}

function formatRelativeTime(dateTime) {
    if (!dateTime) {
        return "";
    }

    const target = new Date(dateTime);
    if (Number.isNaN(target.getTime())) {
        return "";
    }

    const diff = Date.now() - target.getTime();
    const minute = 60 * 1000;
    const hour = 60 * minute;
    const day = 24 * hour;

    if (diff < minute) {
        return "방금 전";
    }
    if (diff < hour) {
        return `${Math.floor(diff / minute)}분 전`;
    }
    if (diff < day) {
        return `${Math.floor(diff / hour)}시간 전`;
    }
    if (diff < 30 * day) {
        return `${Math.floor(diff / day)}일 전`;
    }

    return `${target.getFullYear()}.${String(target.getMonth() + 1).padStart(2, "0")}.${String(target.getDate()).padStart(2, "0")}`;
}

function formatPublishedDate(dateTime) {
    const target = new Date(dateTime);
    if (Number.isNaN(target.getTime())) {
        return "";
    }

    return `${target.getMonth() + 1}월 ${target.getDate()}일`;
}

function formatPublishedYear(dateTime) {
    const target = new Date(dateTime);
    if (Number.isNaN(target.getTime())) {
        return "";
    }

    return `${target.getFullYear()}년`;
}

function normalizeComment(comment) {
    return {
        id: comment.id,
        author: `@${comment.memberNickname || "user"}`,
        avatar: comment.memberProfileImage || "",
        time: formatRelativeTime(comment.createdDatetime),
        text: comment.content || "",
        likes: comment.likeCount || 0,
        isLiked: Boolean(comment.isLiked),
        isOwner: Boolean(comment.isOwner),
        replies: Array.isArray(comment.replies) ? comment.replies.map(normalizeComment) : []
    };
}

function buildPivotData(galleryDetail, workId) {
    if (!galleryDetail || !Array.isArray(galleryDetail.works) || !galleryDetail.works.length) {
        return {
            pivotThumb: "",
            pivotTitle: "",
            pivotAvatar: "",
            pivotArtist: "",
            pivotCount: "",
            pivotItems: []
        };
    }

    const pivotItems = galleryDetail.works
        .filter((work) => work && work.id !== workId)
        .map((work) => ({
            image: work.thumbnailUrl || "",
            meta: work.title || "",
            href: `/work/detail/${work.id}`
        }));

    return {
        pivotThumb: galleryDetail.coverImage || galleryDetail.works[0]?.thumbnailUrl || "",
        pivotTitle: galleryDetail.title || "",
        pivotAvatar: galleryDetail.memberProfileImage || "",
        pivotArtist: galleryDetail.memberNickname ? `@${galleryDetail.memberNickname}` : "",
        pivotCount: `작품 ${galleryDetail.workCount || galleryDetail.works.length || 0}개`,
        pivotItems
    };
}

async function normalizeWorkDetail(detail) {
    const mediaSource = getMediaSource(detail);
    const thumbnailSource = getThumbnailSource(detail) || mediaSource;
    const isVideo = detail.category === "VIDEO" && Boolean(mediaSource);
    const primaryVisualSource = isVideo ? thumbnailSource : (mediaSource || thumbnailSource);
    const createdDate = detail.createdDatetime || detail.updatedDatetime;
    const marketType = resolveMarketType(detail);
    let pivotData = {
        pivotThumb: "",
        pivotTitle: "",
        pivotAvatar: "",
        pivotArtist: "",
        pivotCount: "",
        pivotItems: []
    };

    if (detail.galleryId) {
        try {
            const galleryDetail = await apiRequest(`/api/galleries/${detail.galleryId}`);
            pivotData = buildPivotData(galleryDetail, detail.id);
        } catch (_) {
            pivotData = {
                pivotThumb: "",
                pivotTitle: "",
                pivotAvatar: "",
                pivotArtist: "",
                pivotCount: "",
                pivotItems: []
            };
        }
    }

    return {
        id: detail.id,
        thumb: primaryVisualSource,
        videoSrc: isVideo ? mediaSource : "",
        thumbAlt: detail.title || "작품",
        caption: detail.title || "",
        likeCount: formatDisplayCount(detail.likeCount || 0, { compact: true }),
        viewCount: formatDisplayCount(detail.viewCount || 0),
        publishedDate: formatPublishedDate(createdDate),
        publishedYear: formatPublishedYear(createdDate),
        commentCount: formatDisplayCount(detail.commentCount || 0),
        shareLabel: "공유",
        remixLabel: marketType === "auction" ? "경매하기" : marketType === "trade" ? "거래하기" : "",
        marketType,
        avatarText: getAvatarText(detail.memberNickname),
        channel: `@${detail.memberNickname || "artist"}`,
        isOwner: Boolean(detail.isOwner),
        subscribe: "팔로우",
        desc: detail.description || "",
        headline: detail.title || "",
        isBookmarked: Boolean(detail.isBookmarked),
        isLiked: Boolean(detail.isLiked),
        shareUrl: `${window.location.origin}/work/detail/${detail.id}`,
        comments: Array.isArray(detail.comments) ? detail.comments.map(normalizeComment) : [],
        ...pivotData
    };
}

async function loadScrollableWorkDetails(detail) {
    if (!detail) {
        return [];
    }

    if (!detail.galleryId) {
        return [detail];
    }

    try {
        const galleryDetail = await apiRequest(`/api/galleries/${detail.galleryId}`);
        const relatedWorkIds = Array.isArray(galleryDetail?.works)
            ? galleryDetail.works
                .map((work) => work && work.id)
                .filter((id) => Number.isFinite(id) && id > 0)
            : [];
        const orderedWorkIds = [detail.id].concat(relatedWorkIds.filter((id) => id !== detail.id));
        const resolvedDetails = await Promise.all(orderedWorkIds.map((id) => {
            if (id === detail.id) {
                return Promise.resolve(detail);
            }

            return apiRequest(`/api/works/${id}`).catch(() => null);
        }));

        return resolvedDetails.filter(Boolean);
    } catch (_) {
        return [detail];
    }
}

async function apiRequest(url, options = {}) {
    const response = await fetch(url, {
        headers: {
            ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
            ...(options.headers || {})
        },
        ...options
    });

    if (!response.ok) {
        const text = await response.text();
        throw new Error(text || "요청 처리에 실패했습니다.");
    }

    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
        return response.json();
    }

    return null;
}

// UI 아이콘 경로 정의
const playIconPath = "M7 5.2v13.6c0 .73.8 1.18 1.43.8L19.98 13a.92.92 0 0 0 0-1.6L8.43 4.4A.92.92 0 0 0 7 5.2Z";
const pauseIconPath = "M6.5 3A1.5 1.5 0 005 4.5v15A1.5 1.5 0 006.5 21h2a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 008.5 3h-2Zm9 0A1.5 1.5 0 0014 4.5v15a1.5 1.5 0 001.5 1.5h2a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0017.5 3h-2Z";
const volumeHighIconPath = "M11.485 2.143 3.913 6.687A6 6 0 001 11.832v.338a6 6 0 002.913 5.144l7.572 4.543A1 1 0 0013 21V3a1.001 1.001 0 00-1.515-.857Zm6.88 2.079a1 1 0 00-.001 1.414 9 9 0 010 12.728 1 1 0 001.414 1.414 11 11 0 000-15.556 1 1 0 00-1.413 0Zm-2.83 2.828a1 1 0 000 1.415 5 5 0 010 7.07 1 1 0 001.415 1.415 6.999 6.999 0 000-9.9 1 1 0 00-1.415 0Z";
const volumeLowIconPath = "M11.485 2.143 3.913 6.687A6 6 0 001 11.832v.338a6 6 0 002.913 5.144l7.572 4.543A1 1 0 0013 21V3a1.001 1.001 0 00-1.515-.857Zm4.697 4.907a1 1 0 000 1.415 5 5 0 010 7.07 1 1 0 001.415 1.415 6.999 6.999 0 000-9.9 1 1 0 00-1.415 0Z";
const volumeMuteIconPath = "M11.485 2.143 3.913 6.687A6 6 0 001 11.832v.338a6 6 0 002.913 5.144l7.572 4.543A1 1 0 0013 21V3a1.001 1.001 0 00-1.515-.857Zm5.222 6.443a1 1 0 0 0-1.414 0L13.88 10l-1.414-1.414a1 1 0 1 0-1.414 1.414L12.466 11.414l-1.414 1.414a1 1 0 0 0 1.414 1.414l1.414-1.414 1.414 1.414a1 1 0 0 0 1.414-1.414L15.294 11.414l1.413-1.414a1 1 0 0 0 0-1.414Z";
const commentLikeOutlinePath = "M9.221 1.795a1 1 0 011.109-.656l1.04.173a4 4 0 013.252 4.784L14 9h4.061a3.664 3.664 0 013.576 2.868A3.68 3.68 0 0121 14.85l.02.087A3.815 3.815 0 0120 18.5v.043l-.01.227a2.82 2.82 0 01-.135.663l-.106.282A3.754 3.754 0 0116.295 22h-3.606l-.392-.007a12.002 12.002 0 01-5.223-1.388l-.343-.189-.27-.154a2.005 2.005 0 00-.863-.26l-.13-.004H3.5a1.5 1.5 0 01-1.5-1.5V12.5A1.5 1.5 0 013.5 11h1.79l.157-.013a1 1 0 00.724-.512l.063-.145 2.987-8.535Zm-1.1 9.196A3 3 0 015.29 13H4v4.998h1.468a4 4 0 011.986.528l.27.155.285.157A10 10 0 0012.69 20h3.606c.754 0 1.424-.483 1.663-1.2l.03-.126a.819.819 0 00.012-.131v-.872l.587-.586c.388-.388.577-.927.523-1.465l-.038-.23-.02-.087-.21-.9.55-.744A1.663 1.663 0 0018.061 11H14a2.002 2.002 0 01-1.956-2.418l.623-2.904a2 2 0 00-1.626-2.392l-.21-.035-2.71 7.741Z";
const commentLikeFilledPath = "M2 10.5A1.5 1.5 0 0 1 3.5 9h2.614a.25.25 0 0 0 .239-.183l1.265-4.427A2.75 2.75 0 0 1 10.262 2a.75.75 0 0 1 .75.75v5.999a.75.75 0 0 0 .75.75h6.112a2.25 2.25 0 0 1 2.174 2.835l-1.209 4.836A3.75 3.75 0 0 1 15.201 20H8.574a3.75 3.75 0 0 1-1.06-.153L4.158 18.79A1.5 1.5 0 0 1 2 17.35v-6.85Z";
const bookmarkOutlinePath = "M19 2H5a2 2 0 00-2 2v16.887c0 1.266 1.382 2.048 2.469 1.399L12 18.366l6.531 3.919c1.087.652 2.469-.131 2.469-1.397V4a2 2 0 00-2-2ZM5 20.233V4h14v16.233l-6.485-3.89-.515-.309-.515.309L5 20.233Z";
const bookmarkFilledPath = "M5 2a2 2 0 0 0-2 2v16.887c0 1.266 1.382 2.048 2.469 1.399L12 18.366l6.531 3.919c1.087.652 2.469-.131 2.469-1.397V4a2 2 0 0 0-2-2H5Z";
const tradeIconPath = "M21.5 4h-19A1.5 1.5 0 001 5.5v13A1.5 1.5 0 002.5 20h19a1.5 1.5 0 001.5-1.5v-13A1.5 1.5 0 0021.5 4ZM3 18V6h18v12H3Zm9-11.5a1 1 0 00-1 1v.638c-.357.101-.689.26-.979.49A2.35 2.35 0 009.13 10.5c-.007.424.112.84.342 1.197.21.31.497.563.831.734.546.29 1.23.411 1.693.502.557.109.899.19 1.117.315.087.048.11.082.114.09.004.005.028.044.028.162 0 .024-.008.118-.165.235-.162.122-.5.27-1.09.27-.721 0-1.049-.21-1.181-.323a.7.7 0 01-.132-.15l-.01-.018.005.013.006.014.002.009a.996.996 0 00-1.884.64l.947-.316-.003.001c-.9.3-.942.315-.943.317l.001.003.003.006.004.015.012.032c.045.111.1.218.162.321.146.236.324.444.535.624.357.306.841.566 1.476.702v.605a1 1 0 002 0v-.614c1.29-.289 2.245-1.144 2.245-2.386 0-.44-.103-.852-.327-1.212-.22-.355-.52-.6-.82-.77-.555-.316-1.244-.445-1.719-.539-.568-.111-.915-.185-1.143-.305a.5.5 0 01-.1-.07l-.004-.002V10.6a.401.401 0 01-.012-.1c0-.158.053-.244.14-.314.109-.086.34-.19.74-.19.373-.001.73.144.997.404a.995.995 0 001.518-1.286l-.699.58.698-.582v-.001l-.002-.001-.002-.003-.006-.006-.016-.018a2.984 2.984 0 00-.178-.182A3.44 3.44 0 0013 8.154V7.5a1 1 0 00-1-1Z";
const auctionIconPath = "M4.222 4.223a11 11 0 000 15.555 1 1 0 101.414-1.414 9 9 0 010-12.727 1 1 0 10-1.414-1.414Zm13.79.353a1 1 0 000 1.414 8.5 8.5 0 010 12.022 1 1 0 001.413 1.414 10.501 10.501 0 000-14.85 1 1 0 00-1.413 0Zm-2.83 2.827a1 1 0 000 1.414 4.501 4.501 0 010 6.365 1.001 1.001 0 001.414 1.414 6.5 6.5 0 000-9.193 1 1 0 00-1.415 0Zm-7.78 0a6.5 6.5 0 000 9.194 1 1 0 001.415-1.415 4.5 4.5 0 010-6.364 1.001 1.001 0 00-1.415-1.415ZM12 10a2 2 0 100 4 2 2 0 000-4Z";

// 전역 루트 노드 캐시
const pageStack = document.getElementById("page-stack");
const workPageTemplate = document.getElementById("work-page-template");
const navigationButtonUp = document.getElementById("navigation-button-up");
const navigationButtonDown = document.getElementById("navigation-button-down");

// 브라우저별 전체화면 API 래퍼
function getFullscreenElement() {
    return document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement || null;
}

async function requestElementFullscreen(element) {
    if (element.requestFullscreen) {
        return element.requestFullscreen();
    }

    if (element.webkitRequestFullscreen) {
        return element.webkitRequestFullscreen();
    }

    if (element.msRequestFullscreen) {
        return element.msRequestFullscreen();
    }

    throw new Error("Fullscreen API unavailable");
}

async function exitAnyFullscreen() {
    if (document.exitFullscreen) {
        return document.exitFullscreen();
    }

    if (document.webkitExitFullscreen) {
        return document.webkitExitFullscreen();
    }

    if (document.msExitFullscreen) {
        return document.msExitFullscreen();
    }

    throw new Error("Fullscreen exit unavailable");
}

function supportsFullscreenApi(element) {
    return Boolean(
        element?.requestFullscreen ||
        element?.webkitRequestFullscreen ||
        element?.msRequestFullscreen
    );
}

// 템플릿의 data-field/data-role에 작품 데이터를 주입
function bindPageData(page, data) {
    Object.entries(data).forEach(([key, value]) => {
        page.querySelectorAll(`[data-field="${key}"]`).forEach((node) => {
            if (node.tagName === "IMG") {
                node.src = value;
                if (key === "thumb") {
                    node.alt = data.thumbAlt || "";
                }
                return;
            }

            node.textContent = value;
        });
    });

    const thumbVideo = page.querySelector('[data-role="thumb-video"]');
    const thumbImage = page.querySelector('[data-field="thumb"]');
    const hasVideo = Boolean(data.videoSrc);

    if (thumbVideo) {
        if (hasVideo) {
            thumbVideo.src = data.videoSrc;
            thumbVideo.poster = data.thumb || "";
            thumbVideo.hidden = false;
            thumbVideo.currentTime = 0;
            thumbVideo.muted = true;
            thumbVideo.defaultMuted = true;
            thumbVideo.loop = true;
            thumbVideo.playsInline = true;
            thumbVideo.autoplay = true;
            thumbVideo.preload = "auto";
            thumbVideo.load();
            requestAnimationFrame(() => {
                thumbVideo.play().catch(() => {});
            });
        } else {
            thumbVideo.pause();
            thumbVideo.removeAttribute("src");
            thumbVideo.removeAttribute("poster");
            thumbVideo.load();
            thumbVideo.hidden = true;
        }
    }

    if (thumbImage) {
        thumbImage.hidden = false;
    }

    page.querySelectorAll("[data-action-label]").forEach((button) => {
        const text = button.querySelector("[data-field]")?.textContent?.trim();
        if (text) {
            button.setAttribute("aria-label", text);
        }
    });

    const marketButton = page.querySelector('[data-role="market-button"]');
    const marketIconPath = page.querySelector('[data-role="market-icon-path"]');
    const marketIconSvg = marketButton?.querySelector("svg");
    const pivotButton = page.querySelector('[data-role="pivot-button"]');
    const hasMarketAction = data.marketType === "trade" || data.marketType === "auction";
    const hasPivotItems = Array.isArray(data.pivotItems) && data.pivotItems.length > 0;

    if (marketButton) {
        marketButton.hidden = !hasMarketAction;
        marketButton.style.display = hasMarketAction ? "" : "none";
        marketButton.dataset.marketType = data.marketType || "";
        marketButton.setAttribute("aria-hidden", hasMarketAction ? "false" : "true");
    }

    if (hasMarketAction && marketIconPath) {
        marketIconPath.setAttribute("d", data.marketType === "auction" ? auctionIconPath : tradeIconPath);
    }

    if (marketIconSvg) {
        marketIconSvg.style.transform = data.marketType === "trade" ? "scale(1.14)" : "";
        marketIconSvg.style.transformOrigin = "center";
    }

    if (pivotButton) {
        pivotButton.hidden = !hasPivotItems;
        pivotButton.style.display = hasPivotItems ? "" : "none";
        pivotButton.setAttribute("aria-hidden", hasPivotItems ? "false" : "true");
    }
}

// 댓글/답글 렌더링에 사용하는 기본 유틸
function escapeHtml(value) {
    return String(value ?? "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function parseDisplayCount(value) {
    const text = String(value ?? "").trim().replaceAll(",", "");
    if (!text) {
        return 0;
    }

    if (text.endsWith("만")) {
        const numeric = Number.parseFloat(text.slice(0, -1));
        return Number.isFinite(numeric) ? Math.round(numeric * 10000) : 0;
    }

    const numeric = Number.parseInt(text, 10);
    return Number.isFinite(numeric) ? numeric : 0;
}

function formatDisplayCount(value, { compact = false } = {}) {
    const numeric = Math.max(0, Number(value) || 0);

    if (compact && numeric >= 10000) {
        const manValue = numeric / 10000;
        const formatted = Number.isInteger(manValue) ? String(manValue) : manValue.toFixed(1).replace(/\.0$/, "");
        return `${formatted}만`;
    }

    return new Intl.NumberFormat("ko-KR").format(numeric);
}

function updateVoteButtonState(button, isActive) {
    if (!button) {
        return;
    }

    button.classList.toggle("is-active", isActive);
    button.setAttribute("aria-pressed", isActive ? "true" : "false");
    const iconPath = button.querySelector('[data-role="comment-like-icon-path"]');
    if (iconPath) {
        iconPath.setAttribute("d", isActive ? commentLikeFilledPath : commentLikeOutlinePath);
    }
}

function bindVotePair({ likeButton, dislikeButton, countNode, initialCount = 0, compactCount = false }) {
    let voteState = 0;
    const baseCount = initialCount;

    const sync = () => {
        updateVoteButtonState(likeButton, voteState === 1);
        updateVoteButtonState(dislikeButton, voteState === -1);

        if (countNode) {
            const total = baseCount + (voteState === 1 ? 1 : 0);
            countNode.textContent = formatDisplayCount(total, { compact: compactCount });
        }
    };

    if (likeButton) {
        likeButton.addEventListener("click", () => {
            voteState = voteState === 1 ? 0 : 1;
            sync();
        });
    }

    if (dislikeButton) {
        dislikeButton.addEventListener("click", () => {
            voteState = voteState === -1 ? 0 : -1;
            sync();
        });
    }

    sync();
}

function formatCommentVoteCount(baseCount, voteState) {
    if (voteState === 1 || voteState === -1) {
        return `좋아요 ${formatDisplayCount(baseCount + 1)}`;
    }

    if (baseCount > 0) {
        return `좋아요 ${formatDisplayCount(baseCount)}`;
    }

    return "";
}

function renderCommentsList(commentsList, comments) {
    if (!commentsList) {
        return;
    }

    commentsList.innerHTML = (comments || []).map(renderCommentItem).join("");
}

function updateCommentTree(comments, commentId, updater) {
    return (comments || []).map((comment) => {
        if (comment.id === commentId) {
            return updater(comment);
        }

        return {
            ...comment,
            replies: Array.isArray(comment.replies) ? updateCommentTree(comment.replies, commentId, updater) : []
        };
    });
}

function removeCommentTree(comments, commentId) {
    return (comments || [])
        .filter((comment) => comment.id !== commentId)
        .map((comment) => ({
            ...comment,
            replies: Array.isArray(comment.replies) ? removeCommentTree(comment.replies, commentId) : []
        }));
}

function updateCountFields(page, fieldName, value, compact = false) {
    page.querySelectorAll(`[data-field="${fieldName}"]`).forEach((node) => {
        node.textContent = formatDisplayCount(value || 0, { compact });
    });
}

// 댓글 패널 마크업 렌더링
function renderReplyItem(reply) {
    return `
        <article class="rp" data-comment-id="${escapeHtml(reply.id || "")}">
            <div class="rp-ln"></div>
            <button class="rp-av" type="button" aria-label="${escapeHtml(reply.author)}">
                <img src="${escapeHtml(reply.avatar || "")}" alt="">
            </button>
            <div class="rp-bd">
                <div class="rp-hd">
                    <a class="rp-nm" href="#">${escapeHtml(reply.author)}</a>
                    <a class="rp-tm" href="#">${escapeHtml(reply.time)}</a>
                    ${reply.isOwner ? `
                        <div class="comment-action-wrap">
                            <button class="cm-mn" type="button" aria-label="작업 메뉴" data-role="comment-menu-toggle" aria-expanded="false">
                                <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4a2 2 0 100 4 2 2 0 000-4Zm0 6a2 2 0 100 4 2 2 0 000-4Zm0 6a2 2 0 100 4 2 2 0 000-4Z"></path></svg>
                            </button>
                            <div class="comment-action-menu" hidden data-role="comment-action-menu">
                                <button class="comment-action-item" type="button" data-role="comment-edit">수정</button>
                                <button class="comment-action-item" type="button" data-role="comment-delete">삭제</button>
                            </div>
                        </div>
                    ` : ""}
                </div>
                <p class="rp-tx">${escapeHtml(reply.text)}</p>
                <div class="rp-ft">
                    <button class="rp-ic${reply.isLiked ? " is-active" : ""}" type="button" aria-label="좋아요" data-vote="like" aria-pressed="${reply.isLiked ? "true" : "false"}">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path data-role="comment-like-icon-path" d="${reply.isLiked ? commentLikeFilledPath : commentLikeOutlinePath}"></path></svg>
                    </button>
                    <span class="rp-vt" data-role="comment-like-count" data-base-count="${escapeHtml(reply.likes || 0)}">${escapeHtml(reply.likes ? `좋아요 ${formatDisplayCount(reply.likes)}` : "")}</span>
                </div>
            </div>
        </article>
    `;
}

function renderCommentItem(comment) {
    const replies = comment.replies || [];
    const repliesHtml = replies.length ? replies.map(renderReplyItem).join("") : "";

    return `
        <article class="cm" data-comment-id="${escapeHtml(comment.id || "")}">
            <div class="cm-row">
                <button class="cm-av" type="button" aria-label="${escapeHtml(comment.author)}">
                    <img src="${escapeHtml(comment.avatar || "")}" alt="">
                </button>
                <div class="cm-bd">
                    <div class="cm-hd">
                        <a class="cm-nm" href="#">${escapeHtml(comment.author)}</a>
                        <a class="cm-tm" href="#">${escapeHtml(comment.time)}</a>
                        ${comment.isOwner ? `
                            <div class="comment-action-wrap">
                                <button class="cm-mn" type="button" aria-label="작업 메뉴" data-role="comment-menu-toggle" aria-expanded="false">
                                    <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4a2 2 0 100 4 2 2 0 000-4Zm0 6a2 2 0 100 4 2 2 0 000-4Zm0 6a2 2 0 100 4 2 2 0 000-4Z"></path></svg>
                                </button>
                                <div class="comment-action-menu" hidden data-role="comment-action-menu">
                                    <button class="comment-action-item" type="button" data-role="comment-edit">수정</button>
                                    <button class="comment-action-item" type="button" data-role="comment-delete">삭제</button>
                                </div>
                            </div>
                        ` : ""}
                    </div>
                    <p class="cm-tx">${escapeHtml(comment.text)}</p>
                    <div class="cm-ft">
                        <button class="cm-ic${comment.isLiked ? " is-active" : ""}" type="button" aria-label="좋아요" data-vote="like" aria-pressed="${comment.isLiked ? "true" : "false"}">
                            <svg viewBox="0 0 24 24" aria-hidden="true"><path data-role="comment-like-icon-path" d="${comment.isLiked ? commentLikeFilledPath : commentLikeOutlinePath}"></path></svg>
                        </button>
                        <span class="cm-vt" data-role="comment-like-count" data-base-count="${escapeHtml(comment.likes || 0)}">${escapeHtml(comment.likes ? `좋아요 ${formatDisplayCount(comment.likes)}` : "")}</span>
                    </div>
                    ${replies.length ? `
                        <div class="cm-rp">
                            <button class="cm-rp-tg" type="button" data-role="reply-toggle" aria-expanded="false">답글 ${replies.length}개</button>
                            <div class="cm-rp-ls" hidden>${repliesHtml}</div>
                        </div>
                    ` : ""}
                </div>
            </div>
        </article>
    `;
}

function renderPivotCard(item) {
    return `
        <article class="pivot-card">
            <a class="pivot-card-link" href="${escapeHtml(item.href || "about:invalid#pivot-card")}">
                <img src="${escapeHtml(item.image || "")}" alt="">
                <div class="pivot-card-overlay">
                    <p class="pivot-card-meta">${escapeHtml(item.meta || "")}</p>
                </div>
            </a>
        </article>
    `;
}

let auctionModalShell = null;

function ensureAuctionModalShell() {
    if (auctionModalShell) {
        return auctionModalShell;
    }

    const existingBackdrop = document.querySelector('[data-role="auction-modal-backdrop"]');
    if (existingBackdrop) {
        auctionModalShell = {
            backdrop: existingBackdrop,
            closeButton: existingBackdrop.querySelector('[data-role="auction-modal-close"]'),
            content: existingBackdrop.querySelector(".work-auction-modal__content")
        };
        return auctionModalShell;
    }

    const auctionRoot = document.querySelector(".Auction-Page-Wrapper");
    if (!auctionRoot) {
        return {
            backdrop: null,
            closeButton: null,
            content: null
        };
    }

    const backdrop = document.createElement("div");
    backdrop.className = "work-auction-modal-backdrop";
    backdrop.hidden = true;
    backdrop.dataset.role = "auction-modal-backdrop";

    const modal = document.createElement("div");
    modal.className = "work-auction-modal";
    modal.setAttribute("role", "dialog");
    modal.setAttribute("aria-modal", "true");

    const closeButton = document.createElement("button");
    closeButton.className = "work-auction-modal__close";
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "닫기");
    closeButton.dataset.role = "auction-modal-close";
    closeButton.innerHTML = `
        <svg viewBox="0 0 24 24" aria-hidden="true">
            <path d="M17.293 5.293 12 10.586 6.707 5.293a1 1 0 10-1.414 1.414L10.586 12l-5.293 5.293a1 1 0 001.414 1.414L12 13.414l5.293 5.293a1 1 0 001.414-1.414L13.414 12l5.293-5.293a1 1 0 10-1.414-1.414Z"></path>
        </svg>
    `;

    const content = document.createElement("div");
    content.className = "work-auction-modal__content";

    const auctionHeader = auctionRoot.querySelector(".Auction-Bid-Header");
    if (auctionHeader && !auctionHeader.querySelector('[data-role="auction-modal-close"]')) {
        auctionHeader.appendChild(closeButton);
    }

    content.appendChild(auctionRoot);
    modal.append(content);
    backdrop.appendChild(modal);

    auctionModalShell = { backdrop, closeButton, content };
    return auctionModalShell;
}

let activeAuctionPage = null;

// 페이지 단위 이벤트 바인딩
function bindPageInteractions(page, data) {
    const primaryLikeButton = page.querySelector('[data-role="primary-like-button"]');
    const primaryDislikeButton = page.querySelector('[data-role="primary-dislike-button"]');
    const primaryLikeCount = primaryLikeButton?.querySelector('[data-field="likeCount"]');
    const bookmarkButton = page.querySelector('[data-role="bookmark-button"]');
    const bookmarkIconPath = bookmarkButton?.querySelector('[data-role="bookmark-icon-path"]');
    const shareButton = page.querySelector('[data-role="share-button"]');
    const marketButton = page.querySelector('[data-role="market-button"]');
    const playToggle = page.querySelector('[data-role="play-toggle"]');
    const playTogglePath = page.querySelector('[data-role="play-toggle-path"]');
    const thumbVideo = page.querySelector('[data-role="thumb-video"]');
    const volumeButton = page.querySelector('[data-role="volume-button"]');
    const volumeIconPath = page.querySelector('[data-role="volume-icon-path"]');
    const volumePanel = page.querySelector('[data-role="volume-panel"]');
    const volumeSlider = page.querySelector('[data-role="volume-slider"]');
    const moreButton = page.querySelector('[data-role="more-button"]');
    const moreMenu = page.querySelector('[data-role="more-menu"]');
    const editButton = page.querySelector('[data-role="edit-button"]');
    const deleteButton = page.querySelector('[data-role="delete-button"]');
    const notRecommendButton = page.querySelector('[data-role="not-recommend-button"]');
    const reportButton = page.querySelector('[data-role="report-button"]');
    const descriptionButton = page.querySelector('[data-role="description-button"]');
    const commentsButton = page.querySelector('[data-role="comments-button"]');
    const pivotButton = page.querySelector('[data-role="pivot-button"]');
    const leftMeta = page.querySelector(".left-meta");
    const anchoredPanel = page.querySelector('[data-role="anchored-panel"]');
    const anchoredPanelClose = page.querySelector('[data-role="anchored-panel-close"]');
    const commentsPanel = page.querySelector('[data-role="comments-panel"]');
    const commentsPanelClose = page.querySelector('[data-role="comments-panel-close"]');
    const commentsList = page.querySelector('[data-role="comments-list"]');
    const commentInput = page.querySelector('[data-role="comment-input"]');
    const commentSubmit = page.querySelector('[data-role="comment-submit"]');
    const pivotPanel = page.querySelector('[data-role="pivot-panel"]');
    const pivotPanelClose = page.querySelector('[data-role="pivot-panel-close"]');
    const pivotGalleryCover = page.querySelector('[data-role="pivot-gallery-cover"]');
    const pivotGalleryTitle = page.querySelector('[data-role="pivot-gallery-title"]');
    const pivotGalleryAvatar = page.querySelector('[data-role="pivot-gallery-avatar"]');
    const pivotGalleryArtist = page.querySelector('[data-role="pivot-gallery-artist"]');
    const pivotGalleryCount = page.querySelector('[data-role="pivot-gallery-count"]');
    const pivotGrid = page.querySelector('[data-role="pivot-grid"]');
    const shareModalBackdrop = page.querySelector('[data-role="share-modal-backdrop"]');
    const shareModalClose = page.querySelector('[data-role="share-modal-close"]');
    const shareLinkInput = page.querySelector('[data-role="share-link-input"]');
    const shareLinkCopy = page.querySelector('[data-role="share-link-copy"]');
    const shareModal = shareModalBackdrop?.querySelector(".work-share-modal");
    const auctionModal = ensureAuctionModalShell();
    const auctionModalBackdrop = auctionModal.backdrop;
    const auctionModalClose = auctionModal.closeButton;
    const workSnackbar = page.querySelector('[data-role="work-snackbar"]');
    const workSnackbarUndo = page.querySelector('[data-role="work-snackbar-undo"]');
    const reportModalBackdrop = page.querySelector('[data-role="report-modal-backdrop"]');
    const reportModalClose = page.querySelector('[data-role="report-modal-close"]');
    const reportStepReasons = page.querySelector('[data-role="report-step-reasons"]');
    const reportConfirmationBackdrop = page.querySelector('[data-role="report-confirmation-backdrop"]');
    const reportConfirmationClose = page.querySelector('[data-role="report-confirmation-close"]');
    const reportNextButton = page.querySelector('[data-role="report-next-button"]');
    const reportConfirmButton = page.querySelector('[data-role="report-confirm-button"]');
    const reportReasonInputs = page.querySelectorAll('input[name="report-form-reason-select-page"]');
    const card = page.querySelector(".card");
    const thumb = page.querySelector(".thumb");
    const fullscreenButton = page.querySelector('[data-role="fullscreen-button"]');
    const mediaCluster = page.querySelector(".media-cluster");
    const workdetailStage = pageStack?.closest(".workdetail-stage") || document.querySelector(".workdetail-stage");
    let snackbarTimerId = 0;
    let workState = { ...data };
    const isOwner = Boolean(data.isOwner);
    let lastNonZeroVolume = 0.5;
    let isPaused = false;

    const updateVolumeUi = () => {
        if (!thumbVideo || !volumeButton || !volumeIconPath) {
            return;
        }

        const isMuted = thumbVideo.muted || thumbVideo.volume === 0;
        const volume = thumbVideo.volume;

        if (volumeSlider) {
            volumeSlider.value = String(volume);
        }

        if (isMuted) {
            volumeIconPath.setAttribute("d", volumeMuteIconPath);
            volumeButton.setAttribute("aria-label", "음소거 해제");
            return;
        }

        volumeIconPath.setAttribute("d", volume > 0.5 ? volumeHighIconPath : volumeLowIconPath);
        volumeButton.setAttribute("aria-label", "음소거");
    };

    const closeVolumePanel = () => {
        if (!volumePanel || !volumeButton) {
            return;
        }

        volumePanel.hidden = true;
        volumeButton.setAttribute("aria-expanded", "false");
    };

    const openVolumePanel = () => {
        if (!volumePanel || !volumeButton) {
            return;
        }

        volumePanel.hidden = false;
        volumeButton.setAttribute("aria-expanded", "true");
    };
    const closeAuctionPanelForPage = () => {
        if (!auctionModalBackdrop) {
            return;
        }

        auctionModalBackdrop.hidden = true;
        page.classList.remove("panel-open", "panel-auction");

        if (activeAuctionPage === page) {
            activeAuctionPage = null;
        }
    };

    const openAuctionPanelForPage = () => {
        if (!auctionModalBackdrop) {
            return;
        }

        if (auctionModalBackdrop.parentElement !== page) {
            page.appendChild(auctionModalBackdrop);
        }

        if (activeAuctionPage && activeAuctionPage !== page) {
            activeAuctionPage.classList.remove("panel-open", "panel-auction");
            const previousBackdrop = activeAuctionPage.querySelector('[data-role="auction-modal-backdrop"]');
            if (previousBackdrop) {
                previousBackdrop.hidden = true;
            }
        }

        activeAuctionPage = page;
        page.classList.add("panel-open", "panel-auction");
        auctionModalBackdrop.hidden = false;
        window.AuctionEvent?.init();
    };

    const setMenuItemVisibility = (button, visible) => {
        if (!button) {
            return;
        }

        button.hidden = !visible;
        button.style.display = visible ? "" : "none";
        button.setAttribute("aria-hidden", visible ? "false" : "true");
    };

    setMenuItemVisibility(editButton, isOwner);
    setMenuItemVisibility(deleteButton, isOwner);
    setMenuItemVisibility(notRecommendButton, !isOwner);
    setMenuItemVisibility(reportButton, !isOwner);

    const togglePlayback = () => {
        if (!thumbVideo || thumbVideo.hidden || !playTogglePath || !playToggle) {
            return;
        }

        isPaused = !isPaused;

        if (isPaused) {
            thumbVideo.pause();
        } else {
            thumbVideo.play().catch(() => {});
        }

        playTogglePath.setAttribute("d", isPaused ? playIconPath : pauseIconPath);
        playToggle.setAttribute("aria-label", isPaused ? "재생" : "일시정지");
    };

    if (playToggle && playTogglePath) {
        playToggle.addEventListener("click", () => {
            togglePlayback();
        });

        if (thumbVideo && !thumbVideo.hidden) {
            playTogglePath.setAttribute("d", pauseIconPath);
            playToggle.setAttribute("aria-label", "일시정지");
        }
    }

    if (thumb && thumbVideo && !thumbVideo.hidden) {
        thumb.addEventListener("click", (event) => {
            if (event.target.closest(".thumb-controls") || event.target.closest(".thumb-more-menu")) {
                return;
            }

            togglePlayback();
        });

        thumbVideo.addEventListener("click", (event) => {
            event.stopPropagation();
            togglePlayback();
        });
    }

    if (thumbVideo && !thumbVideo.hidden) {
        thumbVideo.volume = 0.5;
        thumbVideo.muted = true;
        updateVolumeUi();
        thumbVideo.addEventListener("volumechange", updateVolumeUi);
    } else {
        closeVolumePanel();
    }

    if (volumeButton && thumbVideo) {
        volumeButton.addEventListener("click", (event) => {
            event.stopPropagation();

            if (!thumbVideo.hidden && thumbVideo.muted) {
                thumbVideo.muted = false;
                thumbVideo.volume = lastNonZeroVolume || 0.5;
            } else if (!thumbVideo.hidden) {
                if (thumbVideo.volume > 0) {
                    lastNonZeroVolume = thumbVideo.volume;
                }
                thumbVideo.muted = true;
            }

            if (volumePanel?.hidden) {
                openVolumePanel();
            } else {
                closeVolumePanel();
            }

            updateVolumeUi();
        });
    }

    if (volumeSlider && thumbVideo) {
        volumeSlider.addEventListener("input", (event) => {
            const nextVolume = Number(event.target.value || "0");
            thumbVideo.volume = nextVolume;
            thumbVideo.muted = nextVolume === 0;

            if (nextVolume > 0) {
                lastNonZeroVolume = nextVolume;
            }

            updateVolumeUi();
        });
    }

    if (volumePanel) {
        volumePanel.addEventListener("click", (event) => {
            event.stopPropagation();
        });
    }

    page.addEventListener("click", (event) => {
        if (!volumeButton || !volumePanel) {
            return;
        }

        if (volumeButton.contains(event.target) || volumePanel.contains(event.target)) {
            return;
        }

        closeVolumePanel();
    });

    if (commentsList) {
        renderCommentsList(commentsList, workState.comments);

        const closeCommentMenus = () => {
            commentsList.querySelectorAll('[data-role="comment-action-menu"]').forEach((menu) => {
                menu.hidden = true;
            });
            commentsList.querySelectorAll('[data-role="comment-menu-toggle"]').forEach((button) => {
                button.setAttribute("aria-expanded", "false");
            });
        };

        commentsList.addEventListener("click", (event) => {
            const toggle = event.target.closest('[data-role="reply-toggle"]');
            if (!toggle) {
                return;
            }

            const wrap = toggle.closest(".cm-rp");
            const list = wrap?.querySelector(".cm-rp-ls");
            if (!list) {
                return;
            }

            const willOpen = list.hidden;
            list.hidden = !willOpen;
            toggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
            toggle.textContent = willOpen ? "답글 숨기기" : `답글 ${list.children.length}개`;
        });

        commentsList.addEventListener("click", (event) => {
            const menuToggle = event.target.closest('[data-role="comment-menu-toggle"]');
            if (!menuToggle) {
                if (!event.target.closest('[data-role="comment-action-menu"]')) {
                    closeCommentMenus();
                }
                return;
            }

            event.stopPropagation();

            const menu = menuToggle.closest(".comment-action-wrap")?.querySelector('[data-role="comment-action-menu"]');
            if (!menu) {
                return;
            }

            const willOpen = menu.hidden;
            closeCommentMenus();
            menu.hidden = !willOpen;
            menuToggle.setAttribute("aria-expanded", willOpen ? "true" : "false");
        });

        commentsList.addEventListener("click", async (event) => {
            const voteButton = event.target.closest('[data-vote]');
            if (!voteButton) {
                return;
            }

            const commentItem = voteButton.closest("[data-comment-id]");
            const commentId = Number(commentItem?.dataset.commentId || "0");
            const voteWrap = voteButton.closest(".cm-hd, .rp-hd, .cm-ft, .rp-ft");
            if (!voteWrap || !commentId || voteButton.dataset.vote !== "like") {
                return;
            }

            try {
                const result = await apiRequest(`/api/comments/${commentId}/likes`, {
                    method: "POST"
                });
                const likeButton = voteWrap.querySelector('[data-vote="like"]');
                const dislikeButton = voteWrap.querySelector('[data-vote="dislike"]');
                const countNode = commentItem.querySelector('[data-role="comment-like-count"]');

                updateVoteButtonState(likeButton, Boolean(result.liked));
                updateVoteButtonState(dislikeButton, false);

                if (countNode) {
                    countNode.dataset.baseCount = String(result.likeCount || 0);
                    countNode.textContent = result.likeCount ? `좋아요 ${formatDisplayCount(result.likeCount)}` : "";
                }
            } catch (error) {
                window.alert(error.message || "댓글 좋아요 처리에 실패했습니다.");
            }
        });

        commentsList.addEventListener("click", async (event) => {
            const editButton = event.target.closest('[data-role="comment-edit"]');
            const deleteButton = event.target.closest('[data-role="comment-delete"]');
            const editSaveButton = event.target.closest('[data-role="comment-edit-save"]');
            const editCancelButton = event.target.closest('[data-role="comment-edit-cancel"]');
            const commentItem = event.target.closest("[data-comment-id]");
            const commentId = Number(commentItem?.dataset.commentId || "0");

            if (!commentId) {
                return;
            }

            const closeInlineEditors = () => {
                commentsList.querySelectorAll('[data-role="comment-inline-editor"]').forEach((editor) => {
                    editor.remove();
                });
                commentsList.querySelectorAll(".cm-tx, .rp-tx").forEach((textNode) => {
                    textNode.hidden = false;
                });
            };

            if (editCancelButton) {
                closeInlineEditors();
                return;
            }

            if (editSaveButton) {
                closeCommentMenus();
                const editor = commentItem.querySelector('[data-role="comment-inline-editor"]');
                const input = editor?.querySelector('[data-role="comment-inline-input"]');
                const textNode = commentItem.querySelector(".cm-tx, .rp-tx");
                const currentText = textNode?.textContent?.trim() || "";
                const normalizedText = input?.value?.trim() || "";

                if (!normalizedText || normalizedText === currentText) {
                    closeInlineEditors();
                    return;
                }

                try {
                    const updated = await apiRequest(`/api/comments/${commentId}`, {
                        method: "PUT",
                        body: JSON.stringify({ content: normalizedText })
                    });

                    workState.comments = updateCommentTree(workState.comments, commentId, (comment) => ({
                        ...comment,
                        text: updated.content || normalizedText,
                        time: formatRelativeTime(updated.updatedDatetime || updated.createdDatetime)
                    }));
                    renderCommentsList(commentsList, workState.comments);
                } catch (error) {
                    window.alert(error.message || "댓글 수정에 실패했습니다.");
                }

                return;
            }

            if (editButton) {
                closeCommentMenus();
                const textNode = commentItem.querySelector(".cm-tx, .rp-tx");
                const currentText = textNode?.textContent?.trim() || "";
                const anchorNode =
                    commentItem.querySelector(".cm-ft, .rp-ft")
                    || commentItem.querySelector(".cm-rp")
                    || textNode;

                if (!textNode || !anchorNode) {
                    return;
                }

                closeInlineEditors();
                textNode.hidden = true;
                anchorNode.insertAdjacentHTML("beforebegin", `
                    <div class="comment-inline-editor" data-role="comment-inline-editor">
                        <textarea class="comment-inline-input" data-role="comment-inline-input">${escapeHtml(currentText)}</textarea>
                        <div class="comment-inline-actions">
                            <button class="comment-inline-button comment-inline-button--ghost" type="button" data-role="comment-edit-cancel">취소</button>
                            <button class="comment-inline-button comment-inline-button--primary" type="button" data-role="comment-edit-save">저장</button>
                        </div>
                    </div>
                `);
                commentItem.querySelector('[data-role="comment-inline-input"]')?.focus();

                return;
            }

            if (deleteButton) {
                closeCommentMenus();
                if (!window.confirm("댓글을 삭제하시겠습니까?")) {
                    return;
                }

                try {
                    await apiRequest(`/api/comments/${commentId}`, {
                        method: "DELETE"
                    });

                    workState.comments = removeCommentTree(workState.comments, commentId);
                    workState.commentCount = Math.max(0, parseDisplayCount(workState.commentCount) - 1);
                    renderCommentsList(commentsList, workState.comments);
                    updateCountFields(page, "commentCount", workState.commentCount);
                } catch (error) {
                    window.alert(error.message || "댓글 삭제에 실패했습니다.");
                }
            }
        });

        document.addEventListener("click", closeCommentMenus);
    }

    if (primaryLikeButton) {
        updateVoteButtonState(primaryLikeButton, Boolean(workState.isLiked));

        primaryLikeButton.addEventListener("click", async () => {
            if (!workState.id) {
                return;
            }

            try {
                const result = await apiRequest(`/api/works/${workState.id}/likes`, {
                    method: "POST"
                });
                workState.isLiked = Boolean(result.liked);
                workState.likeCount = formatDisplayCount(result.likeCount || 0, { compact: true });
                updateVoteButtonState(primaryLikeButton, workState.isLiked);
                updateVoteButtonState(primaryDislikeButton, false);
                updateCountFields(page, "likeCount", result.likeCount || 0, true);
            } catch (error) {
                window.alert(error.message || "좋아요 처리에 실패했습니다.");
            }
        });
    }

    if (bookmarkButton) {
        const syncBookmarkState = (isActive) => {
            bookmarkButton.setAttribute("aria-pressed", isActive ? "true" : "false");
            bookmarkButton.classList.toggle("is-active", isActive);
            bookmarkButton.setAttribute("aria-label", isActive ? "찜 해제" : "찜하기");

            if (bookmarkIconPath) {
                bookmarkIconPath.setAttribute("d", isActive ? bookmarkFilledPath : bookmarkOutlinePath);
            }
        };

        syncBookmarkState(Boolean(workState.isBookmarked));

        bookmarkButton.addEventListener("click", async () => {
            if (!workState.id) {
                return;
            }

            try {
                const result = await apiRequest("/api/bookmarks", {
                    method: "POST",
                    body: JSON.stringify({
                        targetType: "WORK",
                        targetId: workState.id
                    })
                });
                workState.isBookmarked = Boolean(result.bookmarked);
                syncBookmarkState(workState.isBookmarked);
            } catch (error) {
                window.alert(error.message || "북마크 처리에 실패했습니다.");
            }
        });
    }

    if (commentInput && commentSubmit) {
        const syncCommentSubmitState = () => {
            commentSubmit.disabled = !commentInput.value.trim();
            commentInput.style.height = "auto";
            commentInput.style.height = `${Math.min(commentInput.scrollHeight, 120)}px`;
        };

        commentInput.addEventListener("input", syncCommentSubmitState);
        commentInput.addEventListener("keydown", async (event) => {
            if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                commentSubmit.click();
            }
        });

        commentSubmit.addEventListener("click", async () => {
            const content = commentInput.value.trim();

            if (!content || !workState.id) {
                return;
            }

            commentSubmit.disabled = true;

            try {
                const detail = await apiRequest(`/api/works/${workState.id}/comments`, {
                    method: "POST",
                    body: JSON.stringify({ content })
                });
                const normalizedComments = Array.isArray(detail.comments)
                    ? detail.comments.map(normalizeComment)
                    : workState.comments;
                const nextCommentCount = detail.commentCount || normalizedComments.length || 0;

                workState = {
                    ...workState,
                    comments: normalizedComments,
                    commentCount: formatDisplayCount(nextCommentCount)
                };
                renderCommentsList(commentsList, workState.comments);
                updateCountFields(page, "commentCount", nextCommentCount, false);
                commentInput.value = "";
                syncCommentSubmitState();
                if (commentsList) {
                    commentsList.scrollTop = commentsList.scrollHeight;
                }
            } catch (error) {
                window.alert(error.message || "댓글 등록에 실패했습니다.");
                syncCommentSubmitState();
            }
        });

        syncCommentSubmitState();
    }

    if (pivotGalleryCover) {
        pivotGalleryCover.src = data.pivotThumb || "";
        pivotGalleryCover.alt = data.pivotTitle || "예술관";
    }
    if (pivotGalleryTitle) {
        pivotGalleryTitle.textContent = data.pivotTitle || "";
    }
    if (pivotGalleryAvatar) {
        pivotGalleryAvatar.src = data.pivotAvatar || "";
        pivotGalleryAvatar.alt = data.pivotArtist || "예술관";
    }
    if (pivotGalleryArtist) {
        pivotGalleryArtist.textContent = data.pivotArtist || "";
    }
    if (pivotGalleryCount) {
        pivotGalleryCount.textContent = data.pivotCount || "";
    }
    if (pivotGrid) {
        pivotGrid.innerHTML = (data.pivotItems || []).map(renderPivotCard).join("");
    }

    if (shareLinkInput) {
        shareLinkInput.value = data.shareUrl || "https://localhost:10000/profile/ttt?galleryId=9";
    }

    if (marketButton && data.marketType === "trade") {
        marketButton.addEventListener("click", (event) => {
            event.stopPropagation();
            window.location.href = `/payment/pay-api?workId=${data.id}`;
        });
    }

    if (marketButton && auctionModalBackdrop && data.marketType === "auction") {
            marketButton.addEventListener("click", (event) => {
                event.stopPropagation();
                const isAuctionOpen =
                    page.classList.contains("panel-open") &&
                    page.classList.contains("panel-auction") &&
                    !auctionModalBackdrop.hidden;

                if (isAuctionOpen) {
                    closeAuctionPanelForPage();
                    return;
                }

                await AuctionService.getAuctionInfo(data.id, (auction) => {
                    openAuctionPanelForPage();
                    AuctionLayout.init(auction);
                    AuctionEvent.setAuctionId(auction.id);
                    AuctionEvent.bindEvents();
                    AuctionSocket.connect(auction.id, auction.loginMemberId);
                });
                openAuctionPanelForPage();
            });

            if (!auctionModalBackdrop.dataset.bound) {
                auctionModalClose?.addEventListener("click", () => {
                    if (!activeAuctionPage) {
                        return;
                    }

                    const activeBackdrop = activeAuctionPage.querySelector('[data-role="auction-modal-backdrop"]');
                    if (activeBackdrop) {
                        activeBackdrop.hidden = true;
                    }
                    activeAuctionPage.classList.remove("panel-open", "panel-auction");
                    activeAuctionPage = null;
                });

                document.addEventListener("keydown", (event) => {
                    if (event.key === "Escape" && !auctionModalBackdrop.hidden) {
                        if (!activeAuctionPage) {
                            return;
                        }

                        activeAuctionPage.classList.remove("panel-open", "panel-auction");
                        const activeBackdrop = activeAuctionPage.querySelector('[data-role="auction-modal-backdrop"]');
                        if (activeBackdrop) {
                            activeBackdrop.hidden = true;
                        }
                        activeAuctionPage = null;
                    }
                });

                auctionModalBackdrop.dataset.bound = "true";
            }
    }

    if (notRecommendButton && workSnackbar) {
        workSnackbar.hidden = true;

        const openSnackbar = () => {
            window.clearTimeout(snackbarTimerId);
            workSnackbar.hidden = false;
            snackbarTimerId = window.setTimeout(() => {
                workSnackbar.hidden = true;
            }, 3000);
        };

        const closeSnackbar = () => {
            window.clearTimeout(snackbarTimerId);
            workSnackbar.hidden = true;
        };

        notRecommendButton.addEventListener("click", (event) => {
            event.stopPropagation();
            if (moreMenu && moreButton) {
                moreMenu.hidden = true;
                moreButton.setAttribute("aria-expanded", "false");
            }
            openSnackbar();
        });

        workSnackbarUndo?.addEventListener("click", closeSnackbar);
    }

    if (shareButton && shareModalBackdrop) {
        if (shareModalBackdrop.parentElement !== document.body) {
            document.body.appendChild(shareModalBackdrop);
        }

        shareModalBackdrop.style.position = "fixed";
        shareModalBackdrop.style.inset = "0";
        shareModalBackdrop.style.zIndex = "9999";
        shareModalBackdrop.style.display = "none";
        shareModalBackdrop.style.background = "rgba(15, 23, 42, 0.42)";
        shareModalBackdrop.style.padding = "16px";
        shareModalBackdrop.style.alignItems = "center";
        shareModalBackdrop.style.justifyContent = "center";

        if (shareModal) {
            shareModal.style.position = "relative";
            shareModal.style.left = "auto";
            shareModal.style.top = "auto";
            shareModal.style.margin = "auto";
            shareModal.style.zIndex = "10000";
        }

        const openShareModal = () => {
            shareModalBackdrop.hidden = false;
            shareModalBackdrop.setAttribute("aria-hidden", "false");
            shareModalBackdrop.style.display = "flex";
        };

        const closeShareModal = () => {
            shareModalBackdrop.hidden = true;
            shareModalBackdrop.setAttribute("aria-hidden", "true");
            shareModalBackdrop.style.display = "none";
        };

        shareButton.addEventListener("click", async (event) => {
            event.stopPropagation();

            if (!shareModalBackdrop.hidden) {
                closeShareModal();
                return;
            }

            if (navigator.share) {
                try {
                    await navigator.share({
                        title: workState.headline || document.title,
                        text: workState.desc || "",
                        url: workState.shareUrl || window.location.href
                    });
                    return;
                } catch (error) {
                    if (error?.name === "AbortError") {
                        return;
                    }
                }
            }

            openShareModal();
        });

        shareModalClose?.addEventListener("click", closeShareModal);

        shareModalBackdrop.addEventListener("click", (event) => {
            if (event.target === shareModalBackdrop) {
                closeShareModal();
            }
        });

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && !shareModalBackdrop.hidden) {
                closeShareModal();
            }
        });

        shareLinkCopy?.addEventListener("click", async () => {
            if (!shareLinkInput) {
                return;
            }

            const shareUrl = shareLinkInput.value;

            try {
                if (navigator.clipboard?.writeText) {
                    await navigator.clipboard.writeText(shareUrl);
                } else {
                    shareLinkInput.select();
                    document.execCommand("copy");
                }

                shareLinkCopy.textContent = "복사됨";
                window.setTimeout(() => {
                    shareLinkCopy.textContent = "복사";
                }, 1500);
            } catch (error) {
                shareLinkInput.focus();
                shareLinkInput.select();
            }
        });
    }

    if (reportButton && reportModalBackdrop) {
        if (reportModalBackdrop.parentElement !== document.body) {
            document.body.appendChild(reportModalBackdrop);
        }
        if (reportConfirmationBackdrop && reportConfirmationBackdrop.parentElement !== document.body) {
            document.body.appendChild(reportConfirmationBackdrop);
        }

        const syncReportNextButton = () => {
            if (!reportNextButton) {
                return;
            }

            const hasSelection = Array.from(reportReasonInputs).some((input) => input.checked);
            reportNextButton.disabled = !hasSelection;
            reportNextButton.setAttribute("aria-disabled", hasSelection ? "false" : "true");
            reportNextButton.style.background = hasSelection ? "#0f0f0f" : "#e5e7eb";
            reportNextButton.style.color = hasSelection ? "#ffffff" : "#9ca3af";
            reportNextButton.style.cursor = hasSelection ? "pointer" : "default";
        };

        const openReportModal = () => {
            if (reportStepReasons) {
                reportStepReasons.hidden = false;
            }
            syncReportNextButton();
            reportModalBackdrop.hidden = false;
            if (reportConfirmationBackdrop) {
                reportConfirmationBackdrop.hidden = true;
            }
        };

        const closeReportModal = () => {
            reportModalBackdrop.hidden = true;
        };

        const openReportConfirmationModal = () => {
            if (reportConfirmationBackdrop) {
                reportConfirmationBackdrop.hidden = false;
            }
        };

        const closeReportConfirmationModal = () => {
            if (reportConfirmationBackdrop) {
                reportConfirmationBackdrop.hidden = true;
            }
        };

        reportButton.addEventListener("click", (event) => {
            event.stopPropagation();
            if (moreMenu && moreButton) {
                moreMenu.hidden = true;
                moreButton.setAttribute("aria-expanded", "false");
            }
            openReportModal();
        });

        reportModalClose?.addEventListener("click", closeReportModal);

        reportModalBackdrop.addEventListener("click", (event) => {
            if (event.target === reportModalBackdrop) {
                closeReportModal();
            }
        });

        reportConfirmationBackdrop?.addEventListener("click", (event) => {
            if (event.target === reportConfirmationBackdrop) {
                closeReportConfirmationModal();
            }
        });

        reportReasonInputs.forEach((input) => {
            input.addEventListener("change", syncReportNextButton);
        });

        reportNextButton?.addEventListener("click", () => {
            if (!reportNextButton.disabled) {
                closeReportModal();
                openReportConfirmationModal();
            }
        });

        reportConfirmationClose?.addEventListener("click", closeReportConfirmationModal);
        reportConfirmButton?.addEventListener("click", closeReportConfirmationModal);

        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && !reportModalBackdrop.hidden) {
                closeReportModal();
            }
            if (event.key === "Escape" && reportConfirmationBackdrop && !reportConfirmationBackdrop.hidden) {
                closeReportConfirmationModal();
            }
        });
    }

    if (anchoredPanel) {
        let closePanelTimer;

        const openPanel = (panelType) => {
            window.clearTimeout(closePanelTimer);
            closeAuctionPanelForPage();
            if (anchoredPanel) {
                anchoredPanel.hidden = panelType !== "description";
            }
            if (commentsPanel) {
                commentsPanel.hidden = panelType !== "comments";
            }
            if (pivotPanel) {
                pivotPanel.hidden = panelType !== "pivot";
            }
            window.requestAnimationFrame(() => {
                page.classList.add("panel-open");
                page.classList.remove("panel-auction");
                page.classList.toggle("panel-comments", panelType === "comments");
                page.classList.toggle("panel-pivot", panelType === "pivot");
            });
        };

        const closePanel = () => {
            closeAuctionPanelForPage();
            page.classList.remove("panel-open");
            page.classList.remove("panel-comments");
            page.classList.remove("panel-pivot");
            window.clearTimeout(closePanelTimer);
            closePanelTimer = window.setTimeout(() => {
                if (!page.classList.contains("panel-open")) {
                    if (anchoredPanel) {
                        anchoredPanel.hidden = true;
                    }
                    if (commentsPanel) {
                        commentsPanel.hidden = true;
                    }
                    if (pivotPanel) {
                        pivotPanel.hidden = true;
                    }
                }
            }, 300);
        };

        if (descriptionButton) {
            descriptionButton.addEventListener("click", (event) => {
                event.stopPropagation();
                openPanel("description");
                if (moreMenu && moreButton) {
                    moreMenu.hidden = true;
                    moreButton.setAttribute("aria-expanded", "false");
                }
            });
        }

        if (leftMeta) {
            leftMeta.addEventListener("click", () => {
                openPanel("description");
            });
        }

        if (commentsButton) {
            commentsButton.addEventListener("click", (event) => {
                event.stopPropagation();

                const isCommentsOpen =
                    page.classList.contains("panel-open") &&
                    page.classList.contains("panel-comments") &&
                    commentsPanel &&
                    !commentsPanel.hidden;

                if (isCommentsOpen) {
                    closePanel();
                    return;
                }

                openPanel("comments");
            });
        }

        if (pivotButton) {
            pivotButton.addEventListener("click", (event) => {
                event.preventDefault();
                const isPivotOpen =
                    page.classList.contains("panel-open") &&
                    page.classList.contains("panel-pivot") &&
                    pivotPanel &&
                    !pivotPanel.hidden;

                if (isPivotOpen) {
                    closePanel();
                    return;
                }

                openPanel("pivot");
            });
        }

        if (anchoredPanelClose) {
            anchoredPanelClose.addEventListener("click", (event) => {
                event.stopPropagation();
                closePanel();
            });
        }

        if (commentsPanelClose) {
            commentsPanelClose.addEventListener("click", (event) => {
                event.stopPropagation();
                closePanel();
            });
        }

        if (pivotPanelClose) {
            pivotPanelClose.addEventListener("click", (event) => {
                event.stopPropagation();
                closePanel();
            });
        }
    }

    if (moreButton && moreMenu && card) {
        const positionMenu = () => {
            moreMenu.style.left = "378px";
            moreMenu.style.top = "48px";
        };

        const closeMenu = () => {
            moreMenu.hidden = true;
            moreButton.setAttribute("aria-expanded", "false");
        };

        moreButton.addEventListener("click", (event) => {
            event.stopPropagation();
            const willOpen = moreMenu.hidden;
            moreMenu.hidden = !willOpen;
            moreButton.setAttribute("aria-expanded", willOpen ? "true" : "false");
            if (willOpen) {
                positionMenu();
            }
        });

        moreMenu.addEventListener("click", (event) => {
            event.stopPropagation();
        });

        document.addEventListener("click", (event) => {
            if (!moreMenu.hidden && !moreMenu.contains(event.target) && !moreButton.contains(event.target)) {
                closeMenu();
            }
        });

        window.addEventListener("resize", () => {
            if (!moreMenu.hidden) {
                positionMenu();
            }
        });
    }

    if (fullscreenButton && workdetailStage) {
        const fullscreenTarget = workdetailStage;
        let fallbackFullscreenActive = false;
        let normalModeScrollTop = null;
        let normalWindowScrollX = 0;
        let normalWindowScrollY = 0;
        const closeTransientUi = () => {
            workdetailStage.querySelectorAll(".page").forEach((targetPage) => {
                const targetMoreMenu = targetPage.querySelector('[data-role="more-menu"]');
                const targetMoreButton = targetPage.querySelector('[data-role="more-button"]');

                if (targetMoreMenu) {
                    targetMoreMenu.hidden = true;
                }
                if (targetMoreButton) {
                    targetMoreButton.setAttribute("aria-expanded", "false");
                }
            });
        };

        const updateFullscreenState = () => {
            const activeFullscreenElement = getFullscreenElement();
            const isFullscreen = activeFullscreenElement === fullscreenTarget || fallbackFullscreenActive;
            workdetailStage.classList.toggle("stage-fullscreen", isFullscreen);
            document.body.classList.toggle("workdetail-is-fullscreen", isFullscreen);
            if (isFullscreen) {
                const activePage = getFullscreenActivePage();
                if (!activePage) {
                    syncFullscreenActivePage();
                }
                requestAnimationFrame(() => {
                    alignFullscreenScrollToActivePage();
                    requestAnimationFrame(() => {
                        alignFullscreenScrollToActivePage();
                    });
                });
            } else {
                workdetailStage.querySelectorAll(".page").forEach((targetPage) => {
                    targetPage.classList.remove("fullscreen-active-page");
                });
                requestAnimationFrame(() => {
                    if (pageStack && normalModeScrollTop !== null) {
                        pageStack.scrollTop = normalModeScrollTop;
                    }
                    window.scrollTo(normalWindowScrollX, normalWindowScrollY);
                    requestAnimationFrame(() => {
                        if (pageStack && normalModeScrollTop !== null) {
                            pageStack.scrollTop = normalModeScrollTop;
                        }
                        window.scrollTo(normalWindowScrollX, normalWindowScrollY);
                    });
                    updateNavigationState();
                    resetInactivePages();
                });
            }
            workdetailStage.querySelectorAll('[data-role="fullscreen-button"]').forEach((button) => {
                button.setAttribute("aria-label", isFullscreen ? "전체 화면 종료" : "전체 화면");
                button.setAttribute("aria-pressed", isFullscreen ? "true" : "false");
            });
        };

        fullscreenButton.addEventListener("click", async () => {
            const willOpen = !(getFullscreenElement() === fullscreenTarget || fallbackFullscreenActive);
            closeTransientUi();
            if (willOpen) {
                normalModeScrollTop = pageStack ? pageStack.scrollTop : null;
                normalWindowScrollX = window.scrollX;
                normalWindowScrollY = window.scrollY;
                if (pageStack) {
                    pageStack.scrollTop = page.offsetTop;
                }
                setFullscreenActivePage(page);
            }

            try {
                if (willOpen && supportsFullscreenApi(fullscreenTarget)) {
                    fallbackFullscreenActive = false;
                    await requestElementFullscreen(fullscreenTarget);
                } else if (!willOpen && getFullscreenElement()) {
                    fallbackFullscreenActive = false;
                    await exitAnyFullscreen();
                } else {
                    fallbackFullscreenActive = willOpen;
                }
            } catch (_) {
                fallbackFullscreenActive = willOpen;
            }

            updateFullscreenState();
        });

        document.addEventListener("fullscreenchange", updateFullscreenState);
        document.addEventListener("webkitfullscreenchange", updateFullscreenState);
        document.addEventListener("msfullscreenchange", updateFullscreenState);
        document.addEventListener("keydown", (event) => {
            if (event.key === "Escape" && !getFullscreenElement() && fallbackFullscreenActive) {
                fallbackFullscreenActive = false;
                updateFullscreenState();
            }
        });
        updateFullscreenState();
    }

    if (editButton) {
        editButton.addEventListener("click", (event) => {
            event.stopPropagation();
            if (moreMenu && moreButton) {
                moreMenu.hidden = true;
                moreButton.setAttribute("aria-expanded", "false");
            }
            if (workState.id) {
                if (typeof window.openComposeModal === "function") {
                    window.openComposeModal(`/work/work-edit/${workState.id}`);
                    return;
                }

                window.location.href = `/work/work-edit/${workState.id}`;
            }
        });
    }

    if (deleteButton) {
        deleteButton.addEventListener("click", async (event) => {
            event.stopPropagation();
            if (moreMenu && moreButton) {
                moreMenu.hidden = true;
                moreButton.setAttribute("aria-expanded", "false");
            }

            const confirmed = window.confirm("이 작품을 삭제하시겠습니까?");
            if (confirmed) {
                try {
                    await apiRequest(`/api/works/${workState.id}`, {
                        method: "DELETE"
                    });
                    window.location.href = "/profile";
                } catch (error) {
                    window.alert(error.message || "작품 삭제에 실패했습니다.");
                }
            }
        });
    }
}

// 현재 page-stack 기준으로 화면에 가장 가까운 페이지 계산
function getCurrentPageIndex() {
    if (!pageStack) {
        return 0;
    }

    const pages = Array.from(pageStack.querySelectorAll(".page"));
    if (!pages.length) {
        return 0;
    }

    const pageStackTop = pageStack.getBoundingClientRect().top;
    let currentIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    pages.forEach((page, index) => {
        const distance = Math.abs(page.getBoundingClientRect().top - pageStackTop);
        if (distance < closestDistance) {
            closestDistance = distance;
            currentIndex = index;
        }
    });

    return currentIndex;
}

// 상하 네비게이션 이동
function scrollToPage(index) {
    if (!pageStack) {
        return;
    }

    const pages = pageStack.querySelectorAll(".page");
    const targetPage = pages[index];

    if (targetPage) {
        targetPage.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

// 전체화면 대상 페이지 표시 동기화
function syncFullscreenActivePage() {
    if (!pageStack) {
        return;
    }

    const currentIndex = getCurrentPageIndex();
    const pages = Array.from(pageStack.querySelectorAll(".page"));

    pages.forEach((page, index) => {
        page.classList.toggle("fullscreen-active-page", index === currentIndex);
    });
}

function setFullscreenActivePage(targetPage) {
    if (!pageStack) {
        return;
    }

    const pages = Array.from(pageStack.querySelectorAll(".page"));
    pages.forEach((page) => {
        page.classList.toggle("fullscreen-active-page", page === targetPage);
    });
}

function getFullscreenActivePage() {
    if (!pageStack) {
        return null;
    }

    return pageStack.querySelector(".page.fullscreen-active-page");
}

function alignFullscreenScrollToActivePage() {
    if (!pageStack) {
        return;
    }

    const activePage = getFullscreenActivePage();
    if (!activePage) {
        return;
    }

    pageStack.scrollTop = activePage.offsetTop;
}

// 현재 인덱스에 따라 위/아래 버튼 표시 제어
function updateNavigationState() {
    if (!pageStack || !navigationButtonUp || !navigationButtonDown) {
        return;
    }

    const pages = pageStack.querySelectorAll(".page");
    const currentIndex = getCurrentPageIndex();
    const lastIndex = pages.length - 1;

    navigationButtonUp.hidden = currentIndex <= 0;
    navigationButtonDown.hidden = currentIndex >= lastIndex;
    navigationButtonUp.style.display = currentIndex <= 0 ? "none" : "";
    navigationButtonDown.style.display = currentIndex >= lastIndex ? "none" : "";
}

// 비활성 페이지의 패널/메뉴 상태 정리
function resetInactivePages() {
    if (!pageStack) {
        return;
    }

    const currentIndex = getCurrentPageIndex();
    const pages = Array.from(pageStack.querySelectorAll(".page"));

    pages.forEach((page, index) => {
        if (index === currentIndex) {
            return;
        }

        page.classList.remove("panel-open");
        page.classList.remove("panel-comments");
        page.classList.remove("panel-pivot");
        page.classList.remove("panel-auction");

        const anchoredPanel = page.querySelector('[data-role="anchored-panel"]');
        const commentsPanel = page.querySelector('[data-role="comments-panel"]');
        const pivotPanel = page.querySelector('[data-role="pivot-panel"]');
        const auctionModalBackdrop = page.querySelector('[data-role="auction-modal-backdrop"]');
        const moreMenu = page.querySelector('[data-role="more-menu"]');
        const moreButton = page.querySelector('[data-role="more-button"]');

        if (anchoredPanel) {
            anchoredPanel.hidden = true;
        }
        if (commentsPanel) {
            commentsPanel.hidden = true;
        }
        if (pivotPanel) {
            pivotPanel.hidden = true;
        }
        if (auctionModalBackdrop) {
            auctionModalBackdrop.hidden = true;
        }
        if (moreMenu) {
            moreMenu.hidden = true;
        }
        if (moreButton) {
            moreButton.setAttribute("aria-expanded", "false");
        }

        if (activeAuctionPage === page) {
            activeAuctionPage = null;
        }
    });
}

async function initializeWorkDetailPage() {
    if (!pageStack || !workPageTemplate) {
        return;
    }

    const workId = getCurrentWorkId();
    if (!workId) {
        pageStack.innerHTML = "";
        return;
    }

    try {
        const detail = await apiRequest(`/api/works/${workId}`);
        const detailPages = await loadScrollableWorkDetails(detail);

        pageStack.innerHTML = "";
        workDetails.length = 0;

        for (const item of detailPages) {
            const normalized = await normalizeWorkDetail(item);
            const fragment = workPageTemplate.content.cloneNode(true);
            const page = fragment.querySelector(".page");

            bindPageData(page, normalized);
            bindPageInteractions(page, normalized);
            pageStack.appendChild(fragment);
            workDetails.push(normalized);
        }

        if (navigationButtonUp && navigationButtonDown) {
            navigationButtonUp.addEventListener("click", () => {
                const currentIndex = getCurrentPageIndex();
                if (currentIndex > 0) {
                    scrollToPage(currentIndex - 1);
                }
            });

            navigationButtonDown.addEventListener("click", () => {
                const currentIndex = getCurrentPageIndex();
                scrollToPage(currentIndex + 1);
            });

            pageStack.addEventListener("scroll", () => {
                updateNavigationState();
                resetInactivePages();
                if (document.querySelector(".workdetail-stage")?.classList.contains("stage-fullscreen")) {
                    syncFullscreenActivePage();
                }
            }, { passive: true });
            window.addEventListener("resize", updateNavigationState);
            resetInactivePages();
            updateNavigationState();
            syncFullscreenActivePage();
        }
    } catch (error) {
        pageStack.innerHTML = `<div style="padding: 32px; text-align: center;">${escapeHtml(error.message || "작품 정보를 불러오지 못했습니다.")}</div>`;
    }
}

initializeWorkDetailPage();
