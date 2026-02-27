package esfita.repository;

import java.util.List;
import java.util.Set;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import esfita.entity.RecipeHHib;

@Repository
public interface RecipeHRepository extends JpaRepository<RecipeHHib, Integer> {

	@Query("SELECT DISTINCT r FROM RecipeHHib r " + "JOIN r.categoryMappings m "
			+ "WHERE r.status = 'A' AND m.status = 'A' " + "AND m.categoryFk = :categoryfk "
			+ "ORDER BY r.recipeName ASC")
	List<RecipeHHib> filterByCategoryFk(@Param("categoryfk") Integer categoryfk);

	@Query("SELECT DISTINCT r, m.categoryFk FROM RecipeHHib r " + "JOIN r.categoryMappings m "
			+ "WHERE r.status='A' AND m.status='A' AND m.categoryFk IN :categoryfks " + "ORDER BY r.id DESC")
	List<Object[]> findByCategoryFkIn(@Param("categoryfks") Set<Integer> categoryfks);

	@Query("SELECT DISTINCT r FROM RecipeHHib r " + "JOIN FETCH r.categoryMappings m "
			+ "WHERE r.status = 'A' AND m.status = 'A'")
	List<RecipeHHib> findAllActiveWithCategories();

	@Query("SELECT DISTINCT r FROM RecipeHHib r LEFT JOIN r.categoryMappings m "
			+ "WHERE (:categoryFk IS NULL OR m.categoryFk = :categoryFk) " + "ORDER BY r.status, r.recipeName DESC")
	List<RecipeHHib> filterRecipeEnquiry(@Param("categoryFk") Integer categoryFk);

}
