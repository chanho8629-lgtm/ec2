const AuctionSocket = (() => {
    let stompClient = null;
    let currentAuctionId = null;
    let currentMemberId = null;
    let subscription = null;
    let isConnecting = false;

    const connect = (auctionId, memberId) => {
        // 이미 같은 경매에 연결되어 있거나 연결 중이면 스킵
        if ((stompClient?.connected && currentAuctionId === auctionId) || isConnecting) return;

        disconnect();

        currentAuctionId = auctionId;
        currentMemberId = memberId;
        isConnecting = true;  // ← 연결 시작

        if (typeof SockJS === 'undefined' || typeof Stomp === 'undefined') {
            console.error('SockJS 또는 Stomp 미로드');
            isConnecting = false;
            return;
        }

        const socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);
        stompClient.debug = null;

        stompClient.connect({}, () => {
            isConnecting = false;  // ← 연결 완료

            // 기존 구독이 있으면 먼저 해제
            if (subscription) {
                subscription.unsubscribe();
                subscription = null;
            }

            subscription = stompClient.subscribe(
                `/topic/auction.${auctionId}`,
                (message) => {
                    const data = JSON.parse(message.body);
                    onBidReceived(data);
                }
            );
        }, (error) => {
            isConnecting = false;  // ← 연결 실패
            console.error('WebSocket 연결 실패:', error);
        });
    };

    const disconnect = () => {
        isConnecting = false;
        subscription?.unsubscribe();
        subscription = null;
        stompClient?.disconnect();
        stompClient = null;
        currentAuctionId = null;
        currentMemberId = null;
    };

    const sendBid = (auctionId, bidPrice) => {
        // STOMP 대신 REST API로 입찰 처리
        fetch(`/api/auction/${auctionId}/bid`, {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ bidPrice })
        })
            .then(res => {
                if (!res.ok) return res.text().then(text => { throw new Error(text); });
            })
            .catch(error => {
                AuctionEvent.showToast(error.message || '입찰에 실패했습니다.', 'error');
            });
    };

    const onBidReceived = (data) => {
        // 경매 종료 처리
        if (data.status === 'CLOSED') {
            onAuctionClosed(data);
            return;
        }

        // 1. 입찰 현황 카운트 업데이트
        const bidHistoryCount = document.getElementById('bidHistoryCount');
        if (bidHistoryCount) {
            bidHistoryCount.textContent = `${data.bidCount}건`;
        }

        // 2. 현재 최고 입찰가 업데이트
        const currentHighestPrice = document.getElementById('currentHighestPrice');
        if (currentHighestPrice) {
            currentHighestPrice.textContent = `${data.currentPrice.toLocaleString()}원`;
        }

        // 3. 입찰 버튼 금액 업데이트
        const bidNextAmount = document.getElementById('bidNextAmount');
        if (bidNextAmount) {
            bidNextAmount.textContent = `${data.nextMinBid.toLocaleString()}원으로 입찰하기`;
            bidNextAmount.dataset.amount = data.nextMinBid;
        }

        // 4. 입찰 내역 추가
        appendBidItem(data);

        // 5. empty 숨김 — 입찰이 하나라도 있으면
        const bidHistoryEmpty = document.getElementById('bidHistoryEmpty');
        if (bidHistoryEmpty) bidHistoryEmpty.hidden = true;

        // 6. 내가 보낸 입찰이면 성공 토스트
        if (data.memberId === currentMemberId) {
            AuctionEvent.showToast(`${data.bidPrice.toLocaleString()}원 입찰 완료!`, 'success');
        }
    };

    const onAuctionClosed = (data) => {
        // 카운트다운 종료 표시
        const auctionDeadlineDate = document.getElementById('auctionDeadlineDate');
        if (auctionDeadlineDate) {
            auctionDeadlineDate.textContent = '경매가 종료되었습니다.';
        }

        const bidSubmitBtn = document.getElementById('bidSubmitBtn');
        if (!bidSubmitBtn) return;

        if (data.winnerId === currentMemberId) {
            // 낙찰자 — 구매하기 버튼으로 교체
            bidSubmitBtn.innerHTML = `
            <span class="Auction-Bid-SubmitBtn-Amount">🎉 낙찰! 구매하기</span>
        `;
            bidSubmitBtn.onclick = () => {
                window.location.href = `/payment/pay-api?auctionId=${data.auctionId}`;
            };
            AuctionEvent.showToast('축하합니다! 낙찰되었습니다.', 'success');
        } else {
            // 낙찰자 아님 — 버튼 비활성화
            bidSubmitBtn.disabled = true;
            bidSubmitBtn.style.opacity = '0.4';
            bidSubmitBtn.style.cursor = 'not-allowed';
            bidSubmitBtn.innerHTML = `
            <span class="Auction-Bid-SubmitBtn-Amount">경매 종료</span>
        `;
            if (data.winnerId) {
                AuctionEvent.showToast(`${data.winnerNickname}님이 ${data.finalPrice.toLocaleString()}원에 낙찰되었습니다.`, 'info');
            }
        }
    };

    const appendBidItem = (data) => {
        if(!data) return;
        if (!data.memberNickname && !data.bidPrice) return;

        const list = document.getElementById('bidHistoryList');
        const empty = document.getElementById('bidHistoryEmpty');
        if (!list) return;

        if (empty) empty.hidden = true;

        const avatarText = data.memberNickname?.charAt(0).toUpperCase() || '?';
        const bidPrice = data.bidPrice?.toLocaleString();
        const item = document.createElement('div');
        item.className = 'Auction-Bid-Item';
        item.innerHTML = `
            <div class="Auction-Bid-Avatar">
                <div class="Auction-Bid-AvatarCircle">${avatarText}</div>
            </div>
            <div class="Auction-Bid-Content">
                <span class="Auction-Bid-Username">@${data.memberNickname}</span>
                <span class="Auction-Bid-Text">${bidPrice}원 입찰했습니다.</span>
            </div>
        `;

        list.prepend(item);  // 최신 입찰이 상단에
        list.scrollTop = 0;
    };

    return {
        connect: connect,
        disconnect: disconnect,
        sendBid: sendBid,
        appendBidItem: appendBidItem
    };
})();