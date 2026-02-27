package esfita.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import esfita.entity.MealSetMenuHHib;

@Repository
public interface MealSetMenuHRepository extends JpaRepository<MealSetMenuHHib, Integer> {

	@Query("SELECT m FROM MealSetMenuHHib m " + "WHERE (:mealTypeFk IS NULL OR m.mealTypeFk = :mealTypeFk) "
			+ "AND (:approvalStatus IS NULL OR m.approvalStatus = :approvalStatus) "
			+ "ORDER BY m.status ASC, m.approvalStatus ASC, m.id DESC")
	List<MealSetMenuHHib> findByMealTypeAndApprovalStatus(@Param("mealTypeFk") Integer mealTypeFk,
			@Param("approvalStatus") Integer approvalStatus);

	@Query(value = "SELECT " + "COUNT(*) AS totalMenu, " + "COUNT(*) FILTER (WHERE status = 'A') AS activeMenu, "
			+ "COUNT(*) FILTER (WHERE approval_status = 1) AS pendingApproval, " + "AVG(total_cost) AS averageCost "
			+ "FROM dbo.meal_set_menu_h", nativeQuery = true)
	List<Object[]> getMenuSummary();

	@Query("SELECT m FROM MealSetMenuHHib m WHERE m.status = 'A' AND m.mealTypeFk = :mealTypeFk AND m.approvalStatus = 0 ")
	List<MealSetMenuHHib> findActiveByFk(@Param("mealTypeFk") int mealTypeFk);

	@Query("SELECT m FROM MealSetMenuHHib m "
			+ "WHERE m.status = 'A' AND m.mealTypeFk = :mealTypeFk AND m.approvalStatus = 0 ORDER BY m.menuName ASC")
	List<MealSetMenuHHib> findActByFk(@Param("mealTypeFk") int mealTypeFk);

}
