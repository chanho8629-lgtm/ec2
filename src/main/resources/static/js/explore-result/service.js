const searchService = (() => {
  const search = async (page, keyword, type, sort, callback) => {
    console.log("들어옴1 - search", page, keyword, type, sort);
    const response = await fetch(`/api/search/${page}?keyword=${encodeURIComponent(keyword)}&type=${encodeURIComponent(type)}&sort=${encodeURIComponent(sort)}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Fetch error");
    }

    const data = await response.json();
    console.log("들어옴2 ", data);

    if (callback) {
      return callback(data);
    }
  };

  const toggleBookmark = async (targetType, targetId, callback) => {
    console.log("들어옴1 북마크토글", targetType, targetId);
    const response = await fetch("/api/bookmarks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType: targetType, targetId: targetId })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Fetch error");
    }

    const data = await response.json();
    console.log("들어옴2 북마크 응답", data);

    if (callback) {
      return callback(data);
    }
  };

  const report = async (targetType, targetId, reason, callback) => {
    console.log("들어옴1 신고", targetType, targetId, reason);
    const response = await fetch("/api/reports", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ targetType: targetType, targetId: targetId, reason: reason, detail: "" })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Fetch error");
    }

    const data = await response.json();
    console.log("들어옴2 신고", data);

    if (callback) {
      return callback(data);
    }
  };

  const searchMembers = async (keyword, callback) => {
    console.log("들어옴1 사람찾아요", keyword);
    const response = await fetch(`/api/messages/search-members?keyword=${encodeURIComponent(keyword)}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Fetch error");
    }

    const data = await response.json();
    console.log("들어옴2 -사람찾아요", data);

    if (callback) {
      return callback(data);
    }
  };

  const shareToMember = async (memberId, content, callback) => {
    console.log("들어옴1 공유", memberId);
    const roomResponse = await fetch("/api/messages/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ memberIds: [memberId] })
    });

    if (!roomResponse.ok) {
      const errorText = await roomResponse.text();
      throw new Error(errorText || "Fetch error");
    }

    const room = await roomResponse.json();
    console.log("들어옴2 챗방생성", room);

    const msgResponse = await fetch(`/api/messages/rooms/${room.id}/send`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: content })
    });

    if (!msgResponse.ok) {
      const errorText = await msgResponse.text();
      throw new Error(errorText || "Fetch error");
    }

    const data = await msgResponse.json();
    console.log("들어옴3 디엠전송", data);

    if (callback) {
      return callback(data);
    }
  };

  const blockMember = async (memberId, callback) => {
    console.log("들어옴1 차단", memberId);
    const response = await fetch(`/api/members/${memberId}/block`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Fetch error");
    }

    const data = await response.json();
    console.log("들어옴2 차단 응답", data);

    if (callback) {
      return callback(data);
    }
  };

  const toggleFollow = async (memberId, callback) => {
    console.log("들어옴1 팔로우토글", memberId);
    const response = await fetch(`/api/members/${memberId}/follow`, {
      method: "POST",
      headers: { "Content-Type": "application/json" }
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || "Fetch error");
    }

    const data = await response.json();
    console.log("들어옴2 팔로우 응답", data);

    if (callback) {
      return callback(data);
    }
  };

  return {
    search: search,
    toggleBookmark: toggleBookmark,
    toggleFollow: toggleFollow,
    blockMember: blockMember,
    report: report,
    searchMembers: searchMembers,
    shareToMember: shareToMember
  };
})();
