package com.app.bideo.controller.admin;

import com.app.bideo.dto.admin.AdminRestrictionResponseDTO;
import com.app.bideo.dto.admin.AdminRestrictionSearchDTO;
import com.app.bideo.dto.admin.AdminRestrictionUpsertRequestDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

@Tag(name = "Admin - Restriction", description = "회원 제재 라이프사이클 (생성·수정·해제)")
public interface AdminRestrictionAPIControllerDocs {

    @Operation(summary = "제재 목록 조회",
            description = "기본 status=ACTIVE. 현재 List<...> 직접 반환.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "ROLE_ADMIN 권한 없음")
    })
    List<AdminRestrictionResponseDTO> list(AdminRestrictionSearchDTO searchDTO);

    @Operation(summary = "제재 단일 조회")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "400", description = "제재 row가 존재하지 않음"),
            @ApiResponse(responseCode = "403", description = "ROLE_ADMIN 권한 없음")
    })
    AdminRestrictionResponseDTO detail(@Parameter(description = "제재 PK") Long id);

    @Operation(summary = "회원의 활성 제재 조회",
            description = "회원에게 active 상태인 제재가 있으면 200, 없으면 204.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "활성 제재 존재"),
            @ApiResponse(responseCode = "204", description = "활성 제재 없음"),
            @ApiResponse(responseCode = "403", description = "ROLE_ADMIN 권한 없음")
    })
    ResponseEntity<AdminRestrictionResponseDTO> activeByMember(@Parameter(description = "회원 PK") Long memberId);

    @Operation(summary = "제재 생성",
            description = "LIMIT(기간 제한) / BLOCK(영구 차단). LIMIT은 endDatetime 필수, BLOCK은 endDatetime이 무시되어 null 저장. 부수 효과: 회원 상태가 SUSPENDED(LIMIT) 또는 BANNED(BLOCK)로 전이.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "{ \"id\": <newRestrictionId> }"),
            @ApiResponse(responseCode = "400", description = "필수값 누락, 허용값 외 restrictionType, 또는 회원에 이미 활성 제재 존재"),
            @ApiResponse(responseCode = "403", description = "ROLE_ADMIN 권한 없음")
    })
    ResponseEntity<Map<String, Long>> create(AdminRestrictionUpsertRequestDTO requestDTO);

    @Operation(summary = "제재 수정",
            description = "ACTIVE 상태에서만 가능. memberId / restrictionType은 기존 값 강제 유지, reason / endDatetime만 적용.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "수정 완료"),
            @ApiResponse(responseCode = "400", description = "비활성 제재 수정 시도 또는 입력 검증 실패"),
            @ApiResponse(responseCode = "403", description = "ROLE_ADMIN 권한 없음")
    })
    ResponseEntity<Void> update(@Parameter(description = "제재 PK") Long id, AdminRestrictionUpsertRequestDTO requestDTO);

    @Operation(summary = "제재 해제",
            description = "ACTIVE 상태에서만 가능. 회원 상태가 previousMemberStatus로 복원.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "해제 완료"),
            @ApiResponse(responseCode = "400", description = "비활성 제재 해제 시도"),
            @ApiResponse(responseCode = "403", description = "ROLE_ADMIN 권한 없음")
    })
    ResponseEntity<Void> release(@Parameter(description = "제재 PK") Long id);
}
