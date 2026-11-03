package com.noirson.service;

import java.util.List;
import java.util.Optional;

import com.noirson.entity.Favorite;
import com.noirson.entity.Member;
import com.noirson.entity.Mix;
import com.noirson.repository.FavoriteRepository;
import com.noirson.repository.MixRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;

@Service
public class FavoriteService {
    private final FavoriteRepository favoriteRepository;
    private final MixRepository mixRepository;

    public FavoriteService(FavoriteRepository favoriteRepository, MixRepository mixRepository) {
        this.favoriteRepository = favoriteRepository;
        this.mixRepository = mixRepository;
    }

    public List<String> listMixCodes(Long memberId) {
        return favoriteRepository.findMixCodesByMemberId(memberId);
    }

    // Optional.empty 表示 Mix 不存在；true 表示本次新增。
    public Optional<Boolean> add(Member member, String code) {
        Optional<Mix> foundMix = mixRepository.findByCode(code);
        if (foundMix.isEmpty()) return Optional.empty();
        Mix mix = foundMix.get();
        if (favoriteRepository.existsByMember_IdAndMix_Id(member.getId(), mix.getId())) {
            return Optional.of(false);
        }
        try {
            // 立即執行 INSERT，讓資料庫唯一約束處理同時送出的收藏。
            favoriteRepository.saveAndFlush(new Favorite(member, mix));
            return Optional.of(true);
        } catch (DataIntegrityViolationException exception) {
            // 只把已存在的同一組收藏視為冪等；其他完整性錯誤仍向上回報。
            if (favoriteRepository.existsByMember_IdAndMix_Id(member.getId(), mix.getId())) {
                return Optional.of(false);
            }
            throw exception;
        }
    }

    public boolean remove(Long memberId, String code) {
        Optional<Mix> foundMix = mixRepository.findByCode(code);
        if (foundMix.isEmpty()) return false;
        favoriteRepository.findByMember_IdAndMix_Id(memberId, foundMix.get().getId())
                .ifPresent(favoriteRepository::delete);
        return true;
    }
}
