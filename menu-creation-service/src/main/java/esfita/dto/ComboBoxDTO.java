package esfita.dto;

import java.io.Serializable;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;

import lombok.Data;

@Data
public class ComboBoxDTO implements Serializable {
	/**
	* 
	*/
	private static final long serialVersionUID = 4003377269733806369L;
	private int pk;
	private String code;
	private String name;
	private Date date;
	private String pkOne;
	private String codeOne;
	private String nameOne;
	private String remarks;
	private int pkTwo;
	private String codeTwo;
	private String nameTwo;
	private int pkThree;
	private String codeThree;
	private String nameThree;
	private String namefour;
	private int categoryCount;
	private double portionYield;
	private double portionSize;
	private double cookedWeight;
	private double idealPortion;
	private double percentage;
	private String imageURL;
	private String category;
	private String cuisine;
	private String meal;
	private int dishTypebfd;
	private LocalDate from;
	private LocalDate to;
	private boolean check;
	private int count;
	private int fk;
	private List<Integer> locationFkList = new ArrayList<>();
	private String itemCode;
	private String itemName;
	private int categoryFk;
	private String packageId;
	private double cost;
	private double factor;
	private double factorCost;
	private String inventoryUnit;
	private double perUnit;
	private String chefUnit;
	private double chefCost;
	private String uom;
	private double costPortion;
	private double packagePrice;
	private double quantity;
	private double perPortionCost;
	private double packageBaseFactor;
	private double packageSecondaryFactor;
	private String packageBaseUnit;
	private String packageSecondaryUnit;
	private double packageSecondaryCost;

	public int getPk() {
		return pk;
	}

	public void setPk(int pk) {
		this.pk = pk;
	}

	public String getCode() {
		return code;
	}

