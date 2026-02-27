package esfita.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import esfita.entity.RecipeHHistoryHib;



@Repository
public interface RecipeHHistoryRepository extends JpaRepository<RecipeHHistoryHib, Integer> {

	@Query("SELECT r FROM RecipeHHistoryHib r WHERE r.recipeFk = ?1")
	List<RecipeHHistoryHib> findVersionList(int recPK);
	
	@Query("SELECT r FROM RecipeHHistoryHib r WHERE r.recipeFk = ?1 AND r.versionNo = ?2")
	RecipeHHistoryHib findVersion(int recPK, int verNo);
	
	@Query("SELECT MAX(r.versionNo) FROM RecipeHHistoryHib r WHERE r.recipeFk = :recipeFk")
	Integer findMaxVersionByRecipeFk(@Param("recipeFk") int recipeFk);

}
