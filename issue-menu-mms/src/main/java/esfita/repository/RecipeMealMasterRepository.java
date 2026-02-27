package esfita.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import esfita.entity.RecipeMealMasterHib;

@Repository

public interface RecipeMealMasterRepository extends JpaRepository<RecipeMealMasterHib, Integer> {
	@Query("select m from RecipeMealMasterHib m where m.recipeMealCode=?1")
	RecipeMealMasterHib findCode(String recipeCode);

	@Query("SELECT m FROM RecipeMealMasterHib m WHERE m.status = 'A' ORDER BY m.id DESC")
	List<RecipeMealMasterHib> orderBy();

	@Query("SELECT r FROM RecipeMealMasterHib r WHERE r.id = :id")
	RecipeMealMasterHib findByRecipeMealId(@Param("id") int id);

}
