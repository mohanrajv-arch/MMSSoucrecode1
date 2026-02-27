package esfita.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;



import esfita.entity.FinalSetMenuDHib;

@Repository
public interface FinalSetMenuDRepository extends JpaRepository<FinalSetMenuDHib, Integer> {

	@Query("SELECT m FROM FinalSetMenuDHib m WHERE m.finalMenuFk = :finalFk AND m.menuFk = :menuFk AND m.status = 'A'")
	List<FinalSetMenuDHib> findByActCat(@Param("finalFk") int finalFk, @Param("menuFk") int menuFk);

	

	@Query("SELECT m FROM FinalSetMenuDHib m WHERE m.finalMenuFk = :finalFk AND m.status = 'A'")
	List<FinalSetMenuDHib> findByAct(@Param("finalFk") int finalFk);
	
	@Query("SELECT m FROM FinalSetMenuDHib m WHERE m.finalMenuFk = :finalFk AND m.menuFk = :menuFk")
	List<FinalSetMenuDHib> findByfinalAndMenuFk(@Param("finalFk") int finalFk,@Param("menuFk") int menuFk);
	

	

	@Query("SELECT d FROM FinalSetMenuDHib d WHERE d.menuFk = :menuFk")
	List<FinalSetMenuDHib> findDetailsByMenuFk(@Param("menuFk") int menuFk);


	@Query("SELECT d FROM FinalSetMenuDHib d WHERE d.menuFk = :menuFk AND d.status = 'A'")
	List<FinalSetMenuDHib> findActiveDetailsByMenuFk(@Param("menuFk") int menuFk);

	
	
	@Query("SELECT d FROM FinalSetMenuDHib d WHERE d.finalMenuFk = :finalMenuFk AND d.menuFk = :menuFk AND d.recipeFk = :recipeFk")
	FinalSetMenuDHib findByFinalFkMenuFkAndRecipeFk(@Param("finalMenuFk") int finalMenuFk,@Param("menuFk") int menuFK, @Param("recipeFk") int recipeFk );
	
	@Query("SELECT d FROM FinalSetMenuDHib d WHERE d.finalMenuFk = :finalMenuFk AND d.menuFk = :menuFk AND d.categoryFk = :categoryFk AND d.recipeFk = :recipeFk")
	FinalSetMenuDHib findByFinalFkMenuFkAndRecipeFk(@Param("finalMenuFk") int finalMenuFk,@Param("menuFk") int menuFK,@Param("categoryFk") int categoryFk,@Param("recipeFk") int recipeFk );
	
	
}
