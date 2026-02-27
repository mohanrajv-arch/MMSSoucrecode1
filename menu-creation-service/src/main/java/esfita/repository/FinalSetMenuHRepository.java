package esfita.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import esfita.entity.FinalSetMenuHHib;

@Repository
public interface FinalSetMenuHRepository extends JpaRepository<FinalSetMenuHHib, Integer> {

	@Query("SELECT i FROM FinalSetMenuHHib i WHERE i.finalMenuFk = :finalMenuFk AND i.status = 'A' ORDER BY i.id ASC")
	List<FinalSetMenuHHib> findActiveByMenuDFk(@Param("finalMenuFk") Integer finalMenuFk);

	@Query("SELECT i FROM FinalSetMenuHHib i WHERE i.menuFk = :menuFk ")
	FinalSetMenuHHib findByMenu(@Param("menuFk") Integer menuFk);

	@Query("SELECT h FROM FinalSetMenuHHib h WHERE h.finalMenuFk = :finalMenuFk AND h.menuFk = :menuFk ")
	List<FinalSetMenuHHib> findHeadersByMenuFk(@Param("finalMenuFk") int finalMenuFk);

	@Query("SELECT i FROM FinalSetMenuHHib i WHERE i.finalMenuFk = :finalMenuFk AND i.status = 'A' ")
	List<FinalSetMenuHHib> findByMenuDFk(@Param("finalMenuFk") Integer finalMenuFk);

	@Query("SELECT h FROM FinalSetMenuHHib h WHERE h.finalMenuFk = :finalMenuFk AND h.status = 'A'")
	List<FinalSetMenuHHib> findActiveHeadersByFinalMenuFk(@Param("finalMenuFk") int finalMenuFk);

	@Query("SELECT h FROM FinalSetMenuHHib h WHERE h.finalMenuFk = :finalMenuFk AND h.menuFk = :menuFk ")
	FinalSetMenuHHib findHeadersByMenuFk(@Param("finalMenuFk") int finalMenuFk, @Param("menuFk") int menuFk);

	@Query("SELECT h FROM FinalSetMenuHHib h WHERE h.finalMenuFk = :finalMenuFk AND h.menuFk = :menuFk AND h.status = 'A'")
	FinalSetMenuHHib findByMenuFk(@Param("finalMenuFk") int finalMenuFk, @Param("menuFk") int menuFk);

	// ==============================================================================================================================
	@Query("SELECT h FROM FinalSetMenuHHib h WHERE h.finalMenuFk IN :menuIds AND h.status = 'A'")
	List<FinalSetMenuHHib> findActiveByMenuFks(@Param("menuIds") List<Integer> menuIds);
}
