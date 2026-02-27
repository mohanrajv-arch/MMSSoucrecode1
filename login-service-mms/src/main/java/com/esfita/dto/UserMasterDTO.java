package com.esfita.dto;

import java.util.Date;
import java.util.List;

import lombok.Data;

@Data
public class UserMasterDTO {

	private int userPk;
	private String emailId;
	private String password;
	private String mobileNo;
	private int roleFk;
	private String firstName;
	private String lastName;
	private String userTypeStr;
	private int userType;
	private String status;
	private Date createdDate;
	private int createdBy;
	private int lastActBy;
	private Date lastActDate;

	private List<UserMasterDTO> userDetailsList ;
	

	public int getRoleFk() {
		return roleFk;
	}

	public void setRoleFk(int roleFk) {
		this.roleFk = roleFk;
	}

	public int getUserPk() {
		return userPk;
	}

	public void setUserPk(int userPk) {
		this.userPk = userPk;
	}

	public String getMobileNo() {
		return mobileNo;
	}

	public void setMobileNo(String mobileNo) {
		this.mobileNo = mobileNo;
	}

	public String getEmailId() {
		return emailId;
	}

	public void setEmailId(String emailId) {
		this.emailId = emailId;
	}

	public String getPassword() {
		return password;
	}

	public void setPassword(String password) {
		this.password = password;
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

	

	public String getStatus() {
		return status;
	}

	public void setStatus(String status) {
		this.status = status;
	}

	public Date getCreatedDate() {
		return createdDate;
	}

	public void setCreatedDate(Date createdDate) {
		this.createdDate = createdDate;
	}

	public int getCreatedBy() {
		return createdBy;
	}

	public void setCreatedBy(int createdBy) {
		this.createdBy = createdBy;
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

	public String getUserTypeStr() {
		return userTypeStr;
	}

	public void setUserTypeStr(String userTypeStr) {
		this.userTypeStr = userTypeStr;
	}

	public int getUserType() {
		return userType;
	}

	public void setUserType(int userType) {
		this.userType = userType;
	}

	public List<UserMasterDTO> getUserDetailsList() {
		return userDetailsList;
	}

	public void setUserDetailsList(List<UserMasterDTO> userDetailsList) {
		this.userDetailsList = userDetailsList;
	}

}
