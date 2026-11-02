package com.noirson.entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Column;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

//告訴JPA這個Class是需要被資料庫持久化管理的Entity
@Entity
@Table(name = "mix")
public class Mix {

    //指定Entity的主鍵@Id(PRIMARY KEY) --> Java和SQL的對應
    @Id
    //讓MySQL自動產生id
    //@GeneratedValue=>主鍵由系統產生
    //GenerationType.IDENTITY=>使用資料庫的自增機制
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "code", nullable = false, unique = true, length = 10)
    private String code;

    private String title;
    private String genre;

    //無參數Constructor (JPA 的Entity所需)
    public Mix() {
    }

    public Mix(Long id, String code, String title, String genre) {
        this.id = id;
        this.code = code;
        this.title = title;
        this.genre = genre;
    }

    //產生Getter，讓外部可取得物件id,title,genre...
    public Long getId() {
        return id;
    }

    public String getCode() {
        return code;
    }

    public String getTitle() {
        return title;
    }

    public String getGenre() {
        return genre;
    }
}
