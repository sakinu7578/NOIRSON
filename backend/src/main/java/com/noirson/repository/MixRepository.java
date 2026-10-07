//MixRepository是 MixService用來存取Mix資料庫資料的入口。
package com.noirson.repository;

import com.noirson.entity.Mix;
import org.springframework.data.jpa.repository.JpaRepository;

public interface MixRepository extends JpaRepository<Mix, Long> {

}
