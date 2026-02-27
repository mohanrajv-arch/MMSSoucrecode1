package esfita.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import esfita.entity.FinalSetMenuIHib;

@Repository
public interface FinalSetMenuIRepository extends JpaRepository<FinalSetMenuIHib, Integer> {

	@Query("SELECT i FROM FinalSetMenuIHib i WHERE i.menuDFk = :menuDFk AND i.status = 'A'")
	List<FinalSetMenuIHib> findActiveItemsByMenuDFk(@Param("menuDFk") int menuDFk);

	@Query("SELECT i FROM FinalSetMenuIHib i "
			+ "WHERE i.menuDFk = :menuDFk AND i.recipeFk = :recipeFk AND i.status = 'A'")
	List<FinalSetMenuIHib> findActiveByMenuDFk(@Param("menuDFk") int menuDFk,
			@Param("recipeFk") int recipeFk);

	@Query("SELECT i FROM FinalSetMenuIHib i WHERE i.finalMenuFk = :finalMenuFk AND i.status = 'A'")
	List<FinalSetMenuIHib> findByItem(@Param("finalMenuFk") int finalMenuFk);
	
	

	
	@Query("SELECT i FROM FinalSetMenuIHib i WHERE i.menuDFk = :menuDFk")
	List<FinalSetMenuIHib> findItemsByMenuDFk(@Param("menuDFk") int menuDFk);

//	@Query("SELECT i FROM FINAL_SET_MENU_I_HIB i "
//			+ "WHERE i.finalMenuFk = :finalMenuFk AND i.recipeFk = :recipeFk ")
//	List<FINAL_SET_MENU_I_HIB> findActiveByFinalMenuFkAndRecipeFk(@Param("finalMenuFk") int menuDFk,
//			@Param("recipeFk") int recipeFk);

	
	
	@Query("SELECT i FROM FinalSetMenuIHib i WHERE i.finalMenuFk = :finalMenuFk AND i.status = 'A'AND i.recipeFk = :recipeFk")
	List<FinalSetMenuIHib> findByRecipeFk(@Param("finalMenuFk") int finalMenuFk,@Param("recipeFk") int recipeFk);

	@Query("SELECT i FROM FinalSetMenuIHib i WHERE i.finalMenuFk = :finalMenuFk AND i.status = 'A'AND i.menuFk=:menuFk")
	List<FinalSetMenuIHib> findByFinalFkAndMenuFk(@Param("finalMenuFk") int finalMenuFk,@Param("menuFk") int menuFk);
	
	@Query("SELECT i FROM FinalSetMenuIHib i WHERE i.finalMenuFk = :finalMenuFk AND i.menuFk=:menuFk")
	List<FinalSetMenuIHib> findByFinalFkMenuFk(@Param("finalMenuFk") int finalMenuFk,@Param("menuFk") int menuFk);
	
	@Query("SELECT i FROM FinalSetMenuIHib i WHERE i.menuDFk=:menuDFk AND i.recipeFk=:recipeFk")
	List<FinalSetMenuIHib> findItems(@Param("menuDFk") int menuDFk,@Param("recipeFk") int recipeFk);
 
	
	@Query("SELECT i FROM FinalSetMenuIHib i "
			+ "WHERE i.finalMenuFk = :finalMenuFk AND i.recipeFk = :recipeFk AND  i.menuFk=:menuFk")
	List<FinalSetMenuIHib> findActiveByMenuDFkAndItemFk(@Param("finalMenuFk") int finalMenuFk,
			@Param("recipeFk") int recipeFk,@Param("menuFk") int menuFK);
	
	//=====================================================================================================================


}
