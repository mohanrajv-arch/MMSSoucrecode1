package com.esfita.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.esfita.entity.MstLocationMenuHib;

public interface MstLocationMenuRepository extends JpaRepository<MstLocationMenuHib, Integer> {

	@Query("select m from MstLocationMenuHib m where m.msStatus = 'A'")
	List<MstLocationMenuHib> byStatusActive();

}