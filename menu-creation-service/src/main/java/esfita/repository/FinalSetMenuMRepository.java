package esfita.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import esfita.entity.FinalSetMenuMHib;

@Repository
public interface FinalSetMenuMRepository extends JpaRepository<FinalSetMenuMHib, Integer> {

	@Query(value = "SELECT DISTINCT m.* FROM dbo.final_set_menu_m m "
			+ "JOIN dbo.final_set_menu_h h ON h.final_menu_fk = m.id "
			+ "WHERE (:mealTypeFk IS NULL OR h.meal_type_fk = :mealTypeFk) "
			+ "AND (:approvalStatus IS NULL OR m.approval_status = :approvalStatus) "
			+ "ORDER BY m.status ASC, m.approval_status ASC, m.id DESC", nativeQuery = true)
	List<FinalSetMenuMHib> findMByMealTypeAndApprovalStatus(@Param("mealTypeFk") Integer mealTypeFk,
			@Param("approvalStatus") Integer approvalStatus);

	@Query(value = "SELECT " + "COUNT(*) AS totalMenu, " + "COUNT(*) FILTER (WHERE status = 'A') AS activeMenu, "
			+ "COUNT(*) FILTER (WHERE approval_status = 1) AS pendingApproval, " + "AVG(total) AS averageCost "
			+ "FROM dbo.final_set_menu_m", nativeQuery = true)
	List<Object[]> getMenuSummary();

	@Query("SELECT i FROM FinalSetMenuMHib i WHERE i.status ='A'AND i.approvalStatus=0 ")
	List<FinalSetMenuMHib> orderBy();
}
