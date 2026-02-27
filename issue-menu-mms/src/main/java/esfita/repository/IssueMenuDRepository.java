package esfita.repository;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;



import esfita.entity.IssueMenuDHib;

@Repository
public interface IssueMenuDRepository extends JpaRepository<IssueMenuDHib, Integer> {
	
	@Query("SELECT i FROM IssueMenuDHib i WHERE i.issueMenuHFk = ?1 ANd i.status='A' ORDER BY i.id")
	List<IssueMenuDHib> findByIssueMenuHFk(int issueMenuHFk);
	
	List<IssueMenuDHib> findByIssueMenuMFk(int issueMenuMFk);
	IssueMenuDHib findById(int id);
	void deleteByIssueMenuHFk(int issueMenuHFk);
}