package esfita.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import esfita.entity.FinalSetMenuMHib;

@Repository
public interface FinalSetMenuMRepository extends JpaRepository<FinalSetMenuMHib, Integer> {

	@Query("SELECT m FROM FinalSetMenuMHib m " + "WHERE (:mealTypeFk IS NULL OR m.mealTypeFk = :mealTypeFk) "
			+ "AND (:approvalStatus IS NULL OR m.approvalStatus = :approvalStatus) "
			+ "ORDER BY m.status ASC, m.approvalStatus ASC, m.id DESC")
	List<FinalSetMenuMHib> findMByMealTypeAndApprovalStatus(@Param("mealTypeFk") Integer mealTypeFk,
			@Param("approvalStatus") Integer approvalStatus);

	@Query(value = "SELECT " + "COUNT(*) AS totalMenu, " + "COUNT(*) FILTER (WHERE status = 'A') AS activeMenu, "
			+ "COUNT(*) FILTER (WHERE approval_status = 1) AS pendingApproval, " + "AVG(total) AS averageCost "
			+ "FROM dbo.final_set_menu_m", nativeQuery = true)
	List<Object[]> getMenuSummary();

	@Query("SELECT i FROM FinalSetMenuMHib i WHERE i.status = 'A' AND i.approvalStatus = 0 ORDER BY i.name ASC")
	List<FinalSetMenuMHib> orderBy();

	@Query("SELECT i FROM FinalSetMenuMHib i WHERE i.id = :id")
	FinalSetMenuMHib findById(@Param("id") int id);

}
