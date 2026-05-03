package com.app.bideo.admin;

import org.junit.jupiter.api.Test;
import org.springframework.core.io.ClassPathResource;

import java.io.IOException;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * 관리자(Admin) 화면의 e2e 회귀 방지 contract test.
 *
 * 화면(admin.html), 이벤트 스크립트(event.js), 렌더러(layout.js), 스타일(admin-override.css)
 * 사이의 약속을 잠가둔다.
 */
class AdminPanelContractTest {

    @Test
    void memberSuspendModalAutoPopulatesTargetNicknameAsReadonly() throws IOException {
        String adminHtml = readResource("templates/admin/admin.html");
        String eventJs   = readResource("static/js/admin/event.js");

        // 1) 모달은 readonly 대상자 입력 필드를 갖는다
        assertTrue(adminHtml.contains("id=\"suspend-target-name\""));
        assertTrue(adminHtml.contains("readonly"));

        // 2) 정지 버튼은 모달 열기 직전에 #d-member-nick → #suspend-target-name 으로 닉네임을 주입한다
        assertTrue(eventJs.contains("btn-member-suspend"));
        assertTrue(eventJs.contains("d-member-nick"));
        assertTrue(eventJs.contains("suspend-target-name"));
        assertTrue(eventJs.contains("openModal('modal-member-suspend')"));

        // 3) 정지 처리 후 회원 상세/목록을 다시 불러와 상태 배지를 갱신한다
        assertTrue(eventJs.contains("await adminMemberService.suspend"));
        assertTrue(eventJs.contains("await loadDetail('members'"));
        assertTrue(eventJs.contains("await loadList('members')"));
    }

    @Test
    void filterTabPillStylesAreLoadedFromAdminOverrideCss() throws IOException {
        String adminHtml = readResource("templates/admin/admin.html");
        String overrideCss = readResource("static/css/admin/admin-override.css");

        // admin.html 은 admin-override.css 만 로드한다
        assertTrue(adminHtml.contains("/static/css/admin/admin-override.css"));

        // 모든 탭의 .filter-tab / .tabs-container / .selection-bar 룰이 override 에 있어야 한다
        assertTrue(overrideCss.contains(".filter-tab"));
        assertTrue(overrideCss.contains(".filter-tab.active"));
        assertTrue(overrideCss.contains(".tabs-container"));
        assertTrue(overrideCss.contains(".tabs-wrapper"));
        assertTrue(overrideCss.contains(".selection-bar"));
    }

    @Test
    void artworkListHasNoPreviewColumn() throws IOException {
        String adminHtml = readResource("templates/admin/admin.html");
        String layoutJs  = readResource("static/js/admin/layout.js");

        // 작품 테이블 헤더에서 "미리보기" 컬럼 제거됨
        // (단, 작품 상세 섹션의 "작품 미리보기" 타이틀은 그대로 유지)
        // → 정확히 <th>...미리보기</th> 패턴이 헤더에 없는지로 확인
        assertFalse(adminHtml.contains(">미리보기</th>"));

        // 렌더러도 미리보기 셀/함수 사용하지 않음
        assertFalse(layoutJs.contains("renderWorkPreviewCell"));

        // 리스트에서 영상/이미지 트래픽 발생 안 함
        assertFalse(layoutJs.contains("<video src=\"${w.videoUrl}\""));
        assertFalse(layoutJs.contains("<img src=\"${w.thumbnailUrl}\""));
        assertFalse(layoutJs.contains("via.placeholder.com"));
    }

    @Test
    void auctionUsesEndedStatusOnly() throws IOException {
        String adminHtml = readResource("templates/admin/admin.html");
        String layoutJs  = readResource("static/js/admin/layout.js");
        String eventJs   = readResource("static/js/admin/event.js");

        // 필터 탭은 전체/종료 만 노출
        assertTrue(adminHtml.contains("data-filter=\"종료\""));
        assertFalse(adminHtml.contains("data-filter=\"낙찰\""));
        assertFalse(adminHtml.contains("data-filter=\"유찰\""));

        // status FINISHED → '종료' 뱃지로 매핑
        assertTrue(layoutJs.contains("FINISHED"));
        assertTrue(layoutJs.contains("'종료'"));

        // event.js 의 필터 매핑도 종료만 인정
        assertTrue(eventJs.contains("'종료': 'FINISHED'"));
    }

