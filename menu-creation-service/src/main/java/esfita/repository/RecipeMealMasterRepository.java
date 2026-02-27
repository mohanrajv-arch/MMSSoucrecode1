package esfita.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import esfita.entity.RecipeMealMasterHib;

@Repository
public interface RecipeMealMasterRepository extends JpaRepository<RecipeMealMasterHib, Integer> {

	@Query("select m from RecipeMealMasterHib m where m.recipeMealCode=?1")
	RecipeMealMasterHib findCode(String recipeCode);

	@Query("SELECT m FROM RecipeMealMasterHib m WHERE m.status = 'A' ORDER BY m.recipeMealName ASC")
	List<RecipeMealMasterHib> orderBy();

	@Query("select m from RecipeMealMasterHib m order by m.recipeMealName Asc")
	List<RecipeMealMasterHib> orderByAsc();

	List<RecipeMealMasterHib> findAllById(Iterable<Integer> ids);

}
