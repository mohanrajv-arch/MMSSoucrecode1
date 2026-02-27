package esfita.repositoy;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import esfita.entity.MstUserAuditTrail;

public interface MstUserAuditTrailRepository extends JpaRepository<MstUserAuditTrail, Integer> {
	@Query("SELECT m FROM MstUserAuditTrail m " + "WHERE m.createdDate BETWEEN :fromDate AND :toDate "
			+ "AND (:userType IS NULL OR m.userType = :userType) " + "ORDER BY m.id DESC")
	List<MstUserAuditTrail> byFromDateAndToDate(@Param("fromDate") Date fromDate, @Param("toDate") Date toDate,
			@Param("userType") Integer userType);
//	@Query(value = "SELECT * FROM dbo.mst_user_audit_trail m " + "WHERE m.muat_crt_date >= :fromDate "
//			+ "AND m.muat_crt_date < (CAST(:toDate AS timestamp) + INTERVAL '1 day') "
//			+ "AND (COALESCE(:userType, m.muat_user_type) = m.muat_user_type) "
//			+ "ORDER BY m.muat_user_audit_trail_pk DESC", nativeQuery = true)
//	List<MstUserAuditTrail> byFromDateAndToDate(@Param("fromDate") Date fromDate, @Param("toDate") Date toDate,
//			@Param("userType") Integer userType);

}