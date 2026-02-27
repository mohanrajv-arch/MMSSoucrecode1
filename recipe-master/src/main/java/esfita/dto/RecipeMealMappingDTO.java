package esfita.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import lombok.Data;

@Data
public class RecipeMealMappingDTO implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 3250876914926376466L;
	private int id;
	private int mealFk;
	private int recipeFk;
	private char status;
	private int createdBy;
	private Date createdDate;
	private int updatedBy;
	private Date updatedDate;
	private String statusStr;
	private String userName;
	
	private boolean activeStatus;
	
	
	private int countryOriginFk;
	private String recipeName;
	private int categoryFk;
	private String categoryName;
	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public int getMealFk() {
		return mealFk;
	}

	public void setMealFk(int mealFk) {
		this.mealFk = mealFk;
	}

	public int getRecipeFk() {
		return recipeFk;
	}

	public void setRecipeFk(int recipeFk) {
		this.recipeFk = recipeFk;
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

	public int getCountryOriginFk() {
		return countryOriginFk;
	}

	public void setCountryOriginFk(int countryOriginFk) {
		this.countryOriginFk = countryOriginFk;
	}

	public String getRecipeName() {
		return recipeName;
	}

	public void setRecipeName(String recipeName) {
		this.recipeName = recipeName;
	}

	public int getCategoryFk() {
		return categoryFk;
	}

	public void setCategoryFk(int categoryFk) {
		this.categoryFk = categoryFk;
	}

	public String getCategoryName() {
		return categoryName;
	}

	public void setCategoryName(String categoryName) {
		this.categoryName = categoryName;
	}

	public String getMealTypeName() {
		return mealTypeName;
	}

	public void setMealTypeName(String mealTypeName) {
		this.mealTypeName = mealTypeName;
	}

	public String getCountryName() {
		return countryName;
	}

	public void setCountryName(String countryName) {
		this.countryName = countryName;
	}

	public String getImageUrl() {
		return imageUrl;
	}

	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}

	public boolean isSelected() {
		return selected;
	}

	public void setSelected(boolean selected) {
		this.selected = selected;
	}

	public boolean isAlreadyMapped() {
		return alreadyMapped;
	}

	public void setAlreadyMapped(boolean alreadyMapped) {
		this.alreadyMapped = alreadyMapped;
	}

	public List<RecipeMealMappingDTO> getMealTypeList() {
		return mealTypeList;
	}

	public void setMealTypeList(List<RecipeMealMappingDTO> mealTypeList) {
		this.mealTypeList = mealTypeList;
	}

	public List<RecipeMealMappingDTO> getCategoryList() {
		return categoryList;
	}

	public void setCategoryList(List<RecipeMealMappingDTO> categoryList) {
		this.categoryList = categoryList;
	}

	public List<RecipeMealMappingDTO> getMealMappingList() {
		return mealMappingList;
	}

	public void setMealMappingList(List<RecipeMealMappingDTO> mealMappingList) {
		this.mealMappingList = mealMappingList;
	}

	public static long getSerialversionuid() {
		return serialVersionUID;
	}

	private String mealTypeName;
	private String countryName;
	private String imageUrl;
	private boolean selected;
	
	private boolean alreadyMapped;
	 private List<RecipeMealMappingDTO> mealTypeList;
	private List<RecipeMealMappingDTO> categoryList = new ArrayList<>();
	
	private List<RecipeMealMappingDTO> mealMappingList = new ArrayList<>();
	

}
