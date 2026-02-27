package esfita.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import esfita.entity.RecipeCategoryMappingHib;

public interface RecipeCategoryMappingRepository extends JpaRepository<RecipeCategoryMappingHib, Integer> {
	@Query("SELECT m FROM RecipeCategoryMappingHib m WHERE m.status = 'A' AND m.recipeFk = ?1")
	List<RecipeCategoryMappingHib> findByIdAndAct(int id);

	List<RecipeCategoryMappingHib> findByRecipeFk(int recipeFk);

	@Query("SELECT c FROM RecipeCategoryMappingHib c WHERE c.recipeFk = :recipeFk AND c.status = 'A'")
	List<RecipeCategoryMappingHib> findActiveByRecipeFk(@Param("recipeFk") int recipeFk);

	@Query("SELECT r FROM RecipeCategoryMappingHib r "
			+ "WHERE r.categoryFk = :categorfk AND r.recipeFk = :recipefk AND r.status = 'A'")
	RecipeCategoryMappingHib findByCategoryAndRecipeActive(@Param("categorfk") int categorfk,
			@Param("recipefk") int recipefk);

	@Query("SELECT c FROM RecipeCategoryMappingHib c WHERE c.id = :id AND c.status = 'A'")
	RecipeCategoryMappingHib findById(@Param("id") int id);

	@Query("SELECT c FROM RecipeCategoryMappingHib c WHERE c.recipeFk IN :recipeIds AND c.status = 'A'")
	List<RecipeCategoryMappingHib> findActiveByRecipeFkIn(@Param("recipeIds") List<Integer> recipeIds);


}
