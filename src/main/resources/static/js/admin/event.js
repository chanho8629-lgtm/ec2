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
       State management
       ======================================== */
    const currentPage = { members: 1, reports: 1, artworks: 1, auctions: 1, withdrawals: 1, payments: 1 };
    const currentPageSize = { members: 30, reports: 30, artworks: 30, auctions: 30, withdrawals: 30, payments: 30 };
    const currentFilter = { members: '', reports: '', artworks: '', auctions: '', withdrawals: '', payments: '' };
    const currentKeyword = { members: '', reports: '', artworks: '', auctions: '', withdrawals: '', payments: '' };
    const currentDetailId = {};

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
       Load list data from server
       ======================================== */
    const loadList = async (tabName) => {
        const params = {
            keyword: currentKeyword[tabName] || '',
            status: currentFilter[tabName] || '',
            page: currentPage[tabName],
            size: currentPageSize[tabName]
        };

        try {
            const pageSection = document.getElementById('page-' + tabName);
            let data;

            switch (tabName) {
                case 'members': {
                    data = await adminMemberService.getList(params);
                    const tbody = document.querySelector('#table-members tbody');
                    adminLayout.renderMemberList(Array.isArray(data) ? data : (data.content || []), tbody);
                    adminLayout.renderPagination(pageSection, currentPage[tabName], data.totalElements || (Array.isArray(data) ? data.length : 0), currentPageSize[tabName], (newPage) => {
                        currentPage[tabName] = newPage;
                        loadList(tabName);
                    });
                    break;
                }
                case 'reports': {
                    data = await adminReportService.getList(params);
                    const tbody = document.querySelector('#table-reports tbody');
                    adminLayout.renderReportList(Array.isArray(data) ? data : (data.content || []), tbody);
                    adminLayout.renderPagination(pageSection, currentPage[tabName], data.totalElements || (Array.isArray(data) ? data.length : 0), currentPageSize[tabName], (newPage) => {
                        currentPage[tabName] = newPage;
                        loadList(tabName);
                    });
                    break;
                }
                case 'artworks': {
                    data = await adminWorkService.getList(params);
                    const tbody = document.querySelector('#table-artworks tbody');
                    adminLayout.renderWorkList(Array.isArray(data) ? data : (data.content || []), tbody);
                    adminLayout.renderPagination(pageSection, currentPage[tabName], data.totalElements || (Array.isArray(data) ? data.length : 0), currentPageSize[tabName], (newPage) => {
                        currentPage[tabName] = newPage;
                        loadList(tabName);
                    });
                    break;
                }
                case 'auctions': {
                    data = await adminAuctionService.getList(params);
                    const tbody = document.querySelector('#table-auctions tbody');
                    adminLayout.renderAuctionList(Array.isArray(data) ? data : (data.content || []), tbody);
                    adminLayout.renderPagination(pageSection, currentPage[tabName], data.totalElements || (Array.isArray(data) ? data.length : 0), currentPageSize[tabName], (newPage) => {
                        currentPage[tabName] = newPage;
                        loadList(tabName);
                    });
                    break;
                }
                case 'withdrawals': {
                    data = await adminWithdrawalService.getList(params);
                    const tbody = document.querySelector('#table-withdrawals tbody');
                    adminLayout.renderWithdrawalList(Array.isArray(data) ? data : (data.content || []), tbody);
                    adminLayout.renderPagination(pageSection, currentPage[tabName], data.totalElements || (Array.isArray(data) ? data.length : 0), currentPageSize[tabName], (newPage) => {
                        currentPage[tabName] = newPage;
                        loadList(tabName);
                    });
                    break;
                }
                case 'payments': {
                    data = await adminPaymentService.getList(params);
                    const tbody = document.querySelector('#table-payments tbody');
                    adminLayout.renderPaymentList(Array.isArray(data) ? data : (data.content || []), tbody);
                    adminLayout.renderPagination(pageSection, currentPage[tabName], data.totalElements || (Array.isArray(data) ? data.length : 0), currentPageSize[tabName], (newPage) => {
                        currentPage[tabName] = newPage;
                        loadList(tabName);
                    });
                    break;
                }
                default:
                    break;
            }
        } catch (e) {
            console.error('[loadList]', tabName, e);
            showToast('데이터를 불러오는데 실패했습니다.');
        }
    };

    /* ========================================
       Load detail data from server
       ======================================== */
    const loadDetail = async (tabName, id) => {
        try {
            switch (tabName) {
                case 'members': {
                    const data = await adminMemberService.getDetail(id);
                    adminLayout.renderMemberDetail(data);
                    break;
                }
                case 'reports': {
                    const data = await adminReportService.getDetail(id);
                    adminLayout.renderReportDetail(data);
                    break;
                }
                case 'artworks': {
                    const data = await adminWorkService.getDetail(id);
                    adminLayout.renderWorkDetail(data);
                    break;
                }
                case 'auctions': {
                    const data = await adminAuctionService.getDetail(id);
                    adminLayout.renderAuctionDetail(data);
                    break;
                }
                case 'withdrawals': {
                    const data = await adminWithdrawalService.getDetail(id);
                    adminLayout.renderWithdrawalDetail(data);
                    break;
                }
                case 'payments': {
                    const data = await adminPaymentService.getDetail(id);
                    adminLayout.renderPaymentDetail(data);
                    break;
                }
                default:
                    break;
            }
            currentDetailId[tabName] = id;
        } catch (e) {
            console.error('[loadDetail]', tabName, id, e);
            showToast('상세 정보를 불러오는데 실패했습니다.');
        }
    };

    /* ========================================
       Status Filter Tab bar animation
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

            const listView = target ? target.querySelector('.list-view') : null;
            const detailView = target ? target.querySelector('.detail-view') : null;
            if (listView) listView.classList.add('active');
            if (detailView) detailView.classList.remove('active');

            setTimeout(initAllSelectionBars, 50);

            loadList(page);
        });
    });

    /* ========================================
       Search (debounced)
       ======================================== */
    const searchInputs = document.querySelectorAll('[data-search]');
    let searchTimers = {};
    searchInputs.forEach((input) => {
        input.addEventListener('keyup', () => {
            const section = input.getAttribute('data-search');
            clearTimeout(searchTimers[section]);
            searchTimers[section] = setTimeout(() => {
                currentKeyword[section] = input.value.trim();
                currentPage[section] = 1;
                loadList(section);
            }, 300);
        });
    });

    /* ========================================
       Status Filter Tabs
       ======================================== */
    const filterToServerStatus = (tabName, filterVal) => {
        if (!filterVal || filterVal === 'all') return '';
        const map = {
            members: { '활동': 'ACTIVE', '정지': 'SUSPENDED' },
            reports: { '처리중': 'PENDING', '처리완료': 'RESOLVED', '취소됨': 'CANCELLED' },
            artworks: { '전시중': 'ACTIVE', '숨김': 'HIDDEN' },
            auctions: { '낙찰': 'SOLD', '유찰': 'CLOSED' },
            withdrawals: { '대기': 'PENDING', '승인': 'APPROVED', '반려': 'REJECTED' },
            payments: { '결제완료': 'COMPLETED', '결제취소': 'CANCELLED' }
        };
        return (map[tabName] && map[tabName][filterVal]) || filterVal;
    };

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
            const tabName = section ? section.id.replace('page-', '') : null;
            if (!tabName) return;

            currentFilter[tabName] = filterToServerStatus(tabName, filterVal);
            currentPage[tabName] = 1;
            loadList(tabName);
        });
    });

    /* ========================================
       Detail View Toggle (event delegation)
       ======================================== */
    document.querySelectorAll('.data-table').forEach((table) => {
        table.addEventListener('click', (e) => {
            if (e.target.closest('a') || e.target.closest('[data-goto-member]')) return;
            const row = e.target.closest('tbody tr');
            if (!row) return;

            const section = row.closest('.page-section');
            if (!section) return;
            const tabName = section.id.replace('page-', '');
            const id = row.getAttribute('data-id');
            if (!id) return;

            const listView = section.querySelector('.list-view');
            const detailView = section.querySelector('.detail-view');
            if (!detailView) return;

            loadDetail(tabName, id).then(() => {
                listView.classList.remove('active');
                detailView.classList.add('active');
            });
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
            if (memberMenuItem) memberMenuItem.classList.add('active');

            pageSections.forEach((s) => { s.classList.remove('active'); });
            const memberPage = document.getElementById('page-members');
            if (memberPage) memberPage.classList.add('active');
            pageTitle.textContent = '회원관리';

            const listView = memberPage ? memberPage.querySelector('.list-view') : null;
            const detailView = memberPage ? memberPage.querySelector('.detail-view') : null;

            if (listView) listView.classList.remove('active');
            if (detailView) detailView.classList.add('active');

            if (memberId) {
                loadDetail('members', memberId);
            }
        });
    });

    /* ========================================
       Page size selects
       ======================================== */
    document.querySelectorAll('.page-size-select').forEach((sel) => {
        sel.addEventListener('change', () => {
            const section = sel.closest('.page-section');
            if (!section) return;
            const tabName = section.id.replace('page-', '');
            currentPageSize[tabName] = parseInt(sel.value, 10);
            currentPage[tabName] = 1;
            loadList(tabName);
        });
    });

    /* ========================================
       Modal confirm actions (with server calls)
       ======================================== */

    // 회원 정지
    const btnSuspendConfirm = document.querySelector('#modal-member-suspend .btn-danger');
    if (btnSuspendConfirm) {
        btnSuspendConfirm.addEventListener('click', async () => {
            const id = currentDetailId['members'];
            if (!id) return;
            const reason = document.querySelector('#modal-member-suspend textarea').value.trim();
            const endDate = document.getElementById('suspend-end-date').value;
            try {
                await adminMemberService.suspend(id, reason, endDate);
                closeModal('modal-member-suspend');
                showToast('회원이 정지되었습니다.');
                await loadDetail('members', id);
                await loadList('members');
            } catch (e) {
                console.error(e);
                closeModal('modal-member-suspend');
                showToast('처리 중 오류가 발생했습니다.');
            }
        });
    }

    // 회원 정지 해제
    const btnActivateConfirm = document.querySelector('#modal-member-activate .btn-primary');
    if (btnActivateConfirm) {
        btnActivateConfirm.addEventListener('click', async () => {
            const id = currentDetailId['members'];
            if (!id) return;
            try {
                await adminMemberService.activate(id);
                closeModal('modal-member-activate');
                showToast('정지가 해제되었습니다.');
                await loadDetail('members', id);
                await loadList('members');
            } catch (e) {
                console.error(e);
                closeModal('modal-member-activate');
                showToast('처리 중 오류가 발생했습니다.');
            }
        });
    }

    // 신고 처리
    const btnReportProcessConfirm = document.querySelector('#modal-report-process .btn-primary');
    if (btnReportProcessConfirm) {
        btnReportProcessConfirm.addEventListener('click', async () => {
            const id = currentDetailId['reports'];
            if (!id) return;
            const memo = document.querySelector('#modal-report-process textarea').value.trim();
            try {
                await adminReportService.process(id, memo);
                closeModal('modal-report-process');
                showToast('신고가 처리되었습니다.');
                await loadDetail('reports', id);
                await loadList('reports');
            } catch (e) {
                console.error(e);
                closeModal('modal-report-process');
                showToast('처리 중 오류가 발생했습니다.');
            }
        });
    }

    // 신고 취소
    const btnReportCancelConfirm = document.querySelector('#modal-report-cancel .btn-danger');
    if (btnReportCancelConfirm) {
        btnReportCancelConfirm.addEventListener('click', async () => {
            const id = currentDetailId['reports'];
            if (!id) return;
            const memo = document.querySelector('#modal-report-cancel textarea').value.trim();
            try {
                await adminReportService.cancel(id, memo);
                closeModal('modal-report-cancel');
                showToast('신고가 취소되었습니다.');
                await loadDetail('reports', id);
                await loadList('reports');
            } catch (e) {
                console.error(e);
                closeModal('modal-report-cancel');
                showToast('처리 중 오류가 발생했습니다.');
            }
        });
    }

    // 작품 숨김
    const btnArtworkHideConfirm = document.querySelector('#modal-artwork-hide .btn-danger');
    if (btnArtworkHideConfirm) {
        btnArtworkHideConfirm.addEventListener('click', async () => {
            const id = currentDetailId['artworks'];
            if (!id) return;
            try {
                await adminWorkService.hide(id);
                closeModal('modal-artwork-hide');
                showToast('작품이 숨김 처리되었습니다.');
                await loadDetail('artworks', id);
                await loadList('artworks');
            } catch (e) {
                console.error(e);
                closeModal('modal-artwork-hide');
                showToast('처리 중 오류가 발생했습니다.');
            }
        });
    }

    // 작품 숨김 해제
    const btnArtworkShowConfirm = document.querySelector('#modal-artwork-show .btn-primary');
    if (btnArtworkShowConfirm) {
        btnArtworkShowConfirm.addEventListener('click', async () => {
            const id = currentDetailId['artworks'];
            if (!id) return;
            try {
                await adminWorkService.show(id);
                closeModal('modal-artwork-show');
                showToast('작품 숨김이 해제되었습니다.');
                await loadDetail('artworks', id);
                await loadList('artworks');
            } catch (e) {
                console.error(e);
                closeModal('modal-artwork-show');
                showToast('처리 중 오류가 발생했습니다.');
            }
        });
    }

    // 출금 승인
    const btnWdApproveConfirm = document.querySelector('#modal-wd-approve .btn-primary');
    if (btnWdApproveConfirm) {
        btnWdApproveConfirm.addEventListener('click', async () => {
            const id = currentDetailId['withdrawals'];
            if (!id) return;
            try {
                await adminWithdrawalService.approve(id);
                closeModal('modal-wd-approve');
                showToast('출금이 승인되었습니다.');
                await loadDetail('withdrawals', id);
                await loadList('withdrawals');
            } catch (e) {
                console.error(e);
                closeModal('modal-wd-approve');
                showToast('처리 중 오류가 발생했습니다.');
            }
        });
    }

    // 출금 반려
    const btnWdRejectConfirm = document.querySelector('#modal-wd-reject .btn-danger');
    if (btnWdRejectConfirm) {
        btnWdRejectConfirm.addEventListener('click', async () => {
            const id = currentDetailId['withdrawals'];
            if (!id) return;
            const reason = document.querySelector('#modal-wd-reject textarea').value.trim();
            try {
                await adminWithdrawalService.reject(id, reason);
                closeModal('modal-wd-reject');
                showToast('출금이 반려되었습니다.');
                await loadDetail('withdrawals', id);
                await loadList('withdrawals');
            } catch (e) {
                console.error(e);
                closeModal('modal-wd-reject');
                showToast('처리 중 오류가 발생했습니다.');
            }
        });
    }

    /* ========================================
       Remove legacy onclick confirmAction from modal buttons
       (buttons above now have direct event listeners, but the
        HTML still has onclick="confirmAction(...)" — keep
        confirmAction as a no-op fallback so the HTML doesn't error
        if someone still references it)
       ======================================== */
    window.confirmAction = () => {};

    /* ========================================
       Initial load - members tab
       ======================================== */
    loadList('members');
};
