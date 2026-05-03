package com.app.bideo.service.admin;

import com.app.bideo.dto.admin.AdminMemberDetailResponseDTO;
import com.app.bideo.dto.admin.AdminRestrictionResponseDTO;
import com.app.bideo.dto.admin.AdminRestrictionUpsertRequestDTO;
import com.app.bideo.repository.admin.AdminMemberDAO;
import com.app.bideo.repository.admin.AdminRestrictionDAO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

/**
 * 회원 정지/해제 e2e 시나리오 테스트.
 *
 * 관리자 화면(admin.html)에서 [정지] 버튼을 누르면 다음 흐름이 실행돼야 한다.
 *  1) POST /api/admin/restrictions 로 restriction 레코드가 생성된다.
 *  2) 같은 트랜잭션에서 tbl_member.status 가 SUSPENDED(또는 BANNED)로 갱신된다.
 *  3) 이후 GET /api/admin/members/{id} 가 변경된 status 를 돌려줘서
 *     상세 화면의 배지가 "정지" 로 바뀐다.
 *
 * DB 없이 e2e 흐름을 검증하기 위해 DAO 를 모킹하고
 *  - DAO 호출 순서/인자
 *  - 상태 동기화
 *  - 해제 시 이전 상태 복원
 * 을 모두 단언한다.
 */
@ExtendWith(MockitoExtension.class)
class AdminMemberSuspensionE2ETest {

    @Mock
    private AdminRestrictionDAO adminRestrictionDAO;

    @Mock
    private AdminMemberDAO adminMemberDAO;

    @InjectMocks
    private AdminRestrictionService adminRestrictionService;

    @BeforeEach
    void noExpirableRestrictions() {
        when(adminRestrictionDAO.findExpirableRestrictions()).thenReturn(Collections.emptyList());
    }

    @Nested
    @DisplayName("정지 (createRestriction)")
    class Suspend {

        @Test
        @DisplayName("기간 제한 정지(LIMIT) - 회원 상태가 SUSPENDED 로 갱신된다")
        void limitSuspendUpdatesMemberStatusToSuspended() {
            Long memberId = 42L;
            stubActiveMember(memberId, "ACTIVE");
            when(adminRestrictionDAO.findActiveByMemberId(memberId)).thenReturn(Optional.empty());

            AdminRestrictionUpsertRequestDTO request = AdminRestrictionUpsertRequestDTO.builder()
                    .memberId(memberId)
                    .restrictionType("LIMIT")
                    .reason("부적절한 활동")
                    .endDatetime(LocalDateTime.now().plusDays(7))
                    .build();

            adminRestrictionService.createRestriction(request);

            ArgumentCaptor<AdminRestrictionUpsertRequestDTO> insertCaptor =
                    ArgumentCaptor.forClass(AdminRestrictionUpsertRequestDTO.class);
            verify(adminRestrictionDAO).insert(insertCaptor.capture());
            assertThat(insertCaptor.getValue().getPreviousMemberStatus()).isEqualTo("ACTIVE");
            assertThat(insertCaptor.getValue().getRestrictionType()).isEqualTo("LIMIT");

            verify(adminMemberDAO).updateStatus(memberId, "SUSPENDED");
        }

        @Test
        @DisplayName("영구 정지(BLOCK) - 회원 상태가 BANNED 로 갱신된다")
        void blockSuspendUpdatesMemberStatusToBanned() {
            Long memberId = 99L;
            stubActiveMember(memberId, "ACTIVE");
            when(adminRestrictionDAO.findActiveByMemberId(memberId)).thenReturn(Optional.empty());

            AdminRestrictionUpsertRequestDTO request = AdminRestrictionUpsertRequestDTO.builder()
                    .memberId(memberId)
                    .restrictionType("BLOCK")
                    .reason("관리자 정지")
                    .build();

            adminRestrictionService.createRestriction(request);

            verify(adminRestrictionDAO).insert(any(AdminRestrictionUpsertRequestDTO.class));
            verify(adminMemberDAO).updateStatus(memberId, "BANNED");
        }

