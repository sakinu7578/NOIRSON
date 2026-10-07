package com.noirson.controller;

import com.noirson.entity.Mix;
import com.noirson.service.MixService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;


@RestController
public class MixController {
//  private(權限)這個變數給MixController自己使用，外面的Class不能隨意使用
//  final(限制)這個變數設定好後，不允許再指向另一個MixService
//  新建名為mixService的變數裡面要放MixService的物件 (型別/變數名稱)
//  MixController 有一個自己使用的 mixService，型別是 MixService，而且設定完成後不准換掉。
    private final MixService mixService;

//  Constructor（建構子）
    public MixController(MixService mixService) {
        //把外面傳進來的 mixService(=後面的)，存進這個MixController自己的mixService
        //this.mixService >>這個物件自己的成員變數
        //mixService >>這個 Constructor 收到的參數
        this.mixService = mixService;
    }

    @GetMapping("/api/mixes")
    public Mix getMix() {
        //到MixService.class 物件裡呼叫它的 getMix()方法
        return mixService.getMix();
    }
}
