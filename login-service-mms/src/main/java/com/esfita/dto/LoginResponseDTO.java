package com.esfita.dto;

import java.util.Date;

import com.esfita.entity.AppPreference;

public class LoginResponseDTO {
	private String token;
	private String emailId;
	private int userId;
	private int userType;
	private int auditPk;
	private String firstName;
	private String lastName;
	private Date loginTime;
	private Date logOutTime;
	private String numberFormat;
	private AppPreference appPreference;

	public Date getLoginTime() {
		return loginTime;
	}

	public void setLoginTime(Date loginTime) {
		this.loginTime = loginTime;
	}

	public int getAuditPk() {
		return auditPk;
	}

	public void setAuditPk(int auditPk) {
		this.auditPk = auditPk;
	}

	public String getToken() {
		return token;
	}

	public void setToken(String token) {
		this.token = token;
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

	public AppPreference getAppPreference() {
		return appPreference;
	}

	public void setAppPreference(AppPreference appPreference) {
		this.appPreference = appPreference;
	}

	public String getEmailId() {
		return emailId;
	}

	public void setEmailId(String emailId) {
		this.emailId = emailId;
	}

	public int getUserId() {
		return userId;
	}

	public void setUserId(int userId) {
		this.userId = userId;
	}

	public int getUserType() {
		return userType;
	}

	public void setUserType(int userType) {
		this.userType = userType;
	}

	public String getNumberFormat() {
		return numberFormat;
	}

	public void setNumberFormat(String numberFormat) {
		this.numberFormat = numberFormat;
	}

	public Date getLogOutTime() {
		return logOutTime;
	}

	public void setLogOutTime(Date logOutTime) {
		this.logOutTime = logOutTime;
	}

}
