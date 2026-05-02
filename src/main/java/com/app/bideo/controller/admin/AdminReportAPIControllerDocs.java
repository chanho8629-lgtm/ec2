package com.app.bideo.controller.admin;

import com.app.bideo.dto.admin.ReportResponseDTO;
import com.app.bideo.dto.admin.ReportSearchDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;

import java.util.Map;

@Tag(name = "Admin - Report", description = "신고 관리 (목록·상세·상태 변경)")
public interface AdminReportAPIControllerDocs {

    @Operation(summary = "신고 목록 조회")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "ROLE_ADMIN 권한 없음")
    })
    Map<String, Object> list(ReportSearchDTO searchDTO);

    @Operation(summary = "신고 상세 조회")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "400", description = "신고 건이 존재하지 않음"),
            @ApiResponse(responseCode = "403", description = "ROLE_ADMIN 권한 없음")
    })
    ReportResponseDTO detail(@Parameter(description = "신고 PK") Long id);

    @Operation(summary = "신고 상태 변경",
            description = "허용값: PENDING / REVIEWING / RESOLVED / CANCELLED. memo는 선택.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "변경 완료"),
            @ApiResponse(responseCode = "400", description = "status 누락 또는 허용값 외"),
            @ApiResponse(responseCode = "403", description = "ROLE_ADMIN 권한 없음")
    })
    ResponseEntity<Void> updateStatus(@Parameter(description = "신고 PK") Long id, Map<String, String> body);
}
