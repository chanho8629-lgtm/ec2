package com.app.bideo.service.member;

import com.app.bideo.dto.member.FollowResponseDTO;
import com.app.bideo.repository.member.FollowDAO;
import com.app.bideo.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class FollowService {

    private final FollowDAO followDAO;
    private final NotificationService notificationService;

    private static final int PAGE_SIZE = 20;

    public Map<String, Object> toggleFollow(Long followerId, Long followingId) {
        if (followerId.equals(followingId)) {
            throw new IllegalArgumentException("자기 자신을 팔로우할 수 없습니다.");
        }

        boolean exists = followDAO.exists(followerId, followingId);
        if (exists) {
            followDAO.delete(followerId, followingId);
            followDAO.decreaseFollowerCount(followingId);
            followDAO.decreaseFollowingCount(followerId);
        } else {
            followDAO.save(followerId, followingId);
            followDAO.increaseFollowerCount(followingId);
            followDAO.increaseFollowingCount(followerId);

            notificationService.createNotification(
                    followingId, followerId, "FOLLOW", "MEMBER", followerId,
                    "회원님을 팔로우하기 시작했습니다."
            );
        }

        return Map.of("followed", !exists);
    }

    @Transactional(readOnly = true)
    public List<FollowResponseDTO> getFollowers(Long memberId, Long currentMemberId, int page) {
        return followDAO.findFollowers(memberId, currentMemberId, page * PAGE_SIZE, PAGE_SIZE);
    }

    @Transactional(readOnly = true)
    public List<FollowResponseDTO> getFollowings(Long memberId, Long currentMemberId, int page) {
        return followDAO.findFollowings(memberId, currentMemberId, page * PAGE_SIZE, PAGE_SIZE);
    }

    @Transactional(readOnly = true)
    public boolean isFollowing(Long followerId, Long followingId) {
        return followDAO.exists(followerId, followingId);
    }
}
