package com.app.bideo.mapper.contest;

import com.app.bideo.dto.common.TagResponseDTO;
import com.app.bideo.dto.contest.ContestDetailResponseDTO;
import com.app.bideo.dto.contest.ContestCreateRequestDTO;
import com.app.bideo.dto.contest.ContestEntryResponseDTO;
import com.app.bideo.dto.contest.ContestListResponseDTO;
import com.app.bideo.dto.contest.ContestSearchDTO;
import com.app.bideo.dto.contest.ContestEntryRequestDTO;
import com.app.bideo.dto.contest.ContestWorkOptionDTO;
import com.app.bideo.dto.contest.ContestUpdateRequestDTO;
import com.app.bideo.dto.contest.ContestWinnerNotificationDTO;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;

import java.util.List;

@Mapper
public interface ContestMapper {

    List<ContestListResponseDTO> selectContestList(ContestSearchDTO searchDTO);

    int selectContestCount(ContestSearchDTO searchDTO);

    ContestDetailResponseDTO selectContestDetail(@Param("id") Long id, @Param("memberId") Long memberId);

    List<ContestEntryResponseDTO> selectContestEntryList(@Param("contestId") Long contestId);

    void insertContest(@Param("memberId") Long memberId, @Param("contest") ContestCreateRequestDTO contest);

    List<ContestListResponseDTO> selectHostedContestList(@Param("memberId") Long memberId);

    List<ContestListResponseDTO> selectParticipatedContestList(@Param("memberId") Long memberId);

    boolean existsContest(@Param("contestId") Long contestId);

    Long selectContestOwnerId(@Param("contestId") Long contestId);

    boolean existsOwnedWork(@Param("memberId") Long memberId, @Param("workId") Long workId);

    boolean existsContestEntry(@Param("contestId") Long contestId, @Param("workId") Long workId);

    boolean existsContestEntryById(@Param("contestId") Long contestId, @Param("entryId") Long entryId);

    void insertContestEntry(@Param("memberId") Long memberId, @Param("entry") ContestEntryRequestDTO entry);

    void increaseContestEntryCount(@Param("contestId") Long contestId);

    void clearContestWinner(@Param("contestId") Long contestId);

    int updateContestWinner(@Param("contestId") Long contestId,
                            @Param("entryId") Long entryId,
                            @Param("awardRank") String awardRank);

    List<ContestWorkOptionDTO> selectEntryWorkOptions(@Param("memberId") Long memberId);

    int updateContest(@Param("contestId") Long contestId,
                      @Param("memberId") Long memberId,
                      @Param("contest") ContestUpdateRequestDTO contest);

    List<TagResponseDTO> selectContestTagsByContestId(@Param("contestId") Long contestId);

    void insertContestTag(@Param("contestId") Long contestId, @Param("tagId") Long tagId);

    Long findOrCreateTag(@Param("tagName") String tagName);

    void deleteContestTagsByContestId(@Param("contestId") Long contestId);

    List<ContestWinnerNotificationDTO> selectPendingWinnerNotifications(@Param("todayEpochDay") long todayEpochDay);

    void markWinnerNotificationSent(@Param("contestId") Long contestId);
}
