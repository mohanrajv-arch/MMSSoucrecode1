package esfita.repositoy;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import esfita.entity.CountryMasterHib;

@Repository
public interface CountryMasterRepository extends JpaRepository<CountryMasterHib, Integer> {

	@Query("select m from CountryMasterHib m where m.countryCode=?1")
	CountryMasterHib findCode(String recipeCode);

	@Query("select m from CountryMasterHib m ORDER BY m.status ASC, m.id DESC")
	List<CountryMasterHib> orderBy();

	@Query("SELECT c FROM CountryMasterHib c WHERE c.id = :id")
	CountryMasterHib findOne(@Param("id") int id);
}
