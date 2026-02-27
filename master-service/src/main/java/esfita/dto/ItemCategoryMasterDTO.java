package esfita.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import lombok.Data;

@Data
public class ItemCategoryMasterDTO implements Serializable{

	
	/**
	 * 
	 */
	private static final long serialVersionUID = -1079867320455824687L;
	private int id;
	private String itemCode;
	private  String itemName;
	private char status;
	private int createdBy;
	private int updatedBy;
	private Date createdDate;
	private Date updatedDate;
	public int getId() {
		return id;
	}


	public void setId(int id) {
		this.id = id;
	}


	public String getItemCode() {
		return itemCode;
	}


	public void setItemCode(String itemCode) {
		this.itemCode = itemCode;
	}


	public String getItemName() {
		return itemName;
	}


	public void setItemName(String itemName) {
		this.itemName = itemName;
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


	public List<ItemCategoryMasterDTO> getUploadedItemList() {
		return uploadedItemList;
	}


	public void setUploadedItemList(List<ItemCategoryMasterDTO> uploadedItemList) {
		this.uploadedItemList = uploadedItemList;
	}


	public static long getSerialversionuid() {
		return serialVersionUID;
	}


	private String statusStr;
	
	private String userName;
	private String userEmail;
	
	private boolean isActiveStatus;
	
	
	private List<ItemCategoryMasterDTO> uploadedItemList = new ArrayList<>();
}
