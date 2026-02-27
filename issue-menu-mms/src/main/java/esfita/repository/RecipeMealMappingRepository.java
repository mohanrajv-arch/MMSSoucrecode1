package esfita.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;



import esfita.entity.RecipeMealMappingHib;

public interface RecipeMealMappingRepository extends JpaRepository<RecipeMealMappingHib, Integer>{
	@Query("SELECT m FROM RecipeMealMappingHib m WHERE m.status = 'A' AND m.recipeFk = ?1")
	List<RecipeMealMappingHib> findByIdAndAct(int id);
	

	List<RecipeMealMappingHib> findByRecipeFk(int recipeFk);
	
	@Query("SELECT r FROM RecipeMealMappingHib r " +
		       "WHERE r.mealFk = :mealFk AND r.recipeFk = :recipeFk AND r.status = 'A'")
		RecipeMealMappingHib findByMealAndRecipeActive(
		    @Param("mealFk") int mealFk,
		    @Param("recipeFk") int recipeFk);
	
	@Query("SELECT r FROM RecipeMealMappingHib r WHERE r.id = :id AND r.status = 'A'")
	RecipeMealMappingHib findById(
		    @Param("id") int id);
	
	
}
