package com.app.bideo.mapper.member;

import com.app.bideo.dto.member.BlockResponseDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface BlockMapper {
    // 차단 여부 조회
    boolean existsBlock(@Param("blockerId") Long blockerId,
                        @Param("blockedId") Long blockedId);

    // 차단 등록
    void insertBlock(@Param("blockerId") Long blockerId,
                     @Param("blockedId") Long blockedId);

    // 차단 해제
    void deleteBlock(@Param("blockerId") Long blockerId,
                     @Param("blockedId") Long blockedId);

    // 차단 목록 조회
    List<BlockResponseDTO> selectBlockedMembers(@Param("blockerId") Long blockerId,
                                                @Param("offset") int offset,
                                                @Param("limit") int limit);
}
