package esfita.dto;

import java.io.Serializable;
import java.util.Date;

import lombok.Data;
@Data
public class RecipeMealMasterDTO implements Serializable{
	/**
	 * 
	 */
	private static final long serialVersionUID = -7442354058230514292L;

	private int id;
	private String recipeMealcode;
	private String recipeMealName;
	private char status;
	public int getId() {
		return id;
	}
	public void setId(int id) {
		this.id = id;
	}
	public String getRecipeMealcode() {
		return recipeMealcode;
	}
	public void setRecipeMealcode(String recipeMealcode) {
		this.recipeMealcode = recipeMealcode;
	}
	public String getRecipeMealName() {
		return recipeMealName;
	}
	public void setRecipeMealName(String recipeMealName) {
		this.recipeMealName = recipeMealName;
	}
	public char getStatus() {
		return status;
	}
	public void setStatus(char status) {
		this.status = status;
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
	public int getUpdatedBy() {
		return updatedBy;
	}
	public void setUpdatedBy(int updatedBy) {
		this.updatedBy = updatedBy;
	}
	public Date getUpdatedDate() {
		return updatedDate;
	}
	public void setUpdatedDate(Date updatedDate) {
		this.updatedDate = updatedDate;
	}
	public String getStatusStr() {
		return statusStr;
	}
	public void setStatusStr(String statusStr) {
		this.statusStr = statusStr;
	}
	public String getUserName() {
		return userName;
	}
	public void setUserName(String userName) {
		this.userName = userName;
	}
	public boolean isActiveStatus() {
		return activeStatus;
	}
	public void setActiveStatus(boolean activeStatus) {
		this.activeStatus = activeStatus;
	}
	public String getEmailId() {
		return emailId;
	}
	public void setEmailId(String emailId) {
		this.emailId = emailId;
	}
	public static long getSerialversionuid() {
		return serialVersionUID;
	}
	private int createdBy;
	private Date createdDate;
	private int updatedBy;
	private Date updatedDate;
	private String statusStr;
	private String userName;
	
	private boolean activeStatus;
	private String emailId;
	
}
