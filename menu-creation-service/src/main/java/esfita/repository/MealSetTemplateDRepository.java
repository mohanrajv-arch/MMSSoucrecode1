package esfita.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import esfita.entity.MealSetTemplateDHib;

public interface MealSetTemplateDRepository extends JpaRepository<MealSetTemplateDHib, Integer> {
	@Query("SELECT m FROM MealSetTemplateDHib m WHERE m.templateFk = ?1 AND m.status = 'A'")
	List<MealSetTemplateDHib> findByActCat(int tempFk);

	List<MealSetTemplateDHib> findByTemplateFk(Integer templateFk);

	@Query("SELECT d FROM MealSetTemplateDHib d WHERE d.templateFk = :templateHId")
	List<MealSetTemplateDHib> findByTemplateHId(@Param("templateHId") int templateHId);

	@Query("SELECT d FROM MealSetTemplateDHib d WHERE d.templateFk = :templateFk AND d.status = 'A' AND (:categoryFk = 0 OR :categoryFk IS NULL OR d.categoryFk = :categoryFk)")
	List<MealSetTemplateDHib> findActiveByCategoryFlexible(@Param("categoryFk") Integer categoryFk,
			@Param("templateFk") int templateFk);

	@Query("SELECT d FROM MealSetTemplateDHib d " + "WHERE d.templateFk = :tempFk " + "AND d.status = 'A' "
			+ "ORDER BY d.categoryName ASC")
	List<MealSetTemplateDHib> findActiveByTemplateFk(@Param("tempFk") int tempFk);
}
