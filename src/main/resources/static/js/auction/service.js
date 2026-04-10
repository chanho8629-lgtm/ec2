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


    return {
        getAuctionInfo: getAuctionInfo
    };
})();