'use strict';

/* =====================================================
   adminLayout - HTML 렌더링 모듈
   ===================================================== */
const adminLayout = (() => {

    /* --------------------------------------------------
       포맷 헬퍼
       -------------------------------------------------- */
    const formatMoney = (amount) => {
        if (amount === null || amount === undefined || amount === '') return '-';
        return '\u20A9' + Number(amount).toLocaleString();
    };

    const formatDateShort = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            const yy = String(d.getFullYear()).slice(2);
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            return `${yy}.${mm}.${dd}`;
        } catch { return dateStr; }
    };

    const formatDateFull = (dateStr) => {
        if (!dateStr) return '-';
        try {
            const d = new Date(dateStr);
            if (isNaN(d.getTime())) return dateStr;
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, '0');
            const dd = String(d.getDate()).padStart(2, '0');
            const hh = String(d.getHours()).padStart(2, '0');
            const mi = String(d.getMinutes()).padStart(2, '0');
            return `${yyyy}-${mm}-${dd} ${hh}:${mi}`;
        } catch { return dateStr; }
    };

    const statusBadge = (status, type) => {
        let cssClass = 'status-muted';
        let label = status || '-';

        if (type === 'member') {
            if (status === 'ACTIVE') { cssClass = 'status-active'; label = '활동'; }
            else if (status === 'SUSPENDED' || status === 'BANNED') { cssClass = 'status-urgent'; label = '정지'; }
        } else if (type === 'report') {
            if (status === 'PENDING' || status === 'REVIEWING') { cssClass = 'status-pending'; label = '처리중'; }
            else if (status === 'RESOLVED') { cssClass = 'status-active'; label = '처리완료'; }
            else if (status === 'CANCELLED') { cssClass = 'status-muted'; label = '취소됨'; }
        } else if (type === 'work') {
            if (status === 'ACTIVE') { cssClass = 'status-active'; label = '전시중'; }
            else if (status === 'HIDDEN') { cssClass = 'status-muted'; label = '숨김'; }
        } else if (type === 'auction') {
            if (status === '낙찰' || status === 'SOLD') { cssClass = 'status-active'; label = '낙찰'; }
            else if (status === '유찰' || status === 'CLOSED') { cssClass = 'status-muted'; label = '유찰'; }
        } else if (type === 'withdrawal') {
            if (status === 'PENDING') { cssClass = 'status-pending'; label = '대기'; }
            else if (status === 'APPROVED' || status === 'PAID') { cssClass = 'status-active'; label = '승인'; }
            else if (status === 'REJECTED') { cssClass = 'status-urgent'; label = '반려'; }
        } else if (type === 'payment') {
            if (status === 'COMPLETED') { cssClass = 'status-active'; label = '결제완료'; }
            else if (status === 'REFUNDED' || status === 'CANCELLED') { cssClass = 'status-urgent'; label = '결제취소'; }
        }

        return `<span class="status-badge ${cssClass}">${label}</span>`;
    };

    const memberStatusLabel = (status) => {
        if (status === 'ACTIVE') return '활동';
        if (status === 'SUSPENDED' || status === 'BANNED') return '정지';
        return status || '-';
    };

    const reportStatusLabel = (status) => {
        if (status === 'PENDING' || status === 'REVIEWING') return '처리중';
        if (status === 'RESOLVED') return '처리완료';
        if (status === 'CANCELLED') return '취소됨';
        return status || '-';
    };

    const workStatusLabel = (status) => {
        if (status === 'ACTIVE') return '전시중';
        if (status === 'HIDDEN') return '숨김';
        return status || '-';
    };

    const withdrawalStatusLabel = (status) => {
        if (status === 'PENDING') return '대기';
        if (status === 'APPROVED' || status === 'PAID') return '승인';
        if (status === 'REJECTED') return '반려';
        return status || '-';
    };

    const paymentStatusLabel = (status) => {
        if (status === 'COMPLETED') return '결제완료';
        if (status === 'REFUNDED' || status === 'CANCELLED') return '결제취소';
        return status || '-';
    };

    /* --------------------------------------------------
       회원관리 렌더링
       -------------------------------------------------- */
    const renderMemberList = (members, tbody) => {
        if (!members || members.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#909090;">데이터가 없습니다.</td></tr>';
            return;
        }
        tbody.innerHTML = members.map((m, i) => {
            const statusLabel = memberStatusLabel(m.status);
            const dataStatus = statusLabel;
            const reportStyle = (m.reportCount > 0) ? ' style="color:#c00;"' : '';
            return `<tr data-status="${dataStatus}" data-id="${m.id}">
                <td>${i + 1}</td>
                <td>${m.email || ''}</td>
                <td>${m.nickname || ''}</td>
                <td>${m.memberType || ''}</td>
                <td>${statusBadge(m.status, 'member')}</td>
                <td>${formatDateShort(m.createdDatetime)}</td>
                <td${reportStyle}>${m.reportCount || 0}</td>
                <td>${m.tradeCount || 0}건</td>
            </tr>`;
        }).join('');
    };

    const renderMemberDetail = (data) => {
        document.getElementById('d-member-title').innerHTML = `${data.nickname || ''} ${statusBadge(data.status, 'member')}`;
        document.getElementById('d-member-email').textContent = data.email || '-';
        document.getElementById('d-member-nick').textContent = data.nickname || '-';
        document.getElementById('d-member-joined').textContent = formatDateFull(data.createdDatetime);
        document.getElementById('d-member-lastlogin').textContent = formatDateFull(data.lastLoginDatetime);
        document.getElementById('d-member-type').textContent = data.creatorVerified ? '작가' : '컬렉터';
        document.getElementById('d-member-social').textContent = data.oauthProvider || '-';
        document.getElementById('d-member-email-verified').textContent = data.sellerVerified ? '완료' : '미완료';
        document.getElementById('d-member-phone-verified').textContent = data.phoneNumber ? '완료' : '미완료';
        document.getElementById('d-member-status').innerHTML = statusBadge(data.status, 'member');
        document.getElementById('d-member-lastactivity').textContent = formatDateFull(data.lastLoginDatetime);
        document.getElementById('d-member-reports').textContent = (data.restrictionHistoryCount || 0) + '건';
        document.getElementById('d-member-failedpay').textContent = (data.refundCount || 0) + '회';
        document.getElementById('d-member-refund').textContent = (data.refundCount || 0) + '건';
        document.getElementById('d-member-suspensions').textContent = (data.restrictionHistoryCount || 0) + '회';
        document.getElementById('d-member-artworks').textContent = data.workCount || 0;
        document.getElementById('d-member-auctions').textContent = data.auctionParticipateCount || 0;
        document.getElementById('d-member-followers').textContent = (data.followerCount || 0) + '명';
        document.getElementById('d-member-sold').textContent = (data.soldCount || 0) + '건';
        document.getElementById('d-member-total').textContent = formatMoney(data.totalTradeAmount);
        document.getElementById('d-member-pendingwd').textContent = (data.pendingWithdrawalCount || 0) + '건';
        document.getElementById('d-member-lasttx').textContent = data.lastTransactionDate || '-';

        const suspendBtn = document.getElementById('btn-member-suspend');
        const activateBtn = document.getElementById('btn-member-activate');
        if (data.status === 'ACTIVE') {
            suspendBtn.style.display = '';
            activateBtn.style.display = 'none';
        } else {
            suspendBtn.style.display = 'none';
            activateBtn.style.display = '';
        }
    };

    /* --------------------------------------------------
       신고관리 렌더링
       -------------------------------------------------- */
    const targetTypeLabel = (type) => {
        if (type === 'WORK') return '작품';
        if (type === 'MEMBER') return '사용자';
        if (type === 'COMMENT') return '댓글';
        if (type === 'GALLERY') return '갤러리';
        return type || '-';
    };

    const reasonLabel = (reason) => {
        if (reason === 'COPYRIGHT') return '저작권 침해';
        if (reason === 'HARASSMENT') return '욕설/비하';
        if (reason === 'SENSITIVE') return '음란물/부적절';
        if (reason === 'IMPERSONATION') return '사칭';
        return reason || '-';
    };

    const renderReportList = (reports, tbody) => {
        if (!reports || reports.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#909090;">데이터가 없습니다.</td></tr>';
            return;
        }
        tbody.innerHTML = reports.map((r, i) => {
            const statusLabel = reportStatusLabel(r.status);
            const countStyle = (r.targetReportCount > 0) ? ' style="color:#c00;font-weight:500;"' : '';
            return `<tr data-status="${statusLabel}" data-id="${r.id}">
                <td>${i + 1}</td>
                <td>${r.reporterNickname || ''}</td>
                <td>${targetTypeLabel(r.targetType)}</td>
                <td>${r.targetName || ''}</td>
                <td>${reasonLabel(r.reason)}</td>
                <td>${formatDateShort(r.createdDatetime)}</td>
                <td${countStyle}>${r.targetReportCount || 0}회</td>
                <td>${statusBadge(r.status, 'report')}</td>
            </tr>`;
        }).join('');
    };

    const renderReportDetail = (data) => {
        document.getElementById('d-report-title').innerHTML = `신고 #${data.id} ${statusBadge(data.status, 'report')}`;
        document.getElementById('d-report-reporter').textContent = data.reporterNickname || '-';
        document.getElementById('d-report-category').textContent = targetTypeLabel(data.targetType);
        document.getElementById('d-report-date').textContent = formatDateFull(data.createdDatetime);
        document.getElementById('d-report-reporter-history').textContent = `총 ${data.reporterHistoryCount || 0}건 신고`;
        document.getElementById('d-report-reason').textContent = reasonLabel(data.reason);
        document.getElementById('d-report-detail').textContent = data.detail || data.reason || '-';
        document.getElementById('d-report-target-type').textContent = targetTypeLabel(data.targetType);
        document.getElementById('d-report-target').textContent = data.targetName || '-';
        document.getElementById('d-report-target-status').textContent = data.targetStatus || '-';
        document.getElementById('d-report-targetcount').textContent = (data.targetReportCount || 0) + '건';
        document.getElementById('d-report-artist').textContent = data.targetAuthorName || '-';
        document.getElementById('d-report-artist-status').textContent = data.targetAuthorStatus || '-';
        document.getElementById('d-report-memo').textContent = data.resolvedMemo || '-';
        document.getElementById('d-report-processed').textContent = formatDateFull(data.resolvedAt);
    };

    /* --------------------------------------------------
       작품관리 렌더링
       -------------------------------------------------- */
    const renderWorkList = (works, tbody) => {
        if (!works || works.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:#909090;">데이터가 없습니다.</td></tr>';
            return;
        }
        tbody.innerHTML = works.map((w, i) => {
            const statusLabel = workStatusLabel(w.status);
            const reportStyle = (w.reportCount > 0) ? ' style="color:#c00;"' : '';
            return `<tr data-status="${statusLabel}" data-id="${w.id}">
                <td>${i + 1}</td>
                <td>${w.title || ''}</td>
                <td>${w.artistName || ''}</td>
                <td>${w.category || ''}</td>
                <td>${w.saleType || ''}</td>
                <td>${statusBadge(w.status, 'work')}</td>
                <td>${formatDateShort(w.createdDatetime)}</td>
                <td>${w.viewCount || 0}</td>
                <td${reportStyle}>${w.reportCount || 0}</td>
            </tr>`;
        }).join('');
    };

    const renderWorkDetail = (data) => {
        document.getElementById('d-artwork-title').innerHTML = `${data.title || ''} ${statusBadge(data.status, 'work')}`;
        document.getElementById('d-artwork-name').textContent = data.title || '-';
        document.getElementById('d-artwork-artist').textContent = data.artistName || '-';
        document.getElementById('d-artwork-category').textContent = data.category || '-';
        document.getElementById('d-artwork-saletype').textContent = data.saleType || '-';
        document.getElementById('d-artwork-date').textContent = formatDateFull(data.createdDatetime);
        document.getElementById('d-artwork-views').textContent = (data.viewCount || 0) + '회';
        document.getElementById('d-artwork-likes').textContent = (data.saveCount || 0) + '개';
        document.getElementById('d-artwork-resolution').textContent = (data.fileWidth && data.fileHeight) ? `${data.fileWidth} x ${data.fileHeight}` : '-';
        document.getElementById('d-artwork-size').textContent = data.fileSize ? (Math.round(data.fileSize / 1024) + ' KB') : '-';
        const auctionStatusMap = { 'ACTIVE': '진행중', 'SOLD': '낙찰', 'CLOSED': '유찰', 'CANCELLED': '취소' };
        document.getElementById('d-artwork-auction-status').textContent = auctionStatusMap[data.auctionStatus] || data.auctionStatus || '-';
        document.getElementById('d-artwork-highbid').textContent = formatMoney(data.currentHighBid);
        document.getElementById('d-artwork-bidcount').textContent = (data.bidCount || 0) + '건';
        document.getElementById('d-artwork-reports').textContent = (data.reportCount || 0) + '건';
        document.getElementById('d-artwork-lastreport').textContent = data.lastReportDate || '-';

        const imgEl = document.getElementById('d-artwork-img');
        const videoEl = document.getElementById('d-artwork-video');
        if (data.videoUrl || data.fileType === 'VIDEO') {
            const src = data.videoUrl || data.thumbnailUrl;
            if (src) {
                videoEl.querySelector('source').src = src;
                videoEl.style.display = 'block';
                videoEl.load();
                imgEl.style.display = 'none';
            } else {
                imgEl.src = 'https://picsum.photos/seed/artwork1/320/180';
                imgEl.style.display = 'block';
                videoEl.style.display = 'none';
            }
        } else {
            imgEl.src = data.thumbnailUrl || 'https://picsum.photos/seed/artwork1/320/180';
            imgEl.style.display = 'block';
            videoEl.style.display = 'none';
        }

        const hideBtn = document.querySelector('#artworks-detail .btn-outline[onclick*="artwork-hide"]');
        const showBtn = document.querySelector('#artworks-detail .btn-outline[onclick*="artwork-show"]');
        if (hideBtn && showBtn) {
            if (data.status === 'HIDDEN') {
                hideBtn.style.display = 'none';
                showBtn.style.display = '';
            } else {
                hideBtn.style.display = '';
                showBtn.style.display = 'none';
            }
        }
    };

    /* --------------------------------------------------
       경매관리 렌더링
       -------------------------------------------------- */
    const renderAuctionList = (auctions, tbody) => {
        if (!auctions || auctions.length === 0) {
            tbody.innerHTML = '<tr><td colspan="9" style="text-align:center;color:#909090;">데이터가 없습니다.</td></tr>';
            return;
        }
        tbody.innerHTML = auctions.map((a) => {
            return `<tr data-status="종료" data-id="${a.id}">
                <td>${a.auctionCode || a.id}</td>
                <td>${a.workTitle || ''}</td>
                <td>${a.artistName || ''}</td>
                <td>${a.winnerName || '-'}</td>
                <td>${formatMoney(a.startingPrice)}</td>
                <td>${formatMoney(a.finalPrice)}</td>
                <td>${a.bidCount || 0}</td>
                <td>${a.closingAt || '-'}</td>
                <td>${statusBadge(a.status, 'auction')}</td>
            </tr>`;
        }).join('');
    };

    const renderAuctionDetail = (data) => {
        document.getElementById('d-auction-title').innerHTML = `${data.auctionCode || data.id} ${statusBadge(data.status, 'auction')}`;
        document.getElementById('d-auction-id').textContent = data.auctionCode || data.id || '-';
        document.getElementById('d-auction-start').textContent = formatMoney(data.startingPrice);
        document.getElementById('d-auction-bidunit').textContent = formatMoney(data.bidIncrement);
        document.getElementById('d-auction-final').textContent = formatMoney(data.finalPrice);
        document.getElementById('d-auction-bids').textContent = (data.bidCount || 0) + '건';
        document.getElementById('d-auction-participants').textContent = (data.participantCount || 0) + '명';
        document.getElementById('d-auction-startdate').textContent = data.startedAt || '-';
        document.getElementById('d-auction-enddate').textContent = data.closingAt || '-';
        document.getElementById('d-auction-artwork').textContent = data.workTitle || '-';
        document.getElementById('d-auction-artist').textContent = data.artistName || '-';
        document.getElementById('d-auction-category').textContent = data.category || '-';
        document.getElementById('d-auction-winner').textContent = data.winnerName || '-';
        const payStatusMap = { 'COMPLETED': '결제완료', 'PENDING': '대기', 'CANCELLED': '결제취소', 'REFUNDED': '환불' };
        const settleStatusMap = { 'PAID': '정산완료', 'PENDING': '대기', 'PROCESSING': '처리중' };
        document.getElementById('d-auction-paystatus').textContent = payStatusMap[data.paymentStatus] || data.paymentStatus || '-';
        document.getElementById('d-auction-settlement').textContent = settleStatusMap[data.settlementStatus] || data.settlementStatus || '-';

        document.getElementById('d-auction-fee').textContent = formatMoney(data.feeAmount);
        document.getElementById('d-auction-netamount').textContent = formatMoney(data.settlementAmount);
    };

    /* --------------------------------------------------
       출금관리 렌더링
       -------------------------------------------------- */
    const renderWithdrawalList = (withdrawals, tbody) => {
        if (!withdrawals || withdrawals.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#909090;">데이터가 없습니다.</td></tr>';
            return;
        }
        tbody.innerHTML = withdrawals.map((w) => {
            const statusLabel = withdrawalStatusLabel(w.status);
            return `<tr data-status="${statusLabel}" data-id="${w.id}">
                <td>${w.withdrawalCode || w.id}</td>
                <td>${w.artistName || ''}</td>
                <td>${formatMoney(w.requestedAmount)}</td>
                <td>${formatMoney(w.netAmount)}</td>
                <td>${w.bankName || ''}</td>
                <td>${w.requestedAt || '-'}</td>
                <td>${formatMoney(w.remainingBalance)}</td>
                <td>${statusBadge(w.status, 'withdrawal')}</td>
            </tr>`;
        }).join('');
    };

    const renderWithdrawalDetail = (data) => {
        document.getElementById('d-wd-title').innerHTML = `${data.withdrawalCode || data.id} ${statusBadge(data.status, 'withdrawal')}`;
        document.getElementById('d-wd-artist').textContent = data.artistName || '-';
        document.getElementById('d-wd-email').textContent = data.artistEmail || '-';
        document.getElementById('d-wd-member-status').textContent = data.memberStatus || '-';
        document.getElementById('d-wd-total-sales').textContent = formatMoney(data.totalSalesAmount);
        document.getElementById('d-wd-history').textContent = (data.withdrawalHistoryCount || 0) + '건 / ' + formatMoney(data.withdrawalHistoryTotal);
        document.getElementById('d-wd-bank').textContent = data.bankName || '-';
        document.getElementById('d-wd-account').textContent = data.accountNumber || '-';
        document.getElementById('d-wd-holder').textContent = data.accountHolder || '-';
        document.getElementById('d-wd-account-verified').textContent = data.accountNumber ? '인증완료' : '미인증';
        document.getElementById('d-wd-id').textContent = data.withdrawalCode || data.id || '-';
        document.getElementById('d-wd-amount').textContent = formatMoney(data.requestedAmount);
        document.getElementById('d-wd-fee').textContent = formatMoney(data.fee);
        document.getElementById('d-wd-net').innerHTML = '실 수령액: ' + formatMoney(data.netAmount);
        document.getElementById('d-wd-balance').textContent = formatMoney(data.currentBalance);
        document.getElementById('d-wd-after-balance').textContent = formatMoney(data.afterBalance);
        document.getElementById('d-wd-date').textContent = data.requestedAt || '-';
        document.getElementById('d-wd-approver').textContent = data.approverName || '미처리';
        document.getElementById('d-wd-approved-date').textContent = data.approvedAt || '-';
    };

    /* --------------------------------------------------
       결제관리 렌더링
       -------------------------------------------------- */
    const renderPaymentList = (payments, tbody) => {
        if (!payments || payments.length === 0) {
            tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#909090;">데이터가 없습니다.</td></tr>';
            return;
        }
        tbody.innerHTML = payments.map((p) => {
            const statusLabel = paymentStatusLabel(p.status);
            return `<tr data-status="${statusLabel}" data-id="${p.id}">
                <td>${p.orderCode || p.id}</td>
                <td>${p.buyerName || ''}</td>
                <td>${p.sellerName || ''}</td>
                <td>${p.orderType || ''}</td>
                <td>${p.workTitle || ''}</td>
                <td>${formatMoney(p.totalPrice)}</td>
                <td>${p.paidAt || '-'}</td>
                <td>${statusBadge(p.status, 'payment')}</td>
            </tr>`;
        }).join('');
    };

    const renderPaymentDetail = (data) => {
        document.getElementById('d-pay-title').innerHTML = `${data.orderCode || data.id} ${statusBadge(data.status, 'payment')}`;
        document.getElementById('d-pay-id').textContent = data.orderCode || data.id || '-';
        document.getElementById('d-pay-artwork').textContent = data.workTitle || '-';
        document.getElementById('d-pay-seller').textContent = data.sellerName || '-';
        document.getElementById('d-pay-type').textContent = data.orderType || '-';
        document.getElementById('d-pay-amount').textContent = formatMoney(data.totalPrice);
        document.getElementById('d-pay-commission').textContent = formatMoney(data.totalFee);
        document.getElementById('d-pay-settlement').textContent = formatMoney(data.settlementAmount);
        document.getElementById('d-pay-buyer').textContent = data.buyerName || '-';
        document.getElementById('d-pay-buyer-email').textContent = data.buyerEmail || '-';
        document.getElementById('d-pay-method').textContent = data.payMethod || '-';
        document.getElementById('d-pay-card').textContent = data.cardNumber || '-';
        document.getElementById('d-pay-date').textContent = data.paidAt || '-';
        document.getElementById('d-pay-approval').textContent = data.paymentCode || '-';
        document.getElementById('d-pay-total-display').textContent = formatMoney(data.totalPrice);
    };

    /* --------------------------------------------------
       페이지네이션 렌더링
       -------------------------------------------------- */
    const renderPagination = (pageSection, currentPageNum, totalCount, pageSize, onPageChange) => {
        const footer = pageSection.querySelector('.table-footer');
        if (!footer) return;

        const totalPages = Math.ceil(totalCount / pageSize) || 1;

        const desc = footer.querySelector('.page-description');
        if (desc) {
            if (totalCount === 0) {
                desc.textContent = '0개';
            } else {
                const start = (currentPageNum - 1) * pageSize + 1;
                const end = Math.min(currentPageNum * pageSize, totalCount);
                desc.textContent = `${totalCount}개 중 ${start}~${end}`;
            }
        }

        const pageNav = footer.querySelector('.page-nav');
        if (!pageNav) return;

        const navBtns = pageNav.querySelectorAll('.page-nav-btn');

        // Remove any old page number buttons
        pageNav.querySelectorAll('.page-num-btn').forEach(b => b.remove());

        const firstBtn = navBtns[0]; // 첫 페이지
        const prevBtn = navBtns[1];  // 이전 페이지
        const nextBtn = navBtns[navBtns.length - 1]; // 다음 페이지

        // No page number buttons - YouTube Studio style (first / prev / next only)

        // Wire first/prev/next buttons (clone to remove old listeners)
        if (firstBtn) {
            const newFirst = firstBtn.cloneNode(true);
            firstBtn.parentNode.replaceChild(newFirst, firstBtn);
            newFirst.disabled = currentPageNum <= 1;
            newFirst.addEventListener('click', () => { if (onPageChange) onPageChange(1); });
        }
        if (prevBtn) {
            const newPrev = prevBtn.cloneNode(true);
            prevBtn.parentNode.replaceChild(newPrev, prevBtn);
            newPrev.disabled = currentPageNum <= 1;
            newPrev.addEventListener('click', () => { if (onPageChange && currentPageNum > 1) onPageChange(currentPageNum - 1); });
        }
        if (nextBtn) {
            const newNext = nextBtn.cloneNode(true);
            nextBtn.parentNode.replaceChild(newNext, nextBtn);
            newNext.disabled = currentPageNum >= totalPages;
            newNext.addEventListener('click', () => { if (onPageChange && currentPageNum < totalPages) onPageChange(currentPageNum + 1); });
        }
    };

    return {
        renderMemberList,
        renderMemberDetail,
        renderReportList,
        renderReportDetail,
        renderWorkList,
        renderWorkDetail,
        renderAuctionList,
        renderAuctionDetail,
        renderWithdrawalList,
        renderWithdrawalDetail,
        renderPaymentList,
        renderPaymentDetail,
        renderPagination,
        formatMoney,
        formatDateShort,
        formatDateFull,
        statusBadge
    };
})();
