package esfita.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;



import esfita.entity.RecipeDHib;

public interface RecipeDRepository extends JpaRepository<RecipeDHib, Integer> {
	@Query("SELECT m FROM RecipeDHib m WHERE m.recipeFk = ?1")
	List<RecipeDHib> findByRecipe(int recipeFk);
	
	 @Query("SELECT m FROM RecipeDHib m WHERE m.recipeFk = ?1 AND m.status = 'A'")
	    List<RecipeDHib> findByActRecipe(int recipeFk);

	    
}
