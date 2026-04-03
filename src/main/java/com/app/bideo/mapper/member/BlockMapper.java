package com.app.bideo.mapper.member;

import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

@Mapper
public interface BlockMapper {
    boolean existsBlock(@Param("blockerId") Long blockerId,
                        @Param("blockedId") Long blockedId);

    void insertBlock(@Param("blockerId") Long blockerId,
                     @Param("blockedId") Long blockedId);
}
