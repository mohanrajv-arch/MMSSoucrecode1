package esfita.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import esfita.entity.RecipeHHib;



@Repository
public interface RecipeHRepository extends JpaRepository<RecipeHHib, Integer> {
	@Query("SELECT DISTINCT r FROM RecipeHHib r " + "LEFT JOIN r.recipeCategoryMappings m "
			+ "WHERE (:originFk IS NULL OR r.countryOriginFk = :originFk) " + "AND (:uom IS NULL OR r.uom = :uom) "
			+ "AND (:categoryFk IS NULL OR m.categoryFk = :categoryFk) " + "ORDER BY r.status,r.id DESC")
	List<RecipeHHib> filterRecipes(@Param("originFk") Integer originFk, @Param("uom") String uom,
			@Param("categoryFk") Integer categoryFk);
	
	

	@Query("select r from RecipeHHib r where r.uniqueNo LIKE ?1")
	List<RecipeHHib> transactionNo(String ref);

	@Query("SELECT DISTINCT r FROM RecipeHHib r " + "LEFT JOIN r.recipeCategoryMapping m "
			+ "WHERE r.status = 'A' AND (:categoryFk IS NULL OR (m.status = 'A' AND m.categoryFk = :categoryFk)) "
			+ "ORDER BY r.id DESC")
	List<RecipeHHib> filterByCategory(@Param("categoryFk") Integer categoryFk);

	@Query("SELECT DISTINCT r FROM RecipeHHib r " + "JOIN r.mealMappings m "
			+ "WHERE r.status = 'A' AND m.status = 'A' AND m.mealFk = :mealFk " + "ORDER BY r.id DESC")
	List<RecipeHHib> filterByMealType(@Param("mealFk") Integer mealFk);

	@Query("SELECT DISTINCT r FROM RecipeHHib r " + "JOIN r.categoryMappings m "
			+ "WHERE r.status = 'A' AND m.status = 'A' AND m.categoryFk = :categoryfk " + "ORDER BY r.id DESC")
	List<RecipeHHib> filterByCategorys(@Param("categoryfk") Integer categoryfk);

	@Query("SELECT r FROM RecipeHHib r " + "WHERE (:countryOriginFk IS NULL OR r.countryOriginFk = :countryOriginFk) "
			+ "AND r.status = 'A' " + "ORDER BY r.id DESC")
	List<RecipeHHib> filterByCountry(@Param("countryOriginFk") Integer countryOriginFk);

	@Query("SELECT DISTINCT r FROM RecipeHHib r " + "JOIN r.categoryMappings m "
			+ "WHERE r.status = 'A' AND m.status = 'A' " + "AND m.categoryFk = :categoryfk " + "ORDER BY r.recipeName DESC")
	List<RecipeHHib> filterByCategoryFk(@Param("categoryfk") Integer categoryfk);

	@Query("SELECT DISTINCT r FROM RecipeHHib r " + "LEFT JOIN r.recipeCategoryMappings m "
			+ "LEFT JOIN r.recipeMealTypeMappings mt " + "WHERE (:originFk IS NULL OR r.countryOriginFk = :originFk) "
			+ "AND (:mealFk IS NULL OR mt.mealFk = :mealFk) "
			+ "AND (:categoryFk IS NULL OR m.categoryFk = :categoryFk) " + "ORDER BY r.status, r.id DESC")
	List<RecipeHHib> filterRecipeMapping(@Param("originFk") Integer originFk, @Param("mealFk") Integer mealTypeFk,
			@Param("categoryFk") Integer categoryFk);

	@Query("SELECT DISTINCT r FROM RecipeHHib r LEFT JOIN r.recipeCategoryMappings m "
			+ "WHERE (:categoryFk IS NULL OR m.categoryFk = :categoryFk) " + "ORDER BY r.status, r.id DESC")
	List<RecipeHHib> filterRecipeEnquiry(@Param("categoryFk") Integer categoryFk);
	
	@Query(value = "SELECT COALESCE(MAX(id), 0) FROM dbo.recipe_h", nativeQuery = true)
	int getMaxId();

	  @Query("SELECT r FROM RecipeHHib r " +
	           "WHERE r.id = :recipeFk " +
	           "AND r.status = 'A' ")
	    RecipeHHib findActiveByRecipeFk(@Param("recipeFk") int recipeFk);
	  
	  @Query("SELECT r FROM RecipeHHib r " +
	           "WHERE r.id = :recipeFk ")
	    RecipeHHib findByRecipeFk(@Param("recipeFk") int recipeFk);
	  
	
	
	
}
