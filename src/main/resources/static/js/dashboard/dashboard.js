document.addEventListener('DOMContentLoaded', function () {
  // 대시보드 상태 관리
  var state = {
    dashboard: null,
    cards: [],
    activeMetric: 'views',
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
  var cardCompanyInput = document.querySelector('[data-card-company-input]');
  var cardNumberInput = document.querySelector('[data-card-number-input]');
  var cardBillingKeyInput = document.querySelector('[data-card-billing-key-input]');
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

  // 탭 이벤트 연결
  function setupTabs() {
    tabButtons.forEach(function (button) {
      button.addEventListener('click', function () {
        var target = button.dataset.dashboardTab;

        tabButtons.forEach(function (item) {
          item.classList.toggle('is-active', item === button);
          item.setAttribute('aria-selected', item === button ? 'true' : 'false');
        });

        panels.forEach(function (panel) {
          var active = panel.dataset.dashboardPanel === target;
          panel.classList.toggle('is-active', active);
          panel.hidden = !active;
        });

        syncTabIndicator(button);
      });
    });

    syncTabIndicator(document.querySelector('.Dashboard-Tab.is-active'));
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
      var rows = (table.items || []).map(function (item) {
        return '<tr><td>' + escapeHtml(item.label) + '</td><td>' + escapeHtml(item.value) + '</td></tr>';
      }).join('');

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

  // 각 탭의 리스트형 데이터를 행 UI로 렌더링한다.
  function renderList(name, items) {
    var body = document.querySelector('[data-list-body="' + name + '"]');
    if (!body) {
      return;
    }

    body.innerHTML = (items || []).map(function (item) {
      var badge = item.tag ? '<span class="Dashboard-StatusBadge' + inferStatusClass(item.tag) + '">' + escapeHtml(item.tag) + '</span>' : '';
      var amount = item.amount ? '<span>' + escapeHtml(item.amount) + '</span>' : '';
      return '' +
        '<article class="Dashboard-DataRow" tabindex="0" data-detail-row>' +
          '<div>' +
            '<strong>' + escapeHtml(item.title || '-') + '</strong>' +
            '<p>' + escapeHtml(item.description || '-') + '</p>' +
          '</div>' +
          '<div class="Dashboard-DataRowMeta">' +
            amount +
            badge +
          '</div>' +
        '</article>';
    }).join('');

    Array.from(body.querySelectorAll('[data-detail-row]')).forEach(function (row, index) {
      row.addEventListener('click', function () {
        openDetail(items[index]);
      });
      row.addEventListener('keydown', function (event) {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          openDetail(items[index]);
        }
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
    var metric = metrics[state.activeMetric] || metrics.views;
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
      cardPreviewBrand.textContent = (cardCompanyInput && cardCompanyInput.value.trim()) || 'NEW CARD';
    }
    if (cardPreviewNumberText) {
      cardPreviewNumberText.textContent = (cardNumberInput && cardNumberInput.value.trim()) || '**** **** **** ****';
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
        ? '등록된 카드 정보를 수정하고 대표 카드 여부를 변경합니다.'
        : '현재 백엔드 저장 기준으로 카드 정보를 등록하고 대표 카드 여부를 설정합니다.';
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
    syncCardPreview();
  }

  // 카드 폼 채우기
  function fillCardForm(card) {
    state.editingCardId = card.id;
    if (cardCompanyInput) cardCompanyInput.value = card.cardCompany || '';
    if (cardNumberInput) cardNumberInput.value = card.cardNumberMasked || '';
    if (cardBillingKeyInput) cardBillingKeyInput.value = card.billingKey || '';
    if (cardPrimaryInput) cardPrimaryInput.checked = !!card.isDefault;
    setCardFormMode(true);
    syncCardPreview();
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
    return {
      cardCompany: cardCompanyInput ? cardCompanyInput.value.trim() : '',
      cardNumberMasked: cardNumberInput ? cardNumberInput.value.trim() : '',
      billingKey: cardBillingKeyInput ? cardBillingKeyInput.value.trim() : '',
      isDefault: !!(cardPrimaryInput && cardPrimaryInput.checked),
    };
  }

  // 카드 필수 입력값을 검사한다.
  // 카드 요청값 검증
  function validateCardPayload(payload) {
    if (!payload.cardCompany) {
      throw new Error('카드사를 입력해 주세요.');
    }
    if (!payload.cardNumberMasked) {
      throw new Error('마스킹 카드 번호를 입력해 주세요.');
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
          renderList('purchasedWorks', state.dashboard.purchasedWorks || []);
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
    if (cardCompanyInput) {
      cardCompanyInput.addEventListener('input', syncCardPreview);
    }
    if (cardNumberInput) {
      cardNumberInput.addEventListener('input', syncCardPreview);
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

        requestJson('/api/cards/' + state.pendingDeleteId, {
          method: 'DELETE',
        })
          .then(function () {
            state.pendingDeleteId = null;
            closeModal(cardDeleteConfirmButton);
            if (state.editingCardId && !state.cards.some(function (card) { return card.id === state.editingCardId; })) {
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
