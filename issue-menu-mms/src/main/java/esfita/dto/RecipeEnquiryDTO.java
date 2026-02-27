
package esfita.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import lombok.Data;

@Data
public class RecipeEnquiryDTO implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = -7206667135793692380L;
	private int id;
	private String recipeName;
	private String refNo;
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
	public List<RecipeEnquiryDTO> getCategoryList() {
		return categoryList;
	}
	public void setCategoryList(List<RecipeEnquiryDTO> categoryList) {
		this.categoryList = categoryList;
	}
	public List<RecipeEnquiryDTO> getMealList() {
		return mealList;
	}
	public void setMealList(List<RecipeEnquiryDTO> mealList) {
		this.mealList = mealList;
	}
	public List<RecipeEnquiryDTO> getRecipeItems() {
		return recipeItems;
	}
	public void setRecipeItems(List<RecipeEnquiryDTO> recipeItems) {
		this.recipeItems = recipeItems;
	}
	public int getMealTypeFk() {
		return mealTypeFk;
	}
	public void setMealTypeFk(int mealTypeFk) {
		this.mealTypeFk = mealTypeFk;
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
	public List<RecipeEnquiryDTO> getVersionList() {
		return versionList;
	}
	public void setVersionList(List<RecipeEnquiryDTO> versionList) {
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
	public String getCuisineName() {
		return CuisineName;
	}
	public void setCuisineName(String cuisineName) {
		CuisineName = cuisineName;
	}
	public List<RecipeEnquiryDTO> getCategoryListName() {
		return categoryListName;
	}
	public void setCategoryListName(List<RecipeEnquiryDTO> categoryListName) {
		this.categoryListName = categoryListName;
	}
	public String getCookingInstruction() {
		return cookingInstruction;
	}
	public void setCookingInstruction(String cookingInstruction) {
		this.cookingInstruction = cookingInstruction;
	}
	public double getBaseQuantity() {
		return baseQuantity;
	}
	public void setBaseQuantity(double baseQuantity) {
		this.baseQuantity = baseQuantity;
	}
	public double getFinishedProduct() {
		return finishedProduct;
	}
	public void setFinishedProduct(double finishedProduct) {
		this.finishedProduct = finishedProduct;
	}
	public int getItemFk() {
		return itemFk;
	}
	public void setItemFk(int itemFk) {
		this.itemFk = itemFk;
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
	public String getPackageId() {
		return packageId;
	}
	public void setPackageId(String packageId) {
		this.packageId = packageId;
	}
	public double getPackagePrice() {
		return packagePrice;
	}
	public void setPackagePrice(double packagePrice) {
		this.packagePrice = packagePrice;
	}
	public double getTotal() {
		return total;
	}
	public void setTotal(double total) {
		this.total = total;
	}
	public List<RecipeEnquiryDTO> getRecipeSubList() {
		return recipeSubList;
	}
	public void setRecipeSubList(List<RecipeEnquiryDTO> recipeSubList) {
		this.recipeSubList = recipeSubList;
	}
	public double getCalories() {
		return calories;
	}
	public void setCalories(double calories) {
		this.calories = calories;
	}
	public double getFat() {
		return fat;
	}
	public void setFat(double fat) {
		this.fat = fat;
	}
	public double getProtein() {
		return protein;
	}
	public void setProtein(double protein) {
		this.protein = protein;
	}
	public double getCarbs() {
		return carbs;
	}
	public void setCarbs(double carbs) {
		this.carbs = carbs;
	}
	public int getItemCount() {
		return itemCount;
	}
	public void setItemCount(int itemCount) {
		this.itemCount = itemCount;
	}
	public String getItemCategoryName() {
		return itemCategoryName;
	}
	public void setItemCategoryName(String itemCategoryName) {
		this.itemCategoryName = itemCategoryName;
	}
	public String getChefUnit() {
		return chefUnit;
	}
	public void setChefUnit(String chefUnit) {
		this.chefUnit = chefUnit;
	}
	public double getCostPrice() {
		return costPrice;
	}
	public void setCostPrice(double costPrice) {
		this.costPrice = costPrice;
	}
	public double getQuantity() {
		return quantity;
	}
	public void setQuantity(double quantity) {
		this.quantity = quantity;
	}
	public static long getSerialversionuid() {
		return serialVersionUID;
	}
	private String uom;
	private double portionSize;
	private String imageUrl;
	private double totalCost;
	private double perPortionCost;
	private char status;
	private double servings;
	private String categoryName;
	private String mealName;
	private Integer categoryFk;
	private Integer cuisinesFk;
	private List<RecipeEnquiryDTO> categoryList = new ArrayList<>();
	private List<RecipeEnquiryDTO> mealList = new ArrayList<>();
	private List<RecipeEnquiryDTO> recipeItems = new ArrayList<>();
	private int mealTypeFk;
	private String statusStr;
	private int recipeFk;
	private String version;
	private int versionNo;
	private String userName;
	private Date updatedDate;
	private Date createdDate;
	private List<RecipeEnquiryDTO> versionList = new ArrayList<>();
	private String newRecipeName;
	private int createdBy;
	private String CuisineName;

	private List<RecipeEnquiryDTO> categoryListName = new ArrayList<>();
	private String cookingInstruction;
	private double baseQuantity;
	private double finishedProduct;
	private int itemFk;
	private String itemCode;
	private String itemName;
	private String packageId;
	private double packagePrice;
	private double total;
	private List<RecipeEnquiryDTO> recipeSubList = new ArrayList<>();
	private double calories;
	private double fat;
	private double protein;
	private double carbs;
	private int itemCount;
	private String itemCategoryName;
	private String chefUnit;
	private double costPrice;
	private double quantity;

}
