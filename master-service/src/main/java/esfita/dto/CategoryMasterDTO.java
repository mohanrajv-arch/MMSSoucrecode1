package esfita.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import lombok.Data;
@Data
public class CategoryMasterDTO implements Serializable{
	
	/**
	 * 
	 */
	private static final long serialVersionUID = 7791832876003598545L;
	
	public int getId() {
		return id;
	}


	public void setId(int id) {
		this.id = id;
	}


	public String getCategoryCode() {
		return categoryCode;
	}


	public void setCategoryCode(String categoryCode) {
		this.categoryCode = categoryCode;
	}


	public String getCategoryName() {
		return categoryName;
	}


	public void setCategoryName(String categoryName) {
		this.categoryName = categoryName;
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


	public int getUpdatedBy() {
		return updatedBy;
	}


	public void setUpdatedBy(int updatedBy) {
		this.updatedBy = updatedBy;
	}


	public Date getCreatedDate() {
		return createdDate;
	}


	public void setCreatedDate(Date createdDate) {
		this.createdDate = createdDate;
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


	public String getUserEmail() {
		return userEmail;
	}


	public void setUserEmail(String userEmail) {
		this.userEmail = userEmail;
	}


	public boolean isActiveStatus() {
		return isActiveStatus;
	}


	public void setActiveStatus(boolean isActiveStatus) {
		this.isActiveStatus = isActiveStatus;
	}


	public List<CategoryMasterDTO> getUploadedCategoryList() {
		return uploadedCategoryList;
	}


	public void setUploadedCategoryList(List<CategoryMasterDTO> uploadedCategoryList) {
		this.uploadedCategoryList = uploadedCategoryList;
	}


	public static long getSerialversionuid() {
		return serialVersionUID;
	}


	private int id;
	private String categoryCode;
	private  String categoryName;
	private char status;
	private int createdBy;
	private int updatedBy;
	private Date createdDate;
	private Date updatedDate;
	private String statusStr;
	
	private String userName;
	private String userEmail;
	
	private boolean isActiveStatus;
	
	
	private List<CategoryMasterDTO> uploadedCategoryList = new ArrayList<>();

}


