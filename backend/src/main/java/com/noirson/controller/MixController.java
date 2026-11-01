package com.noirson.controller;

import com.noirson.entity.Mix;
import com.noirson.service.MixService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class MixController {
    // Controller 只接收請求並委派 Service 查詢資料。
    private final MixService mixService;

    public MixController(MixService mixService) {
        this.mixService = mixService;
    }

    @GetMapping("/api/mixes")
    public Mix getMix() {
        // 目前 API 固定回傳主鍵 1 的單筆 Mix。
        return mixService.getMix();
    }
}
