package esfita.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import esfita.entity.MealSetMenuDHib;

public interface MealSetMenuDRepository extends JpaRepository<MealSetMenuDHib, Integer> {
	@Query(value = "SELECT category_name, COUNT(*) AS recipe_count " + "FROM dbo.meal_set_menu_d "
			+ "WHERE menu_fk = :menuFk AND status = 'A' " + "GROUP BY category_name "
			+ "ORDER BY category_name", nativeQuery = true)
	List<Object[]> findCategoryRecipeSummary(@Param("menuFk") Integer menuFk);

	@Query("SELECT m FROM MealSetMenuDHib m WHERE m.menuFk = ?1 AND m.status = 'A'")
	List<MealSetMenuDHib> findByActCat(int tempFk);

	// added by bharath
	@Query("SELECT m FROM MealSetMenuDHib m WHERE m.menuFk = :menuFk AND m.status = 'A'")
	List<MealSetMenuDHib> findActiveByMenuFk(@Param("menuFk") int menuFk);

	@Query("SELECT m FROM MealSetMenuDHib m WHERE m.menuFk = :menuFk")
	List<MealSetMenuDHib> findByMenuFk(@Param("menuFk") int menuFk);

}
