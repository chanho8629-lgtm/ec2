package com.app.bideo.repository.message;

import com.app.bideo.domain.message.MessageRoomVO;
import com.app.bideo.dto.member.MemberListResponseDTO;
import com.app.bideo.dto.message.MessageRoomResponseDTO;
import com.app.bideo.mapper.message.MessageRoomMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
@RequiredArgsConstructor
public class MessageRoomDAO {

    private final MessageRoomMapper messageRoomMapper;

    public void createRoom(MessageRoomVO roomVO) {
        messageRoomMapper.insertRoom(roomVO);
    }

    public void addMember(Long messageRoomId, Long memberId) {
        messageRoomMapper.insertRoomMember(messageRoomId, memberId);
    }

    public Long findExistingRoomId(Long memberId1, Long memberId2) {
        return messageRoomMapper.selectExistingRoomId(memberId1, memberId2);
    }

    public List<MessageRoomResponseDTO> findRoomsByMemberId(Long memberId) {
        return messageRoomMapper.selectRoomsByMemberId(memberId);
    }

    public List<MemberListResponseDTO> findRoomMembers(Long roomId, Long excludeMemberId) {
        return messageRoomMapper.selectRoomMembers(roomId, excludeMemberId);
    }

    public List<Long> findRoomMemberIds(Long roomId) {
        return messageRoomMapper.selectRoomMemberIds(roomId);
    }

    public boolean isMember(Long roomId, Long memberId) {
        return messageRoomMapper.existsRoomMember(roomId, memberId);
    }

    public void updateTimestamp(Long roomId) {
        messageRoomMapper.updateRoomDatetime(roomId);
    }
}
