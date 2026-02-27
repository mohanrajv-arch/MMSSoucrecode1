package esfita.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import lombok.Data;

@Data
public class RecipeMasterDTO implements Serializable {
	/**
	* 
	*/
	private static final long serialVersionUID = 1246697399382981856L;
	/**
		 * 
		 */

	private int id;
	private int recipeFk;
	public int getId() {
		return id;
	}
	public void setId(int id) {
		this.id = id;
	}
	public int getRecipeFk() {
		return recipeFk;
	}
	public void setRecipeFk(int recipeFk) {
		this.recipeFk = recipeFk;
	}
	public int getVersionNo() {
		return versionNo;
	}
	public void setVersionNo(int versionNo) {
		this.versionNo = versionNo;
	}
	public String getUniqueNo() {
		return uniqueNo;
	}
	public void setUniqueNo(String uniqueNo) {
		this.uniqueNo = uniqueNo;
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
	public String getCookingInstruction() {
		return cookingInstruction;
	}
	public void setCookingInstruction(String cookingInstruction) {
		this.cookingInstruction = cookingInstruction;
	}
	public int getCountryOriginFk() {
		return countryOriginFk;
	}
	public void setCountryOriginFk(int countryOriginFk) {
		this.countryOriginFk = countryOriginFk;
	}
	public int getBaseQuantityFk() {
		return baseQuantityFk;
	}
	public void setBaseQuantityFk(int baseQuantityFk) {
		this.baseQuantityFk = baseQuantityFk;
	}
	public double getBaseQuantity() {
		return baseQuantity;
	}
	public void setBaseQuantity(double baseQuantity) {
		this.baseQuantity = baseQuantity;
	}
	public String getUom() {
		return uom;
	}
	public void setUom(String uom) {
		this.uom = uom;
	}
	public double getFinishedProduct() {
		return finishedProduct;
	}
	public void setFinishedProduct(double finishedProduct) {
		this.finishedProduct = finishedProduct;
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
	public String getStatus() {
		return status;
	}
	public void setStatus(String status) {
		this.status = status;
	}
	public String getRecipeType() {
		return recipeType;
	}
	public void setRecipeType(String recipeType) {
		this.recipeType = recipeType;
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
	public int getRecipeHistoryFk() {
		return recipeHistoryFk;
	}
	public void setRecipeHistoryFk(int recipeHistoryFk) {
		this.recipeHistoryFk = recipeHistoryFk;
	}
	public List<String> getCategoryList() {
		return categoryList;
	}
	public void setCategoryList(List<String> categoryList) {
		this.categoryList = categoryList;
	}
	public List<String> getMealtype() {
		return mealtype;
	}
	public void setMealtype(List<String> mealtype) {
		this.mealtype = mealtype;
	}
	public String getCategoryName() {
		return categoryName;
	}
	public void setCategoryName(String categoryName) {
		this.categoryName = categoryName;
	}
	public int getItemFk() {
		return itemFk;
	}
	public void setItemFk(int itemFk) {
		this.itemFk = itemFk;
	}
	public int getItemCategoryFk() {
		return itemCategoryFk;
	}
	public void setItemCategoryFk(int itemCategoryFk) {
		this.itemCategoryFk = itemCategoryFk;
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
	public double getPackageBaseFactor() {
		return packageBaseFactor;
	}
	public void setPackageBaseFactor(double packageBaseFactor) {
		this.packageBaseFactor = packageBaseFactor;
	}
	public double getPackageSecondaryFactor() {
		return packageSecondaryFactor;
	}
	public void setPackageSecondaryFactor(double packageSecondaryFactor) {
		this.packageSecondaryFactor = packageSecondaryFactor;
	}
	public String getPackageBaseUnit() {
		return packageBaseUnit;
	}
	public void setPackageBaseUnit(String packageBaseUnit) {
		this.packageBaseUnit = packageBaseUnit;
	}
	public String getPackageSecondaryUnit() {
		return packageSecondaryUnit;
	}
	public void setPackageSecondaryUnit(String packageSecondaryUnit) {
		this.packageSecondaryUnit = packageSecondaryUnit;
	}
	public double getPackageSecondaryCost() {
		return packageSecondaryCost;
	}
	public void setPackageSecondaryCost(double packageSecondaryCost) {
		this.packageSecondaryCost = packageSecondaryCost;
	}
	public double getSecondaryQuantity() {
		return secondaryQuantity;
	}
	public void setSecondaryQuantity(double secondaryQuantity) {
		this.secondaryQuantity = secondaryQuantity;
	}
	public double getPackagePerCost() {
		return packagePerCost;
	}
	public void setPackagePerCost(double packagePerCost) {
		this.packagePerCost = packagePerCost;
	}
	public double getPackagePerQty() {
		return packagePerQty;
	}
	public void setPackagePerQty(double packagePerQty) {
		this.packagePerQty = packagePerQty;
	}
	public double getTotal() {
		return total;
	}
	public void setTotal(double total) {
		this.total = total;
	}
	public List<RecipeMasterDTO> getRecipeSubList() {
		return recipeSubList;
	}
	public void setRecipeSubList(List<RecipeMasterDTO> recipeSubList) {
		this.recipeSubList = recipeSubList;
	}
	public String getCuisineName() {
		return cuisineName;
	}
	public void setCuisineName(String cuisineName) {
		this.cuisineName = cuisineName;
	}
	public String getMealName() {
		return mealName;
	}
	public void setMealName(String mealName) {
		this.mealName = mealName;
	}
	public List<RecipeMasterDTO> getCategoryListName() {
		return categoryListName;
	}
	public void setCategoryListName(List<RecipeMasterDTO> categoryListName) {
		this.categoryListName = categoryListName;
	}
	public List<RecipeMasterDTO> getMealList() {
		return mealList;
	}
	public void setMealList(List<RecipeMasterDTO> mealList) {
		this.mealList = mealList;
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
	public String getUserName() {
		return userName;
	}
	public void setUserName(String userName) {
		this.userName = userName;
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
	public String getStatusStr() {
		return statusStr;
	}
	public void setStatusStr(String statusStr) {
		this.statusStr = statusStr;
	}
	public RecipeMasterDTO getOldVersion() {
		return oldVersion;
	}
	public void setOldVersion(RecipeMasterDTO oldVersion) {
		this.oldVersion = oldVersion;
	}
	public RecipeMasterDTO getCurrentVersion() {
		return currentVersion;
	}
	public void setCurrentVersion(RecipeMasterDTO currentVersion) {
		this.currentVersion = currentVersion;
	}
	public String getNewRecipeName() {
		return newRecipeName;
	}
	public void setNewRecipeName(String newRecipeName) {
		this.newRecipeName = newRecipeName;
	}
	public static long getSerialversionuid() {
		return serialVersionUID;
	}
	private int versionNo;
	private String uniqueNo;
	private String recipeName;
	private String refNo;
	private String cookingInstruction;
	private int countryOriginFk;
	private int baseQuantityFk;
	private double baseQuantity;
	private String uom;
	private double finishedProduct;
	private double portionSize;
	private String imageUrl;
	private double totalCost;
	private double perPortionCost;
	private String status; // A / I
	private String recipeType; // Custom / Standard
	private int createdBy;
	private Date createdDate;

	private int updatedBy;
	private Date updatedDate;

	private int recipeHistoryFk;
	private List<String> categoryList = new ArrayList<>();
	private List<String> mealtype = new ArrayList<>();
	private String categoryName;

	private int itemFk;
	private int itemCategoryFk;
	private String itemCode;
	private String itemName;

	private String packageId;
	private double packagePrice;
	private double packageBaseFactor;
	private double packageSecondaryFactor;

	private String packageBaseUnit;
	private String packageSecondaryUnit;

	private double packageSecondaryCost;
	private double secondaryQuantity;
	
	private double packagePerCost;

	private double packagePerQty;

	private double total;

	private List<RecipeMasterDTO> recipeSubList = new ArrayList<>();
	
//	add
	private String cuisineName;
	private String mealName;
	private List<RecipeMasterDTO> categoryListName = new ArrayList<>();
	private List<RecipeMasterDTO> mealList = new ArrayList<>();
	private double calories;
	private double fat;
	private double protein;
	private double carbs;
	private String userName;
	private int itemCount;
	private String itemCategoryName;
	private String chefUnit;
	private double costPrice;
	private double quantity;
	private String statusStr;
	
	private RecipeMasterDTO oldVersion;
    private RecipeMasterDTO currentVersion;
    private String newRecipeName;
	
}