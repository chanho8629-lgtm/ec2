package com.app.bideo.repository.member;

import com.app.bideo.dto.member.BlockResponseDTO;
import com.app.bideo.mapper.member.BlockMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class BlockDAO {

    private final BlockMapper blockMapper;

    // 차단 여부 조회
    public boolean exists(Long blockerId, Long blockedId) {
        return blockMapper.existsBlock(blockerId, blockedId);
    }

    // 차단 등록
    public void save(Long blockerId, Long blockedId) {
        blockMapper.insertBlock(blockerId, blockedId);
    }

    // 차단 해제
    public void delete(Long blockerId, Long blockedId) {
        blockMapper.deleteBlock(blockerId, blockedId);
    }

    // 차단 목록 조회
    public List<BlockResponseDTO> findBlockedMembers(Long blockerId, int offset, int limit) {
        return blockMapper.selectBlockedMembers(blockerId, offset, limit);
    }
}
