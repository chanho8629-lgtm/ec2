package com.app.bideo.service.admin;

import com.app.bideo.domain.admin.ReportVO;
import com.app.bideo.dto.admin.ReportCreateRequestDTO;
import com.app.bideo.repository.admin.ReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Locale;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class ReportService {

    private final ReportRepository reportRepository;

    public Map<String, Object> create(Long reporterId, ReportCreateRequestDTO requestDTO) {
        if (reporterId == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }
        if (requestDTO == null || requestDTO.getTargetId() == null) {
            throw new IllegalArgumentException("신고 대상이 없습니다.");
        }

        String targetType = normalize(requestDTO.getTargetType());
        String reason = requestDTO.getReason() != null ? requestDTO.getReason().getValue() : "";

        reportRepository.save(
                ReportVO.builder()
                        .reporterId(reporterId)
                        .targetType(targetType)
                        .targetId(requestDTO.getTargetId())
                        .reason(reason)
                        .detail(requestDTO.getDetail())
                        .status("PENDING")
                        .build()
        );

        return Map.of(
                "reported", true,
                "targetType", targetType,
                "targetId", requestDTO.getTargetId()
        );
    }

    private String normalize(String value) {
        return value == null ? "" : value.trim().toUpperCase(Locale.ROOT);
    }
}
