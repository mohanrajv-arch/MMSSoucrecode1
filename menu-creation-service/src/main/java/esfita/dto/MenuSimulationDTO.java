package esfita.dto;

import java.io.Serializable;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

import lombok.Data;

@Data
public class MenuSimulationDTO implements Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = -8144195231400707050L;
	private int finalMenuFk;
	private String finalMenuName;
	private int mealTypeFk;
	private String mealTypeName;
	private int pob;
	private int itemCount;
	private double totalCost;
	private double perPortionCost;
	private int categoriesCount;
	private int itemFk;
	private int itemCategoryFk;
	private String itemCode;
	private String itemName;
	private String packageId;
	private double packagePrice;
	private String chefUnit;
	private double costPrice;
	private double baseQuantity;
	private double baseTotal;
	private int recipeFk;
	private String recipeName;
	private String menuName;
	private int repeatedItem;
	private double portionSize;
	private String itemCategoryName;
	private String categoryName;
	private String uom;
	private double pobParticipation;
	private double finalCost;
	private double totalMealCost;
	private int id;
	private String mealName;
	private double servings;
	private String cuisineName;
	private int categoryFk;
	private double packageBaseFactor;
	private double packageSecondaryFactor;
	private String packageBaseUnit;
	private String packageSecondaryUnit;
	private double packageSecondaryCost;
	private double secondaryQuantity;
	private int menudFk;

	private List<MenuSimulationDTO> recipes = new ArrayList<>();
	private List<MenuSimulationDTO> mealCostList = new ArrayList<>();
	private List<MenuSimulationDTO> mealTypeList = new ArrayList<>();
	private List<MenuSimulationDTO> itemList = new ArrayList<>();

	private List<MenuSimulationDTO> categoryList = new ArrayList<>();
	private List<MenuSimulationDTO> mealList = new ArrayList<>();

	private List<MenuSimulationDTO> ingList = new ArrayList<>();

	private transient Set<Integer> categoryIds = new HashSet<>();
	private transient Set<Integer> mealIds = new HashSet<>();

	private String mainCategory;

	public int getFinalMenuFk() {
		return finalMenuFk;
	}

	public void setFinalMenuFk(int finalMenuFk) {
		this.finalMenuFk = finalMenuFk;
	}

	public String getFinalMenuName() {
		return finalMenuName;
	}

	public void setFinalMenuName(String finalMenuName) {
		this.finalMenuName = finalMenuName;
	}

	public int getMealTypeFk() {
		return mealTypeFk;
	}

	public void setMealTypeFk(int mealTypeFk) {
		this.mealTypeFk = mealTypeFk;
	}

	public String getMealTypeName() {
		return mealTypeName;
	}

	public void setMealTypeName(String mealTypeName) {
		this.mealTypeName = mealTypeName;
	}

	public int getPob() {
		return pob;
	}

	public void setPob(int pob) {
		this.pob = pob;
	}

	public int getItemCount() {
		return itemCount;
	}

	public void setItemCount(int itemCount) {
		this.itemCount = itemCount;
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

	public int getCategoriesCount() {
		return categoriesCount;
	}

	public void setCategoriesCount(int categoriesCount) {
		this.categoriesCount = categoriesCount;
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

	public double getBaseQuantity() {
		return baseQuantity;
	}

	public void setBaseQuantity(double baseQuantity) {
		this.baseQuantity = baseQuantity;
	}

	public double getBaseTotal() {
		return baseTotal;
	}

	public void setBaseTotal(double baseTotal) {
		this.baseTotal = baseTotal;
	}

	public int getRecipeFk() {
		return recipeFk;
	}

	public void setRecipeFk(int recipeFk) {
		this.recipeFk = recipeFk;
	}

	public String getRecipeName() {
		return recipeName;
	}

	public void setRecipeName(String recipeName) {
		this.recipeName = recipeName;
	}

	public String getMenuName() {
		return menuName;
	}

	public void setMenuName(String menuName) {
		this.menuName = menuName;
	}

	public int getRepeatedItem() {
		return repeatedItem;
	}

	public void setRepeatedItem(int repeatedItem) {
		this.repeatedItem = repeatedItem;
	}

	public double getPortionSize() {
		return portionSize;
	}

	public void setPortionSize(double portionSize) {
		this.portionSize = portionSize;
	}

	public String getItemCategoryName() {
		return itemCategoryName;
	}

	public void setItemCategoryName(String itemCategoryName) {
		this.itemCategoryName = itemCategoryName;
	}

	public String getCategoryName() {
		return categoryName;
	}

	public void setCategoryName(String categoryName) {
		this.categoryName = categoryName;
	}

	public String getUom() {
		return uom;
	}

	public void setUom(String uom) {
		this.uom = uom;
	}

	public double getPobParticipation() {
		return pobParticipation;
	}

	public void setPobParticipation(double pobParticipation) {
		this.pobParticipation = pobParticipation;
	}

	public double getFinalCost() {
		return finalCost;
	}

	public void setFinalCost(double finalCost) {
		this.finalCost = finalCost;
	}

	public double getTotalMealCost() {
		return totalMealCost;
	}

	public void setTotalMealCost(double totalMealCost) {
		this.totalMealCost = totalMealCost;
	}

	public int getId() {
		return id;
	}

	public void setId(int id) {
		this.id = id;
	}

	public String getMealName() {
		return mealName;
	}

	public void setMealName(String mealName) {
		this.mealName = mealName;
	}

	public double getServings() {
		return servings;
	}

	public void setServings(double servings) {
		this.servings = servings;
	}

	public String getCuisineName() {
		return cuisineName;
	}

	public void setCuisineName(String cuisineName) {
		this.cuisineName = cuisineName;
	}

	public int getCategoryFk() {
		return categoryFk;
	}

	public void setCategoryFk(int categoryFk) {
		this.categoryFk = categoryFk;
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

	public int getMenudFk() {
		return menudFk;
	}

	public void setMenudFk(int menudFk) {
		this.menudFk = menudFk;
	}

	public List<MenuSimulationDTO> getRecipes() {
		return recipes;
	}

	public void setRecipes(List<MenuSimulationDTO> recipes) {
		this.recipes = recipes;
	}

	public List<MenuSimulationDTO> getMealCostList() {
		return mealCostList;
	}

	public void setMealCostList(List<MenuSimulationDTO> mealCostList) {
		this.mealCostList = mealCostList;
	}

	public List<MenuSimulationDTO> getMealTypeList() {
		return mealTypeList;
	}

	public void setMealTypeList(List<MenuSimulationDTO> mealTypeList) {
		this.mealTypeList = mealTypeList;
	}

	public List<MenuSimulationDTO> getItemList() {
		return itemList;
	}

	public void setItemList(List<MenuSimulationDTO> itemList) {
		this.itemList = itemList;
	}

	public List<MenuSimulationDTO> getCategoryList() {
		return categoryList;
	}

	public void setCategoryList(List<MenuSimulationDTO> categoryList) {
		this.categoryList = categoryList;
	}

	public List<MenuSimulationDTO> getMealList() {
		return mealList;
	}

	public void setMealList(List<MenuSimulationDTO> mealList) {
		this.mealList = mealList;
	}

	public List<MenuSimulationDTO> getIngList() {
		return ingList;
	}

	public void setIngList(List<MenuSimulationDTO> ingList) {
		this.ingList = ingList;
	}

	public Set<Integer> getCategoryIds() {
		return categoryIds;
	}

	public void setCategoryIds(Set<Integer> categoryIds) {
		this.categoryIds = categoryIds;
	}

	public Set<Integer> getMealIds() {
		return mealIds;
	}

	public void setMealIds(Set<Integer> mealIds) {
		this.mealIds = mealIds;
	}

	public String getMainCategory() {
		return mainCategory;
	}

	public void setMainCategory(String mainCategory) {
		this.mainCategory = mainCategory;
	}

}
