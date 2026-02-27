package com.esfita.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.esfita.entity.MstUserAuditTrail;

public interface MstUserAuditTrailRepository extends JpaRepository<MstUserAuditTrail, Integer> {

	@Query("SELECT m FROM MstUserAuditTrail m WHERE m.createdDate BETWEEN :fromDate AND :toDate AND m.userType = 1 ORDER BY m.id DESC")
	List<MstUserAuditTrail> byFromDateAndToDate(@Param("fromDate") Date fromDate, @Param("toDate") Date toDate);

}