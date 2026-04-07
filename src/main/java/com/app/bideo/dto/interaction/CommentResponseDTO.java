package com.app.bideo.dto.interaction;

import lombok.*;
import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentResponseDTO {
    private Long id;
    private Long memberId;
    private String memberNickname;
    private String memberProfileImage;
    private String targetType;
    private Long targetId;
    private Long parentId;
    private String content;
    private Boolean isPinned;
    private Integer likeCount;
    private Boolean isLiked;
    private Boolean isOwner;
    private List<CommentResponseDTO> replies;
    private LocalDateTime createdDatetime;
    private LocalDateTime updatedDatetime;
}
