package esfita.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


import esfita.entity.IssueMenuHHib;

@Repository
public interface IssueMenuHRepository extends JpaRepository<IssueMenuHHib, Integer> {

	@Query("SELECT i FROM IssueMenuHHib i WHERE i.issueMenuMFk = :id ANd i.status='A'")
	List<IssueMenuHHib> findList(@Param("id") int id);

	@Query("SELECT i FROM IssueMenuHHib i WHERE i.issueMenuMFk = :issue_menu_m_fk AND i.status = 'A' ")
	List<IssueMenuHHib> findByMenuMFk(@Param("issue_menu_m_fk") Integer issue_menu_m_fk);


}
