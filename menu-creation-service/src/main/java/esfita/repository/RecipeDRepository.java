package esfita.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import esfita.entity.RecipeDHib;

@Repository
public interface RecipeDRepository extends JpaRepository<RecipeDHib, Integer> {

	@Query("SELECT m FROM RecipeDHib m WHERE m.recipeFk = ?1 AND m.status = 'A'")
	List<RecipeDHib> findByActRecipe(int recipeFk);

	List<RecipeDHib> findAllById(Iterable<Integer> ids);
	List<RecipeDHib> findByRecipeFkIn(List<Integer> recipeIds);
}
