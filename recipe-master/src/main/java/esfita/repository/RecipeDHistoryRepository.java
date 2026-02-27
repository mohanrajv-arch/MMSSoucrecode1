package esfita.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import esfita.entity.RecipeDHistoryHib;



@Repository
public interface RecipeDHistoryRepository extends JpaRepository<RecipeDHistoryHib, Integer> {

	@Query("SELECT m FROM RecipeDHistoryHib m WHERE m.recipeHistoryFk = ?1")
	List<RecipeDHistoryHib> findByRecipe(int recipeFk);
}
