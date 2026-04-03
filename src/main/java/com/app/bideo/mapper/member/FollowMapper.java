package com.app.bideo.mapper.member;

import com.app.bideo.dto.member.FollowResponseDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface FollowMapper {
    boolean existsFollow(@Param("followerId") Long followerId,
                         @Param("followingId") Long followingId);

    void insertFollow(@Param("followerId") Long followerId,
                      @Param("followingId") Long followingId);

    void deleteFollow(@Param("followerId") Long followerId,
                      @Param("followingId") Long followingId);

    List<FollowResponseDTO> selectFollowers(@Param("memberId") Long memberId,
                                            @Param("currentMemberId") Long currentMemberId,
                                            @Param("offset") int offset,
                                            @Param("limit") int limit);

    List<FollowResponseDTO> selectFollowings(@Param("memberId") Long memberId,
                                             @Param("currentMemberId") Long currentMemberId,
                                             @Param("offset") int offset,
                                             @Param("limit") int limit);

    void increaseFollowerCount(@Param("memberId") Long memberId);

    void decreaseFollowerCount(@Param("memberId") Long memberId);

    void increaseFollowingCount(@Param("memberId") Long memberId);

    void decreaseFollowingCount(@Param("memberId") Long memberId);
}
