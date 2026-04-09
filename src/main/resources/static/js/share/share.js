window.BideoShare = (function () {
  /*
   * 사용 방법
   * 1. 공유 input에 data-share-link-input 추가
   * 2. 전송 버튼에서 normalizeInputUrl() 호출
   * 3. 선택한 수신자 id 목록을 collectReceiverIds()로 변환
   * 4. buildSharePayload() 결과를 각 도메인 API에 전달
   *
   * 프로필 예시
   * - API: /api/profile/{nickname}/share
   * - 주소만 /profile/{nickname} 으로 다르고 흐름은 동일
   *
   * 다른 페이지 예시
   * - 작품: /work/detail/{id}
   * - 예술관: /gallery/{id}
   * - 주소만 바꿔서 같은 방식으로 사용
   */

  // 공유 링크 정규화
  function normalizeUrl(rawValue, fallbackUrl) {
    var value = String(rawValue || '').trim();

    if (!value) {
      return fallbackUrl || window.location.href;
    }

    if (/^https?:\/\//i.test(value)) {
      return value;
    }

    if (value.charAt(0) === '/') {
      return window.location.origin + value;
    }

    return new URL(value, window.location.origin).toString();
  }

  // 공유 input 값 정규화
  function normalizeInputUrl(input, fallbackUrl) {
    var normalizedUrl = normalizeUrl(input && input.value, fallbackUrl);

    if (input) {
      input.value = normalizedUrl;
    }

    return normalizedUrl;
  }

  // 선택한 수신자 id 목록 생성
  function collectReceiverIds(selectedKeys, receiverMap) {
    return (selectedKeys || [])
      .map(function (key) {
        var item = receiverMap && typeof receiverMap.get === 'function' ? receiverMap.get(key) : null;
        return item ? item.id : null;
      })
      .filter(Boolean);
  }

  // 공유 요청 바디 생성
  function buildSharePayload(receiverIds, shareUrl, message) {
    return {
      receiverIds: receiverIds || [],
      shareUrl: shareUrl || '',
      message: String(message || '').trim(),
    };
  }

  return {
    normalizeUrl: normalizeUrl,
    normalizeInputUrl: normalizeInputUrl,
    collectReceiverIds: collectReceiverIds,
    buildSharePayload: buildSharePayload,
  };
})();
