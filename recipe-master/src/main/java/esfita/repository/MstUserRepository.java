package esfita.repository;

import java.util.Date;
import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import esfita.entity.MstUserHib;
import jakarta.transaction.Transactional;

public interface MstUserRepository extends JpaRepository<MstUserHib, Integer> {

	@Query(value = "SELECT r FROM MstUserHib r WHERE r.emailId =?1")
	MstUserHib isAlreadyRegistered(String emailId);

	@Query(value = "SELECT r FROM MstUserHib r WHERE r.userPk =?1")
	MstUserHib getUser(Integer userFK);

	@Query(value = "SELECT r FROM MstUserHib r WHERE r.emailId =?1 AND r.password =?2")
	MstUserHib isRegistered(String emailId, String password);

	@Query(value = "SELECT r FROM MstUserHib r WHERE r.mobileNo =?1")
	MstUserHib alreadyRegistered(String mobile);

	@Query(value = "SELECT r FROM MstUserHib r WHERE r.userPk =?1")
	MstUserHib findentity(Integer entityId);

	@Query("select m from MstUserHib m order by userPk desc")
	List<MstUserHib> orderBy();

	@Query(value = "SELECT r FROM MstUserHib r WHERE r.emailId =?1 and r.status = 'A'")
	MstUserHib alreadyRegisteredMailId(String mailId);

	@Query("select m from MstUserHib m where m.userType = ?1 and m.status = 'A' order by firstName asc")
	List<MstUserHib> forUserDropdown(int typeFk);

	@Transactional
	@Modifying
	@Query("UPDATE MstUserHib r SET r.password=?2 , r.lastPasswordUpdateDate =?3 WHERE r.userPk=?1")
	void changePassword(int userPK, String userPassword, Date passwordChangedDate);
	
	@Query("SELECT u FROM MstUserHib u WHERE u.userPk = :userId")
    MstUserHib findByUserId(@Param("userId") int userId);
}