    @Test
    void auctionRendererUsesActualDtoFieldNames() throws IOException {
        String layoutJs = readResource("static/js/admin/layout.js");

        // AdminAuctionListResponseDTO / AdminAuctionDetailResponseDTO 의 실제 필드명 사용
        assertTrue(layoutJs.contains("a.artworkTitle"));
        assertTrue(layoutJs.contains("a.artistNickname"));
        assertTrue(layoutJs.contains("a.winnerNickname"));
        assertTrue(layoutJs.contains("a.startPrice"));
        assertTrue(layoutJs.contains("a.winningPrice"));
        assertTrue(layoutJs.contains("a.endAt"));

        assertTrue(layoutJs.contains("data.artworkCategory"));
        assertTrue(layoutJs.contains("data.bidUnit"));
        assertTrue(layoutJs.contains("data.commissionAmount"));

        // 잘못된 옛 키들이 더이상 남아있지 않다
        assertFalse(layoutJs.contains("a.workTitle"));
        assertFalse(layoutJs.contains("a.startingPrice"));
        assertFalse(layoutJs.contains("a.finalPrice"));
        assertFalse(layoutJs.contains("a.closingAt"));
        assertFalse(layoutJs.contains("data.bidIncrement"));
        assertFalse(layoutJs.contains("data.feeAmount"));
    }

    @Test
    void withdrawalRendererFillsAllColumnsAndShowsDateOnly() throws IOException {
        String layoutJs = readResource("static/js/admin/layout.js");

        // List: requestAmount/actualAmount/requestedAt(YYYY-MM-DD)
        assertTrue(layoutJs.contains("w.requestAmount"));
        assertTrue(layoutJs.contains("w.actualAmount"));
        assertTrue(layoutJs.contains("formatDateOnly(w.requestedAt)"));

        // Detail: artistNickname/totalTransactionAmount/withdrawalHistory/commissionAmount/balanceAfter/approver
        assertTrue(layoutJs.contains("data.artistNickname"));
        assertTrue(layoutJs.contains("data.totalTransactionAmount"));
        assertTrue(layoutJs.contains("data.withdrawalHistory"));
        assertTrue(layoutJs.contains("data.commissionAmount"));
        assertTrue(layoutJs.contains("data.balanceAfter"));
        assertTrue(layoutJs.contains("data.approver"));
        assertTrue(layoutJs.contains("formatDateOnly(data.requestedAt)"));

        // 옛 잘못된 키들 제거
        assertFalse(layoutJs.contains("w.requestedAmount"));
        assertFalse(layoutJs.contains("w.netAmount"));
        assertFalse(layoutJs.contains("data.totalSalesAmount"));
        assertFalse(layoutJs.contains("data.withdrawalHistoryCount"));
        assertFalse(layoutJs.contains("data.afterBalance"));
        assertFalse(layoutJs.contains("data.approverName"));
    }

    @Test
    void photoOnlyDummyWorkSeedExistsAndInsertsThumbnailFileWithoutVideo() throws IOException {
        String seed = readSource("src/main/resources/sql/seed_admin_photo_works.sql");
        // 사진 작품 시드 파일이 존재하고, 영상 row 없이 THUMBNAIL 만 넣는다
        assertTrue(seed.contains("QA-사진-"));
        assertTrue(seed.contains("'PHOTO'"));
        assertTrue(seed.contains("'THUMBNAIL'"));
        assertFalse(seed.contains("'VIDEO'"));

        // 매퍼는 PHOTO 카테고리를 한글 '사진' 으로 라벨링한다
        String workMapper = readSource("src/main/resources/mapper/admin/AdminWorkMapper.xml");
        assertTrue(workMapper.contains("when 'PHOTO'         then '사진'"));
    }

