package com.app.bideo.controller.admin;

import com.app.bideo.dto.admin.AdminSearchDTO;
import com.app.bideo.dto.admin.AdminWorkDetailResponseDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;

import java.util.Map;

@Tag(name = "Admin - Work", description = "작품 관리 (목록·상세·상태 변경)")
public interface AdminWorkAPIControllerDocs {

    @Operation(summary = "작품 목록 조회")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "ROLE_ADMIN 권한 없음")
    })
    Map<String, Object> list(AdminSearchDTO searchDTO);

    @Operation(summary = "작품 상세 조회")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "400", description = "작품이 존재하지 않음"),
            @ApiResponse(responseCode = "403", description = "ROLE_ADMIN 권한 없음")
    })
    AdminWorkDetailResponseDTO detail(@Parameter(description = "작품 PK") Long id);

    @Operation(summary = "작품 상태 변경",
            description = "허용값: ACTIVE / HIDDEN. 그 외 값은 400.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "변경 완료"),
            @ApiResponse(responseCode = "400", description = "status 누락 또는 허용값 외"),
            @ApiResponse(responseCode = "403", description = "ROLE_ADMIN 권한 없음")
    })
    ResponseEntity<Void> updateStatus(@Parameter(description = "작품 PK") Long id, Map<String, String> body);
}
