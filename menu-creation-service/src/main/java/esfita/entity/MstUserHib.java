package esfita.entity;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Data;

@Entity
@Data
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
@Table(name = "mst_user", schema = "dbo")
public class MstUserHib {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "user_pk", updatable = false)
	private int userPk;

	@Column(name = "user_type")
	private int userType;

	@Column(name = "first_name")
	private String firstName;

	@Column(name = "last_name")
	private String lastName;

	@Column(name = "email_id")
	private String emailId;

	@Column(name = "mobile_no")
	private String mobileNo;

	@Column(name = "password")
	private String password;

	@Column(name = "created_by")
	private int createdBy;

	@Column(name = "created_date")
	private Date createdDate;

	@Column(name = "last_act_by")
	private int lastActBy;

	@Column(name = "last_act_date")
	private Date lastActDate;

	@Column(name = "last_signed_in")
	private Date lastSignedIn;

	@Column(name = "last_password_updt_date")
	private Date lastPasswordUpdateDate;

	@Column(name = "session_expiry")
	private Date sessionExpiry;

	@Column(name = "session_token")
	private String sessionToken;

	@Column(name = "status")
	private String status;

	public int getUserPk() {
		return userPk;
	}

	public void setUserPk(int userPk) {
		this.userPk = userPk;
	}

	public int getUserType() {
		return userType;
	}

	public void setUserType(int userType) {
		this.userType = userType;
	}

	public String getFirstName() {
		return firstName;
	}

	public void setFirstName(String firstName) {
		this.firstName = firstName;
	}

	public String getLastName() {
		return lastName;
	}

	public void setLastName(String lastName) {
		this.lastName = lastName;
	}

	public String getEmailId() {
		return emailId;
	}

	public void setEmailId(String emailId) {
		this.emailId = emailId;
	}

	public String getMobileNo() {
		return mobileNo;
	}

	public void setMobileNo(String mobileNo) {
		this.mobileNo = mobileNo;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
	}

	public int getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(int createdBy) {
		this.createdBy = createdBy;
	}

	public Date getCreatedDate() {
		return createdDate;
	}

	public void setCreatedDate(Date createdDate) {
		this.createdDate = createdDate;
	}

	public int getLastActBy() {
		return lastActBy;
	}

	public void setLastActBy(int lastActBy) {
		this.lastActBy = lastActBy;
	}

	public Date getLastActDate() {
		return lastActDate;
	}

	public void setLastActDate(Date lastActDate) {
		this.lastActDate = lastActDate;
	}

	public Date getLastSignedIn() {
		return lastSignedIn;
	}

	public void setLastSignedIn(Date lastSignedIn) {
		this.lastSignedIn = lastSignedIn;
	}

	public Date getLastPasswordUpdateDate() {
		return lastPasswordUpdateDate;
	}

	public void setLastPasswordUpdateDate(Date lastPasswordUpdateDate) {
		this.lastPasswordUpdateDate = lastPasswordUpdateDate;
	}

	public Date getSessionExpiry() {
		return sessionExpiry;
	}

	public void setSessionExpiry(Date sessionExpiry) {
		this.sessionExpiry = sessionExpiry;
	}

	public String getSessionToken() {
		return sessionToken;
	}

	public void setSessionToken(String sessionToken) {
		this.sessionToken = sessionToken;
	}

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

}
