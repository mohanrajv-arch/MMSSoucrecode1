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
	List<FinalSetMenuIHib> findActiveByMenuDFk(@Param("menuDFk") int menuDFk, @Param("recipeFk") int recipeFk);

	@Query("SELECT i FROM FinalSetMenuIHib i WHERE i.finalMenuFk = :finalMenuFk AND i.status = 'A'")
	List<FinalSetMenuIHib> findByItem(@Param("finalMenuFk") int finalMenuFk);

	@Query("SELECT i FROM FinalSetMenuIHib i WHERE i.menuDFk = :menuDFk")
	List<FinalSetMenuIHib> findItemsByMenuDFk(@Param("menuDFk") int menuDFk);

	@Query("SELECT i FROM FinalSetMenuIHib i WHERE i.finalMenuFk = :finalMenuFk")
	List<FinalSetMenuIHib> findByFinalMenuFk(@Param("finalMenuFk") int finalMenuFk);

	@Query("SELECT i FROM FinalSetMenuIHib i WHERE i.finalMenuFk = :finalMenuFk AND i.status = 'A'AND i.recipeFk = :recipeFk")
	List<FinalSetMenuIHib> findByRecipeFk(@Param("finalMenuFk") int finalMenuFk, @Param("recipeFk") int recipeFk);

	@Query("SELECT i FROM FinalSetMenuIHib i WHERE i.finalMenuFk = :finalMenuFk AND i.status = 'A'AND i.menuFk=:menuFk")
	List<FinalSetMenuIHib> findByFinalFkAndMenuFk(@Param("finalMenuFk") int finalMenuFk, @Param("menuFk") int menuFk);

	@Query("SELECT i FROM FinalSetMenuIHib i WHERE i.finalMenuFk = :finalMenuFk AND i.menuFk=:menuFk")
	List<FinalSetMenuIHib> findByFinalFkMenuFk(@Param("finalMenuFk") int finalMenuFk, @Param("menuFk") int menuFk);

	@Query("SELECT i FROM FinalSetMenuIHib i WHERE i.menuDFk=:menuDFk AND i.recipeFk=:recipeFk")
	List<FinalSetMenuIHib> findItems(@Param("menuDFk") int menuDFk, @Param("recipeFk") int recipeFk);

	@Query("SELECT i FROM FinalSetMenuIHib i "
			+ "WHERE i.finalMenuFk = :finalMenuFk AND i.recipeFk = :recipeFk AND  i.menuFk=:menuFk")
	List<FinalSetMenuIHib> findActiveByMenuDFkAndItemFk(@Param("finalMenuFk") int finalMenuFk,
			@Param("recipeFk") int recipeFk, @Param("menuFk") int menuFK);

	// =====================================================================================================================

	@Query(value = "SELECT COUNT(DISTINCT item_fk) " + "FROM dbo.final_set_menu_i "
			+ "WHERE final_menu_fk = :finalFk AND menu_fk = :menuFk", nativeQuery = true)
	Integer uniqueItemCountByMenu(@Param("finalFk") int finalFk, @Param("menuFk") int menuFk);

	@Query(value = "SELECT COUNT(DISTINCT item_fk) " + "FROM dbo.final_set_menu_i "
			+ "WHERE final_menu_fk = :finalFk", nativeQuery = true)
	Integer uniqueItemCountByfinalMenu(@Param("finalFk") int finalFk);

	@Query(value = "SELECT COUNT(*) " + "FROM (SELECT item_fk " + "      FROM dbo.final_set_menu_i "
			+ "      WHERE final_menu_fk = :finalFk " + "      GROUP BY item_fk "
			+ "      HAVING COUNT(*) > 1) t", nativeQuery = true)
	Integer repeatedItemCountByFinalMenu(@Param("finalFk") int finalFk);

}
