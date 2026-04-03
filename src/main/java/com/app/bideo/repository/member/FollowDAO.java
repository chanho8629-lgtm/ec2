package com.app.bideo.repository.member;

import com.app.bideo.dto.member.FollowResponseDTO;
import com.app.bideo.mapper.member.FollowMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class FollowDAO {

    private final FollowMapper followMapper;

    public boolean exists(Long followerId, Long followingId) {
        return followMapper.existsFollow(followerId, followingId);
    }

    public void save(Long followerId, Long followingId) {
        followMapper.insertFollow(followerId, followingId);
    }

    public void delete(Long followerId, Long followingId) {
        followMapper.deleteFollow(followerId, followingId);
    }

    public List<FollowResponseDTO> findFollowers(Long memberId, Long currentMemberId, int offset, int limit) {
        return followMapper.selectFollowers(memberId, currentMemberId, offset, limit);
    }

    public List<FollowResponseDTO> findFollowings(Long memberId, Long currentMemberId, int offset, int limit) {
        return followMapper.selectFollowings(memberId, currentMemberId, offset, limit);
    }

    public void increaseFollowerCount(Long memberId) {
        followMapper.increaseFollowerCount(memberId);
    }

    public void decreaseFollowerCount(Long memberId) {
        followMapper.decreaseFollowerCount(memberId);
    }

    public void increaseFollowingCount(Long memberId) {
        followMapper.increaseFollowingCount(memberId);
    }

    public void decreaseFollowingCount(Long memberId) {
        followMapper.decreaseFollowingCount(memberId);
    }
}
