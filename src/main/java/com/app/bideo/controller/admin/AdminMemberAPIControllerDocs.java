package com.app.bideo.controller.admin;

import com.app.bideo.dto.admin.AdminMemberDetailResponseDTO;
import com.app.bideo.dto.member.MemberSearchDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;

import java.util.Map;

@Tag(name = "Admin - Member", description = "회원 관리 (목록·상세·상태 변경)")
public interface AdminMemberAPIControllerDocs {

    @Operation(summary = "회원 목록 조회",
            description = "키워드/상태/역할/크리에이터 인증 여부로 필터링된 회원 목록과 총 건수를 반환한다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "ROLE_ADMIN 권한 없음")
    })
    Map<String, Object> list(MemberSearchDTO searchDTO);

    @Operation(summary = "회원 상세 조회")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "400", description = "회원이 존재하지 않음"),
            @ApiResponse(responseCode = "403", description = "ROLE_ADMIN 권한 없음")
    })
    AdminMemberDetailResponseDTO detail(@Parameter(description = "회원 PK") Long id);

    @Operation(summary = "회원 상태 변경",
            description = "단순 상태 토글. 정지/차단을 종료일·사유와 함께 처리하려면 Restriction API 사용.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "변경 완료"),
            @ApiResponse(responseCode = "400", description = "status 누락 또는 허용값(ACTIVE / SUSPENDED / BANNED) 외"),
            @ApiResponse(responseCode = "403", description = "ROLE_ADMIN 권한 없음")
    })
    ResponseEntity<?> updateStatus(@Parameter(description = "회원 PK") Long id, Map<String, String> body);
}
