package com.noirson.controller;

import java.util.List;

import com.noirson.entity.Mix;
import com.noirson.service.MixService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class MixController {
    // Controller 只接收請求並委派 Service 查詢資料。
    private final MixService mixService;

    public MixController(MixService mixService) {
        this.mixService = mixService;
    }

    @GetMapping("/api/mixes")
    public List<Mix> getMixes() {
        return mixService.getMixes();
    }

    @GetMapping("/api/mixes/{code}")
    public ResponseEntity<Mix> getMixByCode(@PathVariable String code) {
        return mixService.getMixByCode(code)
                .map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