    @Test
    void artworkDetailRendersImgForPhotoAndVideoForVideoOnlyByVideoUrl() throws IOException {
        String layoutJs = readResource("static/js/admin/layout.js");

        // 영상 여부는 videoUrl 존재 여부로만 판단 (fileType 단독으로는 분기 X)
        assertTrue(layoutJs.contains("const isVideo = !!data.videoUrl"));
        assertFalse(layoutJs.contains("data.fileType === 'VIDEO'"));

        // 사진(영상 없음) → <img src=thumbnailUrl>, video 는 src 비우고 숨김
        assertTrue(layoutJs.contains("imgEl.src = data.thumbnailUrl"));
        assertTrue(layoutJs.contains("videoEl.style.display = 'none'"));

        // 외부 picsum placeholder 더 이상 사용 안 함
        assertFalse(layoutJs.contains("picsum.photos"));
    }

    @Test
    void formatDateOnlyHelperReturnsYearMonthDay() throws IOException {
        String layoutJs = readResource("static/js/admin/layout.js");
        assertTrue(layoutJs.contains("formatDateOnly"));
        // YYYY-MM-DD 포맷 (연-월-일) 만 출력한다
        assertTrue(layoutJs.contains("`${yyyy}-${mm}-${dd}`"));
    }

    @Test
    void serverErrorMessagesArePropagatedToToastInsteadOfGenericProcessingError() throws IOException {
        String serviceJs = readResource("static/js/admin/service.js");
        String eventJs   = readResource("static/js/admin/event.js");

        // service.js: 서버 응답의 error/message 필드를 추출해 throw
        assertTrue(serviceJs.contains("throwServerError"));
        assertTrue(serviceJs.contains("parsed.error"));

        // event.js: 캐치한 예외 메시지를 그대로 토스트로 노출
        assertTrue(eventJs.contains("e.message"));
        // 모든 모달 confirm 핸들러는 generic toast 만 띄우면 안 된다 (e.message 우선)
        assertFalse(eventJs.contains("showToast('처리 중 오류가 발생했습니다.');"));
    }

    @Test
    void restrictionServiceEvictsMemberCacheSoStatusBadgeRefreshes() throws IOException {
        String svc = readSource("src/main/java/com/app/bideo/service/admin/AdminRestrictionService.java");
        // createRestriction/updateRestriction/releaseRestriction 모두 회원 캐시를 비워야 한다
        assertTrue(svc.contains("@CacheEvict"));
        assertTrue(svc.contains("admin:members:detail"));
        assertTrue(svc.contains("admin:members:list"));
    }

    @Test
    void allStatusLabelsAreKorean() throws IOException {
        String layoutJs = readResource("static/js/admin/layout.js");

        // 결제수단/주문유형 한글 라벨 헬퍼 존재
        assertTrue(layoutJs.contains("paymentMethodLabel"));
        assertTrue(layoutJs.contains("'신용카드'"));
        assertTrue(layoutJs.contains("'카카오페이'"));
        assertTrue(layoutJs.contains("orderTypeLabel"));
        assertTrue(layoutJs.contains("'경매'"));
        assertTrue(layoutJs.contains("'거래'"));

        // 출금 detail 의 미처리 필드 공란 처리 (status==='PENDING' 일 때)
        assertTrue(layoutJs.contains("data.status !== 'PENDING'"));
        // 신고 detail 도 처리 전 공란
        assertTrue(layoutJs.contains("isReportProcessed"));
    }

    private String readResource(String path) throws IOException {
        try (InputStream stream = new ClassPathResource(path).getInputStream()) {
            return new String(stream.readAllBytes(), StandardCharsets.UTF_8);
        }
    }

    private String readSource(String relativePath) throws IOException {
        Path p = Paths.get(System.getProperty("user.dir"), relativePath);
        return Files.readString(p, StandardCharsets.UTF_8);
    }
}
