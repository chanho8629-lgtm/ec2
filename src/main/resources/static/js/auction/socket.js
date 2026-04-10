const AuctionSocket = (() => {
    let stompClient = null;
    let currentAuctionId = null;
    let currentMemberId = null;
    let subscription = null;

    const connect = (auctionId, memberId) => {
        console.log('connect 시작 - auctionId:', auctionId, 'memberId:', memberId);

        if (stompClient?.connected && currentAuctionId === auctionId) {
            console.log('이미 연결됨');
            return;
        }

        if (typeof SockJS === 'undefined' || typeof Stomp === 'undefined') {
            console.error('SockJS 또는 Stomp 미로드');
            return;
        }

        disconnect();

        currentAuctionId = auctionId;
        currentMemberId = memberId;

        console.log('SockJS 연결 시도...');
        const socket = new SockJS('/ws');
        stompClient = Stomp.over(socket);
        stompClient.debug = (msg) => console.log('STOMP:', msg); // debug 활성화

        stompClient.connect({}, () => {
            console.log('STOMP 연결 성공, 구독 시작:', `/topic/auction.${auctionId}`);
            subscription = stompClient.subscribe(
                `/topic/auction.${auctionId}`,
                (message) => {
                    const data = JSON.parse(message.body);
                    onBidReceived(data);
                }
            );
        }, (error) => {
            console.error('WebSocket 연결 실패:', error);
        });
    };

    // const connect = (auctionId, memberId) => {
    //     if (stompClient?.connected && currentAuctionId === auctionId) return;
    //
    //     // SockJS, Stomp 라이브러리 로드 확인
    //     if (typeof SockJS === 'undefined' || typeof Stomp === 'undefined') {
    //         console.error('SockJS 또는 Stomp 라이브러리가 로드되지 않았습니다.');
    //         return;
    //     }
    //
    //     // 다른 경매에 구독하고 있으면 해제
    //     disconnect();
    //
    //     currentAuctionId = auctionId;
    //     currentMemberId = memberId;
    //
    //     const socket = new SockJS('/ws');
    //     stompClient = Stomp.over(socket);
    //     stompClient.debug = null;
    //
    //     // 들어온 경매 구독
    //     stompClient.connect({}, () => {
    //         subscription = stompClient.subscribe(
    //             `/topic/auction/${auctionId}`,
    //             (message) => {
    //                 const data = JSON.parse(message.body);
    //                 onBidReceived(data);
    //             }
    //         );
    //     }, (error) => {
    //         console.error('WebSocket 연결 실패:', error);
    //     });
    // };

    const disconnect = () => {
        subscription?.unsubscribe();
        stompClient?.disconnect();
        stompClient = null;
        subscription = null;
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

        // 3. 입찰 버튼 금액 업데이트 (10% 인상된 nextMinBid)
        const bidNextAmount = document.getElementById('bidNextAmount');
        if (bidNextAmount) {
            bidNextAmount.textContent = `${data.nextMinBid.toLocaleString()}원으로 입찰하기`;
            bidNextAmount.dataset.amount = data.nextMinBid;
        }

        // 4. 입찰 내역 추가
        appendBidItem(data);

        // 5. 내가 보낸 입찰이면 성공 토스트
        if (data.memberId === currentMemberId) {
            AuctionEvent.showToast(`${data.bidPrice.toLocaleString()}원 입찰 완료!`, 'success');
        }
    };

    const appendBidItem = (data) => {
        const list = document.getElementById('bidHistoryList');
        const empty = document.getElementById('bidHistoryEmpty');
        if (!list) return;

        if (empty) empty.hidden = true;

        const avatarText = data.memberNickname?.charAt(0).toUpperCase() || '?';
        const item = document.createElement('div');
        item.className = 'Auction-Bid-Item';
        item.innerHTML = `
            <div class="Auction-Bid-Avatar">
                <div class="Auction-Bid-AvatarCircle">${avatarText}</div>
            </div>
            <div class="Auction-Bid-Content">
                <span class="Auction-Bid-Username">@${data.memberNickname}</span>
                <span class="Auction-Bid-Text">${data.bidPrice.toLocaleString()}원 입찰했습니다.</span>
            </div>
        `;

        list.prepend(item);  // 최신 입찰이 상단에
        list.scrollTop = 0;
    };

    return {
        connect,
        disconnect,
        sendBid,
    };
})();