document.addEventListener('DOMContentLoaded', function () {
  // 대시보드 상태 관리
  var state = {
    dashboard: null,
    cards: [],
    activeMetric: 'favorites',
    activeRange: '28d',
    chart: null,
    editingCardId: null,
    pendingDeleteId: null,
  };

  var tabButtons = Array.from(document.querySelectorAll('[data-dashboard-tab]'));
  var panels = Array.from(document.querySelectorAll('[data-dashboard-panel]'));
  var tabIndicator = document.querySelector('.Dashboard-TabIndicator');
  var tabContainer = document.querySelector('.Dashboard-Tabs');
  var metricButtons = Array.from(document.querySelectorAll('[data-metric-tab]'));
  var dateToggle = document.querySelector('[data-date-toggle]');
  var dateMenu = document.querySelector('[data-date-menu]');
  var dateLabel = document.querySelector('[data-date-label]');
  var dateRange = document.querySelector('[data-date-range]');
  var dateOptions = Array.from(document.querySelectorAll('[data-date-option]'));
  var metricTitle = document.querySelector('[data-metric-title]');
  var metricSummary = document.querySelector('[data-metric-summary]');
  var metricChartCanvas = document.getElementById('dashboardMetricChart');
  var summaryTablesRoot = document.querySelector('[data-summary-tables]');
  var listBodies = Array.from(document.querySelectorAll('[data-list-body]'));
  var cardRowsRoot = document.querySelector('[data-card-rows]');
  var cardForm = document.querySelector('[data-card-form]');
  var cardCompanySelect = document.querySelector('[data-card-company-select]');
  var cardCompanyTrigger = document.querySelector('[data-card-company-trigger]');
  var cardCompanyLabel = document.querySelector('[data-card-company-label]');
  var cardCompanyMenu = document.querySelector('[data-card-company-menu]');
  var cardCompanyOptions = Array.from(document.querySelectorAll('[data-card-company-option]'));
  var cardCompanyInput = document.querySelector('[data-card-company-input]');
  var cardNumberInput = document.querySelector('[data-card-number-input]');
  var cardPasswordInput = document.querySelector('[data-card-password-input]');
  var cardIdentityInput = document.querySelector('[data-card-identity-input]');
  var cardExpireMonthInput = document.querySelector('[data-card-expire-month-input]');
  var cardExpireYearInput = document.querySelector('[data-card-expire-year-input]');
  var cardPrimaryInput = document.querySelector('[data-card-primary-input]');
  var cardPreviewBrand = document.querySelector('[data-card-preview-brand]');
  var cardPreviewNumberText = document.querySelector('[data-card-preview-number-text]');
  var cardFormTitle = document.querySelector('[data-card-form-title]');
  var cardFormDescription = document.querySelector('[data-card-form-description]');
  var cardSubmitButton = document.querySelector('[data-card-submit]');
  var cardDeleteConfirmButton = document.querySelector('[data-card-delete-confirm]');
  var deleteMessage = document.querySelector('[data-delete-message]');
  var detailModalTitle = document.querySelector('[data-detail-modal-title]');
  var detailFields = {
    tag: document.querySelector('[data-detail-field="tag"]'),
    title: document.querySelector('[data-detail-field="title"]'),
    description: document.querySelector('[data-detail-field="description"]'),
    amount: document.querySelector('[data-detail-field="amount"]'),
  };

  // JSON 요청 처리
  function requestJson(url, options) {
    return fetch(url, Object.assign({
      credentials: 'same-origin',
      headers: {
        'Content-Type': 'application/json',
      },
    }, options || {}))
      .then(function (response) {
        if (!response.ok) {
          return response.text().then(function (text) {
            throw new Error(text || '요청 처리 중 오류가 발생했습니다.');
          });
        }

        if (response.status === 204) {
          return null;
        }

        var contentType = response.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          throw new Error('대시보드 응답 형식이 올바르지 않습니다.');
        }

        return response.json();
      });
  }

  function escapeHtml(value) {
    return String(value == null ? '' : value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function escapeAttribute(value) {
    return escapeHtml(value);
  }

  function digitsOnly(value) {
    return String(value || '').replace(/\D/g, '');
  }

  function formatCardNumber(value) {
    return digitsOnly(value).slice(0, 16).replace(/(\d{4})(?=\d)/g, '$1 ').trim();
  }

  function maskCardNumber(value) {
    var digits = digitsOnly(value).slice(0, 16);
    if (digits.length < 8) {
      return '**** **** **** ****';
    }

    var first = digits.slice(0, 4);
    var last = digits.slice(-4);
    return first + ' **** **** ' + last;
  }

  function hasRawCardInput(payload) {
    return !!(payload.cardNumber || payload.cardPasswordTwoDigits || payload.cardIdentityNo || payload.cardExpireMonth || payload.cardExpireYear);
  }

  function getSelectedCardCompany() {
    return cardCompanyInput ? cardCompanyInput.value.trim() : '';
  }

  function closeCardCompanyMenu() {
    if (cardCompanyMenu) {
      cardCompanyMenu.classList.remove('is-active');
      cardCompanyMenu.hidden = true;
    }
    if (cardCompanyTrigger) {
      cardCompanyTrigger.setAttribute('aria-expanded', 'false');
    }
    if (cardCompanySelect) {
      cardCompanySelect.classList.remove('is-open');
    }
  }

  function openCardCompanyMenu() {
    if (cardCompanyMenu) {
      cardCompanyMenu.hidden = false;
      cardCompanyMenu.classList.add('is-active');
    }
    if (cardCompanyTrigger) {
      cardCompanyTrigger.setAttribute('aria-expanded', 'true');
    }
    if (cardCompanySelect) {
      cardCompanySelect.classList.add('is-open');
    }
  }

  function setCardCompany(value) {
    var company = String(value || '').trim();

    if (cardCompanyInput) {
      cardCompanyInput.value = company;
    }
    if (cardCompanyLabel) {
      cardCompanyLabel.textContent = company || '카드사를 선택해 주세요.';
    }

    cardCompanyOptions.forEach(function (option) {
      var selected = option.dataset.cardCompanyOption === company;
      option.classList.toggle('is-selected', selected);
      option.setAttribute('aria-selected', selected ? 'true' : 'false');
    });
  }

  // 모달 열기
  function openModal(name) {
    var modal = document.querySelector('[data-dashboard-modal="' + name + '"]');
    if (modal) {
      if (modal.parentElement !== document.body) {
        document.body.appendChild(modal);
      }
      modal.hidden = false;
    }
  }

  // 모달 닫기
  function closeModal(button) {
    var modal = button.closest('.Dashboard-Modal');
    if (modal) {
      modal.hidden = true;
    }
  }

  // 탭 인디케이터 이동
  function syncTabIndicator(activeTab) {
    if (!tabIndicator || !tabContainer || !activeTab) {
      return;
    }

    var containerRect = tabContainer.getBoundingClientRect();
    var tabRect = activeTab.getBoundingClientRect();
    tabIndicator.style.width = tabRect.width + 'px';
    tabIndicator.style.transform = 'translateX(' + (tabRect.left - containerRect.left) + 'px)';
  }

  function activateTab(target) {
    if (!target) {
      return;
    }

    var activeButton = tabButtons.find(function (button) {
      return button.dataset.dashboardTab === target;
    });

    if (!activeButton) {
      return;
    }

    tabButtons.forEach(function (button) {
      var active = button === activeButton;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-selected', active ? 'true' : 'false');
    });

    panels.forEach(function (panel) {
      var active = panel.dataset.dashboardPanel === target;
      panel.classList.toggle('is-active', active);
      panel.hidden = !active;
    });

    syncTabIndicator(activeButton);
  }

  // 탭 이벤트 연결
  function setupTabs() {
    tabButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        activateTab(button.dataset.dashboardTab);
      });
    });

    var initialTab = new URLSearchParams(window.location.search).get('tab');
    if (initialTab) {
      activateTab(initialTab);
    } else {
      syncTabIndicator(document.querySelector('.Dashboard-Tab.is-active'));
    }

    window.addEventListener('resize', function () {
      syncTabIndicator(document.querySelector('.Dashboard-Tab.is-active'));
    });
  }

  // 기간 선택 드롭다운 이벤트를 연결한다.
  function setupDatePicker() {
    if (dateToggle && dateMenu) {
      dateToggle.addEventListener('click', function (event) {
        event.stopPropagation();
        var willOpen = dateMenu.hidden;
        dateMenu.hidden = !willOpen;
        dateToggle.setAttribute('aria-expanded', willOpen ? 'true' : 'false');
      });

      document.addEventListener('click', function (event) {
        if (!dateMenu.hidden && !event.target.closest('.Dashboard-DatePicker')) {
          dateMenu.hidden = true;
          dateToggle.setAttribute('aria-expanded', 'false');
        }
      });
    }

    dateOptions.forEach(function (option) {
      option.addEventListener('click', function () {
        state.activeRange = option.dataset.dateOption;
        dateOptions.forEach(function (item) {
          item.classList.toggle('is-active', item === option);
        });

        if (dateMenu && dateToggle) {
          dateMenu.hidden = true;
          dateToggle.setAttribute('aria-expanded', 'false');
        }

        renderMetricChart();
      });
    });
  }

  // 서버 요약 데이터를 테이블 카드 UI로 그린다.
  function renderSummaryTables() {
    if (!summaryTablesRoot || !state.dashboard) {
      return;
    }

    var tables = state.dashboard.summaryTables || [];
    summaryTablesRoot.innerHTML = tables.map(function (table) {
      var items = (table.items || []).slice();
      var isPortfolioSummary = table.title === '작품/예술관 요약';

      if (isPortfolioSummary && !items.some(function (item) { return item.label === '누적 조회수'; })) {
        items.push({
          label: '누적 조회수',
          value: (state.dashboard.totalViewsText || '0') + '회',
        });
      }

      var rows = items.map(function (item) {
        return '<tr><td>' + escapeHtml(item.label) + '</td><td>' + escapeHtml(item.value) + '</td></tr>';
      }).join('');

      var hint = isPortfolioSummary
        ? '<p class="Dashboard-TableHint">※작품+예술관 조회수 합산입니다.</p>'
        : '';

      return '' +
        '<article class="Dashboard-Card Dashboard-InfoCard Dashboard-TableCard">' +
          '<div class="Dashboard-CardHead">' +
            '<h2>' + escapeHtml(table.title) + '</h2>' +
            '<p>' + escapeHtml(table.description) + '</p>' +
          '</div>' +
          '<div class="Dashboard-TableWrap Dashboard-TableWrap--compact">' +
            '<table class="Dashboard-Table">' +
              '<thead><tr><th>항목</th><th>수치</th></tr></thead>' +
              '<tbody>' + rows + '</tbody>' +
            '</table>' +
          '</div>' +
          hint +
        '</article>';
    }).join('');
  }

  // 상태 배지 결정
  function inferStatusClass(text) {
    if (!text) return '';
    if (text.indexOf('대기') >= 0 || text.indexOf('진행') >= 0) return ' Dashboard-StatusBadge--pending';
    if (text.indexOf('취소') >= 0 || text.indexOf('반려') >= 0 || text.indexOf('유찰') >= 0) return ' Dashboard-StatusBadge--danger';
    return '';
  }

  function resolveDownloadTargetFile(files) {
    if (!Array.isArray(files) || !files.length) {
      return null;
    }

    var mediaFile = files.find(function (file) {
      return Number(file && file.sortOrder) > 0 && file.fileUrl;
    });
    if (mediaFile) {
      return mediaFile;
    }

    return files.find(function (file) {
      return file && file.fileUrl;
    }) || null;
  }

  function buildDownloadFilename(title, file) {
    var rawTitle = String(title || 'bideo-work').trim();
    var safeTitle = rawTitle.replace(/[\\/:*?"<>|]/g, '_') || 'bideo-work';
    var fileUrl = String(file && file.fileUrl || '');
    var pathname = '';

    try {
      pathname = new URL(fileUrl).pathname || '';
    } catch (error) {
      pathname = fileUrl.split('?')[0] || '';
    }

    var fileName = pathname.split('/').pop() || '';
    var dotIndex = fileName.lastIndexOf('.');
    if (dotIndex > -1) {
      return safeTitle + fileName.slice(dotIndex);
    }

    var fileType = String(file && file.fileType || '');
    if (fileType.indexOf('video/') === 0) return safeTitle + '.mp4';
    if (fileType.indexOf('image/png') === 0) return safeTitle + '.png';
    if (fileType.indexOf('image/jpeg') === 0) return safeTitle + '.jpg';
    if (fileType.indexOf('image/webp') === 0) return safeTitle + '.webp';
    return safeTitle;
  }

  function triggerDirectDownload(url) {
    var link = document.createElement('a');
    link.href = url;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  async function downloadWorkAsset(item, triggerButton) {
    if (!item || !item.downloadWorkId) {
      throw new Error('다운로드할 작품 정보가 없습니다.');
    }

    var originalText = triggerButton ? triggerButton.textContent : '';

    try {
      if (triggerButton) {
        triggerButton.disabled = true;
        triggerButton.textContent = '다운로드 중';
      }

      triggerDirectDownload('/downloads/works/' + item.downloadWorkId);
    } finally {
      if (triggerButton) {
        triggerButton.disabled = false;
        triggerButton.textContent = originalText;
      }
    }
  }

  // 각 탭의 리스트형 데이터를 행 UI로 렌더링한다.
  function renderList(name, items) {
    var body = document.querySelector('[data-list-body="' + name + '"]');
    if (!body) {
      return;
    }

    body.innerHTML = (items || []).map(function (item) {
      var badge = item.tag ? '<span class="Dashboard-StatusBadge' + inferStatusClass(item.tag) + '">' + escapeHtml(item.tag) + '</span>' : '';
      var amount = item.amount ? '<span>' + escapeHtml(item.amount) + '</span>' : '';
      var usesModalDetail = name === 'paymentHistory' || name === 'settlements';
      var detailAction = item.detailUrl
        ? (usesModalDetail
            ? '<button class="Dashboard-TextButton Dashboard-TextButton--link" type="button" data-open-detail>상세</button>'
            : '<a class="Dashboard-TextButton Dashboard-TextButton--link" href="' + escapeAttribute(item.detailUrl) + '" data-detail-link>상세</a>')
        : '';
      var downloadAction = item.downloadWorkId
        ? '<button class="Dashboard-TextButton Dashboard-TextButton--link" type="button" data-download-work-id="' + item.downloadWorkId + '">다운로드</button>'
        : '';
      var actionMarkup = (detailAction || downloadAction)
        ? '<div class="Dashboard-DataRowActions">' + detailAction + downloadAction + '</div>'
        : '';
      return '' +
        '<article class="Dashboard-DataRow" tabindex="0" data-detail-row>' +
          '<div>' +
            '<strong>' + escapeHtml(item.title || '-') + '</strong>' +
            '<p>' + escapeHtml(item.description || '-') + '</p>' +
          '</div>' +
          '<div class="Dashboard-DataRowMeta">' +
            amount +
            badge +
            actionMarkup +
          '</div>' +
        '</article>';
    }).join('');

    Array.from(body.querySelectorAll('[data-detail-row]')).forEach(function (row, index) {
      row.addEventListener('click', function () {
        if (items[index] && items[index].actionUrl) {
          window.location.href = items[index].actionUrl;
          return;
        }
        openDetail(items[index]);
      });
      row.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          if (items[index] && items[index].actionUrl) {
            window.location.href = items[index].actionUrl;
            return;
          }
          openDetail(items[index]);
        }
      });
    });

    Array.from(body.querySelectorAll('[data-detail-link]')).forEach(function (link) {
      link.addEventListener('click', function (event) {
        event.stopPropagation();
      });
    });

    Array.from(body.querySelectorAll('[data-open-detail]')).forEach(function (button, index) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        openDetail(items[index]);
      });
    });

    Array.from(body.querySelectorAll('[data-download-work-id]')).forEach(function (button, index) {
      button.addEventListener('click', function (event) {
        event.stopPropagation();
        downloadWorkAsset(items[index], button).catch(handleError);
      });
    });
  }

  // 선택한 항목 정보를 상세 모달에 채운다.
  // 상세 모달 표시
  function openDetail(item) {
    if (detailModalTitle) {
      detailModalTitle.textContent = (item && item.title ? item.title : '상세 정보');
    }

    Object.keys(detailFields).forEach(function (key) {
      if (detailFields[key]) {
        detailFields[key].textContent = item && item[key] ? item[key] : '-';
      }
    });

    openModal('payment-detail');
  }

  // 상단 지표 숫자를 최신 값으로 갱신한다.
  // 지표 카드 렌더링
  function renderMetrics() {
    if (!state.dashboard) {
      return;
    }

    var metrics = state.dashboard.analyticsMetrics || {};
    Object.keys(metrics).forEach(function (key) {
      var valueNode = document.querySelector('[data-metric-value="' + key + '"]');
      if (valueNode) {
        valueNode.textContent = metrics[key].valueText || '0';
      }
    });
  }

  // 선택된 지표와 기간 기준으로 차트를 다시 그린다.
  // 지표 차트 렌더링
  function renderMetricChart() {
    if (!state.dashboard || typeof Chart === 'undefined' || !metricChartCanvas) {
      return;
    }

    var metrics = state.dashboard.analyticsMetrics || {};
    var metric = metrics[state.activeMetric];
    if (!metric) {
      var metricKeys = Object.keys(metrics);
      metric = metricKeys.length ? metrics[metricKeys[0]] : null;
    }
    if (!metric) {
      return;
    }

    var range = metric.ranges ? metric.ranges[state.activeRange] : null;
    if (!range) {
      var firstKey = Object.keys(metric.ranges || {})[0];
      range = firstKey ? metric.ranges[firstKey] : null;
    }
    if (!range) {
      return;
    }

    if (metricTitle) {
      metricTitle.textContent = metric.title || '통계';
    }
    if (metricSummary) {
      metricSummary.textContent = range.summary || '';
    }
    if (dateLabel) {
      dateLabel.textContent = range.label || '';
    }
    if (dateRange) {
      dateRange.textContent = range.dateRangeText || '';
    }

    if (state.chart) {
      state.chart.destroy();
    }

    state.chart = new Chart(metricChartCanvas, {
      type: 'line',
      data: {
        labels: range.labels || [],
        datasets: [{
          data: range.values || [],
          borderColor: '#1e2a38',
          backgroundColor: 'rgba(30, 42, 56, 0.12)',
          fill: true,
          tension: 0.2,
          borderWidth: 2.5,
          pointRadius: 4,
          pointHoverRadius: 6,
          pointBackgroundColor: '#1e2a38',
          pointBorderColor: '#ffffff',
          pointBorderWidth: 2,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
        },
        scales: {
          x: {
            grid: { display: false },
            border: { display: false },
          },
          y: {
            beginAtZero: true,
            border: { display: false },
          },
        },
      },
    });
  }

  // 지표 버튼 이벤트 연결
  function setupMetricButtons() {
    metricButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        state.activeMetric = button.dataset.metricTab;
        metricButtons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
        });
        renderMetricChart();
      });
    });
  }

  // 카드 미리보기 동기화
  function syncCardPreview() {
    if (cardPreviewBrand) {
      cardPreviewBrand.textContent = getSelectedCardCompany() || 'NEW CARD';
    }
    if (cardPreviewNumberText) {
      cardPreviewNumberText.textContent = maskCardNumber(cardNumberInput ? cardNumberInput.value : '');
    }
  }

  // 카드 폼을 등록 모드와 수정 모드에 맞게 바꾼다.
  // 카드 폼 상태 변경
  function setCardFormMode(editing) {
    if (cardFormTitle) {
      cardFormTitle.textContent = editing ? '카드 수정' : '카드 등록';
    }
    if (cardFormDescription) {
      cardFormDescription.textContent = editing
        ? '카드사와 대표 카드 상태를 수정할 수 있습니다. 민감한 카드 정보는 다시 저장하지 않습니다.'
        : '불필요한 정보는 저장하지 않고, 카드 식별에 필요한 값만 검증합니다.';
    }
    if (cardSubmitButton) {
      cardSubmitButton.textContent = editing ? '카드 수정' : '카드 등록';
    }
  }

  // 카드 입력 폼을 초기 상태로 되돌린다.
  // 카드 폼 초기화
  function resetCardForm() {
    state.editingCardId = null;
    if (cardForm) {
      cardForm.reset();
    }
    if (cardPrimaryInput) {
      cardPrimaryInput.checked = true;
    }
    setCardFormMode(false);
    setCardCompany('');
    closeCardCompanyMenu();
    syncCardPreview();
  }

  // 카드 폼 채우기
  function fillCardForm(card) {
    state.editingCardId = card.id;
    setCardCompany(card.cardCompany || '');
    if (cardNumberInput) cardNumberInput.value = '';
    if (cardPasswordInput) cardPasswordInput.value = '';
    if (cardIdentityInput) cardIdentityInput.value = '';
    if (cardExpireMonthInput) cardExpireMonthInput.value = '';
    if (cardExpireYearInput) cardExpireYearInput.value = '';
    if (cardPrimaryInput) cardPrimaryInput.checked = !!card.isDefault;
    setCardFormMode(true);
    if (cardPreviewBrand) {
      cardPreviewBrand.textContent = card.cardCompany || 'CARD';
    }
    if (cardPreviewNumberText) {
      cardPreviewNumberText.textContent = card.cardNumberMasked || '**** **** **** ****';
    }
  }

  // 카드 목록을 그리고 각 버튼 이벤트를 연결한다.
  // 카드 목록 렌더링
  function renderCards() {
    if (!cardRowsRoot) {
      return;
    }

    cardRowsRoot.innerHTML = state.cards.map(function (card) {
      return '' +
        '<article class="Dashboard-CardRow' + (card.isDefault ? ' is-primary' : '') + '" tabindex="0" data-card-id="' + card.id + '">' +
          '<div class="Dashboard-CardRowMain">' +
            '<div class="Dashboard-CardRowTop">' +
              '<strong>' + escapeHtml(card.cardCompany || '카드') + '</strong>' +
              (card.isDefault ? '<span class="Dashboard-StatusBadge">대표 카드</span>' : '') +
            '</div>' +
            '<p>' + escapeHtml(card.cardNumberMasked || '-') + '</p>' +
          '</div>' +
          '<div class="Dashboard-CardRowActions">' +
            (card.isDefault ? '' : '<button class="Dashboard-TextButton" type="button" data-card-default="' + card.id + '">대표 지정</button>') +
            '<button class="Dashboard-TextButton Dashboard-TextButton--danger" type="button" data-card-delete="' + card.id + '">삭제</button>' +
          '</div>' +
        '</article>';
    }).join('');

    Array.from(cardRowsRoot.querySelectorAll('[data-card-id]')).forEach(function (row) {
      row.addEventListener('click', function (event) {
        if (event.target.closest('[data-card-delete]') || event.target.closest('[data-card-default]')) {
          return;
        }

        var cardId = Number(row.dataset.cardId);
        var card = state.cards.find(function (item) { return item.id === cardId; });
        if (card) {
          fillCardForm(card);
        }
      });
    });

    Array.from(cardRowsRoot.querySelectorAll('[data-card-default]')).forEach(function (button) {
      button.addEventListener('click', function () {
        requestJson('/api/cards/' + button.dataset.cardDefault + '/default', {
          method: 'PATCH',
        }).then(loadDashboard).catch(handleError);
      });
    });

    Array.from(cardRowsRoot.querySelectorAll('[data-card-delete]')).forEach(function (button) {
      button.addEventListener('click', function () {
        state.pendingDeleteId = Number(button.dataset.cardDelete);
        if (deleteMessage) {
          var card = state.cards.find(function (item) { return item.id === state.pendingDeleteId; });
          deleteMessage.textContent = (card && card.cardCompany ? card.cardCompany : '선택한 카드') + ' 카드를 삭제하시겠습니까?';
        }
        openModal('delete');
      });
    });
  }

  // 카드 등록/수정 요청 바디를 만든다.
  // 카드 요청값 생성
  function buildCardPayload() {
    var cardNumber = formatCardNumber(cardNumberInput ? cardNumberInput.value : '');
    return {
      cardCompany: getSelectedCardCompany(),
      cardNumber: digitsOnly(cardNumber),
      cardNumberMasked: digitsOnly(cardNumber).length >= 8 ? maskCardNumber(cardNumber) : '',
      cardPasswordTwoDigits: digitsOnly(cardPasswordInput ? cardPasswordInput.value : '').slice(0, 2),
      cardIdentityNo: digitsOnly(cardIdentityInput ? cardIdentityInput.value : '').slice(0, 6),
      cardExpireMonth: digitsOnly(cardExpireMonthInput ? cardExpireMonthInput.value : '').slice(0, 2),
      cardExpireYear: digitsOnly(cardExpireYearInput ? cardExpireYearInput.value : '').slice(0, 2),
      isDefault: !!(cardPrimaryInput && cardPrimaryInput.checked),
    };
  }

  // 카드 필수 입력값을 검사한다.
  // 카드 요청값 검증
  function validateCardPayload(payload) {
    if (!payload.cardCompany) {
      throw new Error('카드사를 입력해 주세요.');
    }

    if (state.editingCardId && !hasRawCardInput(payload)) {
      return;
    }

    if (!payload.cardNumber || payload.cardNumber.length < 12) {
      throw new Error('카드 번호를 정확히 입력해 주세요.');
    }
    if (!/^\d{2}$/.test(payload.cardPasswordTwoDigits)) {
      throw new Error('카드 비밀번호 앞 2자리를 입력해 주세요.');
    }
    if (!/^\d{6}$/.test(payload.cardIdentityNo)) {
      throw new Error('생년월일 6자리를 입력해 주세요.');
    }
    if (!/^\d{2}$/.test(payload.cardExpireMonth)) {
      throw new Error('유효기간 월을 입력해 주세요.');
    }
    if (!/^\d{2}$/.test(payload.cardExpireYear)) {
      throw new Error('유효기간 년을 입력해 주세요.');
    }

    var month = Number(payload.cardExpireMonth);
    if (month < 1 || month > 12) {
      throw new Error('유효기간 월은 01부터 12 사이여야 합니다.');
    }
  }

  // 공통 에러 처리
  function handleError(error) {
    alert(error.message || '요청 처리 중 오류가 발생했습니다.');
  }

  // 대시보드 데이터와 카드 목록을 다시 불러온다.
  // 대시보드 데이터 로드
  function loadDashboard() {
    return requestJson('/api/dashboard')
      .then(function (response) {
        if (!response || !response.dashboard) {
          throw new Error('대시보드 데이터를 불러오지 못했습니다.');
        }

        state.dashboard = response.dashboard || {};
        state.cards = response.cards || [];

        try {
          renderMetrics();
          renderMetricChart();
          renderSummaryTables();
          renderList('myAuctions', state.dashboard.myAuctions || []);
          renderList('participatingAuctions', state.dashboard.participatingAuctions || []);
          renderList('hostedContests', state.dashboard.hostedContests || []);
          renderList('participatingContests', state.dashboard.participatingContests || []);
          renderList('bookmarkedWorks', state.dashboard.bookmarkedWorks || []);
          renderList('ownedWorks', state.dashboard.ownedWorks || []);
          renderList('galleries', state.dashboard.galleries || []);
          renderList('soldWorks', state.dashboard.soldWorks || []);
          renderList('storedWorks', state.dashboard.storedWorks || []);
          renderList('paymentHistory', state.dashboard.paymentHistory || []);
          renderList('settlements', state.dashboard.settlements || []);
          renderCards();
        } catch (error) {
          console.error(error);
          throw new Error('대시보드 화면을 그리는 중 오류가 발생했습니다.');
        }
      });
  }

  // 카드 폼 관련 입력과 제출 이벤트를 연결한다.
  // 카드 폼 이벤트 연결
  function setupCardForm() {
    if (cardCompanyTrigger) {
      cardCompanyTrigger.addEventListener('click', function () {
        if (cardCompanyMenu && cardCompanyMenu.classList.contains('is-active')) {
          closeCardCompanyMenu();
        } else {
          openCardCompanyMenu();
        }
      });
    }

    if (cardCompanySelect) {
      document.addEventListener('click', function (event) {
        if (!event.target.closest('[data-card-company-select]')) {
          closeCardCompanyMenu();
        }
      });
    }

    cardCompanyOptions.forEach(function (option) {
      option.addEventListener('click', function () {
        setCardCompany(option.dataset.cardCompanyOption);
        closeCardCompanyMenu();
        syncCardPreview();
      });
    });

    if (cardCompanyTrigger) {
      cardCompanyTrigger.addEventListener('keydown', function (event) {
        if (event.key === 'Escape') {
          closeCardCompanyMenu();
        }
      });
    }
    if (cardNumberInput) {
      cardNumberInput.addEventListener('input', function () {
        cardNumberInput.value = formatCardNumber(cardNumberInput.value);
        syncCardPreview();
      });
    }
    if (cardPasswordInput) {
      cardPasswordInput.addEventListener('input', function () {
        cardPasswordInput.value = digitsOnly(cardPasswordInput.value).slice(0, 2);
      });
    }
    if (cardIdentityInput) {
      cardIdentityInput.addEventListener('input', function () {
        cardIdentityInput.value = digitsOnly(cardIdentityInput.value).slice(0, 6);
      });
    }
    if (cardExpireMonthInput) {
      cardExpireMonthInput.addEventListener('input', function () {
        cardExpireMonthInput.value = digitsOnly(cardExpireMonthInput.value).slice(0, 2);
      });
    }
    if (cardExpireYearInput) {
      cardExpireYearInput.addEventListener('input', function () {
        cardExpireYearInput.value = digitsOnly(cardExpireYearInput.value).slice(0, 2);
      });
    }

    if (cardForm) {
      cardForm.addEventListener('submit', function (event) {
        event.preventDefault();

        try {
          var payload = buildCardPayload();
          validateCardPayload(payload);
          var method = state.editingCardId ? 'PUT' : 'POST';
          var url = state.editingCardId ? '/api/cards/' + state.editingCardId : '/api/cards';

          requestJson(url, {
            method: method,
            body: JSON.stringify(payload),
          })
            .then(function () {
              resetCardForm();
              return loadDashboard();
            })
            .catch(handleError);
        } catch (error) {
          handleError(error);
        }
      });
    }

    var createTrigger = document.querySelector('[data-card-create-trigger]');
    if (createTrigger) {
      createTrigger.addEventListener('click', resetCardForm);
    }

    var cancelButton = document.querySelector('[data-card-cancel]');
    if (cancelButton) {
      cancelButton.addEventListener('click', resetCardForm);
    }

    syncCardPreview();
  }

  // 모달 이벤트 연결
  function setupModals() {
    Array.from(document.querySelectorAll('.Dashboard-Modal')).forEach(function (modal) {
      if (modal.parentElement !== document.body) {
        document.body.appendChild(modal);
      }
    });

    Array.from(document.querySelectorAll('[data-modal-close]')).forEach(function (button) {
      button.addEventListener('click', function () {
        closeModal(button);
      });
    });

    if (cardDeleteConfirmButton) {
      cardDeleteConfirmButton.addEventListener('click', function () {
        if (!state.pendingDeleteId) {
          return;
        }

        var deletingCardId = state.pendingDeleteId;

        requestJson('/api/cards/' + state.pendingDeleteId, {
          method: 'DELETE',
        })
          .then(function () {
            state.pendingDeleteId = null;
            closeModal(cardDeleteConfirmButton);
            if (state.editingCardId === deletingCardId) {
              resetCardForm();
            }
            return loadDashboard();
          })
          .catch(handleError);
      });
    }
  }

  setupTabs();
  setupDatePicker();
  setupMetricButtons();
  setupCardForm();
  setupModals();
  loadDashboard().catch(handleError);
});
