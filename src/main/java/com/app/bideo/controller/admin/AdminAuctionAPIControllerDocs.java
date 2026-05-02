package com.app.bideo.controller.admin;

import com.app.bideo.dto.admin.AdminAuctionDetailResponseDTO;
import com.app.bideo.dto.admin.AdminSearchDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;

import java.util.Map;

@Tag(name = "Admin - Auction", description = "경매 관리 (목록·상세 조회)")
public interface AdminAuctionAPIControllerDocs {

    @Operation(summary = "경매 목록 조회")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "ROLE_ADMIN 권한 없음")
    })
    Map<String, Object> list(AdminSearchDTO searchDTO);

    @Operation(summary = "경매 상세 조회",
            description = "종료된 경매(CLOSED / SOLD)만 상세 조회 결과를 반환한다.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "400", description = "경매가 존재하지 않음"),
            @ApiResponse(responseCode = "403", description = "ROLE_ADMIN 권한 없음")
    })
    AdminAuctionDetailResponseDTO detail(@Parameter(description = "경매 PK") Long id);
}
