// Mix 資料查詢層。
package com.noirson.service;

import java.util.List;
import java.util.Optional;

import com.noirson.entity.Mix;
import com.noirson.repository.MixRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;


//Service告知Spring這個Class是Service層元件，交給Spring管理
@Service
public class MixService {

    private final MixRepository mixRepository;

    //建構子注入
    public MixService(MixRepository mixRepository) {
        this.mixRepository = mixRepository;
    }

    public List<Mix> getMixes() {
        return mixRepository.findAll(Sort.by("code").ascending());
    }

    public Optional<Mix> getMixByCode(String code) {
        return mixRepository.findByCode(code);
    }
}
