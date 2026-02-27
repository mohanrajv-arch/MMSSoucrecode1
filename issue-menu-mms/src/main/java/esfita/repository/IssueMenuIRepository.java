package esfita.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import esfita.entity.IssueMenuIHib;

@Repository
public interface IssueMenuIRepository extends JpaRepository<IssueMenuIHib, Integer> {

	@Query("SELECT i " + "FROM IssueMenuIHib i " + "WHERE i.issueMenuDFk = :issueMenuDFk "
			+ "AND i.recipeFk = :recipeFk ")
	List<IssueMenuIHib> findByIssueMenuDFkAndRecipeFkAndCategoryFk(@Param("issueMenuDFk") int issueMenuDFk,
			@Param("recipeFk") long recipeFk);

//	@Query(value = "SELECT COUNT(DISTINCT item_fk) " + "FROM dbo.issue_menu_i "
//			+ "WHERE issue_menu_h_fk = :menuMFk", nativeQuery = true)
//	Integer uniqueItemCountByMenuM(@Param("menuMFk") int menuMFk);

	@Query(value = "SELECT COUNT(DISTINCT item_fk) " + "FROM dbo.issue_menu_i " + "WHERE issue_menu_h_fk = :menuMFk "
			+ "AND secondary_quantity <> 0", nativeQuery = true)
	Integer uniqueItemCountByMenuM(@Param("menuMFk") int menuMFk);

	@Query(value = "SELECT DISTINCT item_fk " + "FROM dbo.issue_menu_i "
			+ "WHERE issue_menu_m_fk = :menuMFk", nativeQuery = true)
	List<Integer> findDistinctItemFkByMenuM(@Param("menuMFk") int menuMFk);

	@Query(value = "SELECT * FROM dbo.issue_menu_i WHERE issue_menu_m_fk = :menuMFk", nativeQuery = true)
	List<IssueMenuIHib> findUniqueItemsByMenuM(@Param("menuMFk") int menuMFk);

	@Query(value = "SELECT * FROM dbo.issue_menu_i WHERE issue_menu_d_fk = :issueMenuDFk", nativeQuery = true)
	List<IssueMenuIHib> findByMenuD(@Param("issueMenuDFk") int menuMFk);

	void deleteByIssueMenuHFk(int issueMenuHFk);

	@Query("""
			SELECT i
			FROM IssueMenuIHib i
			WHERE i.issueMenuHFk = :menuHFk
			""")
	List<IssueMenuIHib> findItemsByMenuH(@Param("menuHFk") int menuHFk);

}