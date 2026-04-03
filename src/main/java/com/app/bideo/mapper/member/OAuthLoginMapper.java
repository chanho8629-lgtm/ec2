package com.app.bideo.mapper.member;

import com.app.bideo.common.enumeration.OAuthProvider;
import com.app.bideo.domain.member.OAuthLoginVO;
import org.apache.ibatis.annotations.Mapper;

import java.util.Optional;

@Mapper
public interface OAuthLoginMapper {
    void insert(OAuthLoginVO oAuthLoginVO);

    Optional<OAuthLoginVO> selectByProviderAndProviderId(OAuthProvider provider, String providerId);

    Optional<OAuthLoginVO> selectByMemberIdAndProvider(Long memberId, OAuthProvider provider);
}
