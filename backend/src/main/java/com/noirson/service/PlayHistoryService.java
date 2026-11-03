package com.noirson.service;

import java.util.List;

import com.noirson.repository.MixRepository;
import com.noirson.repository.PlayHistoryRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class PlayHistoryService {
    private final PlayHistoryRepository playHistoryRepository;
    private final MixRepository mixRepository;

    public PlayHistoryService(PlayHistoryRepository playHistoryRepository, MixRepository mixRepository) {
        this.playHistoryRepository = playHistoryRepository;
        this.mixRepository = mixRepository;
    }

    @Transactional(readOnly = true)
    public List<String> listRecentMixCodes(Long memberId) {
        return playHistoryRepository.findRecentMixCodes(memberId, PageRequest.of(0, 10));
    }

    // false 表示 Mix code 不存在；memberId 僅來自後端驗證過的 Session。
    @Transactional
    public boolean recordPlay(Long memberId, String code) {
        return mixRepository.findByCode(code)
                .map(mix -> {
                    playHistoryRepository.recordPlay(memberId, mix.getId());
                    return true;
                })
                .orElse(false);
    }
}
