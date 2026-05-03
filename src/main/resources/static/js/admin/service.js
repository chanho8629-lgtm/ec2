'use strict';

const safeJson = async (response) => {
    const text = await response.text();
    if (!text) return {};
    try { return JSON.parse(text); } catch { return {}; }
};

const throwServerError = async (response) => {
    const text = await response.text();
    let message = text;
    try {
        const parsed = JSON.parse(text);
        message = parsed.error || parsed.message || text;
    } catch { /* keep raw text */ }
    if (!message || !message.trim()) {
        message = '서버 응답 오류 (' + response.status + ')';
    }
    throw new Error(message);
};

/* =====================================================
   adminMemberService - 회원관리 API
   ===================================================== */
const adminMemberService = (() => {
    const getList = async (params) => {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`/api/admin/members?${query}`);
        if (!response.ok) await throwServerError(response);
        return await response.json();
    };

    const getDetail = async (id) => {
        const response = await fetch(`/api/admin/members/${id}`);
        if (!response.ok) await throwServerError(response);
        return await response.json();
    };

    const updateStatus = async (id, status) => {
        const response = await fetch(`/api/admin/members/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status })
        });
        if (!response.ok) await throwServerError(response);
        return await safeJson(response);
    };

    const suspend = async (memberId, reason, endDate) => {
        const body = {
            memberId: Number(memberId),
            restrictionType: endDate ? 'LIMIT' : 'BLOCK',
            reason: reason || '관리자 정지'
        };
        if (endDate) body.endDatetime = endDate + 'T23:59:59';
        const response = await fetch('/api/admin/restrictions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        });
        if (!response.ok) await throwServerError(response);
        return await safeJson(response);
    };

    const activate = async (memberId) => {
        const resp = await fetch(`/api/admin/restrictions/active/member/${memberId}`);
        if (resp.ok && resp.status !== 204) {
            const restriction = await resp.json();
            const releaseResp = await fetch(`/api/admin/restrictions/${restriction.id}/release`, { method: 'PATCH' });
            if (!releaseResp.ok) await throwServerError(releaseResp);
        } else {
            await updateStatus(memberId, 'ACTIVE');
        }
    };

    return { getList, getDetail, updateStatus, suspend, activate };
})();

/* =====================================================
   adminReportService - 신고관리 API
   ===================================================== */
const adminReportService = (() => {
    const getList = async (params) => {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`/api/admin/reports?${query}`);
        if (!response.ok) await throwServerError(response);
        return await response.json();
    };

    const getDetail = async (id) => {
        const response = await fetch(`/api/admin/reports/${id}`);
        if (!response.ok) await throwServerError(response);
        return await response.json();
    };

    const process = async (id, memo) => {
        const response = await fetch(`/api/admin/reports/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'RESOLVED', memo })
        });
        if (!response.ok) await throwServerError(response);
        return await safeJson(response);
    };

    const cancel = async (id, memo) => {
        const response = await fetch(`/api/admin/reports/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'CANCELLED', memo })
        });
        if (!response.ok) await throwServerError(response);
        return await safeJson(response);
    };

    return { getList, getDetail, process, cancel };
})();

/* =====================================================
   adminWorkService - 작품관리 API
   ===================================================== */
const adminWorkService = (() => {
    const getList = async (params) => {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`/api/admin/works?${query}`);
        if (!response.ok) await throwServerError(response);
        return await response.json();
    };

    const getDetail = async (id) => {
        const response = await fetch(`/api/admin/works/${id}`);
        if (!response.ok) await throwServerError(response);
        return await response.json();
    };

    const hide = async (id) => {
        const response = await fetch(`/api/admin/works/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'HIDDEN' })
        });
        if (!response.ok) await throwServerError(response);
        return await safeJson(response);
    };

    const show = async (id) => {
        const response = await fetch(`/api/admin/works/${id}/status`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status: 'ACTIVE' })
        });
        if (!response.ok) await throwServerError(response);
        return await safeJson(response);
    };

    return { getList, getDetail, hide, show };
})();

/* =====================================================
   adminAuctionService - 경매관리 API
   ===================================================== */
const adminAuctionService = (() => {
    const getList = async (params) => {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`/api/admin/auctions?${query}`);
        if (!response.ok) await throwServerError(response);
        return await response.json();
    };

    const getDetail = async (id) => {
        const response = await fetch(`/api/admin/auctions/${id}`);
        if (!response.ok) await throwServerError(response);
        return await response.json();
    };

    return { getList, getDetail };
})();

/* =====================================================
   adminWithdrawalService - 출금관리 API
   ===================================================== */
const adminWithdrawalService = (() => {
    const getList = async (params) => {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`/api/admin/withdrawals?${query}`);
        if (!response.ok) await throwServerError(response);
        return await response.json();
    };

    const getDetail = async (id) => {
        const response = await fetch(`/api/admin/withdrawals/${id}`);
        if (!response.ok) await throwServerError(response);
        return await response.json();
    };

    const approve = async (id) => {
        const response = await fetch(`/api/admin/withdrawals/${id}/approve`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' }
        });
        if (!response.ok) await throwServerError(response);
        return await safeJson(response);
    };

    const reject = async (id, reason) => {
        const response = await fetch(`/api/admin/withdrawals/${id}/reject`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reason })
        });
        if (!response.ok) await throwServerError(response);
        return await safeJson(response);
    };

    return { getList, getDetail, approve, reject };
})();

/* =====================================================
   adminPaymentService - 결제관리 API
   ===================================================== */
const adminPaymentService = (() => {
    const getList = async (params) => {
        const query = new URLSearchParams(params).toString();
        const response = await fetch(`/api/admin/payments?${query}`);
        if (!response.ok) await throwServerError(response);
        return await response.json();
    };

    const getDetail = async (id) => {
        const response = await fetch(`/api/admin/payments/${id}`);
        if (!response.ok) await throwServerError(response);
        return await response.json();
    };

    return { getList, getDetail };
})();
