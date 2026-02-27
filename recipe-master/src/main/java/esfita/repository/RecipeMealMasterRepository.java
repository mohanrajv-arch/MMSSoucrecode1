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

	@Query("select m from RecipeMealMasterHib m where m.status = 'A' order by m.recipeMealName ASC")
	List<RecipeMealMasterHib> orderBy();

	@Query("SELECT r FROM RecipeMealMasterHib r WHERE r.id = :id")
	RecipeMealMasterHib findByRecipeMealId(@Param("id") int id);

}
