package com.app.bideo.mapper.message;

import com.app.bideo.domain.message.MessageRoomVO;
import com.app.bideo.dto.member.MemberListResponseDTO;
import com.app.bideo.dto.message.MessageRoomResponseDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface MessageRoomMapper {
    void insertRoom(MessageRoomVO roomVO);

    void insertRoomMember(@Param("messageRoomId") Long messageRoomId,
                          @Param("memberId") Long memberId);

    Long selectExistingRoomId(@Param("memberId1") Long memberId1,
                              @Param("memberId2") Long memberId2);

    List<MessageRoomResponseDTO> selectRoomsByMemberId(@Param("memberId") Long memberId);

    List<MemberListResponseDTO> selectRoomMembers(@Param("roomId") Long roomId,
                                                   @Param("excludeMemberId") Long excludeMemberId);

    boolean existsRoomMember(@Param("roomId") Long roomId,
                             @Param("memberId") Long memberId);

    void updateRoomDatetime(@Param("roomId") Long roomId);
}
