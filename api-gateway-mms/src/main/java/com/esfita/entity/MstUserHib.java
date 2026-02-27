package com.esfita.entity;

import java.util.Date;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import jakarta.persistence.Temporal;
import jakarta.persistence.TemporalType;

@Entity
@JsonIgnoreProperties({ "hibernateLazyInitializer", "handler" })
@Table(name = "mst_user", schema = "dbo")
public class MstUserHib {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	@Column(name = "USER_PK", nullable = false)
	private Integer userPk;

	@Column(name = "USER_TYPE")
	private Integer userType;

	@Column(name = "FIRST_NAME")
	private String firstName;

	@Column(name = "LAST_NAME")
	private String lastName;

	@Column(name = "EMAIL_ID")
	private String emailId;

	@Column(name = "MOBILE_NO")
	private String mobileNo;

	@Column(name = "PASSWORD")
	private String password;

	@Column(name = "CREATED_BY")
	private Integer createdBy;

	@Column(name = "CREATED_DATE")
	@Temporal(TemporalType.TIMESTAMP)
	private Date createdDate;

	@Column(name = "LAST_ACT_BY")
	private Integer lastActBy;

	@Column(name = "LAST_ACT_DATE")
	@Temporal(TemporalType.TIMESTAMP)
	private Date lastActDate;

	@Column(name = "LAST_SIGNED_IN")
	@Temporal(TemporalType.TIMESTAMP)
	private Date lastSignedIn;

	@Column(name = "LAST_PASSWORD_UPDT_DATE")
	@Temporal(TemporalType.TIMESTAMP)
	private Date lastPasswordUpdtDate;

	@Column(name = "SESSION_TOKEN")
	private String sessionToken;

	@Column(name = "SESSION_EXPIRY")
	@Temporal(TemporalType.TIMESTAMP)
	private Date sessionExpiry;

	@Column(name = "status")
	private String status;

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public Integer getUserPk() {
		return userPk;
	}

	public void setUserPk(Integer userPk) {
		this.userPk = userPk;
	}

	public Integer getUserType() {
		return userType;
	}

	public void setUserType(Integer userType) {
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

	public Integer getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(Integer createdBy) {
		this.createdBy = createdBy;
	}

	public Date getCreatedDate() {
		return createdDate;
	}

	public void setCreatedDate(Date createdDate) {
		this.createdDate = createdDate;
	}

	public Integer getLastActBy() {
		return lastActBy;
	}

	public void setLastActBy(Integer lastActBy) {
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

	public Date getLastPasswordUpdtDate() {
		return lastPasswordUpdtDate;
	}

	public void setLastPasswordUpdtDate(Date lastPasswordUpdtDate) {
		this.lastPasswordUpdtDate = lastPasswordUpdtDate;
	}

	public String getSessionToken() {
		return sessionToken;
	}

	public void setSessionToken(String sessionToken) {
		this.sessionToken = sessionToken;
	}

	public Date getSessionExpiry() {
		return sessionExpiry;
	}

	public void setSessionExpiry(Date sessionExpiry) {
		this.sessionExpiry = sessionExpiry;
	}

}
