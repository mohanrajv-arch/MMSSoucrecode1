package esfita.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import lombok.Data;

@Data
public class RecipeMasterListDTO implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = -7206667135793692380L;
	private int id;
	private String recipeName;
	private String refNo;
	private String uom;
	private double portionSize;
	private String imageUrl;
	private double totalCost;
	private double perPortionCost;
	private char status;
	private double servings;
	public int getId() {
		return id;
	}
	public void setId(int id) {
		this.id = id;
	}
	public String getRecipeName() {
		return recipeName;
	}
	public void setRecipeName(String recipeName) {
		this.recipeName = recipeName;
	}
	public String getRefNo() {
		return refNo;
	}
	public void setRefNo(String refNo) {
		this.refNo = refNo;
	}
	public String getUom() {
		return uom;
	}
	public void setUom(String uom) {
		this.uom = uom;
	}
	public double getPortionSize() {
		return portionSize;
	}
	public void setPortionSize(double portionSize) {
		this.portionSize = portionSize;
	}
	public String getImageUrl() {
		return imageUrl;
	}
	public void setImageUrl(String imageUrl) {
		this.imageUrl = imageUrl;
	}
	public double getTotalCost() {
		return totalCost;
	}
	public void setTotalCost(double totalCost) {
		this.totalCost = totalCost;
	}
	public double getPerPortionCost() {
		return perPortionCost;
	}
	public void setPerPortionCost(double perPortionCost) {
		this.perPortionCost = perPortionCost;
	}
	public char getStatus() {
		return status;
	}
	public void setStatus(char status) {
		this.status = status;
	}
	public double getServings() {
		return servings;
	}
	public void setServings(double servings) {
		this.servings = servings;
	}
	public String getCategoryName() {
		return categoryName;
	}
	public void setCategoryName(String categoryName) {
		this.categoryName = categoryName;
	}
	public String getMealName() {
		return mealName;
	}
	public void setMealName(String mealName) {
		this.mealName = mealName;
	}
	public Integer getCategoryFk() {
		return categoryFk;
	}
	public void setCategoryFk(Integer categoryFk) {
		this.categoryFk = categoryFk;
	}
	public Integer getCuisinesFk() {
		return cuisinesFk;
	}
	public void setCuisinesFk(Integer cuisinesFk) {
		this.cuisinesFk = cuisinesFk;
	}
	public List<RecipeMasterListDTO> getCategoryList() {
		return categoryList;
	}
	public void setCategoryList(List<RecipeMasterListDTO> categoryList) {
		this.categoryList = categoryList;
	}
	public List<RecipeMasterListDTO> getMealList() {
		return mealList;
	}
	public void setMealList(List<RecipeMasterListDTO> mealList) {
		this.mealList = mealList;
	}
	public List<RecipeMasterListDTO> getRecipeItems() {
		return recipeItems;
	}
	public void setRecipeItems(List<RecipeMasterListDTO> recipeItems) {
		this.recipeItems = recipeItems;
	}
	public String getStatusStr() {
		return statusStr;
	}
	public void setStatusStr(String statusStr) {
		this.statusStr = statusStr;
	}
	public int getRecipeFk() {
		return recipeFk;
	}
	public void setRecipeFk(int recipeFk) {
		this.recipeFk = recipeFk;
	}
	public String getVersion() {
		return version;
	}
	public void setVersion(String version) {
		this.version = version;
	}
	public int getVersionNo() {
		return versionNo;
	}
	public void setVersionNo(int versionNo) {
		this.versionNo = versionNo;
	}
	public String getUserName() {
		return userName;
	}
	public void setUserName(String userName) {
		this.userName = userName;
	}
	public Date getUpdatedDate() {
		return updatedDate;
	}
	public void setUpdatedDate(Date updatedDate) {
		this.updatedDate = updatedDate;
	}
	public Date getCreatedDate() {
		return createdDate;
	}
	public void setCreatedDate(Date createdDate) {
		this.createdDate = createdDate;
	}
	public List<RecipeMasterListDTO> getVersionList() {
		return versionList;
	}
	public void setVersionList(List<RecipeMasterListDTO> versionList) {
		this.versionList = versionList;
	}
	public String getNewRecipeName() {
		return newRecipeName;
	}
	public void setNewRecipeName(String newRecipeName) {
		this.newRecipeName = newRecipeName;
	}
	public int getCreatedBy() {
		return createdBy;
	}
	public void setCreatedBy(int createdBy) {
		this.createdBy = createdBy;
	}
	public static long getSerialversionuid() {
		return serialVersionUID;
	}
	private String categoryName;
	private String mealName;
	private Integer categoryFk;
	private Integer cuisinesFk;
	private List<RecipeMasterListDTO> categoryList = new ArrayList<>();
	private List<RecipeMasterListDTO> mealList = new ArrayList<>();
	private List<RecipeMasterListDTO> recipeItems = new ArrayList<>();

	private String statusStr;
	private int recipeFk;
	private String version;
	private int versionNo;
	private String userName;
	private Date updatedDate;
	private Date createdDate;
	private List<RecipeMasterListDTO> versionList = new ArrayList<>();
	private String newRecipeName;
	private int createdBy;
    
}
