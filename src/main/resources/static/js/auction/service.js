const AuctionService = (() => {
    const getAuctionInfo = async (workId, callback) => {
        console.log("받아온 상품 id: ",workId);
        const response = await fetch(`/api/auction/${workId}`);

        if (!response.ok) {
            console.warn("경매 정보 조회 실패:", response.status);
            return null;
        }

        const auction = await response.json();

        if(callback) {
            callback(auction)
        }
    }

    const analyzeAuction = async (auctionId) => {
        const response = await fetch(`/api/auction/${auctionId}/ai/analyze`, {
            method: "POST",
            headers: {
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            const message = await response.text();
            throw new Error(message || "AI 경매 분석에 실패했습니다.");
        }

        return response.json();
    };

    return {
        getAuctionInfo: getAuctionInfo,
        analyzeAuction: analyzeAuction
    };
})();
