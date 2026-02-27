package esfita.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import esfita.entity.MealSetMenuIHib;

@Repository
public interface MealSetMenuIRepository extends JpaRepository<MealSetMenuIHib, Integer> {

	@Query("SELECT i FROM MealSetMenuIHib i WHERE i.menuDFk = :menuDFk AND i.status = 'A'")
	List<MealSetMenuIHib> findActiveByMenuDFk(@Param("menuDFk") int menuDFk);

	@Query("SELECT i FROM MealSetMenuIHib i WHERE i.menuDFk = :menuDFk")
	List<MealSetMenuIHib> findByMenuDFk(@Param("menuDFk") int menuDFk);

}
