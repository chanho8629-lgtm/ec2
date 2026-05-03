package com.app.bideo.controller.admin;

import com.app.bideo.dto.admin.AdminPaymentDetailResponseDTO;
import com.app.bideo.dto.admin.AdminSearchDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.Map;

@Tag(name = "Admin - Payment", description = "결제 내역 관리 (목록·상세 조회)")
public interface AdminPaymentAPIControllerDocs {

    @Operation(summary = "결제 목록 조회")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "ROLE_ADMIN 권한 없음")
    })
    Map<String, Object> list(AdminSearchDTO searchDTO);

    @Operation(summary = "결제 상세 조회")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "400", description = "결제 내역이 존재하지 않음"),
            @ApiResponse(responseCode = "403", description = "ROLE_ADMIN 권한 없음")
    })
    AdminPaymentDetailResponseDTO detail(@Parameter(description = "결제 PK") Long id);
}
