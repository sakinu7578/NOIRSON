//接 HTTP Request，決定要回什麼 Response。
package com.noirson.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

//讓Spring知道這個Class負責處理HTTP Request的Controller
@RestController
public class HomeController {

    //有人用GET訪問 / ，就執行下面的home()
    @GetMapping("/")
    public String home(){
        //HTTP Response的內容
        return "NOIRSON backend is running.";
    }
}