        @Test
        @DisplayName("이미 활성 정지가 있으면 중복 생성을 차단하고 회원 상태도 변경하지 않는다")
        void doesNotDoublyApplyWhenActiveRestrictionAlreadyExists() {
            Long memberId = 7L;
            stubActiveMember(memberId, "ACTIVE");
            when(adminRestrictionDAO.findActiveByMemberId(memberId))
                    .thenReturn(Optional.of(restriction(1L, memberId, "LIMIT", "ACTIVE", "ACTIVE")));

            AdminRestrictionUpsertRequestDTO request = AdminRestrictionUpsertRequestDTO.builder()
                    .memberId(memberId)
                    .restrictionType("LIMIT")
                    .reason("중복 정지 시도")
                    .endDatetime(LocalDateTime.now().plusDays(3))
                    .build();

            assertThatThrownBy(() -> adminRestrictionService.createRestriction(request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("이미 정지된 회원입니다");

            verify(adminRestrictionDAO, never()).insert(any());
            verify(adminMemberDAO, never()).updateStatus(anyLong(), any());
        }

        @Test
        @DisplayName("LIMIT 타입인데 종료 일시가 비어있으면 IllegalArgumentException")
        void limitRequiresEndDatetime() {
            AdminRestrictionUpsertRequestDTO request = AdminRestrictionUpsertRequestDTO.builder()
                    .memberId(11L)
                    .restrictionType("LIMIT")
                    .reason("기간 제한")
                    .build();

            assertThatThrownBy(() -> adminRestrictionService.createRestriction(request))
                    .isInstanceOf(IllegalArgumentException.class)
                    .hasMessageContaining("종료 일시");

            verify(adminRestrictionDAO, never()).insert(any());
            verify(adminMemberDAO, never()).updateStatus(anyLong(), any());
        }
    }

    @Nested
    @DisplayName("해제 (releaseRestriction)")
    class Release {

        @Test
        @DisplayName("해제 시 정지 이전 상태로 회원 상태가 복원된다")
        void releaseRestoresPreviousMemberStatus() {
            Long restrictionId = 501L;
            Long memberId = 23L;
            AdminRestrictionResponseDTO existing =
                    restriction(restrictionId, memberId, "LIMIT", "ACTIVE", "ACTIVE");
            when(adminRestrictionDAO.findById(restrictionId)).thenReturn(Optional.of(existing));

            adminRestrictionService.releaseRestriction(restrictionId);

            verify(adminRestrictionDAO).release(restrictionId);
            verify(adminMemberDAO).updateStatus(memberId, "ACTIVE");
        }

        @Test
        @DisplayName("이전 상태가 비정상 값이면 ACTIVE 로 정규화돼 복원된다")
        void releaseFallsBackToActiveWhenPreviousIsUnknown() {
            Long restrictionId = 502L;
            Long memberId = 24L;
            AdminRestrictionResponseDTO existing =
                    restriction(restrictionId, memberId, "LIMIT", "ACTIVE", "WHATEVER");
            when(adminRestrictionDAO.findById(restrictionId)).thenReturn(Optional.of(existing));

            adminRestrictionService.releaseRestriction(restrictionId);

            verify(adminMemberDAO).updateStatus(memberId, "ACTIVE");
            verify(adminRestrictionDAO, times(1)).release(restrictionId);
        }
    }

    private void stubActiveMember(Long id, String status) {
        AdminMemberDetailResponseDTO member = new AdminMemberDetailResponseDTO();
        member.setId(id);
        member.setStatus(status);
        when(adminMemberDAO.findById(id)).thenReturn(Optional.of(member));
    }

    private AdminRestrictionResponseDTO restriction(Long id, Long memberId, String type,
                                                    String status, String previousMemberStatus) {
        AdminRestrictionResponseDTO dto = new AdminRestrictionResponseDTO();
        dto.setId(id);
        dto.setMemberId(memberId);
        dto.setRestrictionType(type);
        dto.setStatus(status);
        dto.setPreviousMemberStatus(previousMemberStatus);
        return dto;
    }
}
