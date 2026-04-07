// 진입점: service, layout, event 모듈 조합
document.addEventListener("DOMContentLoaded", async () => {
  const keyword = new URLSearchParams(location.search).get("search_query") || "";
  const searchResults = document.getElementById("searchResults");

  // 정적 UI 이벤트 바인딩
  searchEvent.init();

  // 검색 실행
  if (!keyword.trim()) return;

  const data = await searchService.search(keyword);
  searchLayout.render(searchResults, data);

  // 동적 요소 이벤트 바인딩
  searchEvent.bindDynamic();
});
