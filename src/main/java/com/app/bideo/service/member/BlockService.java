package com.app.bideo.service.member;

import com.app.bideo.dto.member.BlockResponseDTO;
import com.app.bideo.repository.member.BlockDAO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class BlockService {

    private final BlockDAO blockDAO;

    // 차단 등록
    public Map<String, Object> block(Long blockerId, Long blockedId) {
        if (blockerId == null) {
            throw new IllegalArgumentException("로그인이 필요합니다.");
        }
        if (blockedId == null) {
            throw new IllegalArgumentException("차단 대상이 없습니다.");
        }
        if (blockerId.equals(blockedId)) {
            throw new IllegalArgumentException("자기 자신을 차단할 수 없습니다.");
        }

        boolean exists = blockDAO.exists(blockerId, blockedId);
        if (!exists) {
            blockDAO.save(blockerId, blockedId);
        }

        return Map.of(
                "blocked", true,
                "alreadyBlocked", exists
        );
    }

    // 차단 여부 조회
    @Transactional(readOnly = true)
    public boolean isBlocked(Long blockerId, Long blockedId) {
        if (blockerId == null || blockedId == null) {
            return false;
        }
        return blockDAO.exists(blockerId, blockedId);
    }

    // 차단 해제
    public Map<String, Object> unblock(Long blockerId, Long blockedId) {
        if (blockerId == null || blockedId == null) {
            throw new IllegalArgumentException("차단 해제 대상이 없습니다.");
        }

        blockDAO.delete(blockerId, blockedId);
        return Map.of("blocked", false);
    }

    // 차단 목록 조회
    @Transactional(readOnly = true)
    public List<BlockResponseDTO> getBlockedMembers(Long blockerId, int page) {
        int safePage = Math.max(page, 0);
        int size = 20;
        return blockDAO.findBlockedMembers(blockerId, safePage * size, size);
    }
}
