package com.app.bideo.repository.member;

import com.app.bideo.mapper.member.BlockMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

@Repository
@RequiredArgsConstructor
public class BlockDAO {

    private final BlockMapper blockMapper;

    public boolean exists(Long blockerId, Long blockedId) {
        return blockMapper.existsBlock(blockerId, blockedId);
    }

    public void save(Long blockerId, Long blockedId) {
        blockMapper.insertBlock(blockerId, blockedId);
    }
}
