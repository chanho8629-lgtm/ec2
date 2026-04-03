document.addEventListener("DOMContentLoaded", function () {
    var root = document.documentElement;
    var themeToggle = document.querySelector("[data-theme-toggle]");
    var tabs = document.querySelectorAll("[data-dashboard-tab]");
    var panels = document.querySelectorAll("[data-dashboard-panel]");
    var tabIndicator = document.querySelector(".Dashboard-TabIndicator");
    var tabContainer = document.querySelector(".Dashboard-Tabs");
    var metricTabs = document.querySelectorAll("[data-metric-tab]");
    var metricTitle = document.querySelector("[data-metric-title]");
    var metricSummary = document.querySelector("[data-metric-summary]");
    var metricChartCanvas = document.getElementById("dashboardMetricChart");
    var dateToggle = document.querySelector("[data-date-toggle]");
    var dateMenu = document.querySelector("[data-date-menu]");
    var dateLabel = document.querySelector("[data-date-label]");
    var dateRange = document.querySelector("[data-date-range]");
    var dateOptions = document.querySelectorAll("[data-date-option]");
    var cardPreviewNameInput = document.querySelector("[data-card-preview-name]");
    var cardPreviewNumberInput = document.querySelector("[data-card-preview-number]");
    var cardPreviewOwnerInput = document.querySelector("[data-card-preview-owner]");
    var cardPreviewExpiryInput = document.querySelector("[data-card-preview-expiry]");
    var cardPreviewBrand = document.querySelector("[data-card-preview-brand]");
    var cardPreviewNumberText = document.querySelector("[data-card-preview-number-text]");
    var cardPreviewOwnerText = document.querySelector("[data-card-preview-owner-text]");
    var cardPreviewExpiryText = document.querySelector("[data-card-preview-expiry-text]");
    var cardSegments = document.querySelectorAll(".Dashboard-Segment");
    var cardPrimaryInput = document.querySelector("[data-card-primary-input]");
    var cardItems = document.querySelectorAll("[data-card-item]");
    var cardRowsContainer = document.querySelector(".Dashboard-CardRows");
    var cardRegisterForm = document.querySelector(".Dashboard-CardRegister .Dashboard-Form");
    var cardRegisterPanel = document.querySelector(".Dashboard-CardRegister");
    var cardFormTitle = document.querySelector("[data-card-form-title]");
    var cardFormDescription = document.querySelector("[data-card-form-description]");
    var cardCancelButton = document.querySelector("[data-card-cancel]");
    var cardCreateTrigger = document.querySelector("[data-card-create-trigger]");
    var cardSubmitButton = document.querySelector("[data-card-submit]");
    var deleteButtons = document.querySelectorAll("[data-card-delete]");
    var modalCloseButtons = document.querySelectorAll("[data-modal-close]");
    var deleteMessage = document.querySelector("[data-delete-message]");
    var primaryConfirmMessage = document.querySelector("[data-primary-confirm-message]");
    var primaryConfirmButton = document.querySelector("[data-primary-confirm]");
    var paymentDetailRows = document.querySelectorAll("[data-payment-detail]");
    var dashboardLinkElements = document.querySelectorAll("[data-dashboard-link]");
    var detailModalTitle = document.querySelector("[data-detail-modal-title]");
    var detailId = document.querySelector('[data-detail-field="id"]');
    var detailName = document.querySelector('[data-detail-field="name"]');
    var detailType = document.querySelector('[data-detail-field="type"]');
    var detailArtwork = document.querySelector('[data-detail-field="artwork"]');
    var detailAmount = document.querySelector('[data-detail-field="amount"]');
    var detailStatus = document.querySelector('[data-detail-field="status"]');
    var detailDate = document.querySelector('[data-detail-field="date"]');
    var detailExtraLabel = document.querySelector('[data-detail-field="extra-label"]');
    var detailExtraValue = document.querySelector('[data-detail-field="extra-value"]');
    var metricChart;
    var activeMetric = "views";
    var activeRange = "28d";
    var selectedCardItem = document.querySelector('[data-card-item][data-card-primary="true"]') || document.querySelector("[data-card-item]");
    var pendingPrimaryTarget = null;
    var isCardEditMode = false;

    function syncThemeToggle() {
        if (!themeToggle) {
            return;
        }

        themeToggle.textContent = root.getAttribute("data-theme") === "dark" ? "quick light" : "quick dark";
    }

    function getDashboardColor(name, fallback) {
        var value = window.getComputedStyle(document.body).getPropertyValue(name).trim();
        return value || fallback;
    }

    function getChartPalette() {
        return {
            primary: getDashboardColor("--dashboard-primary", "#1e2a38"),
            secondary: getDashboardColor("--dashboard-secondary", "#8b7cff"),
            tertiary: getDashboardColor("--dashboard-tertiary", "#5bd4ff"),
            grid: getDashboardColor("--dashboard-chart-grid", "rgba(30, 42, 56, 0.1)"),
            label: getDashboardColor("--dashboard-chart-label", "#66707c"),
            tooltipBackground: getDashboardColor("--dashboard-chart-tooltip-bg", "#1e2a38"),
            tooltipText: getDashboardColor("--dashboard-chart-tooltip-text", "#ffffff"),
            pointBorder: getDashboardColor("--dashboard-chart-point-border", "#ffffff"),
            fillPrimary: getDashboardColor("--dashboard-chart-fill-primary", "rgba(30, 42, 56, 0.12)"),
            fillSecondary: getDashboardColor("--dashboard-chart-fill-secondary", "rgba(139, 124, 255, 0.16)"),
            fillTertiary: getDashboardColor("--dashboard-chart-fill-tertiary", "rgba(91, 212, 255, 0.18)"),
            fillQuaternary: getDashboardColor("--dashboard-chart-fill-quaternary", "rgba(139, 124, 255, 0.1)")
        };
    }

    var metricMap = {
        views: {
            title: "조회수 추이",
            summary: "지난 4주 동안 조회수가 안정적으로 증가했습니다.",
            colorKey: "primary",
            fillKey: "fillPrimary",
            ranges: {
                "28d": { labels: ["3.4", "3.9", "3.13", "3.18", "3.22", "3.27", "3.31"], values: [18, 26, 24, 35, 44, 52, 63], summary: "지난 4주 동안 조회수가 안정적으로 증가했습니다." },
                "month": { labels: ["1주", "2주", "3주", "4주"], values: [24, 31, 45, 63], summary: "이번 달 조회수는 주차가 갈수록 높아졌습니다." },
                "3m": { labels: ["1월", "2월", "3월"], values: [420, 590, 830], summary: "최근 3개월 동안 조회수는 꾸준한 상승 흐름입니다." },
                "6m": { labels: ["10월", "11월", "12월", "1월", "2월", "3월"], values: [180, 220, 310, 420, 590, 830], summary: "최근 6개월 기준 조회수 성장세가 뚜렷합니다." },
                "12m": { labels: ["4월", "6월", "8월", "10월", "12월", "2월", "3월"], values: [90, 130, 170, 260, 390, 610, 830], summary: "최근 12개월 동안 조회수는 장기적으로 상승했습니다." }
            }
        },
        favorites: {
            title: "찜한 작품 추이",
            colorKey: "secondary",
            fillKey: "fillSecondary",
            ranges: {
                "28d": { labels: ["3.4", "3.9", "3.13", "3.18", "3.22", "3.27", "3.31"], values: [9, 12, 14, 18, 23, 28, 34], summary: "최근 4주 동안 찜한 작품 수가 꾸준히 늘었습니다." },
                "month": { labels: ["1주", "2주", "3주", "4주"], values: [12, 16, 24, 34], summary: "이번 달 후반부로 갈수록 찜한 작품이 더 늘었습니다." },
                "3m": { labels: ["1월", "2월", "3월"], values: [18, 26, 34], summary: "최근 3개월 기준 찜한 작품 수는 완만하게 증가했습니다." },
                "6m": { labels: ["10월", "11월", "12월", "1월", "2월", "3월"], values: [7, 11, 15, 18, 26, 34], summary: "최근 6개월 동안 찜한 작품이 점진적으로 늘었습니다." },
                "12m": { labels: ["4월", "6월", "8월", "10월", "12월", "2월", "3월"], values: [3, 5, 8, 12, 18, 26, 34], summary: "최근 12개월 기준 찜한 작품 수는 장기 상승 흐름입니다." }
            }
        },
        works: {
            title: "내가 만든 작품 추이",
            colorKey: "tertiary",
            fillKey: "fillTertiary",
            ranges: {
                "28d": { labels: ["3.4", "3.9", "3.13", "3.18", "3.22", "3.27", "3.31"], values: [61, 64, 66, 70, 74, 78, 82], summary: "최근 4주 동안 등록 작품 수가 꾸준히 늘었습니다." },
                "month": { labels: ["1주", "2주", "3주", "4주"], values: [64, 69, 75, 82], summary: "이번 달 작품 등록은 후반부에 더 집중되었습니다." },
                "3m": { labels: ["1월", "2월", "3월"], values: [58, 69, 82], summary: "최근 3개월 기준 등록 작품 수가 안정적으로 증가했습니다." },
                "6m": { labels: ["10월", "11월", "12월", "1월", "2월", "3월"], values: [34, 41, 48, 58, 69, 82], summary: "최근 6개월 동안 작품 수가 점진적으로 증가했습니다." },
                "12m": { labels: ["4월", "6월", "8월", "10월", "12월", "2월", "3월"], values: [18, 24, 29, 34, 48, 69, 82], summary: "최근 12개월 동안 내가 만든 작품 수는 장기 상승 흐름입니다." }
            }
        },
        galleries: {
            title: "내가 만든 예술관 추이",
            colorKey: "secondary",
            fillKey: "fillQuaternary",
            ranges: {
                "28d": { labels: ["3.4", "3.9", "3.13", "3.18", "3.22", "3.27", "3.31"], values: [3, 3, 4, 4, 5, 5, 6], summary: "최근 4주 동안 예술관 구성이 한 단계 더 늘었습니다." },
                "month": { labels: ["1주", "2주", "3주", "4주"], values: [3, 4, 5, 6], summary: "이번 달 예술관 수는 후반부에 증가했습니다." },
                "3m": { labels: ["1월", "2월", "3월"], values: [4, 5, 6], summary: "최근 3개월 기준 예술관 수는 완만하게 증가했습니다." },
                "6m": { labels: ["10월", "11월", "12월", "1월", "2월", "3월"], values: [2, 3, 3, 4, 5, 6], summary: "최근 6개월 동안 예술관 구성이 점진적으로 늘었습니다." },
                "12m": { labels: ["4월", "6월", "8월", "10월", "12월", "2월", "3월"], values: [1, 2, 2, 3, 3, 5, 6], summary: "최근 12개월 기준 내가 만든 예술관 수는 꾸준히 증가했습니다." }
            }
        }
    };

    var rangeMap = {
        "28d": { label: "지난 28일", range: "2026. 3. 4. ~ 2026. 3. 31." },
        "month": { label: "이번 달", range: "2026. 3. 1. ~ 2026. 3. 31." },
        "3m": { label: "최근 3개월", range: "2026. 1. 1. ~ 2026. 3. 31." },
        "6m": { label: "최근 6개월", range: "2025. 10. 1. ~ 2026. 3. 31." },
        "12m": { label: "최근 12개월", range: "2025. 4. 1. ~ 2026. 3. 31." }
    };

    function renderMetricChart(key, rangeKey) {
        var metric = metricMap[key];
        var range = metric && metric.ranges[rangeKey];
        var palette = getChartPalette();
        if (!metric || !metricChartCanvas || typeof Chart === "undefined") {
            return;
        }

        if (metricTitle) {
            metricTitle.textContent = metric.title;
        }
        if (metricSummary) {
            metricSummary.textContent = range.summary;
        }

        if (metricChart) {
            metricChart.destroy();
        }

        metricChart = new Chart(metricChartCanvas, {
            type: "line",
            data: {
                labels: range.labels,
                datasets: [{
                    data: range.values,
                    borderColor: palette[metric.colorKey] || palette.primary,
                    backgroundColor: palette[metric.fillKey] || palette.fillPrimary,
                    fill: true,
                    tension: 0,
                    borderWidth: 2.5,
                    pointRadius: 4,
                    pointHoverRadius: 6,
                    pointBackgroundColor: palette[metric.colorKey] || palette.primary,
                    pointBorderColor: palette.pointBorder,
                    pointBorderWidth: 2,
                    pointHitRadius: 12
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: "index"
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        displayColors: false,
                        backgroundColor: palette.tooltipBackground,
                        titleColor: palette.tooltipText,
                        bodyColor: palette.tooltipText,
                        padding: 12,
                        cornerRadius: 12
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        border: {
                            display: false
                        },
                        ticks: {
                            color: palette.label,
                            font: {
                                size: 11
                            }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: palette.grid,
                            drawBorder: false
                        },
                        border: {
                            display: false
                        },
                        ticks: {
                            color: palette.label,
                            font: {
                                size: 11
                            }
                        }
                    }
                }
            }
        });
    }

    function syncTabIndicator(activeTab) {
        if (!tabIndicator || !tabContainer || !activeTab) {
            return;
        }

        var containerRect = tabContainer.getBoundingClientRect();
        var tabRect = activeTab.getBoundingClientRect();
        var offset = tabRect.left - containerRect.left;

        tabIndicator.style.width = tabRect.width + "px";
        tabIndicator.style.transform = "translateX(" + offset + "px)";
    }

    tabs.forEach(function (tab) {
        tab.addEventListener("click", function () {
            var target = tab.getAttribute("data-dashboard-tab");

            tabs.forEach(function (item) {
                item.classList.remove("is-active");
                item.setAttribute("aria-selected", "false");
            });

            panels.forEach(function (panel) {
                var active = panel.getAttribute("data-dashboard-panel") === target;
                panel.classList.toggle("is-active", active);
                panel.hidden = !active;
            });

            tab.classList.add("is-active");
            tab.setAttribute("aria-selected", "true");
            syncTabIndicator(tab);
        });
    });

    var initialActiveTab = document.querySelector(".Dashboard-Tab.is-active");
    syncTabIndicator(initialActiveTab);

    window.addEventListener("resize", function () {
        syncTabIndicator(document.querySelector(".Dashboard-Tab.is-active"));
    });

    metricTabs.forEach(function (tab) {
        var rippleInstance = null;

        function startRipple(event) {
            var rect = tab.getBoundingClientRect();
            var ripple = document.createElement("span");
            var clientX = event.clientX;
            var clientY = event.clientY;
            var localX;
            var localY;
            var maxX;
            var maxY;
            var radius;

            if (typeof clientX !== "number" || typeof clientY !== "number") {
                clientX = rect.left + rect.width / 2;
                clientY = rect.top + rect.height / 2;
            }

            localX = clientX - rect.left;
            localY = clientY - rect.top;
            maxX = Math.max(localX, rect.width - localX);
            maxY = Math.max(localY, rect.height - localY);
            radius = Math.sqrt(maxX * maxX + maxY * maxY);

            ripple.className = "Dashboard-MetricRipple";
            ripple.style.left = localX + "px";
            ripple.style.top = localY + "px";
            ripple.style.setProperty("--ripple-scale", String(radius / 12 + 2));
            tab.appendChild(ripple);
            tab.classList.add("is-pressing");
            rippleInstance = ripple;

            requestAnimationFrame(function () {
                ripple.classList.add("is-pressing");
            });
        }

        function releaseRipple() {
            if (!rippleInstance) {
                tab.classList.remove("is-pressing");
                return;
            }

            rippleInstance.classList.remove("is-pressing");
            rippleInstance.classList.add("is-releasing");
            tab.classList.remove("is-pressing");

            var rippleToRemove = rippleInstance;
            rippleInstance = null;

            window.setTimeout(function () {
                rippleToRemove.remove();
            }, 260);
        }

        tab.addEventListener("pointerdown", function (event) {
            startRipple(event);
        });

        tab.addEventListener("pointerup", releaseRipple);
        tab.addEventListener("pointerleave", releaseRipple);
        tab.addEventListener("pointercancel", releaseRipple);
        tab.addEventListener("blur", releaseRipple);

        tab.addEventListener("click", function () {
            var target = tab.getAttribute("data-metric-tab");

            metricTabs.forEach(function (item) {
                item.classList.remove("is-active");
            });

            tab.classList.add("is-active");
            activeMetric = target;
            renderMetricChart(activeMetric, activeRange);
        });
    });

    if (dateToggle && dateMenu) {
        dateToggle.addEventListener("click", function (event) {
            event.stopPropagation();
            var willOpen = dateMenu.hidden;
            dateMenu.hidden = !willOpen;
            dateToggle.setAttribute("aria-expanded", String(willOpen));
        });

        document.addEventListener("click", function (event) {
            if (!dateMenu.hidden && !event.target.closest(".Dashboard-DatePicker")) {
                dateMenu.hidden = true;
                dateToggle.setAttribute("aria-expanded", "false");
            }
        });
    }

    dateOptions.forEach(function (option) {
        option.addEventListener("click", function () {
            var rangeKey = option.getAttribute("data-date-option");
            var rangeData = rangeMap[rangeKey];
            if (!rangeData) {
                return;
            }

            dateOptions.forEach(function (item) {
                item.classList.remove("is-active");
            });
            option.classList.add("is-active");

            activeRange = rangeKey;
            if (dateLabel) {
                dateLabel.textContent = rangeData.label;
            }
            if (dateRange) {
                dateRange.textContent = rangeData.range;
            }

            if (dateMenu && dateToggle) {
                dateMenu.hidden = true;
                dateToggle.setAttribute("aria-expanded", "false");
            }

            renderMetricChart(activeMetric, activeRange);
        });
    });

    if (cardPreviewNameInput && cardPreviewBrand) {
        cardPreviewNameInput.addEventListener("input", function () {
            var value = cardPreviewNameInput.value.trim();
            cardPreviewBrand.textContent = value ? value.toUpperCase() : "NEW CARD";
        });
    }

    if (cardPreviewNumberInput && cardPreviewNumberText) {
        cardPreviewNumberInput.addEventListener("input", function () {
            var digits = cardPreviewNumberInput.value.replace(/\D/g, "").slice(0, 16);
            var groups = digits.match(/.{1,4}/g) || [];
            var formatted = groups.join(" ");

            cardPreviewNumberInput.value = formatted;
            cardPreviewNumberText.textContent = formatted || "**** **** **** ****";
        });
    }

    if (cardPreviewOwnerInput && cardPreviewOwnerText) {
        cardPreviewOwnerInput.addEventListener("input", function () {
            var value = cardPreviewOwnerInput.value.trim();
            cardPreviewOwnerText.textContent = value || "카드 소유자";
        });
    }

    if (cardPreviewExpiryInput && cardPreviewExpiryText) {
        cardPreviewExpiryInput.addEventListener("input", function () {
            var digits = cardPreviewExpiryInput.value.replace(/\D/g, "").slice(0, 4);
            var formatted = digits.length > 2 ? digits.slice(0, 2) + "/" + digits.slice(2) : digits;

            cardPreviewExpiryInput.value = formatted;
            cardPreviewExpiryText.textContent = formatted || "MM/YY";
        });
    }

    function applySegment(segmentName) {
        cardSegments.forEach(function (segment) {
            segment.classList.toggle("is-active", segment.textContent.trim() === segmentName);
        });
    }

    function updateCardRowDisplay(item) {
        var alias = item.getAttribute("data-card-alias") || "";
        var number = item.getAttribute("data-card-number") || "";
        var expiry = item.getAttribute("data-card-expiry") || "";
        var isPrimary = item.getAttribute("data-card-primary") === "true";
        var title = item.querySelector(".Dashboard-CardRowTop strong");
        var badge = item.querySelector(".Dashboard-StatusBadge");
        var maskedNumber = item.querySelector(".Dashboard-CardRowMain p");
        var expiryValue = item.querySelector(".Dashboard-CardRowMeta strong");
        var rowTop = item.querySelector(".Dashboard-CardRowTop");
        var deleteButton = item.querySelector(".Dashboard-TextButton");
        var maskedText = "**** •••• •••• ****";

        if (number && number.length >= 4) {
            maskedText = number.slice(0, 4) + " •••• •••• " + number.slice(-4);
        }

        if (title) {
            title.textContent = alias || "카드 별칭";
        }
        if (maskedNumber) {
            maskedNumber.textContent = maskedText;
        }
        if (expiryValue) {
            expiryValue.textContent = expiry || "MM/YY";
        }

        if (isPrimary) {
            item.classList.add("is-primary");
            if (!badge && rowTop) {
                badge = document.createElement("span");
                badge.className = "Dashboard-StatusBadge";
                rowTop.appendChild(badge);
            }
            if (badge) {
                badge.textContent = "메인 카드";
            }
            if (deleteButton) {
                deleteButton.disabled = true;
                deleteButton.classList.remove("Dashboard-TextButton--danger");
            }
        } else {
            item.classList.remove("is-primary");
            if (badge) {
                badge.remove();
            }
            if (deleteButton) {
                deleteButton.disabled = false;
                deleteButton.classList.add("Dashboard-TextButton--danger");
            }
        }
    }

    function sortPrimaryCardToTop() {
        var primaryCard = document.querySelector('[data-card-item][data-card-primary="true"]');

        if (cardRowsContainer && primaryCard) {
            cardRowsContainer.prepend(primaryCard);
        }
    }

    function setCardFormMode(editMode) {
        isCardEditMode = editMode;

        if (cardRegisterPanel) {
            cardRegisterPanel.classList.toggle("is-edit-mode", editMode);
        }
        if (cardFormTitle) {
            cardFormTitle.textContent = editMode ? "카드 수정" : "카드 등록";
        }
        if (cardFormDescription) {
            cardFormDescription.textContent = editMode
                ? "등록된 카드의 별칭과 대표 카드 설정을 수정합니다."
                : "결제에 사용할 카드를 등록하고 대표 카드 여부를 설정합니다.";
        }
        if (cardSubmitButton) {
            cardSubmitButton.textContent = editMode ? "카드 수정" : "카드 등록";
        }

        if (cardPreviewNumberInput) {
            cardPreviewNumberInput.readOnly = editMode;
        }
        if (cardPreviewOwnerInput) {
            cardPreviewOwnerInput.readOnly = editMode;
        }
        if (cardPreviewExpiryInput) {
            cardPreviewExpiryInput.readOnly = editMode;
        }

        cardSegments.forEach(function (segment) {
            segment.disabled = editMode;
        });
    }

    function resetCardForm() {
        if (cardPreviewNameInput) {
            cardPreviewNameInput.value = "";
            cardPreviewNameInput.dispatchEvent(new Event("input", { bubbles: true }));
        }
        if (cardPreviewNumberInput) {
            cardPreviewNumberInput.value = "";
            cardPreviewNumberInput.dispatchEvent(new Event("input", { bubbles: true }));
        }
        if (cardPreviewOwnerInput) {
            cardPreviewOwnerInput.value = "";
            cardPreviewOwnerInput.dispatchEvent(new Event("input", { bubbles: true }));
        }
        if (cardPreviewExpiryInput) {
            cardPreviewExpiryInput.value = "";
            cardPreviewExpiryInput.dispatchEvent(new Event("input", { bubbles: true }));
        }
        if (cardPrimaryInput) {
            cardPrimaryInput.checked = true;
        }

        applySegment("개인");
        setCardFormMode(false);

        cardItems.forEach(function (card) {
            card.classList.remove("is-editing");
        });
        selectedCardItem = document.querySelector('[data-card-item][data-card-primary="true"]') || document.querySelector("[data-card-item]");
    }

    function fillFormFromCard(item) {
        var alias = item.getAttribute("data-card-alias") || "";
        var number = item.getAttribute("data-card-number") || "";
        var owner = item.getAttribute("data-card-owner") || "";
        var expiry = item.getAttribute("data-card-expiry") || "";
        var segmentName = item.getAttribute("data-card-segment") || "";
        var isPrimary = item.getAttribute("data-card-primary") === "true";

        selectedCardItem = item;

        cardItems.forEach(function (card) {
            card.classList.toggle("is-editing", card === item);
        });

        if (cardPreviewNameInput) {
            cardPreviewNameInput.value = alias;
            cardPreviewNameInput.dispatchEvent(new Event("input", { bubbles: true }));
        }
        if (cardPreviewNumberInput) {
            cardPreviewNumberInput.value = number;
            cardPreviewNumberInput.dispatchEvent(new Event("input", { bubbles: true }));
        }
        if (cardPreviewOwnerInput) {
            cardPreviewOwnerInput.value = owner;
            cardPreviewOwnerInput.dispatchEvent(new Event("input", { bubbles: true }));
        }
        if (cardPreviewExpiryInput) {
            cardPreviewExpiryInput.value = expiry;
            cardPreviewExpiryInput.dispatchEvent(new Event("input", { bubbles: true }));
        }
        if (cardPrimaryInput) {
            cardPrimaryInput.checked = isPrimary;
        }

        applySegment(segmentName);
        setCardFormMode(true);
    }

    function promoteToPrimary(targetItem) {
        cardItems.forEach(function (item) {
            item.setAttribute("data-card-primary", item === targetItem ? "true" : "false");
            updateCardRowDisplay(item);
        });

        sortPrimaryCardToTop();
        fillFormFromCard(targetItem);
    }

    cardSegments.forEach(function (segment) {
        segment.addEventListener("click", function () {
            cardSegments.forEach(function (item) {
                item.classList.remove("is-active");
            });
            segment.classList.add("is-active");
        });
    });

    cardItems.forEach(function (item) {
        function selectCardRow() {
            fillFormFromCard(item);
        }

        item.addEventListener("click", function (event) {
            if (event.target.closest("[data-card-delete]")) {
                return;
            }
            selectCardRow();
        });

        item.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                selectCardRow();
            }
        });
    });

    if (cardPrimaryInput) {
        cardPrimaryInput.addEventListener("change", function () {
            if (!selectedCardItem) {
                return;
            }

            if (selectedCardItem.getAttribute("data-card-primary") === "true" && !cardPrimaryInput.checked) {
                cardPrimaryInput.checked = true;
                openModal("primary-required");
            }
        });
    }

    if (cardRegisterForm) {
        cardRegisterForm.addEventListener("submit", function (event) {
            var activeSegment = document.querySelector(".Dashboard-Segment.is-active");
            var wantsPrimary;

            event.preventDefault();

            if (!selectedCardItem) {
                return;
            }

            if (cardPreviewNameInput) {
                selectedCardItem.setAttribute("data-card-alias", cardPreviewNameInput.value.trim());
            }
            if (!isCardEditMode && cardPreviewNumberInput) {
                selectedCardItem.setAttribute("data-card-number", cardPreviewNumberInput.value.trim());
            }
            if (!isCardEditMode && cardPreviewOwnerInput) {
                selectedCardItem.setAttribute("data-card-owner", cardPreviewOwnerInput.value.trim());
            }
            if (!isCardEditMode && cardPreviewExpiryInput) {
                selectedCardItem.setAttribute("data-card-expiry", cardPreviewExpiryInput.value.trim());
            }
            if (!isCardEditMode) {
                selectedCardItem.setAttribute("data-card-segment", activeSegment ? activeSegment.textContent.trim() : "");
            }

            wantsPrimary = !!(cardPrimaryInput && cardPrimaryInput.checked);

            if (wantsPrimary && selectedCardItem.getAttribute("data-card-primary") !== "true") {
                pendingPrimaryTarget = selectedCardItem;
                if (primaryConfirmMessage) {
                    primaryConfirmMessage.textContent = "기존 메인 카드를 해제하고 " + (selectedCardItem.getAttribute("data-card-alias") || "선택한 카드") + "를 메인 카드로 변경하시겠습니까?";
                }
                openModal("primary-confirm");
                return;
            }

            updateCardRowDisplay(selectedCardItem);
            fillFormFromCard(selectedCardItem);
        });
    }

    if (cardCancelButton) {
        cardCancelButton.addEventListener("click", function () {
            resetCardForm();
        });
    }

    if (cardCreateTrigger) {
        cardCreateTrigger.addEventListener("click", function () {
            resetCardForm();
        });
    }

    if (themeToggle) {
        syncThemeToggle();
        themeToggle.addEventListener("click", function () {
            var nextTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
            root.setAttribute("data-theme", nextTheme);
            syncThemeToggle();
            renderMetricChart(activeMetric, activeRange);
        });
    }

    if (primaryConfirmButton) {
        primaryConfirmButton.addEventListener("click", function () {
            if (pendingPrimaryTarget) {
                promoteToPrimary(pendingPrimaryTarget);
            }
            pendingPrimaryTarget = null;
            closeModal(primaryConfirmButton);
        });
    }

    function openModal(name) {
        var modal = document.querySelector('[data-dashboard-modal="' + name + '"]');
        if (modal) {
            modal.hidden = false;
        }
    }

    function closeModal(target) {
        var modal = target.closest(".Dashboard-Modal");
        if (modal) {
            modal.hidden = true;
        }
    }

    function fillDetailModal(row) {
        if (detailModalTitle) {
            detailModalTitle.textContent = row.getAttribute("data-detail-title") || "상세 정보";
        }
        if (detailId) {
            detailId.textContent = row.getAttribute("data-detail-id") || "-";
        }
        if (detailName) {
            detailName.textContent = row.getAttribute("data-detail-name") || "-";
        }
        if (detailType) {
            detailType.textContent = row.getAttribute("data-detail-type") || "-";
        }
        if (detailArtwork) {
            detailArtwork.textContent = row.getAttribute("data-detail-artwork") || "-";
        }
        if (detailAmount) {
            detailAmount.textContent = row.getAttribute("data-detail-amount") || "-";
        }
        if (detailStatus) {
            detailStatus.textContent = row.getAttribute("data-detail-status") || "-";
        }
        if (detailDate) {
            detailDate.textContent = row.getAttribute("data-detail-date") || "-";
        }
        if (detailExtraLabel) {
            detailExtraLabel.textContent = row.getAttribute("data-detail-extra-label") || "추가 정보";
        }
        if (detailExtraValue) {
            detailExtraValue.textContent = row.getAttribute("data-detail-extra-value") || "-";
        }
    }

    deleteButtons.forEach(function (button) {
        button.addEventListener("click", function (event) {
            event.stopPropagation();
            var cardName = button.getAttribute("data-card-delete");
            if (deleteMessage) {
                deleteMessage.textContent = cardName + " 카드를 삭제하시겠습니까?";
            }
            openModal("delete");
        });
    });

    paymentDetailRows.forEach(function (row) {
        function openDetail() {
            fillDetailModal(row);
            openModal("payment-detail");
        }

        row.addEventListener("click", openDetail);
        row.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openDetail();
            }
        });
    });

    dashboardLinkElements.forEach(function (row) {
        function moveToDetail() {
            var target = row.getAttribute("data-dashboard-link");

            if (!target) {
                return;
            }

            window.location.href = target;
        }

        row.addEventListener("click", moveToDetail);
        row.addEventListener("keydown", function (event) {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                moveToDetail();
            }
        });
    });

    modalCloseButtons.forEach(function (button) {
        button.addEventListener("click", function () {
            pendingPrimaryTarget = null;
            closeModal(button);
        });
    });

    cardItems.forEach(function (item) {
        updateCardRowDisplay(item);
    });
    sortPrimaryCardToTop();
    resetCardForm();

    renderMetricChart(activeMetric, activeRange);
});
