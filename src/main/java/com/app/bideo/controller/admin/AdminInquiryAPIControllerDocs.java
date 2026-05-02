package com.app.bideo.controller.admin;

import com.app.bideo.dto.admin.InquiryResponseDTO;
import com.app.bideo.dto.admin.InquirySearchDTO;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;

import java.util.List;
import java.util.Map;

@Tag(name = "Admin - Inquiry", description = "1:1 문의 관리 (목록·상세·답변)")
public interface AdminInquiryAPIControllerDocs {

    @Operation(summary = "문의 목록 조회",
            description = "현재는 List<...> 직접 반환. 향후 { content, totalElements } 형태로 통일 예정.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "403", description = "ROLE_ADMIN 권한 없음")
    })
    List<InquiryResponseDTO> list(InquirySearchDTO searchDTO);

    @Operation(summary = "문의 상세 조회")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "조회 성공"),
            @ApiResponse(responseCode = "400", description = "문의가 존재하지 않음"),
            @ApiResponse(responseCode = "403", description = "ROLE_ADMIN 권한 없음")
    })
    InquiryResponseDTO detail(@Parameter(description = "문의 PK") Long id);

    @Operation(summary = "문의 답변",
            description = "reply 본문 필수. 누락 시 400.")
    @ApiResponses({
            @ApiResponse(responseCode = "200", description = "답변 등록 완료"),
            @ApiResponse(responseCode = "400", description = "reply 누락 또는 공백"),
            @ApiResponse(responseCode = "403", description = "ROLE_ADMIN 권한 없음")
    })
    ResponseEntity<Void> reply(@Parameter(description = "문의 PK") Long id, Map<String, String> body);
}
