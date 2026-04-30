package com.app.bideo.service.common;

import com.app.bideo.dto.message.MessageRoomCreateRequestDTO;
import com.app.bideo.dto.message.MessageResponseDTO;
import com.app.bideo.repository.member.MemberRepository;
import com.app.bideo.service.message.MessageService;
import com.app.bideo.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.LinkedHashSet;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(rollbackFor = Exception.class)
public class ShareService {

    private final MemberRepository memberRepository;
    private final MessageService messageService;
    private final NotificationService notificationService;

    /*
     * 사용 방법
     * 1. title 준비
     * 2. fallbackPath 준비
     * 3. shareUrl, receiverIds, extraMessage 준비
     * 4. shareToMembers() 호출
     *
     * 프로필 예시
     * shareToMembers(
     *     currentMemberId,
     *     receiverIds,
     *     nickname + "님의 프로필을 공유했습니다.",
     *     "/profile/" + nickname,
     *     requestDTO.getShareUrl(),
     *     requestDTO.getMessage()
     * );
     *
     * 다른 공유도 주소만 바뀌고 흐름은 동일
     * - 작품: "/work/detail/" + workId
     * - 예술관: "/gallery/" + galleryId
     */

    // 공유 링크 정리
    public String normalizeShareUrl(String fallbackPath, String shareUrl) {
        if (shareUrl == null || shareUrl.isBlank()) {
            return fallbackPath;
        }

        String normalized = shareUrl.trim();
        if (normalized.startsWith("http://") || normalized.startsWith("https://")) {
            return normalized;
        }
        if (normalized.startsWith("/")) {
            return normalized;
        }
        return fallbackPath;
    }

    // 공유 메시지 생성
    public String buildShareMessage(String title, String shareUrl, String extraMessage) {
        StringBuilder builder = new StringBuilder()
                .append(title)
                .append("\n")
                .append(shareUrl);

        if (extraMessage != null && !extraMessage.isBlank()) {
            builder.append("\n\n").append(extraMessage.trim());
        }

        return builder.toString();
    }

    // 공유 모듈 실행
    public void shareToMembers(Long senderId,
                               List<Long> receiverIds,
                               String title,
                               String fallbackPath,
                               String shareUrl,
                               String extraMessage) {
        String normalizedShareUrl = normalizeShareUrl(fallbackPath, shareUrl);
        String content = buildShareMessage(title, normalizedShareUrl, extraMessage);
        sendShareMessage(senderId, receiverIds, content);
    }

    // 공유 메시지 전송
    public void sendShareMessage(Long senderId, List<Long> receiverIds, String content) {
        List<Long> safeReceiverIds = receiverIds == null
                ? List.of()
                : new java.util.ArrayList<>(new LinkedHashSet<>(receiverIds));

        if (safeReceiverIds.isEmpty()) {
            throw new IllegalArgumentException("공유할 대상을 선택해 주세요.");
        }

        for (Long receiverId : safeReceiverIds) {
            if (receiverId == null) {
                continue;
            }
            if (receiverId.equals(senderId)) {
                throw new IllegalArgumentException("자기 자신에게는 공유할 수 없습니다.");
            }

            memberRepository.findById(receiverId)
                    .orElseThrow(() -> new IllegalArgumentException("공유 대상을 찾을 수 없습니다."));

            Long roomId = messageService.createOrGetRoom(senderId,
                    MessageRoomCreateRequestDTO.builder()
                            .memberIds(List.of(receiverId))
                            .build())
                    .getId();

            MessageResponseDTO sentMessage = messageService.sendMessage(roomId, senderId, content, null);
            notificationService.createNotification(
                    receiverId,
                    senderId,
                    "SHARE",
                    "MESSAGE",
                    sentMessage.getId(),
                    "공유하기 메시지를 받았습니다."
            );
        }
    }
}
