//負責處理：商業邏輯
//判斷
//使用者是否存在? Mix存在? 是否已收藏?
package com.noirson.service;

import com.noirson.entity.Mix;
import com.noirson.repository.MixRepository;
import org.springframework.stereotype.Service;


//Service告知Spring這個Class是Service層元件，交給Spring管理
@Service
public class MixService {

    private final MixRepository mixRepository;

    //建構子注入
    public MixService(MixRepository mixRepository) {
        this.mixRepository = mixRepository;
    }

    public Mix getMix() {
        //去 mix table 找 Primary Key id=1 的資料，找不到回傳null
        return mixRepository.findById(1L).orElse(null);
    }
}