	public void setCode(String code) {
		this.code = code;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public Date getDate() {
		return date;
	}

	public void setDate(Date date) {
		this.date = date;
	}

	public String getPkOne() {
		return pkOne;
	}

	public void setPkOne(String pkOne) {
		this.pkOne = pkOne;
	}

	public String getCodeOne() {
		return codeOne;
	}

	public void setCodeOne(String codeOne) {
		this.codeOne = codeOne;
	}

	public String getNameOne() {
		return nameOne;
	}

	public void setNameOne(String nameOne) {
		this.nameOne = nameOne;
	}

	public String getRemarks() {
		return remarks;
	}

	public void setRemarks(String remarks) {
		this.remarks = remarks;
	}

	public int getPkTwo() {
		return pkTwo;
	}

	public void setPkTwo(int pkTwo) {
		this.pkTwo = pkTwo;
	}

	public String getCodeTwo() {
		return codeTwo;
	}

	public void setCodeTwo(String codeTwo) {
		this.codeTwo = codeTwo;
	}

	public String getNameTwo() {
		return nameTwo;
	}

	public void setNameTwo(String nameTwo) {
		this.nameTwo = nameTwo;
	}

	public int getPkThree() {
		return pkThree;
	}

	public void setPkThree(int pkThree) {
		this.pkThree = pkThree;
	}

	public String getCodeThree() {
		return codeThree;
	}

	public void setCodeThree(String codeThree) {
		this.codeThree = codeThree;
	}

	public String getNameThree() {
		return nameThree;
	}

	public void setNameThree(String nameThree) {
		this.nameThree = nameThree;
	}

	public String getNamefour() {
		return namefour;
	}

	public void setNamefour(String namefour) {
		this.namefour = namefour;
	}

	public int getCategoryCount() {
		return categoryCount;
	}

	public void setCategoryCount(int categoryCount) {
		this.categoryCount = categoryCount;
	}

	public double getPortionYield() {
		return portionYield;
	}

	public void setPortionYield(double portionYield) {
		this.portionYield = portionYield;
	}

	public double getPortionSize() {
		return portionSize;
	}

	public void setPortionSize(double portionSize) {
		this.portionSize = portionSize;
	}

	public double getCookedWeight() {
		return cookedWeight;
	}

	public void setCookedWeight(double cookedWeight) {
		this.cookedWeight = cookedWeight;
	}

	public double getIdealPortion() {
		return idealPortion;
	}

	public void setIdealPortion(double idealPortion) {
		this.idealPortion = idealPortion;
	}

	public double getPercentage() {
		return percentage;
	}

	public void setPercentage(double percentage) {
		this.percentage = percentage;
	}

	public String getImageURL() {
		return imageURL;
	}

	public void setImageURL(String imageURL) {
		this.imageURL = imageURL;
	}

	public String getCategory() {
		return category;
	}

	public void setCategory(String category) {
		this.category = category;
	}

	public String getCuisine() {
		return cuisine;
	}

	public void setCuisine(String cuisine) {
		this.cuisine = cuisine;
	}

	public String getMeal() {
		return meal;
	}

	public void setMeal(String meal) {
		this.meal = meal;
	}

	public int getDishTypebfd() {
		return dishTypebfd;
	}

	public void setDishTypebfd(int dishTypebfd) {
		this.dishTypebfd = dishTypebfd;
	}

	public LocalDate getFrom() {
		return from;
	}

	public void setFrom(LocalDate from) {
		this.from = from;
	}

	public LocalDate getTo() {
		return to;
	}

	public void setTo(LocalDate to) {
		this.to = to;
	}

	public boolean isCheck() {
		return check;
	}

	public void setCheck(boolean check) {
		this.check = check;
	}

	public int getCount() {
		return count;
	}

	public void setCount(int count) {
		this.count = count;
	}

	public int getFk() {
		return fk;
	}

	public void setFk(int fk) {
		this.fk = fk;
	}

	public List<Integer> getLocationFkList() {
		return locationFkList;
	}

	public void setLocationFkList(List<Integer> locationFkList) {
		this.locationFkList = locationFkList;
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

	public int getCategoryFk() {
		return categoryFk;
	}

	public void setCategoryFk(int categoryFk) {
		this.categoryFk = categoryFk;
	}

	public String getPackageId() {
		return packageId;
	}

	public void setPackageId(String packageId) {
		this.packageId = packageId;
	}

	public double getCost() {
		return cost;
	}

	public void setCost(double cost) {
		this.cost = cost;
	}

	public double getFactor() {
		return factor;
	}

	public void setFactor(double factor) {
		this.factor = factor;
	}

	public double getFactorCost() {
		return factorCost;
	}

	public void setFactorCost(double factorCost) {
		this.factorCost = factorCost;
	}

	public String getInventoryUnit() {
		return inventoryUnit;
	}

	public void setInventoryUnit(String inventoryUnit) {
		this.inventoryUnit = inventoryUnit;
	}

	public double getPerUnit() {
		return perUnit;
	}

	public void setPerUnit(double perUnit) {
		this.perUnit = perUnit;
	}

	public String getChefUnit() {
		return chefUnit;
	}

	public void setChefUnit(String chefUnit) {
		this.chefUnit = chefUnit;
	}

	public double getChefCost() {
		return chefCost;
	}

	public void setChefCost(double chefCost) {
		this.chefCost = chefCost;
	}

	public String getUom() {
		return uom;
	}

	public void setUom(String uom) {
		this.uom = uom;
	}

	public double getCostPortion() {
		return costPortion;
	}

	public void setCostPortion(double costPortion) {
		this.costPortion = costPortion;
	}

	public double getPackagePrice() {
		return packagePrice;
	}

	public void setPackagePrice(double packagePrice) {
		this.packagePrice = packagePrice;
	}

	public double getQuantity() {
		return quantity;
	}

	public void setQuantity(double quantity) {
		this.quantity = quantity;
	}

	public double getPerPortionCost() {
		return perPortionCost;
	}

	public void setPerPortionCost(double perPortionCost) {
		this.perPortionCost = perPortionCost;
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

}