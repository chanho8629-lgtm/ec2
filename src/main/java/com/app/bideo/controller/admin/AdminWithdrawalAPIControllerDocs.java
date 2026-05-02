package com.app.bideo.controller.admin;

import com.app.bideo.dto.admin.AdminSearchDTO;
import com.app.bideo.dto.admin.AdminWithdrawalDetailResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;

import java.util.Map;

@Tag(name = "Admin - Withdrawal", description = "출금 요청 관리 (목록·상세·승인·반려)")
public interface AdminWithdrawalAPIControllerDocs {

    @Operation(summary = "출금 요청 목록 조회")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "ROLE_ADMIN 권한 없음")
    })
    Map<String, Object> list(AdminSearchDTO searchDTO);

    @Operation(summary = "출금 요청 상세 조회")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "400", description = "출금 요청이 존재하지 않음"),
            @ApiResponse(responseCode = "403", description = "ROLE_ADMIN 권한 없음")
    })
    AdminWithdrawalDetailResponseDTO detail(@Parameter(description = "출금 요청 PK") Long id);

    @Operation(summary = "출금 승인",
            description = "PENDING 상태에서만 가능. 그 외 상태는 400 + { error: ... } 응답.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "승인 완료"),
            @ApiResponse(responseCode = "400", description = "관리자 인증 누락 또는 도메인 검증 실패 (`{ error: \"...\" }`)"),
            @ApiResponse(responseCode = "403", description = "ROLE_ADMIN 권한 없음")
    })
    ResponseEntity<?> approve(@Parameter(description = "출금 요청 PK") Long id);

    @Operation(summary = "출금 반려",
            description = "PENDING 상태에서만 가능. reason 누락 시 400 + 안내 메시지.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "반려 완료"),
            @ApiResponse(responseCode = "400", description = "reason 누락 / 관리자 인증 누락 / 도메인 검증 실패"),
            @ApiResponse(responseCode = "403", description = "ROLE_ADMIN 권한 없음")
    })
    ResponseEntity<?> reject(@Parameter(description = "출금 요청 PK") Long id, Map<String, String> body);
}
