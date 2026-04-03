window.onload = () => {
    'use strict';

    /* ========================================
       Page titles mapping
       ======================================== */
    const pageTitles = {
        members: '회원관리',
        reports: '신고관리',
        artworks: '작품관리',
        auctions: '경매관리',
        withdrawals: '출금관리',
        payments: '결제관리'
    };

    /* ========================================
       Sidebar Navigation
       ======================================== */
    const menuItems = document.querySelectorAll('.menu-item-link.style-scope.ytcp-navigation-drawer');
    const pageSections = document.querySelectorAll('.page-section');
    const pageTitle = document.getElementById('main-page-title');

    menuItems.forEach((item) => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const page = item.getAttribute('data-page');

            menuItems.forEach((m) => { m.classList.remove('active'); });
            item.classList.add('active');

            pageSections.forEach((s) => { s.classList.remove('active'); });
            const target = document.getElementById('page-' + page);
            if (target) {
                target.classList.add('active');
            }

            pageTitle.textContent = pageTitles[page] || page;

            const listView = target.querySelector('.list-view');
            const detailView = target.querySelector('.detail-view');
            if (listView) listView.classList.add('active');
            if (detailView) detailView.classList.remove('active');

            setTimeout(initAllSelectionBars, 50);
        });
    });

    /* ========================================
       Search Filtering
       ======================================== */
    const searchInputs = document.querySelectorAll('[data-search]');
    searchInputs.forEach((input) => {
        input.addEventListener('keyup', () => {
            const query = input.value.toLowerCase().trim();
            const section = input.getAttribute('data-search');
            const table = document.getElementById('table-' + section);
            if (!table) return;
            const rows = table.querySelectorAll('tbody tr');
            rows.forEach((row) => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.indexOf(query) !== -1 ? '' : 'none';
            });
        });
    });

    /* ========================================
       Status Filter Tabs
       ======================================== */
    function moveSelectionBar(tab) {
        const container = tab.closest('.tabs-container');
        if (!container) return;
        const bar = container.querySelector('.selection-bar');
        if (!bar) return;
        bar.style.left = tab.offsetLeft + 'px';
        bar.style.width = tab.offsetWidth + 'px';
    }

    function initAllSelectionBars() {
        document.querySelectorAll('.tabs-container').forEach((container) => {
            const bar = container.querySelector('.selection-bar');
            const activeTab = container.querySelector('.filter-tab.active');
            if (bar && activeTab) {
                bar.style.transition = 'none';
                bar.style.left = activeTab.offsetLeft + 'px';
                bar.style.width = activeTab.offsetWidth + 'px';
                requestAnimationFrame(() => {
                    requestAnimationFrame(() => {
                        bar.style.transition = '';
                    });
                });
            }
        });
    }
    initAllSelectionBars();

    const filterTabs = document.querySelectorAll('.filter-tab');
    filterTabs.forEach((tab) => {
        tab.addEventListener('click', () => {
            const container = tab.closest('.tabs-container');
            const siblings = container.querySelectorAll('.filter-tab');
            siblings.forEach((s) => { s.classList.remove('active'); });
            tab.classList.add('active');

            moveSelectionBar(tab);

            const filterVal = tab.getAttribute('data-filter');
            const section = tab.closest('.page-section');
            const table = section.querySelector('.data-table');
            if (!table) return;
            const rows = table.querySelectorAll('tbody tr');

            rows.forEach((row) => {
                if (filterVal === 'all') {
                    row.style.display = '';
                } else {
                    const status = row.getAttribute('data-status');
                    row.style.display = status === filterVal ? '' : 'none';
                }
            });
        });
    });

    /* ========================================
       Detail View Toggle (event delegation)
       ======================================== */
    document.querySelectorAll('.data-table').forEach((table) => {
        table.addEventListener('click', (e) => {
            if (e.target.closest('a')) return;
            const row = e.target.closest('tbody tr');
            if (!row) return;

            const section = row.closest('.page-section');
            const listView = section.querySelector('.list-view');
            const detailView = section.querySelector('.detail-view');
            if (!detailView) return;

            populateDetail(section.id, row);

            listView.classList.remove('active');
            detailView.classList.add('active');
        });
    });

    /* ========================================
       Back Button
       ======================================== */
    const backLinks = document.querySelectorAll('.back-link');
    backLinks.forEach((link) => {
        link.addEventListener('click', () => {
            const section = link.closest('.page-section');
            const listView = section.querySelector('.list-view');
            const detailView = section.querySelector('.detail-view');
            detailView.classList.remove('active');
            listView.classList.add('active');
        });
    });

    /* ========================================
       Navigate from auction winner to member detail
       ======================================== */
    const gotoMemberLinks = document.querySelectorAll('[data-goto-member]');
    gotoMemberLinks.forEach((link) => {
        link.addEventListener('click', (e) => {
            e.stopPropagation();
            const memberId = link.getAttribute('data-goto-member');

            menuItems.forEach((m) => { m.classList.remove('active'); });
            const memberMenuItem = document.querySelector('[data-page="members"]');
            memberMenuItem.classList.add('active');

            pageSections.forEach((s) => { s.classList.remove('active'); });
            const memberPage = document.getElementById('page-members');
            memberPage.classList.add('active');
            pageTitle.textContent = '회원관리';

            const memberTable = document.getElementById('table-members');
            const memberRow = memberTable.querySelector('tr[data-id="' + memberId + '"]');
            if (memberRow) {
                populateDetail('page-members', memberRow);
                const listView = memberPage.querySelector('.list-view');
                const detailView = memberPage.querySelector('.detail-view');
                listView.classList.remove('active');
                detailView.classList.add('active');
            }
        });
    });

    /* ========================================
       Populate Detail Views
       ======================================== */
    function populateDetail(pageId, row) {
        const cells = row.querySelectorAll('td');

        /* 회원: 번호(0) 이메일(1) 닉네임(2) 유형(3) 회원상태(4) 가입일(5) 신고(6) 거래건수(7) */
        if (pageId === 'page-members') {
            document.getElementById('d-member-email').textContent = cells[1].textContent;
            document.getElementById('d-member-nick').textContent = cells[2].textContent;
            document.getElementById('d-member-type').textContent = cells[3].textContent;
            const statusText = cells[4].textContent.trim();
            const statusEl = document.getElementById('d-member-status');
            const suspendBtn = document.getElementById('btn-member-suspend');
            const activateBtn = document.getElementById('btn-member-activate');
            const titleEl = document.getElementById('d-member-title');

            if (statusText === '정지') {
                statusEl.innerHTML = '<span class="status-badge status-urgent">정지</span>';
                titleEl.innerHTML = cells[2].textContent + ' <span class="status-badge status-urgent">정지</span>';
                suspendBtn.style.display = 'none';
                activateBtn.style.display = '';
            } else {
                statusEl.innerHTML = '<span class="status-badge status-active">활동</span>';
                titleEl.innerHTML = cells[2].textContent + ' <span class="status-badge status-active">활동</span>';
                suspendBtn.style.display = '';
                activateBtn.style.display = 'none';
            }
            document.getElementById('d-member-reports').textContent = cells[6].textContent + '건';
        }

        /* 신고: 번호(0) 신고자(1) 분류(2) 대상(3) 사유(4) 접수일(5) 피신고횟수(6) 상태(7) */
        if (pageId === 'page-reports') {
            document.getElementById('d-report-reporter').textContent = cells[1].textContent;
            document.getElementById('d-report-category').textContent = cells[2].textContent;
            document.getElementById('d-report-target-type').textContent = cells[2].textContent;
            document.getElementById('d-report-artist').textContent = cells[3].textContent;
            document.getElementById('d-report-reason').textContent = cells[4].textContent;
            document.getElementById('d-report-detail').textContent = cells[4].textContent;
            document.getElementById('d-report-date').textContent = cells[5].textContent;
            document.getElementById('d-report-targetcount').textContent = cells[6].textContent;
            const rStatus = cells[7].textContent.trim();
            const rStatusBadge = rStatus === '처리중' ? 'status-pending'
                : rStatus === '처리완료' ? 'status-active'
                : 'status-muted';
            // BUG FIX: Set title innerHTML first with id preserved, then access the fresh element
            document.getElementById('d-report-title').innerHTML = '신고 #' + cells[0].textContent + ' <span id="d-report-status" class="status-badge ' + rStatusBadge + '">' + rStatus + '</span>';
        }

        /* 작품: 번호(0) 작품명(1) 아티스트(2) 카테고리(3) 판매방식(4) 상태(5) 등록일(6) 조회수(7) 신고누적수(8) */
        if (pageId === 'page-artworks') {
            document.getElementById('d-artwork-name').textContent = cells[1].textContent;
            document.getElementById('d-artwork-artist').textContent = cells[2].textContent;
            document.getElementById('d-artwork-category').textContent = cells[3].textContent;
            document.getElementById('d-artwork-saletype').textContent = cells[4].textContent;
            document.getElementById('d-artwork-views').textContent = cells[7].textContent + '회';
            document.getElementById('d-artwork-reports').textContent = cells[8].textContent + '건';
            document.getElementById('d-artwork-date').textContent = cells[6].textContent;
            const aStatus = cells[5].textContent.trim();
            const aStatusBadge = aStatus === '전시중' ? 'status-active' : 'status-muted';
            // BUG FIX: Set title innerHTML with id preserved
            document.getElementById('d-artwork-title').innerHTML = cells[1].textContent + ' <span id="d-artwork-status" class="status-badge ' + aStatusBadge + '">' + aStatus + '</span>';
        }

        /* 경매: 경매번호(0) 작품명(1) 아티스트(2) 낙찰자(3) 시작가(4) 낙찰가(5) 입찰수(6) 종료일시(7) 상태(8) */
        if (pageId === 'page-auctions') {
            document.getElementById('d-auction-id').textContent = cells[0].textContent;
            document.getElementById('d-auction-artwork').textContent = cells[1].textContent;
            document.getElementById('d-auction-artist').textContent = cells[2].textContent;
            document.getElementById('d-auction-winner').textContent = cells[3].textContent;
            document.getElementById('d-auction-start').textContent = cells[4].textContent;
            document.getElementById('d-auction-final').textContent = cells[5].textContent;
            document.getElementById('d-auction-bids').textContent = cells[6].textContent + '건';
            document.getElementById('d-auction-enddate').textContent = cells[7].textContent;
            document.getElementById('d-auction-title').innerHTML = cells[0].textContent + ' <span class="status-badge status-muted">종료</span>';
            const finalPrice = cells[5].textContent.replace(/[^\d]/g, '');
            const fp = parseInt(finalPrice);
            const fee = Math.round(fp * 0.15);
            const net = fp - fee;
            document.getElementById('d-auction-fee').textContent = '\u20A9' + fee.toLocaleString();
            document.getElementById('d-auction-netamount').textContent = '\u20A9' + net.toLocaleString();
        }

        /* 출금: 요청번호(0) 아티스트(1) 신청금액(2) 실수령액(3) 은행(4) 신청일(5) 잔여잔액(6) 상태(7) */
        if (pageId === 'page-withdrawals') {
            document.getElementById('d-wd-id').textContent = cells[0].textContent;
            document.getElementById('d-wd-artist').textContent = cells[1].textContent;
            document.getElementById('d-wd-amount').textContent = cells[2].textContent;
            document.getElementById('d-wd-net').innerHTML = '실 수령액: ' + cells[3].textContent;
            document.getElementById('d-wd-balance').textContent = cells[6].textContent;
            document.getElementById('d-wd-date').textContent = cells[5].textContent;
            const wStatus = cells[7].textContent.trim();
            const wStatusBadge = wStatus === '대기' ? 'status-pending'
                : wStatus === '승인' ? 'status-active'
                : 'status-urgent';
            document.getElementById('d-wd-title').innerHTML = cells[0].textContent + ' <span class="status-badge ' + wStatusBadge + '">' + wStatus + '</span>';
        }

        /* 결제: 주문번호(0) 결제자(1) 판매자(2) 경매/거래(3) 작품명(4) 금액(5) 결제일(6) 결제상태(7) */
        if (pageId === 'page-payments') {
            document.getElementById('d-pay-id').textContent = cells[0].textContent;
            document.getElementById('d-pay-buyer').textContent = cells[1].textContent;
            document.getElementById('d-pay-seller').textContent = cells[2].textContent;
            document.getElementById('d-pay-type').textContent = cells[3].textContent;
            document.getElementById('d-pay-artwork').textContent = cells[4].textContent;
            document.getElementById('d-pay-amount').textContent = cells[5].textContent;
            document.getElementById('d-pay-total-display').textContent = cells[5].textContent;
            document.getElementById('d-pay-date').textContent = cells[6].textContent;
            const pStatus = cells[7].textContent.trim();
            const pStatusBadge = pStatus === '결제완료' ? 'status-active' : 'status-urgent';
            // BUG FIX: Set title innerHTML with id preserved
            document.getElementById('d-pay-title').innerHTML = cells[0].textContent + ' <span id="d-pay-status" class="status-badge ' + pStatusBadge + '">' + pStatus + '</span>';
        }
    }

    /* ========================================
       Modal Functions (exposed globally)
       ======================================== */
    window.openModal = (id) => {
        const modal = document.getElementById(id);
        if (modal) modal.classList.add('active');
    };

    window.closeModal = (id) => {
        const modal = document.getElementById(id);
        if (modal) {
            modal.classList.remove('active');
            const ta = modal.querySelector('textarea');
            if (ta) ta.value = '';
        }
    };

    window.confirmAction = (modalId, message) => {
        closeModal(modalId);
        showToast(message);
    };

    const overlays = document.querySelectorAll('.modal-overlay');
    overlays.forEach((overlay) => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
                const ta = overlay.querySelector('textarea');
                if (ta) ta.value = '';
            }
        });
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            overlays.forEach((overlay) => {
                if (overlay.classList.contains('active')) {
                    overlay.classList.remove('active');
                    const ta = overlay.querySelector('textarea');
                    if (ta) ta.value = '';
                }
            });
        }
    });

    /* ========================================
       Toast Notification
       ======================================== */
    let toastTimer = null;

    function showToast(message) {
        const toast = document.getElementById('toast');
        toast.textContent = message;
        toast.classList.add('show');
        if (toastTimer) clearTimeout(toastTimer);
        toastTimer = setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    window.showToast = showToast;
};
