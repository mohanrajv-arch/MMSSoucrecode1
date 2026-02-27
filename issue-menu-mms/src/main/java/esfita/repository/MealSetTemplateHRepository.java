package esfita.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import esfita.entity.MealSetTemplateHHib;

public interface MealSetTemplateHRepository extends JpaRepository<MealSetTemplateHHib, Integer> {

	@Query("SELECT m FROM MealSetTemplateHHib m " + "WHERE (:mealTypeFk IS NULL OR m.mealTypeFk = :mealTypeFk) "
			+ "AND (:approvalStatus IS NULL OR m.approvalStatus = :approvalStatus) "
			+ "ORDER BY  m.status ASC,m.approvalStatus ASC, m.id DESC")
	List<MealSetTemplateHHib> findByMealTypeAndApprovalStatus(@Param("mealTypeFk") Integer mealTypeFk,
			@Param("approvalStatus") Integer approvalStatus);

	@Query(value = """
		    SELECT
		        m.meal_type_name,
		        COUNT(m.id) AS total_template_count,
		        SUM(CASE WHEN m.status = 'A' THEN 1 ELSE 0 END) AS active_template_count,
		        SUM(m.no_categories) AS total_category_count
		    FROM dbo.meal_set_template_h m
		    GROUP BY m.meal_type_name
		    ORDER BY m.meal_type_name
		    """, nativeQuery = true)
		List<Object[]> getTemplateSummaryByMealType();

	@Query("SELECT m FROM MealSetTemplateHHib m "
			+ "WHERE m.mealTypeFk = :mealTypeFk AND m.status = 'A' AND m.approvalStatus = 0 " + "ORDER BY m.id DESC")
	List<MealSetTemplateHHib> findByMealTypeStatus(@Param("mealTypeFk") int mealTypeFk);

}
